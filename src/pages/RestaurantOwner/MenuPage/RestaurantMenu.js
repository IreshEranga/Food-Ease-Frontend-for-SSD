import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './RestaurantMenu.css';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaDownload, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import jsPDF from 'jspdf';

const RestaurantMenu = ({ restaurantID, restaurantName, onClose }) => {
  const [groupedMenus, setGroupedMenus] = useState({});
  const [, setCategories] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantImage, setRestaurantImage] = useState(null);

  const fetchMenus = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurant/menu/restaurant/${restaurantID}`);
      const data = res.data;
  
      const grouped = data.reduce((acc, menu) => {
        const categoryName = menu.category?.name || 'Uncategorized';
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(menu);
        return acc;
      }, {});
      setGroupedMenus(grouped);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    }
  }, [restaurantID]);
  
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const ownerID = decoded.userID;
  
      const res = await api.get(`/api/restaurant/categories/owner/${ownerID}/restaurant/${restaurantID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [restaurantID]);

  const fetchRestaurantImage = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurant/restaurants/${restaurantID}`);
      setRestaurantImage(res.data.image || null);
    } catch (err) {
      console.error('Failed to fetch restaurant image:', err);
    }
  }, [restaurantID]);

  useEffect(() => {
    if (restaurantID) {
      fetchMenus();
      fetchCategories();
      fetchRestaurantImage();
    }
  }, [restaurantID, fetchMenus, fetchCategories, fetchRestaurantImage]);

  const handleEdit = (menu) => {
    setEditingMenu(menu._id);
    setEditFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      category: menu.category?._id || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    setEditImage(e.target.files[0]);
  };

  const handleEditCancel = () => {
    setEditingMenu(null);
    setEditFormData({});
    setEditImage(null);
  };

  const handleEditSubmit = async (e, menuID) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();

      form.append('name', editFormData.name);
      form.append('description', editFormData.description || '');
      form.append('price', parseFloat(editFormData.price));
      form.append('category', editFormData.category);
      if (editImage) form.append('image', editImage);

      await api.put(`/api/restaurant/menu/${menuID}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast({ type: 'success', message: 'Menu item updated successfully!' });
      setEditingMenu(null);
      fetchMenus();
    } catch (err) {
      console.error(err);
      Toast({ type: 'error', message: 'Failed to update menu item' });
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await api.delete(`/api/restaurant/menu/${menuId}`);
      fetchMenus();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleToggleAvailability = async (menuId, currentAvailability) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/restaurant/menu/${menuId}`, 
        { available: !currentAvailability },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Toast({ type: 'success', message: `Menu item marked as ${currentAvailability ? 'unavailable' : 'available'}!` });
      fetchMenus();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      Toast({ type: 'error', message: 'Failed to update availability' });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      lineHeight: 1.2,
    });

    let yPosition = 20;

    // Add restaurant image if available
    if (restaurantImage) {
      try {
        const imgResponse = await fetch(restaurantImage);
        const imgBlob = await imgResponse.blob();
        const imgUrl = URL.createObjectURL(imgBlob);
        doc.addImage(imgUrl, 'PNG', 80, yPosition, 50, 50);
        yPosition += 55;
        URL.revokeObjectURL(imgUrl);
      } catch (err) {
        console.error('Failed to load restaurant image for PDF:', err);
      }
    }

    // Add restaurant name as title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(139, 0, 0); // Dark red color
    doc.text(restaurantName, 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Add subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Menu', 105, yPosition, { align: 'center' });
    yPosition += 10;

    // Add decorative line
    doc.setLineWidth(0.5);
    doc.setDrawColor(139, 0, 0);
    doc.line(30, yPosition, 180, yPosition);
    yPosition += 10;

    // Add menu items by category
    Object.entries(groupedMenus)
      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
      .forEach(([categoryName, menus]) => {
        // Category header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(139, 0, 0);
        doc.text(categoryName, 20, yPosition);
        yPosition += 8;

        // Menu items, sorted alphabetically by name
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        menus
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((menu) => {
            // Item name and price on the same line
            const nameText = menu.name;
            const priceText = `Rs.${menu.price.toFixed(2)}`;
            doc.text(nameText, 25, yPosition);
            doc.text(priceText, 180, yPosition, { align: 'right' });
            yPosition += 6;

            // Item description
            if (menu.description) {
              doc.setFontSize(10);
              doc.setTextColor(100, 100, 100); // Gray for description
              const descLines = doc.splitTextToSize(menu.description, 160);
              descLines.forEach((line) => {
                doc.text(line, 25, yPosition);
                yPosition += 5;
              });
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
            }
            yPosition += 2;
          });
        yPosition += 5; // Space between categories
      });

    // Add footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(139, 0, 0);
    doc.text('Enjoy your meal!', 105, 280, { align: 'center' });

    // Save the PDF
    doc.save(`${restaurantName}_Menu.pdf`);
    Toast({ type: 'success', message: 'Menu downloaded successfully!' });
  };

  const filteredMenus = (() => {
    const menuObject = Object.entries(groupedMenus).reduce((acc, [categoryName, menus]) => {
      const filtered = menus
        .filter(menu =>
          menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      if (filtered.length > 0) {
        acc[categoryName] = filtered;
      }
      return acc;
    }, {});

    return Object.entries(menuObject).sort(([categoryA], [categoryB]) => 
      categoryA.localeCompare(categoryB)
    );
  })();

  return (
    <div className="menu-view-modal">
      <div className="menu-view-content">
        <button className="close-button" onClick={onClose}>Close</button>
        <h3 style={{ textAlign: 'center', color: '#8B0000', paddingBottom: '20px' }}>Menu Items for {restaurantName}</h3>
        
        <div className="menu-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, marginRight: '20px' }}>
            <input
              type="text"
              placeholder="Search menu items or categories..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <button className="download-pdf-button" onClick={handleDownloadPDF}>
            <FaDownload /> Download Menu PDF
          </button>
        </div>

        {filteredMenus.length === 0 ? (
          <p>No menu items found for this restaurant.</p>
        ) : (
          filteredMenus.map(([categoryName, menus]) => (
            <div key={categoryName} className="category-section">
              <h4>{categoryName}</h4>
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Image</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu._id}>
                      {editingMenu === menu._id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditChange}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="price"
                              value={editFormData.price}
                              onChange={handleEditChange}
                              step="0.01"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditFileChange}
                            />
                          </td>
                          <td>{menu.available ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="icon-button-group-vertical">
                              <button onClick={(e) => handleEditSubmit(e, menu._id)} className="icon-button save">
                                <FaCheck />
                              </button>
                              <button onClick={handleEditCancel} className="icon-button cancel">
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{menu.name}</td>
                          <td>{menu.description}</td>
                          <td>Rs.{menu.price}</td>
                          <td>
                            {menu.image && (
                              <img src={menu.image} alt={menu.name} className="menu-image" />
                            )}
                          </td>
                          <td>{menu.available ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="icon-button-group-vertical">
                              <button onClick={() => handleEdit(menu)} className="icon-button edit">
                                <FaEdit />
                              </button>
                              <button onClick={() => handleDelete(menu._id)} className="icon-button delete">
                                <FaTrash />
                              </button>
                              <button 
                                onClick={() => handleToggleAvailability(menu._id, menu.available)} 
                                className="icon-button toggle-availability"
                              >
                                {menu.available ? <FaToggleOn /> : <FaToggleOff />}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;