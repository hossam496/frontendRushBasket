import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { signupStyles } from "../assets/dummyStyles";

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
  const [apiError, setApiError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const isStrongPassword = (pass) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = "Password must be strong (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)";
    }

    if (!formData.remember) {
      newErrors.remember = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const res = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        const { token, user } = res.data;
        login(user, token, formData.remember);

        setShowToast(true);

        setTimeout(() => {
          navigate(user.role === 'admin' ? "/admin" : "/");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={signupStyles.page}>
      <Link to="/login" className={signupStyles.backLink}>
        <FaArrowLeft className="mr-2" /> Back to Login
      </Link>

      {/* Success Toast */}
      {showToast && (
        <div className={signupStyles.toast}>
          <FaCheck className="mr-2" /> Account created successfully!
        </div>
      )}

      {/* General API Error */}
      {apiError && <p className={signupStyles.error}>{apiError}</p>}

      <div className={signupStyles.signupCard}>
        <div className={signupStyles.logoContainer}>
          <div className={signupStyles.logoOuter}>
            <div className={signupStyles.logoInner}>
              <FaUser className={signupStyles.logoIcon} />
            </div>
          </div>
        </div>

        <h2 className={signupStyles.title}>Create Account</h2>

        <form onSubmit={handleSubmit} className={signupStyles.form}>
          {/* Name */}
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
            {errors.name && <p className={signupStyles.error}>{errors.name}</p>}
          </div>

          {/* Email */}
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
            {errors.email && <p className={signupStyles.error}>{errors.email}</p>}
          </div>

          {/* Password */}
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
              onClick={togglePasswordVisibility}
              className={signupStyles.toggleButton}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {/* Password Hint - Fixed Color */}
            <p className="text-xs text-gray-400 mt-1.5">
              Password must be strong (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)
            </p>

            {errors.password && <p className={signupStyles.error}>{errors.password}</p>}
          </div>

          {/* Terms & Conditions */}
          <div className={signupStyles.termsContainer}>
            <label className={signupStyles.termsLabel}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className={signupStyles.termsCheckbox}
              />
              I agree to the Terms and conditions
            </label>

            {/* Error only shows after submit attempt */}
            {errors.remember && (
              <p className={`${signupStyles.error} mt-1`}>
                You must agree to terms and conditions
              </p>
            )}
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={signupStyles.submitButton}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className={signupStyles.signinText}>
          Already have an Account?{" "}
          <Link to='/login' className={signupStyles.signinLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;