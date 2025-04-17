// src/club_invitations/queries.js
const getClubInvitations = 'SELECT * FROM club_invitations';
const getClubInvitationsByClubId = 'SELECT * FROM club_invitations WHERE club_id = ?';
const getClubInvitationsByAthleteId = 'SELECT * FROM club_invitations WHERE athlete_id = ?';
const getClubInvitationsByStatus = 'SELECT * FROM club_invitations WHERE status = ?';
const getClubInvitationById = 'SELECT * FROM club_invitations WHERE id = ?';
const getPendingInvitation = 'SELECT * FROM club_invitations WHERE club_id = ? AND athlete_id = ? AND status = "pending"';

const addClubInvitation = `INSERT INTO club_invitations (club_id, athlete_id, message, status, sent_date) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`;
const deleteClubInvitation = 'DELETE FROM club_invitations WHERE id = ?';
const updateClubInvitationStatus = 'UPDATE club_invitations SET status = ?, updated_at = NOW() WHERE id = ?';

module.exports = {
  getClubInvitations,
  getClubInvitationsByClubId,
  getClubInvitationsByAthleteId,
  getClubInvitationsByStatus,
  getClubInvitationById,
  getPendingInvitation,
  addClubInvitation,
  deleteClubInvitation,
  updateClubInvitationStatus
};
