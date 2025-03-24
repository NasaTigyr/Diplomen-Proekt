const getTeamRegistrationAthletes = 'SELECT * FROM team_registration_athletes';
const getTeamRegistrationAthletesByTeamRegId = 'SELECT * FROM team_registration_athletes WHERE team_registration_id = ?';
const getTeamRegistrationAthletesByAthleteId = 'SELECT * FROM team_registration_athletes WHERE athlete_id = ?';
const getTeamRegistrationAthletesByCreatedAt = 'SELECT * FROM team_registration_athletes WHERE created_at = ?';
const getTeamRegistrationAthletesByUpdatedAt = 'SELECT * FROM team_registration_athletes WHERE updated_at = ?';

const addTeamRegistrationAthlete = `INSERT INTO team_registration_athletes (team_registration_id, athlete_id,created_at,updated_at) VALUES (?, ?, ?, ?)`;
const deleteTeamRegistrationAthlete = 'DELETE FROM team_registration_athletes WHERE id = ?';
const updateTeamRegistrationAthlete = 'Update team_registration_athletes SET team_registration_id = ?, athlete_id = ?, created_at = ?, updated_at = ? WHERE id = ?';


