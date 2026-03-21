import React, { useEffect, useState } from 'react';
import { useCart } from '../CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiLoader, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Swal from 'sweetalert2';


/**
 * Payment Success Page
 * Handles post-payment verification and order confirmation
 */
const PaymentSuccessPage = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No session ID found. Unable to verify payment.');
        return;
      }

      try {
        // Verify the session with the backend
        const response = await api.get(`/api/payment/session/${sessionId}`);

        if (response.data.success) {
          const { data } = response.data;
          
          if (data.status === 'paid') {
            setStatus('success');
            setOrderDetails(data);
            
            // Clear the cart
            clearCart();
            
            // Show success message
            Swal.fire({
              title: '🎉 Payment Successful!',
              text: `Order #${data.metadata?.orderId} has been confirmed.`,
              icon: 'success',
              confirmButtonColor: '#10b981',
              background: '#1f2937',
              color: '#fff',
              timer: 3000,
              timerProgressBar: true,
            });
          } else {
            setStatus('error');
            setErrorMessage('Payment was not completed. Please try again.');
          }
        } else {
          setStatus('error');
          setErrorMessage('Failed to verify payment status.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 
          'An error occurred while verifying your payment.'
        );
      }
    };

    verifyPayment();
  }, [search, clearCart]);

  const handleViewOrders = () => {
    navigate('/myorders');
  };

  const handleContinueShopping = () => {
    navigate('/items');
  };

  // Render different states
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="text-center">
          <FiLoader className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
          <p className="text-emerald-400">Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="bg-[#1f2937] border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h2>
          <p className="text-red-400 mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              Return to Checkout <FiArrowRight className="ml-2" />
            </button>
            <button
              onClick={handleContinueShopping}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="bg-[#1f2937] border border-emerald-700 rounded-2xl p-8 max-w-lg w-full text-center">
        <FiCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
        
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Order Confirmed!</h2>
        <p className="text-emerald-400 mb-6">Thank you for your purchase</p>

        {orderDetails?.metadata?.orderId && (
          <div className="bg-[#111827] rounded-xl p-4 mb-6">
            <p className="text-emerald-300 text-sm mb-1">Order Number</p>
            <p className="text-white font-mono text-lg font-bold">
              {orderDetails.metadata.orderId}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6 text-left bg-[#111827] rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Payment Status</span>
            <span className="text-emerald-300 font-semibold">Paid</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Email</span>
            <span className="text-white">{orderDetails?.customerEmail}</span>
          </div>
          {orderDetails?.amountTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">Total Amount</span>
              <span className="text-white font-semibold">
                ${(orderDetails.amountTotal / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-6">
          A confirmation email has been sent to your inbox with your order details and receipt.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleViewOrders}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
          >
            View My Orders <FiArrowRight className="ml-2" />
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
