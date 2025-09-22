import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useMediaQuery } from 'react-responsive';
import api from "../../../../api";
import PayHerePayment from "../../../../components/Payment/PayHerePayment";
import DeliveryLocationButton from "../../../../components/DeliveryLocation/DeliveryLocation";
import CustomerSideBar from "../../../../components/CustomerSideBar/CustomerSideBar";
import CustomerBottomNavbar from "../../../../components/CustomerBottomNavbar/CustomerBottomNavbar";
import "./OrderSummary.css"; // Import custom CSS

const OrderSummary = () => {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  //const location = useLocation();
  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customer, setCustomer] = useState();
  const [paymentData, setPaymentData] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  //const deliveryLocation = useAuthStore((state) => state.deliveryLocation);
  //const setDeliveryLocation = useAuthStore((state) => state.setDeliveryLocation);
  //const [showMapModal, setShowMapModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showPlaceOrderBtn, setShowPlaceOrderBtn] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [, setRestaurant] = useState(null);
  const [distance,] = useState(null);

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const authStorage = JSON.parse(localStorage.getItem('auth-storage')) || {};

// Extract deliveryLatLng and deliveryLocation

  const deliveryLocation = authStorage.state?.deliveryLocation || "Unknown Location";

  /*const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
  };*/

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/users/customers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("user data", response.data);
        setCustomerName(response.data.data.name);
        setCustomer(response.data.data);
      } catch (error) {
        console.error("Error fetching customer profile", error);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("auth-storage"));
    if (stored?.state?.deliveryLocation) {
      console.log(stored.state.deliveryLocation);
    }
  }, []);

  /*useEffect(() => {
    if (order && order.restaurantID) {
      api
        .get(`/api/restaurant/restaurants/${order.restaurantID}`)
        .then((res) => {
          setRestaurant(res.data);
          if (
            res.data.coordinates &&
            deliveryLocation?.coordinates?.latitude &&
            deliveryLocation?.coordinates?.longitude
          ) {
            const { latitude: restLat, longitude: restLon } = res.data.coordinates;
            const { latitude: delivLat, longitude: delivLon } = deliveryLocation.coordinates;
            const calculatedDistance = calculateDistance(restLat, restLon, delivLat, delivLon);
            setDistance(calculatedDistance);
          }
        })
        .catch((err) => {
          console.error("Error fetching restaurant:", err.response?.data || err.message);
          if (err.response?.status === 404) {
            alert("Restaurant not found. Please check your cart or try again.");
            setRestaurant(null);
            sessionStorage.removeItem("globalCart");
            navigate("/cart");
          } else {
            alert("Failed to fetch restaurant details. Please try again.");
          }
        });
    }
  }, [order, deliveryLocation, navigate]);*/

  useEffect(() => {
    const loadOrderFromSession = async () => {
      const cartData = JSON.parse(sessionStorage.getItem("globalCart")) || [];
      const storedTotalDiscount = JSON.parse(sessionStorage.getItem("totalDiscount")) || 0;

      if (cartData.length === 0) {
        console.warn("Cart is empty, setting default order");
        setOrder({ items: [], totalAmount: 0, deliveryAddress: "No address", restaurantID: null });
        setFinalPrice(0);
        setTotalDiscount(0);
        return;
      }

      const firstItem = cartData[0] || {};
      console.log("First cart item:", firstItem);

      try {
        // Fetch restaurant by _id to get restaurantId
        const res = await api.get(`/api/restaurant/restaurants/getDetails/${firstItem.restaurantId}`);
        //const restaurantId = res.data.restaurantId;
        setRestaurant(res.data);
        //console.log("Transformed restaurantId:", restaurantId);

        const deliveryAddress = firstItem.address || "No address";

        // Calculate totalAmount and finalPrice
        const totalAmount = cartData.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const APP_CHARGE = 125.00; // LKR 125.00
        const finalPrice = totalAmount + APP_CHARGE - storedTotalDiscount;

        // Set state
        setFinalPrice(finalPrice);
        setTotalDiscount(storedTotalDiscount);
        sessionStorage.setItem("finalPrice", JSON.stringify(finalPrice)); // Update sessionStorage

        console.log('Cart Data', cartData);
        const orderItems = cartData.map((item) => ({
          itemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          restaurantId: item.restaurantId,
        }));

        const orderObject = {
          status: "Pending",
          totalAmount,
          deliveryAddress: deliveryLocation,
          items: orderItems,
          restaurantID: firstItem.restaurantId,
          restaurantName: firstItem.restaurantName || "UNKNOWN",
          branchName: firstItem.branchName || "UNKNOWN",
        };

        setOrder(orderObject);
      } catch (err) {
        console.error("Error fetching restaurantId:", err.response?.data || err.message);
        alert("Failed to load order. Please try again.");
        setOrder(null);
        navigate("/cart");
      }
    };

    loadOrderFromSession();
  }, [navigate]);

  const handlePlaceOrder = async () => {
    try {
      const res = await api.post("/api/order/orders/", {
        userId: customer._id,
        items: order.items,
        totalAmount: finalPrice,
        deliveryAddress: order.deliveryAddress,
        restaurantId: order.restaurantID,
        restaurantName: order.restaurantName,
        branchName: order.branchName,
      });

      alert("Order placed successfully!");
      console.log("Created order:", res.data);

      setOrder((prev) => ({
        ...prev,
        _id: res.data._id,
        status: res.data.orderStatus,
      }));

      const paymentInit = await api.post("/api/payment/payments/start", {
        orderData: {
          order_id: res.data._id,
          amount: finalPrice,
          customer: {
            firstName: customerName.split(" ")[0] || "Customer",
            lastName: customerName.split(" ")[1] || "",
            email: customer.email,
            phone: customer.mobileNumber,
            address: customer.address,
            city: "Colombo",
          },
        },
      });

      console.log("paymentInit", paymentInit);

      setPaymentData(paymentInit.data);
      setShowPaymentGateway(true);
      setShowPlaceOrderBtn(false);

      const updatePaymentStatus = await api.put(`/api/order/orders/${res.data._id}/status`, {
        payment_status: "Paid",
      });

      console.log("Payment status updated:", updatePaymentStatus.data);
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  /*const handleChangeAddress = () => {
    console.log("delivery location btn clicked");
    setShowMapModal(true);
  };*/

  if (!order) return <div className="loading">Loading order...</div>;

  return (
    <div className="order-summary-container">
      {isDesktop && <CustomerSideBar />}
      <h2 className="order-summary-title">Order Summary</h2>
      <div className="order-summary-card">
        <div className="order-details">
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{order.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Restaurant:</span>
            <span className="detail-value">{order.restaurantName} ({order.branchName})</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Delivery Address:</span>
            <span className="detail-value">
              <FaMapMarkerAlt className="inline-icon" /> {deliveryLocation || "Not set"}
            </span>
          </div>
          {distance && (
            <div className="detail-item">
              <span className="detail-label">Distance:</span>
              <span className="detail-value">{distance} km</span>
            </div>
          )}
        </div>

        <div className="order-items">
          <h3 className="items-title">Items Ordered</h3>
          <ul className="items-list">
            {order.items.map((item, index) => (
              <li key={index} className="item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-totals">
          <div className="total-item">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="total-item">
            <span className="total-label">App Charge:</span>
            <span className="total-value">Rs. 125.00</span>
          </div>
          {totalDiscount > 0 && (
            <div className="total-item discount">
              <span className="total-label">Discount:</span>
              <span className="total-value">-Rs. {totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="total-item final">
            <span className="total-label">Final Total:</span>
            <span className="total-value">Rs. {finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="order-actions">
          {order && showPlaceOrderBtn && (
            <button
              onClick={handlePlaceOrder}
              className="action-button primary"
            >
              Place Order
            </button>
          )}
          {showPaymentGateway && paymentData && (
            <PayHerePayment
              orderDetails={paymentData}
              onPaymentSuccess={() => setPaymentSuccess(true)}
            />
          )}
          {paymentSuccess && (
            <div className="order-actions">
            <Link to={`/delivery-status/${order._id}`} className="action-button primary">
              Track Delivery
            </Link>
            </div>
          )}
        </div>
        {!isDesktop && <CustomerBottomNavbar />}
      </div>
      <DeliveryLocationButton />
    </div>
  );
};

export default OrderSummary;