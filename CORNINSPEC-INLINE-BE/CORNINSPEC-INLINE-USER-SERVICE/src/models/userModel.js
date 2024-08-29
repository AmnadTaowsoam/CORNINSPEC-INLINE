const { usersPool } = require("../config/dbConfig");
const bcrypt = require("bcryptjs");

async function getUserByUsername(username) {
  console.log(`Fetching user from DB: ${username}`);
  const query = "SELECT * FROM users.users WHERE username = $1";
  const values = [username];
  try {
    const res = await usersPool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error fetching user from database:", error.message);
    throw error;
  }
}

async function createUser({ username, password, email, roles, port }) {
  console.log(`Creating user: ${username}`);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const query =
    "INSERT INTO users.users (username, pwd, email, roles, port) VALUES ($1, $2, $3, $4, $5) RETURNING *;";
  const values = [username, hashedPassword, email, roles, port];
  try {
    const res = await usersPool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
}

async function updateUser(username, newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const query =
    "UPDATE users.users SET pwd = $2 WHERE username = $1 RETURNING *";
  const values = [username, hashedPassword];
  try {
    const res = await usersPool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error updating user password:", error.message);
    throw error;
  }
}

async function findUserByUsername(username) {
  const query = "SELECT * FROM users.users WHERE username = $1";
  const values = [username];
  try {
    const res = await usersPool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error fetching user from database:", error.message);
    throw error;
  }
}

async function findUserById(userId) {
  const query = "SELECT * FROM users.users WHERE user_id = $1";
  const values = [userId];
  try {
    const res = await usersPool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error fetching user by ID from database:", error.message);
    throw error;
  }
}

async function deleteUser(userId) {
  const query = "DELETE FROM users.users WHERE user_id = $1 RETURNING *";
  const values = [userId];
  try {
    const res = await usersPool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error("User not found");
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw error;
  }
}

async function getAllUsers() {
  const query = "SELECT * FROM users.users";
  try {
    const res = await usersPool.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error fetching all users from database:", error.message);
    throw error;
  }
}

module.exports = {
  getUserByUsername,
  findUserByUsername,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers
};
