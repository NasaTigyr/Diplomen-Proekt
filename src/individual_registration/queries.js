// src/individual_registration/queries.js
const getIndividualRegistrations = 'SELECT * FROM individual_registrations';
const getIndividualRegistrationsByEventId = 'SELECT * FROM individual_registrations WHERE event_id = ?';
const getIndividualRegistrationsByCategoryId = 'SELECT * FROM individual_registrations WHERE category_id = ?';
const getIndividualRegistrationByAthleteId = 'SELECT * FROM individual_registrations WHERE athlete_id = ?';
const getIndividualRegistrationById = 'SELECT * FROM individual_registrations WHERE id = ?';
const getIndividualRegistrationsByRegistrationDate = 'SELECT * FROM individual_registrations WHERE registration_date = ?';
const getIndividualRegistrationsByStatus = 'SELECT * FROM individual_registrations WHERE status = ?';
const getIndividualRegistrationsWithDetails = `
  SELECT ir.*, c.name as category_name, e.name as event_name
  FROM individual_registrations ir
  JOIN categories c ON ir.category_id = c.id
  JOIN events e ON ir.event_id = e.id
  WHERE ir.athlete_id = ?
`;

const addIndividualRegistration = `INSERT INTO individual_registrations (event_id, category_id, athlete_id, registration_date, status) VALUES (?, ?, ?, ?, ?)`;
const deleteIndividualRegistration = 'DELETE FROM individual_registrations WHERE id = ?';
const updateIndividualRegistrationStatus = 'UPDATE individual_registrations SET status = ? WHERE id = ?';

module.exports = {
  getIndividualRegistrations,
  getIndividualRegistrationsByEventId,
  getIndividualRegistrationsByCategoryId,
  getIndividualRegistrationByAthleteId,
  getIndividualRegistrationById,
  getIndividualRegistrationsByRegistrationDate,
  getIndividualRegistrationsByStatus,
  getIndividualRegistrationsWithDetails,
  addIndividualRegistration,
  deleteIndividualRegistration,
  updateIndividualRegistrationStatus
};
