import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; // ✅ Make sure Sidebar is imported
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    position: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8787/auth/getUser");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleAddUser = async () => {
    const { name, email, phone, password, position } = newUser;
    if (!name || !email || !phone || !password || !position) return;

    try {
      await axios.post("http://localhost:8787/auth/createUser", newUser);
      setNewUser({ name: "", email: "", phone: "", password: "", position: "" });
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleUpdateUser = async () => {
    const { name, email, phone, password, position } = newUser;
    if (!name || !email || !phone || !password || !position) return;

    try {
      await axios.put(`http://localhost:8787/auth/updateUser/${editUserId}`, newUser);
      setNewUser({ name: "", email: "", phone: "", password: "", position: "" });
      setEditUserId(null);
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8787/auth/deleteUser/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "", 
      position: user.position,
    });
    setShowAddUserModal(true);
  };

  return (
        <div className="User-container">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <button
          className="button mb-4"
          onClick={() => {
            setEditUserId(null);
            setNewUser({ name: "", email: "", phone: "", password: "", position: "" });
            setShowAddUserModal(true);
          }}
        >
          + Add User
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.position}</td>
                <td>
                  <button className="button" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editUserId ? "Edit User" : "Add New User"}</h2>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Position"
                value={newUser.position}
                onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <div className="modal-buttons">
                <button className="submit-btn" onClick={editUserId ? handleUpdateUser : handleAddUser}>
                  {editUserId ? "Update" : "Submit"}
                </button>
                <button className="cancel-btn" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
