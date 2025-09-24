// import React, { useState } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../../../store/useAuthStore';
// import './Login.css';
// import illustration from '../../../assets/Images/Login2.png';
// import eyeHide from '../../../assets/Images/eye_hide.png';
// import eyeView from '../../../assets/Images/eye_View.png';

// function Login() {
//     const [loginFormData, setLoginFormData] = useState({
//         username: '',
//         password: ''
//     });
//     const [errors, setErrors] = useState({});
//     const [touched, setTouched] = useState({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();
//     const setAuth = useAuthStore((state) => state.setAuth);

//     const validateField = (name, value) => {
//         let newErrors = { ...errors };

//         if (name === 'username') {
//             if (!value) newErrors.username = 'Email is required';
//             else if (!/\S+@\S+\.\S+/.test(value)) newErrors.username = 'Invalid email format';
//             else delete newErrors.username;
//         }

//         if (name === 'password') {
//             if (!value) newErrors.password = 'Password is required';
//             else delete newErrors.password;
//         }

//         setErrors(newErrors);
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setLoginFormData(prev => ({ ...prev, [name]: value }));
//         validateField(name, value);
//         // Clear API error when user starts typing
//         setErrors(prev => ({ ...prev, api: null }));
//     };

//     const handleBlur = (e) => {
//         const { name } = e.target;
//         setTouched(prev => ({ ...prev, [name]: true }));
//         validateField(name, loginFormData[name]);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         // Reset API error at the start of each submission
//         setErrors(prev => ({ ...prev, api: null }));
//         setTouched({ username: true, password: true });

//         validateField('username', loginFormData.username);
//         validateField('password', loginFormData.password);

//         if (Object.keys(errors).filter(key => key !== 'api').length > 0) {
//             setLoading(false);
//             return;
//         }

//         try {
//             const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/auth/login`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     email: loginFormData.username,
//                     password: loginFormData.password
//                 }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message || "Login failed");
//             }

//             const token = data.token;
//             localStorage.setItem("token", token);
//             const decodedToken = jwtDecode(token);

//             // Update auth store
//             setAuth({
//                 isAuthenticated: true,
//                 user: {
//                     userID: decodedToken.userID,
//                     roleID: decodedToken.roleID
//                 },
//                 token: token
//             });

//             console.log("After setAuth:", useAuthStore.getState());

//             // Navigate based on role
//             switch (decodedToken.roleID) {
//                 case 'role1':
//                     navigate('/admin', { replace: true });
//                     break;
//                 case 'role2':
//                     navigate('/restaurant-owner', { replace: true });
//                     break;
//                 case 'role3':
//                     navigate('/customer', { replace: true });
//                     break;
//                 case 'role4':
//                     navigate('/rider', { replace: true });
//                     break;
//                 default:
//                     navigate('/', { replace: true });
//             }

//         } catch (error) {
//             setErrors(prev => ({ ...prev, api: error.message }));
//             console.error("Login error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleGoogleLogin = () => {
//         window.location.href = '/api/users/auth/google';
//     };

//     return (
//         <div className="Login-container">
//             <div className='login-card'>
//                 <div className="Login-illustration">
//                     <img
//                         src={illustration}
//                         alt="Person enjoying food delivery"
//                         className="Login-illustration-image"
//                     />
//                 </div>

//                 <div className="Login-form-section">
//                     <h1 className="Login-title">
//                         <span className='login-title-fletter'>T</span>asti
//                         <span className='login-title-lletter'>G</span>o
//                     </h1>
//                     <p className="Login-subtitle">Welcome back, you've been missed!</p>

//                     {errors.api && <p className="login-error-message">{errors.api}</p>}

//                     <form className="Login-form" onSubmit={handleSubmit}>
//                         <div className="login-input-container">
//                             <input
//                                 type="text"
//                                 name="username"
//                                 placeholder="Enter email"
//                                 className="Login-input uniform-input"
//                                 value={loginFormData.username}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                             />
//                             {touched.username && errors.username && (
//                                 <span className="login-error-message">{errors.username}</span>
//                             )}
//                         </div>

//                         <div className="login-input-container">
//                             <div className="login-password-wrapper">
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     placeholder="Password"
//                                     className="Login-input uniform-input"
//                                     value={loginFormData.password}
//                                     onChange={handleChange}
//                                     onBlur={handleBlur}
//                                 />
//                                 <button
//                                     type="button"
//                                     className="login-password-toggle"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                 >
//                                     <img 
//                                         src={showPassword ? eyeView : eyeHide} 
//                                         alt={showPassword ? "Hide password" : "Show password"}
//                                         className="login-eye-icon"
//                                     />
//                                 </button>
//                             </div>
//                             {touched.password && errors.password && (
//                                 <span className="login-error-message">{errors.password}</span>
//                             )}
//                         </div>

//                         <a href="/forgot-password" className="Login-recover-link">
//                             Recover Password
//                         </a>
//                         <button 
//                             type="submit" 
//                             className="Login-signin-btn" 
//                             disabled={loading}
//                         >
//                             {loading ? 'Signing In...' : 'Sign In'}
//                         </button>
//                     </form>

//                     <div className="Login-social-login">
//                         <p className="Login-social-text">Or continue with</p>
//                         <div className="Login-social-buttons">
//                             <button className="Login-social-btn" onClick={handleGoogleLogin}>G</button>
//                             {/* <button className="Login-social-btn">A</button>
//                             <button className="Login-social-btn">F</button> */}
//                         </div>
//                     </div>

//                     <p className="Login-register-link">
//                         Not a member? <a href="/signup">Register now</a>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;


import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import './Login.css';
import illustration from '../../../assets/Images/Login2.png';
import eyeHide from '../../../assets/Images/eye_hide.png';
import eyeView from '../../../assets/Images/eye_View.png';

function Login() {
  const [loginFormData, setLoginFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Check for error query param from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error) {
      setErrors(prev => ({ ...prev, api: error === 'auth_failed' ? 'Google authentication failed' : 'Invalid user data' }));
    }
  }, [location]);

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (name === 'username') {
      if (!value) newErrors.username = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.username = 'Invalid email format';
      else delete newErrors.username;
    }

    if (name === 'password') {
      if (!value) newErrors.password = 'Password is required';
      else delete newErrors.password;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    setErrors(prev => ({ ...prev, api: null }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, loginFormData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(prev => ({ ...prev, api: null }));
    setTouched({ username: true, password: true });

    validateField('username', loginFormData.username);
    validateField('password', loginFormData.password);

    if (Object.keys(errors).filter(key => key !== 'api').length > 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginFormData.username,
          password: loginFormData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.token;
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);

      setAuth({
        isAuthenticated: true,
        user: decodedToken,
        token
      });

      switch (decodedToken.roleID) {
        case 'role1':
          navigate('/admin', { replace: true });
          break;
        case 'role2':
          navigate('/restaurant-owner', { replace: true });
          break;
        case 'role3':
          if (!data.user.profileComplete) {
            navigate('/complete-profile', { replace: true });
          } else {
            navigate('/customer', { replace: true });
          }
          break;
        case 'role4':
          navigate('/rider', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, api: error.message }));
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_API}/api/users/auth/google`;
  };

  return (
    <div className="Login-container">
      <div className='login-card'>
        <div className="Login-illustration">
          <img
            src={illustration}
            alt="Person enjoying food delivery"
            className="Login-illustration-image"
          />
        </div>

        <div className="Login-form-section">
          <h1 className="Login-title">
            <span className='login-title-fletter'>T</span>asti
            <span className='login-title-lletter'>G</span>o
          </h1>
          <p className="Login-subtitle">Welcome back, you've been missed!</p>

          {errors.api && <p className="login-error-message">{errors.api}</p>}

          <form className="Login-form" onSubmit={handleSubmit}>
            <div className="login-input-container">
              <input
                type="text"
                name="username"
                placeholder="Enter email"
                className="Login-input uniform-input"
                value={loginFormData.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.username && errors.username && (
                <span className="login-error-message">{errors.username}</span>
              )}
            </div>

            <div className="login-input-container">
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="Login-input uniform-input"
                  value={loginFormData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img 
                    src={showPassword ? eyeView : eyeHide} 
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="login-eye-icon"
                  />
                </button>
              </div>
              {touched.password && errors.password && (
                <span className="login-error-message">{errors.password}</span>
              )}
            </div>

            <a href="/forgot-password" className="Login-recover-link">
              Recover Password
            </a>
            <button 
              type="submit" 
              className="Login-signin-btn" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="Login-social-login">
            <p className="Login-social-text">Or continue with</p>
            <div className="Login-social-buttons">
              <button className="Login-social-btn google-btn" onClick={handleGoogleLogin}>
                <span className="Login-social-icon">G</span> Google
              </button>
            </div>
          </div>

          <p className="Login-register-link">
            Not a member? <a href="/signup">Register now</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;