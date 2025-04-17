// src/club_athletes/queries.js
const getClubAthletes = 'SELECT * FROM club_athletes';
const getClubAthletesByClubId = 'SELECT * FROM club_athletes WHERE club_id = ? AND status = ?';
const getClubAthleteByAthleteId = 'SELECT * FROM club_athletes WHERE athlete_id = ?';
const getClubAthletesByJoinDate = 'SELECT * FROM club_athletes WHERE join_date = ?';
const getClubAthletesByStatus = 'SELECT * FROM club_athletes WHERE status = ?';
const getClubJoinRequests = `
  SELECT ca.id, ca.athlete_id, u.first_name, u.last_name, u.email, 
  u.date_of_birth, u.gender, ca.join_date as request_date 
  FROM club_athletes ca 
  JOIN users u ON ca.athlete_id = u.id 
  WHERE ca.club_id = ? AND ca.status = 'pending'
`;

const addClubAthlete = `INSERT INTO club_athletes (club_id, athlete_id, join_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
const deleteClubAthlete = 'DELETE FROM club_athletes WHERE club_id = ? AND athlete_id = ?';
const updateClubAthleteStatus = 'UPDATE club_athletes SET status = ?, updated_at = ? WHERE id = ?';

module.exports = {
  getClubAthletes,
  getClubAthletesByClubId,
  getClubAthleteByAthleteId,
  getClubAthletesByJoinDate,
  getClubAthletesByStatus,
  getClubJoinRequests,
  addClubAthlete,
  deleteClubAthlete,
  updateClubAthleteStatus
};
