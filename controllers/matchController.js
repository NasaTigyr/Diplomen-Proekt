const db = require('../db');

exports.getMatchesByCategoryId = (req, res) => {
  const categoryId = req.params.categoryId;

  db.query(
    `SELECT m.*, 
     r1.user_id AS participant1_user_id, u1.full_name AS participant1_name,
     r2.user_id AS participant2_user_id, u2.full_name AS participant2_name,
     rw.user_id AS winner_user_id, uw.full_name AS winner_name
     FROM matches m
     LEFT JOIN registrations r1 ON m.participant1_id = r1.id
     LEFT JOIN registrations r2 ON m.participant2_id = r2.id
     LEFT JOIN registrations rw ON m.winner_id = rw.id
     LEFT JOIN users u1 ON r1.user_id = u1.id
     LEFT JOIN users u2 ON r2.user_id = u2.id
     LEFT JOIN users uw ON rw.user_id = uw.id
     WHERE m.category_id = ?
     ORDER BY m.round, m.match_number`,
    [categoryId],
    (err, results) => {
      if (err) {
        console.error('Error fetching matches:', err);
        return res.status(500).json({ message: 'Failed to fetch matches' });
      }
      
      res.status(200).json(results);
    }
  );
};

exports.generateBracket = (req, res) => {
  const categoryId = req.params.categoryId;
  
  // First, check if the user is the event creator
  db.query(
    `SELECT c.*, e.creator_id 
     FROM categories c 
     JOIN events e ON c.event_id = e.id 
     WHERE c.id = ?`, 
    [categoryId], 
    (err, categoryResults) => {
      if (err) {
        console.error('Error fetching category:', err);
        return res.status(500).json({ message: 'Failed to generate bracket' });
      }

      if (categoryResults.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const category = categoryResults[0];
      
      // Check authorization
      if (category.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to generate brackets for this category' });
      }
      
      // Check for existing matches
      db.query('SELECT * FROM matches WHERE category_id = ?', [categoryId], (err, matchResults) => {
        if (err) {
          console.error('Error checking existing matches:', err);
          return res.status(500).json({ message: 'Failed to generate bracket' });
        }
        
        if (matchResults.length > 0) {
          return res.status(400).json({ message: 'Bracket already exists for this category' });
        }
        
        // Get approved registrations
        db.query(
          'SELECT * FROM registrations WHERE category_id = ? AND status = "approved"',
          [categoryId],
          (err, registrationResults) => {
            if (err) {
              console.error('Error fetching registrations:', err);
              return res.status(500).json({ message: 'Failed to generate bracket' });
            }
            
            if (registrationResults.length < 2) {
              return res.status(400).json({ message: 'Need at least 2 approved participants to generate a bracket' });
            }
            
            // Shuffle participants
            const participants = shuffleArray([...registrationResults]);
            const matches = generateSingleEliminationBracket(participants, categoryId);
            
            // Insert all matches
            insertMatches(matches, res);
          }
        );
      });
    }
  );
};

exports.updateMatch = (req, res) => {
  const matchId = req.params.id;
  const { winner_id, match_date, match_duration, notes } = req.body;

  // First, check if the match exists
  db.query(
    `SELECT m.*, c.event_id, e.creator_id 
     FROM matches m 
     JOIN categories c ON m.category_id = c.id 
     JOIN events e ON c.event_id = e.id 
     WHERE m.id = ?`, 
    [matchId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching match:', err);
        return res.status(500).json({ message: 'Failed to update match' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Match not found' });
      }

      const match = results[0];
      
      // Check if the user is the event creator
      if (match.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this match' });
      }
      
      // If winner is being set, validate it's one of the participants
      if (winner_id) {
        if (winner_id !== match.participant1_id && winner_id !== match.participant2_id) {
          return res.status(400).json({ message: 'Winner must be one of the match participants' });
        }
      }

      // Update the match
      const updateData = {
        winner_id: winner_id || match.winner_id,
        match_date: match_date || match.match_date,
        match_duration: match_duration !== undefined ? match_duration : match.match_duration,
        notes: notes !== undefined ? notes : match.notes
      };

      db.query('UPDATE matches SET ? WHERE id = ?', [updateData, matchId], (err, result) => {
        if (err) {
          console.error('Error updating match:', err);
          return res.status(500).json({ message: 'Failed to update match' });
        }

        // If winner is set, update next round match
        if (winner_id && winner_id !== match.winner_id) {
          updateNextRoundMatch(match, winner_id);
        }
        
        res.status(200).json({ 
          id: matchId,
          ...match,
          ...updateData
        });
      });
    }
  );
};

function updateNextRoundMatch(match, winnerId) {
  // Find the next round match
  const nextRound = match.round + 1;
  const matchPosition = Math.ceil(match.match_number / 2);
  
  db.query(
    'SELECT * FROM matches WHERE category_id = ? AND round = ? AND match_number = ?',
    [match.category_id, nextRound, matchPosition],
    (err, results) => {
      if (err || results.length === 0) {
        console.error('Error finding next round match:', err);
        return;
      }
      
      const nextMatch = results[0];
      const updateField = match.match_number % 2 === 1 ? 'participant1_id' : 'participant2_id';
      
      // Update the next match with the winner
      db.query(
        `UPDATE matches SET ${updateField} = ? WHERE id = ?`,
        [winnerId, nextMatch.id],
        (err, result) => {
          if (err) {
            console.error('Error updating next round match:', err);
          }
        }
      );
    }
  );
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateSingleEliminationBracket(participants, categoryId) {
  const totalParticipants = participants.length;
  const matches = [];
  
  // Calculate rounds needed - log2 rounded up
  const rounds = Math.ceil(Math.log2(totalParticipants));
  
  // First round matches (may include byes for power-of-2 bracket size)
  const firstRoundMatches = Math.pow(2, rounds - 1);
  
  let matchNumber = 1;
  
  // Generate first round matches
  for (let i = 0; i < firstRoundMatches; i++) {
    // Participant indices
    const p1Index = i * 2;
    const p2Index = i * 2 + 1;
    
    matches.push({
      category_id: categoryId,
      round: 1,
      match_number: matchNumber++,
      participant1_id: p1Index < totalParticipants ? participants[p1Index].id : null,
      participant2_id: p2Index < totalParticipants ? participants[p2Index].id : null,
      winner_id: null,
      match_date: null
    });
  }
  
  // Generate placeholders for subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const roundMatches = Math.pow(2, rounds - round);
    for (let i = 0; i < roundMatches; i++) {
      matches.push({
        category_id: categoryId,
        round: round,
        match_number: matchNumber++,
        participant1_id: null,
        participant2_id: null,
        winner_id: null,
        match_date: null
      });
    }
  }
  
  return matches;
}

function insertMatches(matches, res) {
  if (matches.length === 0) {
    return res.status(201).json({ message: 'Bracket generated successfully', matches: [] });
  }
  
  let insertedCount = 0;
  const insertedMatches = [];
  
  matches.forEach(match => {
    db.query('INSERT INTO matches SET ?', match, (err, result) => {
      if (err) {
        console.error('Error inserting match:', err);
      } else {
        match.id = result.insertId;
        insertedMatches.push(match);
      }
      
      insertedCount++;
      
      // Once all matches are processed, send response
      if (insertedCount === matches.length) {
        res.status(201).json({
          message: 'Bracket generated successfully',
          matches: insertedMatches
        });
      }
    });
  });
}
