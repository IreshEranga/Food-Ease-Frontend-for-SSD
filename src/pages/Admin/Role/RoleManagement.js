import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import { FaDownload } from "react-icons/fa6";
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";
import './RoleManagement.css';
import api from '../../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { generatePDF } from '../../../utils/GeneratePDF';
import AddRole from './AddRole';
import UpdateRole from './UpdateRole';
import { confirmMessage } from '../../../utils/Alert';
import Toast from '../../../utils/toast';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);


  const handleRoleAdded = async () => {
    try {
      const response = await api.get('/api/users/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error refreshing roles:', error);
    }
  };

  const handleUpdate = async (roleId) => {
    const roleToEdit = roles.find((role) => role._id === roleId);
    if (roleToEdit) {
      setSelectedRole(roleToEdit);
      setShowUpdateModal(true);
    }
  };
  
  const handleDelete = (id) => {
    confirmMessage(
      'Are you sure?',
      "You won't be able to revert this!",
      async () => {
        try {
          const response = await api.delete(`/api/users/roles/${id}`);
          if (response.status === 200 || response.data.success) {
            Toast({ type: 'success', message: 'Role deleted successfully!' });
            handleRoleAdded();
          } else {
            Toast({ type: 'error', message: 'Failed to delete role.' });
          }
        } catch (error) {
          console.error('Delete role error:', error);
          Toast({ type: 'error', message: error.response?.data?.message || 'Server error' });
        }
      }
    );
  };
  

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/api/users/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.roleType.toLowerCase().includes(searchInput.toLowerCase()) ||
    role.roleID.toLowerCase().includes(searchInput.toLowerCase())
  );

  const downloadPDF = () => {
          if (!Array.isArray(filteredRoles)) {
            console.error('filteredRoles is not an array:', filteredRoles);
            return;
          }
          generatePDF(
            ["roleID", "roleType", "createdAt", "updatedAt"],
            filteredRoles,
            "roles-report-TastiGo"
          );
        };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <h1 className="roleTitle bungee-spice-regular" style={{ textAlign: 'center', marginTop: '5px' }}>Role Management</h1>
        <div className='adminRoleManagement-btnSection' style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '0 20px',
          margin: '20px 0'
        }}>
          <button 
            type="button" 
            className="btn btn-warning" 
            style={{ padding: '10px' }}
            onClick={() => setShowAddModal(true)}
          >
            <FaPlusCircle /> Add New Role
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search roles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '200px' }}
            />
            <button 
              type="button" 
              className="btn btn-info adminRoleManagement-downloadReportBtn" 
              style={{ padding: '10px' }}
              onClick={downloadPDF}
            >
              <FaDownload /> Download Report
            </button>
          </div>
        </div>
        {/* <div className="table-responsive" style={{ margin: '20px' }}>
          <table className="table table-striped table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope="col">Role ID</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope="col">Role Type</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope="col">Created Date</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope="col">Updated Date</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles && filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role._id}>
                    <td>{role.roleID}</td>
                    <td>{role.roleType}</td>
                    <td>{new Date(role.createdAt).toLocaleString()}</td>
                    <td>{new Date(role.updatedAt).toLocaleString()}</td>
                    <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleUpdate(role._id)}
                        className="btn btn-primary btn-sm me-2"
                        title="Update this role"
                        aria-label="Update role"
                      >
                        <FaEdit className="me-1" /> Update
                      </button>
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="btn btn-danger btn-sm"
                        title="Delete this role"
                        aria-label="Delete role"
                      >
                        <FaTrash className="me-1" /> Delete
                      </button>
                      </div>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    {searchInput ? 'No matching roles found' : 'No roles available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}
        <div className="table-responsive" style={{ margin: '20px' }}>
  <table className="table table-striped table-hover">
    <thead className="thead-dark">
      <tr>
        <th style={{ backgroundColor: '#EB5B00', color: 'white' }} scope="col">Role ID</th>
        <th style={{ backgroundColor: '#EB5B00', color: 'white' }} scope="col">Role Type</th>
        <th style={{ backgroundColor: '#EB5B00', color: 'white' }} scope="col">Created Date</th>
        <th style={{ backgroundColor: '#EB5B00', color: 'white' }} scope="col">Updated Date</th>
        <th style={{ backgroundColor: '#EB5B00', color: 'white' }} scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredRoles && filteredRoles.length > 0 ? (
        filteredRoles.map((role) => (
          <tr key={role._id}>
            <td>{role.roleID}</td>
            <td>{role.roleType}</td>
            <td>{new Date(role.createdAt).toLocaleString()}</td>
            <td>{new Date(role.updatedAt).toLocaleString()}</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => handleUpdate(role._id)}
                  className="btn btn-primary btn-sm me-2"
                  title="Update this role"
                  aria-label="Update role"
                >
                  <FaEdit className="me-1" /> Update
                </button>
                <button
                  onClick={() => handleDelete(role._id)}
                  className="btn btn-danger btn-sm"
                  title="Delete this role"
                  aria-label="Delete role"
                >
                  <FaTrash className="me-1" /> Delete
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center' }}>
            {searchInput ? 'No matching roles found' : 'No roles available'}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>
      <AddRole 
        show={showAddModal} 
        handleClose={() => setShowAddModal(false)} 
        onRoleAdded={handleRoleAdded}
      />
      <UpdateRole
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        role={selectedRole}
        onRoleUpdated={handleRoleAdded}
      />

    </div>
    
  );
  
}



export default RoleManagement;