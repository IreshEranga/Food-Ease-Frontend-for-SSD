import React from 'react';
import PropTypes from 'prop-types';

function CountCard({ title, count, icon, showChange, change, changeIcon, changeColor }) {
  const cardStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s ease',
    width: '250px',
  };

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  const titleRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const iconStyle = {
    fontSize: '20px',
    color: '#4B5563',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2937',
  };

  const countStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginTop: '8px',
    textAlign: 'center',
  };

  const changeStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6px',
    color: changeColor,
    fontWeight: '500',
    fontSize: '14px',
  };

  return (
    <div style={cardStyle}>
      <div style={titleContainerStyle}>
        <div style={titleRowStyle}>
          <div style={iconStyle}>{icon}</div>
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <p style={countStyle}>{count}</p>
        {showChange && (
          <div style={changeStyle}>
            {changeIcon}
            <span style={{ marginLeft: '6px' }}>
              {change}% {changeColor === 'green' ? 'Increase' : 'Decrease'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

CountCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.element.isRequired,
  showChange: PropTypes.bool,
  change: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  changeIcon: PropTypes.element,
  changeColor: PropTypes.string,
};

export default CountCard;
