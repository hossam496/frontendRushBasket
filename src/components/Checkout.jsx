import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import React, { useState } from 'react'; // للتحكم في حالة الفورم والتحميل
import { Link, useNavigate } from 'react-router-dom'; // للتنقل بين الصفحات
import { useCart } from '../CartContext'; // استيراد الـ Hook الخاص بالسلة (تأكد من المسار الصحيح)
import axios from 'axios'; // لعمل الطلبات للـ API
import Swal from 'sweetalert2'; // لإظهار التنبيهات الاحترافية
import {
  FiArrowLeft, FiUser, FiCreditCard,
  FiPackage, FiTruck, FiLock, FiCheck
} from 'react-icons/fi'; // للأيقونات المستخدمة في التصميم
import { checkoutStyles } from '../assets/dummyStyles'; // لتنسيقات الصفحة

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key_here');

/**
 * Checkout Component
 * Integrates with Stripe Checkout for secure payment processing
 */
const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = "Phone number must be 10-15 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showConfirmDialog = async () => {
    const total = getCartTotal;
    const tax = total * 0.05;
    const grandTotal = total + tax;

    const result = await Swal.fire({
      title: 'Confirm Order?',
      html: `
        <div style="text-align: left;">
          <p><strong>Total Amount:</strong> $${grandTotal.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Stripe)'}</p>
          <p><strong>Delivery Address:</strong> ${formData.address}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, place order!',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff',
    });
    return result.isConfirmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
        confirmButtonColor: '#10b981',
        background: '#1f2937',
        color: '#fff',
      });
      return;
    }

    const isConfirmed = await showConfirmDialog();
    if (!isConfirmed) return;

    setIsSubmitting(true);

    Swal.fire({
      title: 'Processing Order...',
      text: 'Please wait while we prepare your order',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => { Swal.showLoading(); },
      background: '#1f2937',
      color: '#fff',
    });

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (formData.paymentMethod === 'COD') {
        // Handle Cash on Delivery
        const res = await axios.post(
          `${apiUrl}/api/payment/create-cod-order`,
          {
            items: cart.map((item) => ({
              id: item.productId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
            })),
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
            },
            notes: formData.notes,
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (res.data.success) {
          Swal.close();
          clearCart();
          handleSuccessCheckout(res.data.data.orderId);
        } else {
          throw new Error(res.data.message || 'Order failed');
        }
      } else {
        // Handle Online Payment - Stripe Checkout
        const res = await axios.post(
          `${apiUrl}/api/payment/create-checkout-session`,
          {
            items: cart.map((item) => ({
              id: item.productId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
            })),
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
            },
            notes: formData.notes,
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (res.data.success && res.data.data?.checkoutUrl) {
          Swal.close();
          // Redirect to Stripe Checkout
          window.location.href = res.data.data.checkoutUrl;
        } else {
          throw new Error(res.data.message || 'Failed to create checkout session');
        }
      }
    } catch (err) {
      console.error("Order error:", err);
      Swal.fire({
        title: 'Order Failed',
        text: err.response?.data?.message || err.message || "Failed to place order. Please try again",
        icon: 'error',
        confirmButtonColor: '#10b981',
        background: '#1f2937',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessCheckout = (orderId) => {
    Swal.fire({
      title: '🎉 Order Placed Successfully!',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">Thank you for your order!</p>
          <div style="background: #374151; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <p style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Order Number:</p>
            <p style="font-family: monospace; font-size: 1.1rem;">${orderId}</p>
          </div>
          <p style="color: #9ca3af; font-size: 0.9rem;">You will receive a confirmation email shortly.</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'View My Orders',
      background: '#1f2937',
      color: '#fff',
    }).then(() => {
      navigate("/myorders");
    });
  };

  const total = getCartTotal;
  const tax = total * 0.05;
  const grandTotal = total + tax;

  return (
    <div className={checkoutStyles.page}>
      <div className={checkoutStyles.container}>
        <Link to="/cart" className={checkoutStyles.backLink}>
          <FiArrowLeft className="mr-2" />
          Back to cart
        </Link>

        <div className={checkoutStyles.header}>
          <h1 className={checkoutStyles.mainTitle}>Checkout</h1>
          <p className={checkoutStyles.subtitle}>
            Complete your purchase with secure Stripe checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Info Column */}
          <div className="space-y-6">
            <div className={checkoutStyles.card}>
              <h2 className={checkoutStyles.sectionTitle}>
                <FiUser className="mr-2 text-emerald-300" />
                Customer Information
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${checkoutStyles.input} ${errors.name ? checkoutStyles.inputError : ""}`}
                    placeholder="Enter Your Full Name"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${checkoutStyles.input} ${errors.email ? checkoutStyles.inputError : ""}`}
                      placeholder="your@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${checkoutStyles.input} ${errors.phone ? checkoutStyles.inputError : ""}`}
                      placeholder="01234567890"
                    />
                    {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    rows="3"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`${checkoutStyles.input} ${errors.address ? checkoutStyles.inputError : ""}`}
                    placeholder="Full Address"
                  />
                  {errors.address && <p className="mt-2 text-sm text-red-400">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className={checkoutStyles.input}
                    placeholder="Special instructions, gate code, etc."
                  />
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className={checkoutStyles.card}>
              <h2 className={checkoutStyles.sectionTitle}>
                <FiCreditCard className="mr-2 text-emerald-300" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 transition-all shadow-sm"
                  />
                  <div className="ml-3">
                    <span className="font-bold text-emerald-100">Cash on Delivery</span>
                    <span className="block text-xs text-emerald-400 mt-0.5 opacity-80">Pay securely in cash upon item arrival</span>
                  </div>
                </label>

                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={formData.paymentMethod === "Online"}
                    onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 transition-all shadow-sm"
                  />
                  <div className="ml-3">
                    <span className="font-bold text-emerald-100 flex items-center">
                      <FiLock className="mr-2 text-emerald-400 text-sm" />
                      Credit / Debit Card
                    </span>
                    <span className="block text-xs text-emerald-400 mt-0.5 opacity-80">Safe & secure online transaction via Stripe</span>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === 'Online' && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-4 border-b border-emerald-900/30 pb-3">
                    <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-widest">Secure Card Payment</h3>
                    <div className="flex space-x-2">
                      <span className="h-6 w-10 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[10px] text-white/40 font-bold">VISA</span>
                      <span className="h-6 w-10 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[10px] text-white/40 font-bold">MC</span>
                    </div>
                  </div>
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      formData={formData}
                      cart={cart}
                      grandTotal={grandTotal}
                      onSuccess={handleSuccessCheckout}
                      onLoading={setIsSubmitting}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className={`${checkoutStyles.card} h-fit sticky top-24`}>
            <h2 className={checkoutStyles.sectionTitle}>
              <FiPackage className="mr-2 text-emerald-300" />
              Order Summary
            </h2>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-emerald-400/60 uppercase tracking-widest mb-4">
                Your Items ({cart.length})
              </h3>
              <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className={`${checkoutStyles.cartItem} border border-white/5 hover:border-white/10 transition-all`}>
                    <div className={checkoutStyles.cartImage}>
                      {item.imageUrl ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FiPackage className="text-emerald-500 w-6 h-6" />
                      )}
                    </div>

                    <div className="grow">
                      <div className="font-bold text-emerald-100 text-sm">{item.name}</div>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-emerald-400">${item.price.toFixed(2)} × {item.quantity}</span>
                        <span className="font-bold text-emerald-100">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-emerald-900/30 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Subtotal</span>
                <span className="font-bold text-emerald-100">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Delivery</span>
                <span className="text-emerald-300 font-bold px-2 py-0.5 bg-emerald-900/30 rounded text-xs uppercase tracking-widest">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Tax (5%)</span>
                <span className="text-emerald-300 font-bold">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-emerald-900/30">
                <div>
                  <span className="text-sm font-bold text-emerald-500/60 uppercase tracking-widest block">Grand Total</span>
                  <span className="text-3xl font-bold bg-linear-to-r from-emerald-100 to-emerald-400 bg-clip-text text-transparent">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {formData.paymentMethod === 'COD' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
                className={`${checkoutStyles.button} ${isSubmitting || cart.length === 0 ? checkoutStyles.disabledButton : checkoutStyles.submitButton
                  } mt-8 group active:scale-95 transition-all`}
              >
                {isSubmitting ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing Order</>
                ) : (
                  <><FiCheck className="mr-2 group-hover:scale-125 transition-transform" /> Confirm COD Order</>
                )}
              </button>
            )}

            <p className="mt-4 text-center text-sm text-emerald-400">
              By placing your order you agree to our{' '}
              <a href="#" className={checkoutStyles.link}>Terms</a>
              {' '}and{' '}
              <a href="#" className={checkoutStyles.link}>Privacy Policy</a>
            </p>
          </div>
        </div>

        <div className={checkoutStyles.deliveryInfo}>
          <h3 className={checkoutStyles.deliveryTitle}>
            <FiTruck className="mr-2" />
            Delivery Information
          </h3>
          <p className={checkoutStyles.deliveryText}>
            We deliver within 30-45 minutes. Orders placed after 9PM will be delivered the next morning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
