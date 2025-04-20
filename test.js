const addUser = `INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender, 
    user_type, 
    profile_picture, 
    contact_number
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;