import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryDisplay.css';

const CategoryDisplay = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName}`);
  };

  return (
    <div className="category-container">
      <h4 className="category-title">What are you craving?</h4>
      <div className="category-list">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-item"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="category-image">
              <img
                src={category.image}
                alt={category.name}
                className="category-img"
              />
            </div>
            <p className="category-name">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDisplay;