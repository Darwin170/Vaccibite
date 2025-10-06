import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; 
import "./UserManagement.css";

function M_user() {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]); 
  const [showAddMUserModal, setShowAddMUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    barangay: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchBarangays();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(` ${process.env.REACT_APP_API_URL}/auth/getMobileUser`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchBarangays = async () => {
    try {
      const res = await axios.get(` ${process.env.REACT_APP_API_URL}/auth/Barangays`);
      setBarangays(res.data);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };


  const handleUpdateMUser = async () => {
    const { fullName, email,  password, barangay } = newUser;
    if (!fullName || !email || !password || !barangay) return;

    try {
      await axios.put(
        ` ${process.env.REACT_APP_API_URL}/auth/updateMUser/${editUserId}`,
        newUser,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        barangay: "",
      });
      setEditUserId(null);
      showAddMUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(` ${process.env.REACT_APP_API_URL}/auth/deleteMUser/${id}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchUsers();
    }
    
    catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.MuserId);
    setNewUser({
      name: user.fullName,
      email: user.email,
      password: "",
      barangay: user.barangay, 
    });
    setShowAddMUserModal(true);
  };


  const getBarangayName = (barangayId) => {
    const brgy = barangays.find((b) => b._id === barangayId);
    return brgy ? brgy.name : "Unknown";
  };

  return (
    <div className="User-container">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Barangay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.MuserId}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{getBarangayName(user.barangay)}</td> 
                <td>
                  <button className="button" onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      
        {showAddMUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editUserId ? "Edit User" : "Add New User"}</h2>
              <input
                type="text"
                placeholder="Name"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
             <select
                value={newUser.barangay}
                onChange={(e) =>
                  setNewUser({ ...newUser, barangay: e.target.value })
                }
              >
                <option value="">-- Select Barangay --</option>
                {barangays.map((brgy) => (
                  <option key={brgy._id} value={brgy._id}>
                    {brgy.name}
                  </option>
                ))}
              </select>

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
             <div className="modal-buttons">
                <button
                  className="submit-btn"
                  onClick={handleUpdateMUser}
                >
                  Update
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddMUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default M_user;






