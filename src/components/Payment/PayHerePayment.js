import React, { useEffect, useState } from 'react';
import api from '../../api';
import './PayHerePayment.css';

const PayHerePayment = ({ orderDetails, onPaymentSuccess }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(0);
  const [, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Dynamically load the PayHere script
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;

    // Event: Payment completed
    window.payhere.onCompleted = function (orderId) {
      console.log('Payment completed. OrderID:', orderId);
      setPaymentStatus(2);   
    };

    // Event: Payment dismissed
    window.payhere.onDismissed = function () {
      console.log('Payment dismissed by the user.');
      setPaymentStatus(-1); 
    };

    // Event: Error occurred
    window.payhere.onError = function (error) {
      console.error('Error during payment:', error);
      setPaymentStatus(-2); 
    };

  }, [scriptLoaded]);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (paymentStatus === 0) return;
  
      try {
        const response = await api.put(`/api/order/orders/${orderDetails.order_id}/status`, {
          paymentStatus: paymentStatus,
        });
        console.log('Payment status updated:', response.data);
        handlePaymentSuccess();
        // Maybe show success/fail message here
      } catch (error) {
        console.error('Failed to update payment status:', error);
      }
    };
  
    updatePaymentStatus();
  }, [paymentStatus, orderDetails.order_id]);

  const handlePayment = () => {
    if (!scriptLoaded || !orderDetails) return;
  
    console.log("Starting payment with details:", orderDetails);
    window.payhere.startPayment(orderDetails);
  };

  const handlePaymentSuccess = () => {
    if (paymentStatus === 2) {
      setPaymentSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(); // Notify parent
      }
    }
  };
  

  return (
    <button
      onClick={handlePayment}
      className="action-button payhere"
    >
      Pay with PayHere
    </button>
  );
};

export default PayHerePayment;

/**
2 - success
0 - pending
-1 - canceled
-2 - failed
-3 - chargedback
 */