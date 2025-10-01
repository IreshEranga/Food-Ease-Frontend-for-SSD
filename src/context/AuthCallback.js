import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; // Adjust path as needed

function AuthCallback() {
  console.log("start auth callback");
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    
    console.log("Token:", token);
    console.log("User param:", userParam);

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log("Parsed user:", user);

        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Update auth store
        setAuth({
          isAuthenticated: true,
          user: user,
          token: token
        });
console.log("User", user)
        // Redirect based on profile completion status
        if (user.roleID === 'role3') { // Customer role
        //   if (!user.profileComplete) {
        //     console.log("Redirecting to complete profile");
        //     //navigate('/complete-profile', { replace: true });
        //   } else {
        //     console.log("Redirecting to customer dashboard");
        //     navigate('/customer', { replace: true });
        //   }
        console.log("Redirecting to customer dashboard");
          navigate('/customer', { replace: true });
        } else {
          // For other roles, redirect to their respective dashboards
          switch (user.roleID) {
            case 'role1':
              navigate('/admin', { replace: true });
              break;
            case 'role2':
              navigate('/restaurant-owner', { replace: true });
              break;
            case 'role4':
              navigate('/rider', { replace: true });
              break;
            default:
              navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate('/login?error=invalid_user_data', { replace: true });
      }
    } else {
      console.log("Missing token or user data");
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [location, navigate, setAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Processing authentication...
    </div>
  );
}

export default AuthCallback;