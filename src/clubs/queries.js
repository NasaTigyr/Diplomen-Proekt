const getClubs = 'SELECT * FROM clubs';
const getClubByName = 'SELECT * FROM clubs WHERE name = ?';
const getClubsByFed = 'SELECT * FROM clubs WHERE federation_affiliation = ?';
const getClubById = 'SELECT * FROM clubs WHERE id = ?';
const getClubsByStatus = 'SELECT * FROM clubs WHERE status = ?';
const getClubsByDate = 'SELECT * FROM clubs WHERE start_date = ?';
//const getPassword = ' SELECT password FROM clubs WHERE id = ?';

const addClub = `INSERT INTO clubs (name, description, logo, coach_id, address, created_at, updated_at, registration_code, phone, email, website, established_date, federation_affiliation, certification_document, coach_certification, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const deleteClub = 'DELETE FROM clubs WHERE id = ?';
const updateClub = 'Update clubs SET name = ?, description = ?, logo = ?, coach_id = ?, address = ?, created_at = ?, updated_at = ?, registrtation_code = ?, phone = ?, email = ?, website = ?, updated_at = ?, status =?  WHERE id = ?';


const queries = { 
  getClubs,
  getClubByName, 
  getClubsByFed, 
  getClubById,
  getClubsByStatus,
  getClubsByDate, 
  addClub,
  deleteClub,
  updateClub,
};

module.exports = queries;
