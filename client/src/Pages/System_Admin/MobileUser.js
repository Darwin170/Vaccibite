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
      // FIX 1A: Remove leading space from template literal
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getMobileUser`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchBarangays = async () => {
    try {
      // FIX 1B: Remove leading space from template literal
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`);
      setBarangays(res.data);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };


  const handleUpdateMUser = async () => {
    const { fullName, email, password, barangay } = newUser;

    // FIX 2A: Prepare the payload dynamically to skip sending an empty password
    // Sending an empty password ("") will cause the server to fail validation
    const payload = { fullName, email, barangay };

    // If the password field is NOT empty, include it in the payload
    if (password) {
      payload.password = password;
    }

    // FIX 2B: Simplify validation. The password check is now server-side (only if present in payload).
    if (!fullName || !email || !barangay) {
      console.error("Name, email, and barangay must not be empty.");
      return;
    }

    try {
      // FIX 1C: Remove leading space from template literal
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/updateMUser/${editUserId}`,
        payload, // Send the dynamic payload (payload instead of newUser)
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        }
      );
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        barangay: "",
      });
      setEditUserId(null);
      // FIX 3: Correctly call the state setter function
      setShowAddMUserModal(false); 
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      // Log response data if available for debugging server-side issues
      if (err.response) {
        console.error("Server response:", err.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      // FIX 1D: Remove leading space from template literal
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/deleteMUser/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });
      fetchUsers();
    }
    catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.MuserId);
    setNewUser({
      // FIX 4: Use 'fullName' key to match state definition
      fullName: user.fullName,
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
                // FIX 4: Use 'fullName' key in onChange handler
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
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
                placeholder="Password (Leave blank to keep existing)"
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
