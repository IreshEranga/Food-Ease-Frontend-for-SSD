import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import { generatePDF } from '../../../utils/GeneratePDF';
import {FaDownload, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import api from '../../../api';
import './AdminRestaurantOwner.css';


function RestaurantOwnerManagement() {
  const [owners, setOwners] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await api.get('/api/users/owners/all');
      setOwners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setOwners([]);
    }
  };

  const filteredOwners = owners.filter((owner) =>
    owner.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    owner.ownerID?.toLowerCase().includes(searchInput.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Pagination logic
  const totalRows = filteredOwners.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOwners = filteredOwners.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };    

  const downloadPDF = () => {
    if (!Array.isArray(filteredOwners)) {
      console.error('filteredOwners is not an array:', filteredOwners);
      return;
    }
    generatePDF(
      ["ownerID", "name", "email", "mobileNumber"],
      filteredOwners,
      "owners-report-TastiGo",
      "Owner Management Report"
    );
  };


  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <h1 className="roleTitle bungee-spice-regular" style={{ textAlign: 'center', marginTop: '5px' }}>
          Restaurant Owner Management
        </h1>
        <div className='adminCustomerManagement-btnSection' style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '0 20px',
          margin: '20px 0'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search owners..."
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
        <div className="table-responsive" style={{ margin: '20px' }}>
          <table className='table table-striped table-hover'>
            <thead className='thead-dark'>
              <tr >
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope='col'>Customer ID</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope='col'>Name</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope='col'>Email</th>
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope='col'>Mobile Number</th>
              </tr>
            </thead>
            <tbody>
            {paginatedOwners && paginatedOwners.length > 0 ? (
                paginatedOwners.map((owner) => (
                  <tr key={owner._id}>
                    <td>{owner.ownerID}</td>
                    <td>{owner.name}</td>
                    <td>{owner.email}</td>
                    <td>{owner.mobileNumber}</td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    {searchInput ? 'No matching owners found' : 'No owners available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        {/* Pagination Controls */}
        {totalRows > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              {/* Previous Button */}
              <button
                className="btn btn-outline-primary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FaAngleLeft /> Previous
              </button>

              {/* Page Numbers */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePageChange(page)}
                    style={{ minWidth: '40px' }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                className="btn btn-outline-primary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Next <FaAngleRight />
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {totalRows > 0 && (
            <div style={{ textAlign: 'center', marginTop: '10px', color: '#555' }}>
              Page {currentPage} of {totalPages} | Total Rows: {totalRows}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantOwnerManagement;