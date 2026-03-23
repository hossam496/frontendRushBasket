import React, { useEffect, useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = user.role === 'admin' ? '/admin' : '/';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmet = async (e) => {
    e.preventDefault();
    setError('')
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    try {
      const response = await api.post(
        '/api/auth/login',
        {
          email: formData.email,
          password: formData.password
        }
      )

      if (response.data.success) {
        const { token, user } = response.data
        login(user, token, formData.remember)

        setShowToast(true)

        // Immediate redirect without setTimeout
        const targetPath = user.role === 'admin' ? '/admin' : '/';
        navigate(targetPath, { replace: true });
      } else {
        setError(response.data.message || "Login Failed")
      }
    }
    catch (err) {
      console.error("Login full error:", err);
      
      // Show detailed error message from server
      if (err.response?.data?.message) {
        console.error("Server error:", err.response.data);
        setError(err.response.data.message)
      } else if (err.response?.status === 500) {
        setError("Server error - please try again later")
      } else if (err.response?.status === 401) {
        setError("Invalid email or password")
      } else if (err.request) {
        console.error("No response from server:", err.request);
        setError("Cannot connect to server - check your internet connection")
      } else {
        console.error("Error:", err.message);
        setError("Login failed - please try again")
      }
    }
  }

  return (
    <div className={loginStyles.page}>
      <Link to="/" className={loginStyles.backLink}>
        <FaArrowLeft className="mr-2" />
        Back to Home
      </Link>

      {/* toast notifaction */}
      {showToast && (
        <div className={loginStyles.toast}>
          <FaCheck className="mr-2" />
          Login Successful!
        </div>
      )}

      {/* login card */}
      <div className={loginStyles.loginCard}>
        <div className={loginStyles.logoContainer}>
          <div className={loginStyles.logoOuter}>
            <div className={loginStyles.logoInner}>
              <FaUser className={loginStyles.logoIcon} />
            </div>
          </div>
        </div>

        <h2 className={loginStyles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmet} className={loginStyles.form}>
          {/* email */}

          <div className={loginStyles.inputContainer}>
            <FaUser className={loginStyles.inputIcon} />
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="Email Adress"
              required className={loginStyles.input} />
          </div>

          <div className={loginStyles.inputContainer}>
            <FaLock className={loginStyles.inputIcon} />
            <input type={showPassword ? 'text' : 'password'}
              name="password" value={formData.password}
              onChange={handleChange} placeholder="passwrod"
              required className={loginStyles.passwordInput} />

            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className={loginStyles.toggleButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* remember me */}
          <div className={loginStyles.rememberContainer}>
            <label className={loginStyles.rememberLabel}>
              <input type="checkbox" name="remember"
                checked={formData.remember}
                onChange={handleChange} className={loginStyles.rememberCheckbox}
              />
              Remember me
            </label>
            <Link to='#' className={loginStyles.forgotLink}>
              Forgot?
            </Link>
          </div>
          {error && <p className={loginStyles.error}>{error}</p>}

          <button type="submit" className={loginStyles.submitButton}>
            Sign In
          </button>
        </form>

        <p className={loginStyles.signupText}>
          Dont’t have an account?{' '}
          <Link to='/signup' className={loginStyles.signupLink}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;