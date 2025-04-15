const getClubInvitations = 'SELECT * FROM club_invitations';
const getClubInvitationsByClubId = 'SELECT * FROM club_invitations WHERE club_id = ?';
const getClubInvitationsByAthleteId = 'SELECT * FROM club_invitations WHERE athlete_id = ?';
const getClubInvitationsByStatus = 'SELECT * FROM club_invitations WHERE status = ?';
const getClubInvitationById = 'SELECT * FROM club_invitations WHERE id = ?';
const getClubInvitationsWithDetails = `
  SELECT ci.*, c.name as club_name, c.logo, u.first_name, u.last_name 
  FROM club_invitations ci
  JOIN clubs c ON ci.club_id = c.id
  JOIN users u ON c.coach_id = u.id
  WHERE ci.athlete_id = ? AND ci.status = ?
`;
const getPendingInvitation = 'SELECT * FROM club_invitations WHERE club_id = ? AND athlete_id = ? AND status = "pending"';

const addClubInvitation = `INSERT INTO club_invitations (club_id, athlete_id, message, status, sent_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;

const deleteClubInvitation = 'DELETE FROM club_invitations WHERE id = ?';

const updateClubInvitation = 'UPDATE club_invitations SET status = ?, updated_at = ? WHERE id = ?';

module.exports = {
  getClubInvitations,
  getClubInvitationsByClubId,
  getClubInvitationsByAthleteId,
  getClubInvitationsByStatus,
  getClubInvitationById,
  getClubInvitationsWithDetails,
  getPendingInvitation,
  addClubInvitation,
  deleteClubInvitation,
  updateClubInvitation
};
