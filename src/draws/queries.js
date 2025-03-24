const getDraws = 'SELECT * FROM draws';
const getDrawId = 'SELECT * from draws WHERE id = ?'; 
const getDrawByCategoryId = 'SELECT * FROM draws WHERE category_id = ?';
const getDrawsByStatus = 'SELECT * FROM draws WHERE status = ?';

const addDraw = `INSERT INTO draws (category_id,  status , file_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
const deleteDraw = 'DELETE FROM draws WHERE id = ?';
const updateDraw = 'Update draws SET category_id = ?, status = ?, file_path = ?, created_at = ?, updated_at = ? WHERE id = ?';


