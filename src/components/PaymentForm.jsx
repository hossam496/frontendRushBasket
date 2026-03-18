import React, { useState } from 'react';
import { 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { FiLock, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#e2e8f0",
      fontFamily: '"Outfit", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#94a3b8",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

const PaymentForm = ({ formData, cart, grandTotal, onSuccess, onLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    onLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // 1. Create Payment Intent on our server
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-payment-intent`,
        {
          items: cart.map(item => ({
            id: item.productId || item.id,
            quantity: item.quantity
          })),
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          },
          notes: formData.notes
        },
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (!data.success) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      const clientSecret = data.data.clientSecret;

      // 2. Confirm payment with Stripe Elements
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
                line1: formData.address
            }
          },
        },
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
        onLoading(false);
      } else {
        setError(null);
        setProcessing(false);
        onLoading(false);
        onSuccess(data.data.orderId);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during payment');
      setProcessing(false);
      onLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Card Details
        </label>
        <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => setError(e.error ? e.error.message : null)} />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-white transition-all shadow-lg ${
          processing ? 'bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 hover:shadow-emerald-900/40'
        }`}
      >
        {processing ? (
          <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing...</>
        ) : (
          <><FiLock className="mr-2" /> Pay ${grandTotal.toFixed(2)} Securely</>
        )}
      </button>
      
      <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center">
        <FiLock className="mr-1" /> Secure encrypted payment powered by Stripe
      </p>
    </div>
  );
};

export default PaymentForm;
