const getIndividualRegistrations = 'SELECT * FROM individual_registrations';
const getIndividualRegistrationsByEventId = 'SELECT * FROM individual_registrations WHERE event_id = ?';
const getIndividualRegistrationsByCategoryId = 'SELECT * FROM individual_registrations WHERE category_id = ?';
const getIndividualRegistrationByAthleteId = 'SELECT * FROM individual_registrations WHERE athlete_id = ?';
const getIndividualRegistrationsByRegistrationDate = 'SELECT * FROM individual_registrations WHERE registration_date = ?';
const getIndividualRegistrationsByStatus = 'SELECT * FROM individual_registrations WHERE status = ?';
const getIndividualRegistrationsByCreatedAt = 'SELECT * FROM individual_registrations WHERE created_at = ?';
const getIndividualRegistrationsByUpdatedAt = 'SELECT * FROM individual_registrations WHERE updated_at = ?';
//const getPassword = ' SELECT password FROM individual_registrationss WHERE id = ?';

const addIndividualRegistration = `INSERT INTO individual_registrations (event_id, category_id, athlete_id, registration_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ? )`;
const deleteIndividualRegistration = 'DELETE FROM individual_registrations WHERE id = ?';
const updateIndividualRegistration = 'Update individual_registrations SET event_id = ?, category_id = ?, athlete_id = ?, registration_date = ?, status = ?, created_at = ?, updated_at = ? WHERE id = ?';


