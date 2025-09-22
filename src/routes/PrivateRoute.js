import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { errorMessage } from "../utils/Alert";

const PrivateRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore.getState();

    console.log("PrivateRoute Debug:", {
        isAuthenticated,
        user,
        allowedRoles,
    });

    // If not authenticated or no user, redirect to login
    if (!isAuthenticated || !user) {
        console.log("Redirecting to /login - User not authenticated or no user data");
        return <Navigate to="/login" replace />;
    }

    // Check if user has permission
    const hasPermission = allowedRoles.includes(user.roleID);
    console.log("Permission Check:", {
        userRole: user.roleID,
        allowedRoles,
        hasPermission,
    });

    if (!hasPermission) {
        console.log("No permission - Showing error and redirecting to /");
        errorMessage("Access Denied", "You do not have permission to access this page");
        return <Navigate to="/" replace />;
    }

    console.log("Permission granted - Rendering Outlet");
    return <Outlet />;
};

export default PrivateRoute;