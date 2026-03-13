import React, { useState } from "react";
import { checkoutStyles } from "../assets/dummyStyles";
import { useCart } from "../CartContext";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiCreditCard, FiPackage, FiTruck, FiUser } from "react-icons/fi";
import axios from "axios";
import Swal from 'sweetalert2'; 

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart(); // getCartTotal هي قيمة الآن
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
    else if (!/^\d{11}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 11 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // دالة لعرض تأكيد قبل تقديم الطلب
  const showConfirmDialog = async () => {
    const result = await Swal.fire({
      title: 'Confirm Order?',
      html: `
        <div style="text-align: left;">
          <p><strong>Total Amount:</strong> $${grandTotal.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
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
      // عرض رسالة خطأ التحقق
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

    // تأكيد الطلب
    const isConfirmed = await showConfirmDialog();
    if (!isConfirmed) return;

    setIsSubmitting(true);

    // عرض loading
    Swal.fire({
      title: 'Processing Order...',
      text: 'Please wait while we process your order',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#1f2937',
      color: '#fff',
    });

    const total = getCartTotal;

    const order = {
      customer: { ...formData },
      items: cart.map((item) => ({
        id: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      total: total,
      status: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === "COD" ? "Pending" : "Unpaid",
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: formData.notes,
    };

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        order,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      if (res.data.CheckoutUrl) {
        // إذا كان هناك رابط دفع أونلاين
        Swal.fire({
          title: 'Redirecting to Payment',
          text: 'You will be redirected to complete your payment',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#fff',
        }).then(() => {
          window.location.href = res.data.CheckoutUrl;
        });
        return;
      }

      if (res.status === 201 || res.status === 200) {
        const createdOrder = res.data.order || res.data;
        const displayId = createdOrder.orderId || createdOrder._id;
        clearCart();
        
        // عرض رسالة نجاح رائعة
        Swal.fire({
          title: '🎉 Order Placed Successfully!',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 1.2rem; margin-bottom: 1rem;">Thank you for your order!</p>
              <div style="background: #374151; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">Order ID:</p>
                <p style="font-family: monospace; font-size: 1.1rem;">${displayId}</p>
              </div>
              <p style="color: #9ca3af; font-size: 0.9rem;">You will receive a confirmation email shortly.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue Shopping',
          background: '#1f2937',
          color: '#fff',
        }).then(() => {
          navigate("/");
        });
      } else {
        throw new Error('Order failed');
      }
    } catch (err) {
      console.error("Order error:", err);
      
      // عرض رسالة خطأ
      Swal.fire({
        title: 'Order Failed',
        text: err.response?.data?.message || "Failed to place order. Please try again",
        icon: 'error',
        confirmButtonColor: '#10b981',
        background: '#1f2937',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Complete your purchase with secure checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Info Column */}
          <div className="space-y-6">
            {/* Customer Information Card */}
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
                    className={`${checkoutStyles.input} ${
                      errors.name ? checkoutStyles.inputError : ""
                    }`}
                    placeholder="Enter Your Full Name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                  )}
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
                      className={`${checkoutStyles.input} ${
                        errors.email ? checkoutStyles.inputError : ""
                      }`}
                      placeholder="your@example.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                    )}
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
                      className={`${checkoutStyles.input} ${
                        errors.phone ? checkoutStyles.inputError : ""
                      }`}
                      placeholder="0123456789"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                    )}
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
                    className={`${checkoutStyles.input} ${
                      errors.address ? checkoutStyles.inputError : ""
                    }`}
                    placeholder="Full Address"
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-400">{errors.address}</p>
                  )}
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
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-emerald-100">
                      Cash on Delivery
                    </span>
                    <span className="block text-sm text-emerald-400">
                      Pay when you receive
                    </span>
                  </div>
                </label>

                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={formData.paymentMethod === "Online"}
                    onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-emerald-100">
                      Online Payment
                    </span>
                    <span className="block text-sm text-emerald-400">
                      Pay now via card/UPI
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className={checkoutStyles.card}>
            <h2 className={checkoutStyles.sectionTitle}>
              <FiPackage className="mr-2 text-emerald-300" />
              Order Summary
            </h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-emerald-300 mb-4">
                Your Items ({cart.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className={checkoutStyles.cartItem}>
                    <div className={checkoutStyles.cartImage}>
                      {item.imageUrl ? (
                        <img 
                          src={`http://localhost:5000${item.imageUrl}`} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/no-image.png';
                          }} 
                        />
                      ) : (
                        <FiPackage className="text-emerald-500 w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="font-medium text-emerald-100">
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-emerald-400">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </span>
                        <span className="font-medium text-emerald-100">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-emerald-700/50 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-emerald-300">Subtotal</span>
                <span className="font-medium text-emerald-100">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">Delivery</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">Tax (5%)</span>
                <span className="text-emerald-400 font-medium">
                  ${tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between pt-3 mt-3 border-t border-emerald-700/50">
                <span className="text-lg font-bold text-emerald-100">
                  Total
                </span>
                <span className="text-lg font-bold text-emerald-300">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || cart.length === 0} 
              className={`${checkoutStyles.button} ${
                isSubmitting || cart.length === 0
                  ? checkoutStyles.disabledButton
                  : checkoutStyles.submitButton
              } mt-6`}
            >
              {isSubmitting ? (
                <>
                  <FiCheck className="mr-2 animate-spin" />
                  Processing Order
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Place Order
                </>
              )}
            </button>
            
            <p className="mt-4 text-center text-sm text-emerald-400">
              By placing your order you agree to our {' '}
              <a href="#" className={checkoutStyles.link}>
                Terms
              </a> {' '}
              and {' '}
              <a href="#" className={checkoutStyles.link}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className={checkoutStyles.deliveryInfo}>
          <h3 className={checkoutStyles.deliveryTitle}>
            <FiTruck className="mr-2" />
            Delivery Information
          </h3>
          <p className={checkoutStyles.deliveryText}>
            We deliver within 30-45 minutes. Orders placed after 9PM will be
            delivered the next morning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;