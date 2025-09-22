import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import classNames from 'classnames';
import signupImage from '../../../assets/Images/signup.png';
import loadingAnimation from '../../../assets/GIF/loading.gif';
import Toast from '../../../utils/toast';
import './Signup.css';

function Signup() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();
  const [signupType, setSignupType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    password: '',
    vehicleNumber: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errors, setErrors] = useState({});
  const otpInputs = useRef([]);

  const getButtonStyle = (type) => ({
    backgroundColor:
      signupType === type ? '#f28c38' : hovered === type ? '#ffb273' : '',
    borderColor: '#f28c38',
    color: signupType === type || hovered === type ? '#fff' : '#f28c38',
  });

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    if (signupType === 'customer' && (!formData.address || formData.address.length < 5)) {
      newErrors.address = 'Address must be at least 5 characters long';
    }
    if (signupType === 'rider' && (!formData.vehicleNumber || formData.vehicleNumber.length < 5)) {
      newErrors.vehicleNumber = 'Vehicle number must be at least 5 characters';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP
  const validateOtp = () => {
    const isOtpValid = otpValues.every((digit) => digit !== '');
    if (!isOtpValid) {
      Toast({ type: 'error', message: 'Please enter all 6 OTP digits' });
    }
    return isOtpValid;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      if (value && index < 5) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace to move to previous input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Send OTP using the backend API
  const sendOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setIsSendingOtp(true);
    Toast({ type: 'info', message: 'Sending OTP to your email...' });

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        Toast({ type: 'success', message: 'OTP sent successfully to your email!' });
      } else {
        Toast({ type: 'error', message: 'Failed to send OTP. Please try again.' });
      }
    } catch (error) {
      console.error(error);
      Toast({ type: 'error', message: 'Error sending OTP. Please try again.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP using the backend API
  const verifyOtp = async () => {
    if (!validateOtp()) return;
    const otp = otpValues.join('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formData.email, code: otp }),
      });
      const data = await response.json();
      if (data.success) {
        setEmailVerified(true);
        Toast({ type: 'success', message: 'Email verified successfully!' });
      } else {
        Toast({ type: 'error', message: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      console.error(error);
      Toast({ type: 'error', message: 'Error verifying OTP. Please try again.' });
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    setOtpSent(false);
    setOtpValues(['', '', '', '', '', '']);
    setEmailVerified(false);
    setErrors((prev) => ({ ...prev, email: '' }));
  };

  // Handle form submission for signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      Toast({ type: 'error', message: 'Please verify your email before proceeding.' });
      return;
    }
    if (!validateForm()) {
      Toast({ type: 'error', message: 'Please fix the errors in the form.' });
      return;
    }

    let signupEndpoint;
    let payload;
    
    switch (signupType) {
      case 'customer':
        signupEndpoint = `${process.env.REACT_APP_BACKEND_API}/api/users/auth/signup/customer`;
        payload = {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          address: formData.address,
          password: formData.password,
        };
        break;
      case 'restaurant':
        signupEndpoint = `${process.env.REACT_APP_BACKEND_API}/api/users/auth/signup/owner`;
        payload = {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        };
        break;
      case 'rider':
        signupEndpoint = `${process.env.REACT_APP_BACKEND_API}/api/users/auth/signup/rider`;
        payload = {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          vehicleNumber: formData.vehicleNumber,
          password: formData.password,
        };
        break;
      default:
        return;
    }

    try {
      const response = await fetch(signupEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 201) {
        let successMessage;
        switch (signupType) {
          case 'customer':
            successMessage = 'Customer registered successfully! You can now log in.';
            break;
          case 'restaurant':
            successMessage = 'Restaurant Owner registered successfully! You can now log in.';
            break;
          case 'rider':
            successMessage = 'Delivery Rider registered successfully! You can now log in.';
            break;
          default:
            successMessage = '';
            break;
        }
        Toast({ type: 'success', message: successMessage });

        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          address: '',
          password: '',
          vehicleNumber: '',
        });
        setOtpSent(false);
        setOtpValues(['', '', '', '', '', '']);
        setEmailVerified(false);
        setSignupType('customer');
        setErrors({});
        navigate('/login');
      } else {
        Toast({ type: 'error', message: data.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      Toast({ type: 'error', message: 'Error during signup. Please try again.' });
    }
  };

  return (
    <div className="SignUp-container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="SignUp-card shadow">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="SignUp-title text-center mb-3">
                    Create an Account
                  </h3>
                  <p className="SignUp-subtitle text-center mb-4">
                    Sign up now!
                  </p>

                  <div className="SignUp-toggle-buttons d-flex justify-content-center mb-4 flex-wrap gap-2">
                    <button
                      className={classNames('btn SignUp-toggle-btn', {
                        'btn-primary': signupType === 'customer',
                        'btn-outline-primary': signupType !== 'customer',
                      })}
                      onClick={() => setSignupType('customer')}
                      onMouseEnter={() => setHovered('customer')}
                      onMouseLeave={() => setHovered(null)}
                      style={getButtonStyle('customer')}
                    >
                      Customer
                    </button>
                    <button
                      className={classNames('btn SignUp-toggle-btn', {
                        'btn-primary': signupType === 'restaurant',
                        'btn-outline-primary': signupType !== 'restaurant',
                      })}
                      onClick={() => setSignupType('restaurant')}
                      onMouseEnter={() => setHovered('restaurant')}
                      onMouseLeave={() => setHovered(null)}
                      style={getButtonStyle('restaurant')}
                    >
                      Restaurant Owner
                    </button>
                    <button
                      className={classNames('btn SignUp-toggle-btn', {
                        'btn-primary': signupType === 'rider',
                        'btn-outline-primary': signupType !== 'rider',
                      })}
                      onClick={() => setSignupType('rider')}
                      onMouseEnter={() => setHovered('rider')}
                      onMouseLeave={() => setHovered(null)}
                      style={getButtonStyle('rider')}
                    >
                      Delivery Rider
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="SignUp-input-container mb-3">
                      <input
                        type="text"
                        name="name"
                        className={classNames('form-control SignUp-input', { 'is-invalid': errors.name })}
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.name && <div className="SignUp-error-message">{errors.name}</div>}
                    </div>

                    <div className="SignUp-input-container mb-3">
                      <div className="input-group">
                        <input
                          type="email"
                          name="email"
                          className={classNames('form-control SignUp-input', { 'is-invalid': errors.email })}
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={otpSent && !emailVerified}
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            className="btn SignUp-otp-btn"
                            onClick={sendOtp}
                            disabled={isSendingOtp}
                          >
                            {isSendingOtp ? (
                              <img
                                src={loadingAnimation}
                                alt="Loading..."
                                className="SignUp-loading-icon"
                              />
                            ) : (
                              'Send OTP'
                            )}
                          </button>
                        )}
                      </div>
                      {errors.email && <div className="SignUp-error-message">{errors.email}</div>}

                      {otpSent && !emailVerified && (
                        <div className="SignUp-otp-section mt-3">
                          <label className="SignUp-otp-label d-block text-center mb-2">
                            Enter OTP
                          </label>
                          <div className="SignUp-otp-inputs d-flex justify-content-center gap-2 mb-3">
                            {otpValues.map((digit, index) => (
                              <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                ref={(el) => (otpInputs.current[index] = el)}
                                className="form-control SignUp-otp-square"
                              />
                            ))}
                          </div>
                          <div className="SignUp-otp-actions d-flex justify-content-center align-items-center gap-3">
                            <button
                              type="button"
                              className="btn SignUp-verify-btn"
                              onClick={verifyOtp}
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              className="SignUp-resend-btn"
                              onClick={handleResendOtp}
                            >
                              Resend OTP
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="SignUp-input-container mb-3">
                      <input
                        type="text"
                        name="mobileNumber"
                        className={classNames('form-control SignUp-input', { 'is-invalid': errors.mobileNumber })}
                        placeholder="Mobile Number"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        required
                        disabled={!emailVerified}
                      />
                      {errors.mobileNumber && <div className="SignUp-error-message">{errors.mobileNumber}</div>}
                    </div>

                    {signupType === 'customer' && (
                      <div className="SignUp-input-container mb-3">
                        <input
                          type="text"
                          name="address"
                          className={classNames('form-control SignUp-input', { 'is-invalid': errors.address })}
                          placeholder="Address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          disabled={!emailVerified}
                        />
                        {errors.address && <div className="SignUp-error-message">{errors.address}</div>}
                      </div>
                    )}

                    {signupType === 'rider' && (
                      <div className="SignUp-input-container mb-3">
                        <input
                          type="text"
                          name="vehicleNumber"
                          className={classNames('form-control SignUp-input', { 'is-invalid': errors.vehicleNumber })}
                          placeholder="Vehicle Number"
                          value={formData.vehicleNumber}
                          onChange={handleInputChange}
                          required
                          disabled={!emailVerified}
                        />
                        {errors.vehicleNumber && <div className="SignUp-error-message">{errors.vehicleNumber}</div>}
                      </div>
                    )}

                    <div className="SignUp-input-container mb-3">
                      <input
                        type="password"
                        name="password"
                        className={classNames('form-control SignUp-input', { 'is-invalid': errors.password })}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={!emailVerified}
                      />
                      {errors.password && <div className="SignUp-error-message">{errors.password}</div>}
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 SignUp-submit-btn"
                    >
                      Sign Up
                    </button>
                    <p className="SignUp-login-link">
                      Already have an Account? <a href="/login">Login now</a>
                    </p>
                  </form>
                </div>

                <div className="SignUp-image-section col-md-6 d-flex align-items-center justify-content-center">
                  <img
                    src={signupImage}
                    alt="Signup Illustration"
                    className="img-fluid SignUp-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;