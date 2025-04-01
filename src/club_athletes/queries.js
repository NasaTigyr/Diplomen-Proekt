const getClubAthletes = 'SELECT * FROM club_athletes';
const getClubAthletesByClubId = 'SELECT * FROM club_athletes WHERE club_id = ?';
const getClubAthleteByAthleteId = 'SELECT * FROM club_athletes WHERE athlete_id = ?';
const getClubAthletesByJoinDate = 'SELECT * FROM club_athletes WHERE join_date = ?';
const getClubAthletesByStatus = 'SELECT * FROM club_athletes WHERE status = ?';
const getClubAthletesByCreatedAt = 'SELECT * FROM club_athletes WHERE created_at = ?';
const getClubAthletesByUpdatedAt = 'SELECT * FROM club_athletes WHERE updated_at = ?';
//const getPassword = ' SELECT password FROM ClubAthletes WHERE id = ?';

const addClubAthlete = `INSERT INTO club_athletes (club_id, athlete_id, join_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
const deleteClubAthlete = 'DELETE FROM club_athletes WHERE id = ?';
const updateClubAthlete = 'Update club_athletes SET name = ?, description = ?, banner_image = ?, address = ?, start_date = ?, end_date = ?, registration_start = ?, registrtation_end = ?, event_type = ?, creator_id = ?, timetable_file = ?, created_at = ?, updated_at = ?  WHERE id = ?';


