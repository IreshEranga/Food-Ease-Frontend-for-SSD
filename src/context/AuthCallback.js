import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AuthCallback() {
    console.log("start auth callback");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const user = JSON.parse(decodeURIComponent(params.get('user')));
console.log("before token create");
    if (token && user) {
        console.log("after token create");
      // Store token and user in localStorage or state management
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Redirect to dashboard or profile completion page
      if (!user.profileComplete) {
        console.log("complete profile");
        navigate('/complete-profile');
      } else {
        console.log("customer");
        navigate('/customer');
      }
    } else {
      navigate('/login?error=auth_failed');
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
}

export default AuthCallback;