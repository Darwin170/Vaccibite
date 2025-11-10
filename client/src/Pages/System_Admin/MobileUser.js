import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./UserManagement.css";

// Assuming your backend serves static files (like confirmation documents) from a base URL
// Example: http://localhost:5000/uploads/confirmation_documents/file-name.jpg
const FILE_BASE_URL = process.env.REACT_APP_API_URL.replace('/api', ''); // Adjust this based on your API structure

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
    isActive: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchBarangays();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getMobileUser`);
      // Assuming user objects now include confirmationDocument: string
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchBarangays = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`);
      setBarangays(res.data);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };


  const handleUpdateMUser = async () => {
    const { fullName, email, password, barangay } = newUser;
    // NOTE: You should typically NOT update the user's password here unless a new one is explicitly entered.
    // If the modal is used for editing, you might want to skip password if it's empty.
    if (!fullName || !email || !barangay) return; 

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/updateMUser/${editUserId}`,
        newUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        barangay: "",
        isActive: true,
      });
      setEditUserId(null);
      setShowAddMUserModal(false); // Corrected: Use setShowAddMUserModal(false)
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/deleteMUser/${id}`, {
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

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} ${user.fullName}'s account?`)) return;

    try {

      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/toggleMUserStatus/${user._id}`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Failed to ${action} user. Check console for details.`);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setNewUser({
      fullName: user.fullName,
      email: user.email,
      // NOTE: Never pre-fill password in an edit form for security.
      // If the field is left blank, your backend update route should ignore it.
      password: "", 
      barangay: user.barangay,
    });
    setShowAddMUserModal(true);
  };

  const getBarangayName = (barangayId) => {
    const brgy = barangays.find((b) => b._id === barangayId);
    return brgy ? brgy.name : "Unknown";
  };
  
  // NEW: Function to open the document in a new tab
  const handleViewDocument = (documentPath) => {
    // Construct the full URL using the path returned from the backend
    const fullUrl = `${FILE_BASE_URL}/${documentPath}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="User-container">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        
        {/* Table Title (Optional, but good practice) */}
        <h1>Mobile User Management</h1> 
        
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Barangay</th>
              <th>Status</th>
              {/* NEW COLUMN */}
              <th>Confirmation Document</th> 
              {/* RENAMED COLUMN */}
              <th>Status Control</th> 
              {/* SEPARATE ACTIONS COLUMN */}
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
                <td style={{ color: user.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </td>
                
                {/* NEW TABLE DATA CELL */}
                <td>
                  {user.confirmationDocument ? (
                    <button
                      className="view-doc-button"
                      onClick={() => handleViewDocument(user.confirmationDocument)}
                      style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      View Document
                    </button>
                  ) : (
                    <span style={{ color: 'gray' }}>No Document</span>
                  )}
                </td>
                
                {/* STATUS CONTROL ACTIONS */}
                <td>
                  <button
                    className={user.isActive ? 'deactivate-button' : 'activate-button'}
                    onClick={() => handleToggleStatus(user)}
                    style={{ backgroundColor: user.isActive ? '#dc3545' : '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
                
                {/* GENERAL ACTIONS */}
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


        {/* Modal remains the same, but note about password field has been added in code */}
        {showAddMUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editUserId ? "Edit User" : "Edit User"}</h2>
              <input
                type="text"
                placeholder="Name"
                value={newUser.fullName}
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
                placeholder="New Password (Leave blank to keep old one)"
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
