// A simple placeholder model to handle user-related logic (could be a DB model)
module.exports = {
  createUser: (username, password) => {
    // You can add logic to store user data in a database
    console.log(`User ${username} created with password: ${password}`);
  }
};

