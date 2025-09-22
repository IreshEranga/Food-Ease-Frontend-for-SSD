import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { USER_ROLES } from "../constants/roles";

const CheckLoginStatus = () => {
    const { user, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !user) {
        return <Outlet />;
    }

    const userRole = user.roleID;

    switch (userRole) {
        case USER_ROLES.role1:
            return <Navigate to="/admin" replace />;
        case USER_ROLES.role2:
            return <Navigate to="/owner" replace />;
        case USER_ROLES.role3:
            return <Navigate to="/customer" replace />;
        case USER_ROLES.role4:
            return <Navigate to="/rider" replace />;
        default:
            return <Outlet />;
    }
};

export default CheckLoginStatus;