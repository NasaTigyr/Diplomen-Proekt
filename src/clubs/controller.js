// src/clubs/controller.js
const queries = require('./queries');
const db = require('../../db');
const path = require('path');
const fs = require('fs');

async function createClub(req, res) {
    try {
        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to create a club' });
        }
        
        const userId = req.session.user.id;
        const { 
            name, 
            description, 
            address, 
            phone, 
            email, 
            website, 
            established_date,
            federation_affiliation,
            other_federation,
            registration_code
        } = req.body;
        
        // Handle club logo if uploaded
        let logoPath = null;
        if (req.files && req.files.logo) {
            logoPath = '/uploads/' + req.files.logo[0].filename;
        }
        
        const currentDate = new Date();
        console.log('Using addClub query:', queries.addClub);
        
        // Insert club into database
        const result = await db.query(
            queries.addClub,
            [
                name,
                description,
                logoPath,
                userId,
                address,
                currentDate,
                currentDate,
                registration_code,
                phone,
                email,
                website,
                established_date || null,
                federation_affiliation === 'other' ? other_federation : federation_affiliation,
                req.files && req.files.certification ? '/uploads/' + req.files.certification[0].filename : null,
                req.files && req.files.coach_certification ? '/uploads/' + req.files.coach_certification[0].filename : null,
                'pending' // status
            ]
        );
        
        const clubId = result[0].insertId;
        
        // Update user type to coach
        await db.query('UPDATE users SET user_type = ? WHERE id = ?', ['coach', userId]);
        
        // Update session user_type
        req.session.user.user_type = 'coach';
        
        return res.status(200).json({ 
            message: 'Club created successfully! You are now a coach.',
            clubId: clubId
        });
    } catch (error) {
        console.error('Club creation error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the club' });
    }
}

async function getClubAthletes(clubId) {
    try {
        const [athletes] = await db.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.date_of_birth, 
                   u.gender, u.profile_picture, u.contact_number, 
                   ca.status, ca.join_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ? AND ca.status = 'active'
        `, [clubId]);
        
        return athletes;
    } catch (error) {
        console.error('Error fetching club athletes:', error);
        throw error;
    }
}

async function removeAthleteFromClub(clubId, athleteId, coachId) {
    try {
        // Verify the coach owns the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to remove athletes');
        }
        
        // Start a transaction
        await db.query('START TRANSACTION');
        
        try {
            // Remove athlete from club
            await db.query(
                "DELETE FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
                [clubId, athleteId]
            );
            
            // Check if the athlete has any other active club memberships
            const [otherMemberships] = await db.query(
                "SELECT * FROM club_athletes WHERE athlete_id = ? AND status = 'active'",
                [athleteId]
            );
            
            // If no other active memberships, update user type to 'regular'
            if (otherMemberships.length === 0) {
                await db.query(
                    "UPDATE users SET user_type = 'regular' WHERE id = ?",
                    [athleteId]
                );
            }
            
            // Commit the transaction
            await db.query('COMMIT');
            
            return { 
                success: true, 
                message: 'Athlete removed from club successfully',
                changedToRegular: otherMemberships.length === 0
            };
        } catch (updateError) {
            // Rollback the transaction if any error occurs
            await db.query('ROLLBACK');
            throw updateError;
        }
    } catch (error) {
        console.error('Error removing athlete from club:', error);
        throw error;
    }
}
// src/clubs/controller.js (continued)
// src/clubs/controller.js (continued)
async function getClubJoinRequests(clubId) {
    try {
        const [requests] = await db.query(`
            SELECT u.id as athlete_id, u.first_name, u.last_name, u.email, 
                   u.date_of_birth, u.gender, 
                   ca.id as request_id, ca.join_date as request_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ? AND ca.status = 'pending'
        `, [clubId]);
        
        return requests;
    } catch (error) {
        console.error('Error fetching join requests:', error);
        throw error;
    }
}

async function processJoinRequest(clubId, requestId, coachId, action) {
    try {
        // Verify the coach owns the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to process join requests');
        }
        
        // Get the join request details
        const [requestDetails] = await db.query(
            "SELECT * FROM club_athletes WHERE id = ? AND club_id = ? AND status = 'pending'",
            [requestId, clubId]
        );
        
        if (!requestDetails || requestDetails.length === 0) {
            throw new Error('Join request not found');
        }
        
        const athleteId = requestDetails[0].athlete_id;
        
        // Start a transaction
        await db.query('START TRANSACTION');
        
        try {
            if (action === 'approve') {
                // Update request status to active
                await db.query(
                    "UPDATE club_athletes SET status = 'active' WHERE id = ? AND club_id = ?",
                    [requestId, clubId]
                );
                
                // Update user type to athlete (if not already a coach)
                await db.query(
                    "UPDATE users SET user_type = 'athlete' WHERE id = ? AND user_type != 'coach'",
                    [athleteId]
                );
            } else if (action === 'reject') {
                // Delete the join request
                await db.query(
                    "DELETE FROM club_athletes WHERE id = ? AND club_id = ?",
                    [requestId, clubId]
                );
            }
            
            // Commit the transaction
            await db.query('COMMIT');
            
            return { 
                success: true, 
                message: action === 'approve' 
                    ? 'Join request approved successfully' 
                    : 'Join request rejected successfully' 
            };
        } catch (updateError) {
            // Rollback the transaction if any error occurs
            await db.query('ROLLBACK');
            throw updateError;
        }
    } catch (error) {
        console.error('Error processing join request:', error);
        throw error;
    }
}

async function approveJoinRequest(clubId, requestId, coachId) {
    return processJoinRequest(clubId, requestId, coachId, 'approve');
}

async function rejectJoinRequest(clubId, requestId, coachId) {
    return processJoinRequest(clubId, requestId, coachId, 'reject');
}

async function sendClubInvitation(userId, clubId, invitationData) {
    try {
        const { email, message } = invitationData;
        
        // Check if user is the club coach
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, userId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to send invitations');
        }
        
        // Check if email already exists in users table
        const [existingUser] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        
        if (!existingUser || existingUser.length === 0) {
            throw new Error('No user found with this email');
        }
        
        const targetUserId = existingUser[0].id;
        
        // Check if user is already in the club
        const [existingMembership] = await db.query(
            "SELECT * FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
            [clubId, targetUserId]
        );
        
        if (existingMembership.length > 0) {
            throw new Error('User is already a member of this club');
        }
        
        // Check for existing pending invitations
        const [existingInvitation] = await db.query(
            "SELECT * FROM club_invitations WHERE club_id = ? AND athlete_id = ? AND status = 'pending'",
            [clubId, targetUserId]
        );
        
        if (existingInvitation.length > 0) {
            throw new Error('An invitation is already pending for this user');
        }
        
        // Create invitation
        await db.query(
            "INSERT INTO club_invitations (club_id, athlete_id, message, status, sent_date) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)",
            [clubId, targetUserId, message || null]
        );
        
        return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
        console.error('Error sending club invitation:', error);
        throw error;
    }
}

// Export functions
module.exports = {
    createClub,
    getClubAthletes,
    removeAthleteFromClub,
    getClubJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    processJoinRequest,
    sendClubInvitation,
    // Include original club controller functions
    getClubs: async (req, res) => {
        try {
            const [rows] = await db.query(queries.getClubs);
            res.json(rows);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },
    getClubById: async (req, res) => {
        try {
            const id = req.params.id;
            const [rows] = await db.query(queries.getClubById, [id]);
            res.json(rows);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
};
