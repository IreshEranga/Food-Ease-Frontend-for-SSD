import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import AdminTableComponent from '../../../components/AdminTable/Table';
import { generatePDF } from '../../../utils/GeneratePDF';
import { FaDownload } from "react-icons/fa6";
import api from "../../../api";

// Helper function to format dates for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to format items array as a numbered list string
const formatItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return "-";
  return items.map((item, index) => `${index + 1}. ${item.name} (Qty: ${item.quantity})`).join("\n");
};

function OrderManagement() {
  const [searchInput, setSearchInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(''); // '' (no filter), 'single', or 'range'
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Define columns for AdminTableComponent
  const columns = [
    { label: 'User ID', key: 'userId' },
    { label: 'Restaurant', key: 'restaurantName' },
    { label: 'Branch', key: 'branchName' },
    { label: 'Items', key: 'itemsFormatted' }, // Use pre-formatted items as numbered list string
    { label: 'Total Amount', key: 'totalAmount' },
    { label: 'Delivery Address', key: 'deliveryAddress' },
    { label: 'Order Status', key: 'orderStatus' },
    { label: 'Payment Status', key: 'paymentStatus' },
    { label: 'Created', key: 'createdAt' }
  ];

  // Fetch orders from API and format createdAt and items
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/order/orders');
        const data = response.data;
        console.log('API response:', data);
        if (!data || !Array.isArray(data.orders)) {
          throw new Error('Invalid response format: orders array not found');
        }
        // Store raw createdAt for filtering, formatted createdAt, and formatted items
        const ordersArray = data.orders.map(order => ({
          ...order,
          createdAtRaw: order.createdAt, // Keep raw ISO string for filtering
          createdAt: formatDate(order.createdAt), // Formatted for display
          itemsFormatted: formatItems(order.items) // Pre-format items as numbered list string
        }));
        setOrders(ordersArray);
        setFilteredOrders(ordersArray);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Failed to fetch orders');
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle filtering (search and date)
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchInput) {
      filtered = filtered.filter(order =>
        order &&
        (order._id?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.userId?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.restaurantName?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.branchName?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.deliveryAddress?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.orderStatus?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.paymentStatus?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.createdAt?.toLowerCase().includes(searchInput.toLowerCase()) ||
         order.itemsFormatted?.toLowerCase().includes(searchInput.toLowerCase())) // Search pre-formatted items
      );
    }

    // Apply date filter
    if (filterType === 'single' && singleDate) {
      const selectedDate = new Date(singleDate);
      const selectedDateStart = new Date(selectedDate.setHours(0, 0, 0, 0));
      const selectedDateEnd = new Date(selectedDate.setHours(23, 59, 59, 999));

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAtRaw);
        return orderDate >= selectedDateStart && orderDate <= selectedDateEnd;
      });
    } else if (filterType === 'range' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAtRaw);
        return orderDate >= start && orderDate <= end;
      });
    }

    setFilteredOrders(filtered);
  }, [searchInput, orders, filterType, singleDate, startDate, endDate]);

  // Download PDF report
  const downloadPDF = () => {
    try {
      console.log('Generating PDF with data:', filteredOrders);
      console.log('Columns:', columns.map(col => col.key));
      const additionalInfo = `Total Orders: ${filteredOrders.length}`;
      generatePDF(
        columns.map(col => col.key),
        filteredOrders, // itemsFormatted is a numbered list string
        "orders-report",
        additionalInfo
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, backgroundColor: '#f5f5f5', padding: '20px' }}>
        <h1 className="roleTitle bungee-spice-regular" style={{ textAlign: 'center', marginTop: '5px' }}>
          Order Management
        </h1>
        <div
          className='adminCustomerManagement-btnSection'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            margin: '20px 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search Orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '200px' }}
            />
            <button
              type="button"
              className="btn btn-info adminRoleManagement-downloadReportBtn"
              style={{ padding: '10px' }}
              onClick={downloadPDF}
              disabled={filteredOrders.length === 0}
            >
              <FaDownload /> Download Report
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              className="form-control"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setSingleDate(''); // Reset date inputs when changing filter type
                setStartDate('');
                setEndDate('');
              }}
              style={{ width: '150px' }}
            >
              <option value="">Filter by...</option>
              <option value="single">Single Date</option>
              <option value="range">Date Range</option>
            </select>
            {filterType === 'single' && (
              <input
                type="date"
                className="form-control"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                style={{ width: '150px' }}
              />
            )}
            {filterType === 'range' && (
              <>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  style={{ width: '150px' }}
                />
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  style={{ width: '150px' }}
                />
              </>
            )}
          </div>
        </div>
        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <AdminTableComponent
            columns={columns}
            data={filteredOrders}
            pageSize={7}
          />
        )}
      </div>
    </div>
  );
}

export default OrderManagement;