const addTeamRegistration = `INSERT INTO team_registrations (event_id, category_id, club_id, coach_id, registration_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const getTeamsRegistrations = 'SELECT * FROM team_registrations';
const getTeamRegistrationsByEventId = 'SELECT * FROM team_registrations WHERE event_id = ?';
const getTeamRegistrationsByCatId = 'SELECT * FROM team_registrations WHERE category_id = ?';
const getTeamRegistrationsByClubId = 'SELECT * FROM team_registrations WHERE club_id = ?';
const getTeamRegistrationsByCoachId = 'SELECT * FROM team_registrations WHERE coach_id = ?';
const getTeamRegistrationsByStatus = 'SELECT * FROM team_registrations WHERE status  = ?';

const deleteTeamRegistration = 'DELETE FROM team_registrations WHERE id = ?';
const updateTeamRegistration = 'Update team_registrations SET event_id = ?, category_id = ?, club_id = ?, coach_id = ?, registration_date = ?, status = ?, created_at = ?, updated_at = ? WHERE id = ?';


