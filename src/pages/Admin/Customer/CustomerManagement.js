import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import { generatePDF } from '../../../utils/GeneratePDF';
import { FaPlusCircle, FaDownload, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import api from '../../../api';
import AddCustomer from './AddCustomer';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/users/customers/all');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    customer.customerID?.toLowerCase().includes(searchInput.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Pagination logic
  const totalRows = filteredCustomers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const downloadPDF = () => {
    if (!Array.isArray(filteredCustomers)) {
      console.error('filteredCustomers is not an array:', filteredCustomers);
      return;
    }
    generatePDF(
      ["customerID", "name", "email", "mobileNumber", "address"],
      filteredCustomers,
      "customers-report-TastiGo",
      "Customer Management Report"
    );
  };

  const handleCustomerAdded = () => {
    fetchCustomers(); // Refresh customer list after adding
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <h1 className="roleTitle bungee-spice-regular" style={{ textAlign: 'center', marginTop: '5px' }}>
          Customer Management
        </h1>
        <div className='adminCustomerManagement-btnSection' style={{ 
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
            <FaPlusCircle /> Add New Customer
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search customers..."
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
                <th style={{backgroundColor:'#EB5B00', color:'white'}} scope='col'>Address</th>
              </tr>
            </thead>
            <tbody>
            {paginatedCustomers && paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.customerID}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.mobileNumber}</td>
                    <td>{customer.address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    {searchInput ? 'No matching customers found' : 'No customers available'}
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
      <AddCustomer 
        show={showAddModal} 
        handleClose={() => setShowAddModal(false)} 
        onCustomerAdded={handleCustomerAdded} 
      />
    </div>
  );
}

export default CustomerManagement;