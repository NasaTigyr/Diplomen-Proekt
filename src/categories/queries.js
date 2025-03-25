const getCategories = 'SELECT * FROM categories';
const getCategoryById = 'SELECT * FROM categories WHERE id = ?';
const getCategoriesByEventId = 'SELECT * FROM categories WHERE event_id = ?';
const getCategoryByName = 'SELECT * FROM categories WHERE name = ?';
const getCategoriesByGender = 'SELECT * FROM categories WHERE gender = ?';
const getCategoriesByAge = 'SELECT * FROM categories WHERE age_group = ?';
const getCategoriesByDescription = 'SELECT * FROM categories WHERE description = ?';

const addCategory = `INSERT INTO categories (event_id, name, age_group, gender, description, max_participants, draw_file_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const deleteCategory = 'DELETE FROM categories WHERE id = ?';
const updateCategory = 'Update categories SET name = ?, age_group = ?, gender = ?, description = ?, max_participants = ?, draw_file_path = ?, updated_at = ? WHERE id = ?';

module.exports = {
  getCategories,
  getCategoryById,
  getCategoriesByEventId,
  getCategoryByName,
  getCategoriesByGender,
  getCategoriesByAge,
  getCategoriesByDescription,
  addCategory,
  deleteCategory,
  updateCategory,
};
