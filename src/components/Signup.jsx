import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupStyles } from "../assets/dummyStyles";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isStrongPassword = (pass) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pass);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email address";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      // تعديل: إضافة \n للنزول سطر في الرسالة
      newErrors.password = "Password must be strong:\n• Min 8 chars, 1 uppercase\n• 1 lowercase, 1 number, 1 symbol";
    }

    if (!formData.remember) newErrors.remember = "You must agree to the terms";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // مسح الخطأ فور البدء في الكتابة
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', formData);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        toast.success("Welcome to RushBasket!");
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={signupStyles.container}>
      <div className={signupStyles.card}>
        <h2 className={signupStyles.title}>Create Account</h2>
        <p className={signupStyles.subtitle}>Join RushBasket today</p>

        <form onSubmit={handleSubmit} className="space-y-2">

          {/* Full Name Field */}
          <div className="flex flex-col">
            <div className={signupStyles.inputContainer}>
              <FaUser className={signupStyles.inputIcon} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={signupStyles.input}
              />
            </div>
            {/* حجز مساحة ثابتة لمنع الـ Layout Shift */}
            <div className="min-h-[20px] mt-1">
              {errors.name && <p className="text-red-500 text-[11px] pl-10 font-medium">{errors.name}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <div className={signupStyles.inputContainer}>
              <FaEnvelope className={signupStyles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className={signupStyles.input}
              />
            </div>
            <div className="min-h-[20px] mt-1">
              {errors.email && <p className="text-red-500 text-[11px] pl-10 font-medium">{errors.email}</p>}
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <div className={signupStyles.inputContainer}>
              <FaLock className={signupStyles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={signupStyles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={signupStyles.toggleButton}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* مساحة أكبر للباسوورد لأنه يحتوي على أسطر متعددة */}
            <div className="min-h-[50px] mt-1">
              {errors.password && (
                <p className="text-red-500 text-[11px] pl-10 font-medium whitespace-pre-line leading-relaxed">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions - تظبيط الصورة رقم 8 */}
          <div className="flex flex-col pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700 cursor-pointer"
              />
              <label className="text-sm text-gray-300 cursor-pointer">
                I agree to the <Link to="/terms" className="text-emerald-500 hover:underline">Terms and conditions</Link>
              </label>
            </div>
            <div className="min-h-[20px] mt-1">
              {errors.remember && <p className="text-red-500 text-[11px] font-medium">{errors.remember}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${signupStyles.submitButton} mt-4 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className={signupStyles.signinText + " mt-6"}>
          Already have an Account? <Link to='/login' className={signupStyles.signinLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;