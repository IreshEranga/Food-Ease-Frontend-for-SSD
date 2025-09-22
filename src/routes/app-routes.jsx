import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import CheckLoginStatus from "./CheckLoginStatus";
import { USER_ROLES } from "../constants/roles";

import FirstPage from '../pages/FirstPage/FirstPage';
import Login from "../pages/Authentication/Login/Login";
import Signup from "../pages/Authentication/Signup/Signup";
import ForgotPassword from "../pages/Authentication/RecoverPassword/ForgotPassword";
import ResetPassword from "../pages/Authentication/RecoverPassword/ResetPassword";

/* ---------------------------- Admin Pages ----------------------------*/
import AdminHome from "../pages/Admin/Home/AdminHome";
import RoleManagement from "../pages/Admin/Role/RoleManagement";
import CustomerManagement from "../pages/Admin/Customer/CustomerManagement";
import RestaurantOwnerManagement from "../pages/Admin/Owners/RestaurantOwnerManagement";
import AdminAnalytics from "../pages/Admin/Analytics/AdminAnalytics";
import AdminRestaurantsManagement from "../pages/Admin/Restaurants/AdminRestaurantsManagement";
import OrderManagement from "../pages/Admin/Orders/OrderManagement";
import DeliveryRiderManagement from "../pages/Admin/Riders/DeliveryRiderManagement";

/* ---------------------------- Restaurant Owner ----------------------------*/
import RestaurantOwnerHome from "../pages/RestaurantOwner/HomePage/RestaurantOwnerHome";
import OwnerRestaurantPage from "../pages/RestaurantOwner/RestaurantsPage/OwnerRestaurantPage";
import OwnerMenuPage from "../pages/RestaurantOwner/MenuPage/OwnerMenuPage";
import OwnerOffersPage from "../pages/RestaurantOwner/OffersPage/OwnerOffersPage";
import OwnerOrdersPage from "../pages/RestaurantOwner/OrdersPage/OwnerOrdersPage";
import OwnerPaymentsPage from "../pages/RestaurantOwner/PaymentsPage/OwnerPaymentsPage";
import OwnerProfilePage from "../pages/RestaurantOwner/ProfilePage/OwnerProfilePage";


/* ---------------------------- Customer  ----------------------------*/
import CustomerHome from "../pages/Customer/Home/CustomerHome";
import CustomerProfile from "../pages/Customer/Profile/CustomerProfile";
import MenuItemDetails from "../pages/Customer/Menu/MenuItemDetails";
import CustomerRestaurantSearch from "../pages/Customer/Restaurant/CustomerRestaurantSearch";
import CustomerRestaurantView from "../pages/Customer/Restaurant/CustomerRestaurantView";
import CustomerCart from "../pages/Customer/Cart/CustomerCart";
import OrderSummary from "../pages/Customer/Order/OrderSummary/OrderSummary";
import CategoryRestaurants from "../components/Category/CategoryRestaurants";
import CustomerOrders from "../pages/Customer/Order/CustomerOrders/CustomerOrders";
import OrderTracking from "../pages/Customer/Order/OrderTracking/OrderTracking";


/* ---------------------------- Delivery Rider  ----------------------------*/
import DeliveryRiderHome from "../pages/DeliveryRider/Home/DeliveryRiderHome";
import DriverDeliveries from "../pages/DeliveryRider/DriverDeliveries";
import DriverProfile from "../pages/DeliveryRider/DriverProfile";
import DeliveryRiderProfile from "../pages/DeliveryRider/DeliveryRiderProfile";
import DeliveryDriver from "../pages/DeliveryRider/DeliveryRiderProfile";
import MyDeliveries from "../pages/DeliveryRider/MyDelivery";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<FirstPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route element={<CheckLoginStatus />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Admin Routes */}
                <Route 
                    element={<PrivateRoute allowedRoles={[USER_ROLES.role1]} />}
                >
                    <Route path="/admin" element={<AdminHome />} />
                    <Route path="/admin/roles" element={<RoleManagement />} />
                    <Route path="/admin/customers" element={<CustomerManagement />} />
                    <Route path="/admin/restaurant-owners" element={<RestaurantOwnerManagement />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/restaurants" element={<AdminRestaurantsManagement />} />
                    <Route path="/admin/orders" element={<OrderManagement />} />
                    <Route path="/admin/driders" element={<DeliveryRiderManagement />} />
                </Route>

                {/* Restaurant Owner Routes */}
                <Route 
                    element={<PrivateRoute allowedRoles={[USER_ROLES.role2]} />}
                >
                    <Route path="/restaurant-owner" element={<RestaurantOwnerHome />} />
                    <Route path="/restaurant-owner/restaurants" element={<OwnerRestaurantPage />} />
                    <Route path="/restaurant-owner/menu" element={<OwnerMenuPage />} />
                    <Route path="/restaurant-owner/offers" element={<OwnerOffersPage />} />
                    <Route path="/restaurant-owner/orders" element={<OwnerOrdersPage />} />
                    <Route path="/restaurant-owner/payments" element={<OwnerPaymentsPage />} />
                    <Route path="/restaurant-owner/profile" element={<OwnerProfilePage />} />
                </Route>
               

               {/* Customer Routes */}
               <Route 
                    element={<PrivateRoute allowedRoles={[USER_ROLES.role3]} />}
                >
                    <Route path="/customer" element={<CustomerHome />} />
                    <Route path="/customer/profile" element={<CustomerProfile />} />
                    <Route path="/category/:categoryName" element={<CategoryRestaurants />} />
                    <Route path="/menu-item/:id" element={<MenuItemDetails />} />
                    <Route path="/customer/restaurants" element={<CustomerRestaurantSearch />} />
                    <Route path="/customer/restaurant/:id" element={<CustomerRestaurantView />} />
                    <Route path="/customer/cart" element={<CustomerCart />} />
                    <Route path="/order-summary" element={<OrderSummary />} />
                    <Route path="/customer/orders" element={<CustomerOrders />} />
                    <Route path="customer/order-tracking/:orderId" element={<OrderTracking />} />


                </Route>


                {/* Delivery rider Routes */}
               <Route 
                    element={<PrivateRoute allowedRoles={[USER_ROLES.role4]} />}
                >
                    <Route path="/rider" element={<DriverDeliveries />} />
                    <Route path="/rider/profile" element={<DriverProfile />} />


                    <Route path="/rider/delivery" element={<MyDeliveries />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;