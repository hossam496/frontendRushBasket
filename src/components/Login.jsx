import React, { useEffect, useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import Logout from "./Logout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../services/api";

const Login = () => {
  const { isAuthenticated, login, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Logout />;
  }

  // form handler 
  const handleChange = (e) => {
    const {name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Use the AuthContext login method
        login(data.user, data.token, formData.remember);
        toast.success(`Welcome back, ${data.user.name}!`);
        
        // Redirect will happen in useEffect based on role
        if (data.user.role === 'admin') {
          setTimeout(() => navigate('/admin'), 1000);
        } else {
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={loginStyles.page}>
      <Link to="/" className={loginStyles.backLink}>
        <FaArrowLeft className="mr-2" />
        Back to Home
      </Link>

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

        <form onSubmit={handleSubmit} className={loginStyles.form}>
          {/* email */}
          
          <div className={loginStyles.inputContainer}>
            <FaUser className={loginStyles.inputIcon} />
            <input type="email" name="email" value={formData.email}
            onChange={handleChange} placeholder="Email Address" 
            required className={loginStyles.input}/>
          </div>

          <div className={loginStyles.inputContainer}>
            <FaLock className={loginStyles.inputIcon} />
            <input type={showPassword ? 'text' : 'password'}
             name="password" value={formData.password}
            onChange={handleChange} placeholder="Password" 
            required className={loginStyles.passwordInput}/>

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
              onChange={handleChange} className={loginStyles.rememberCheckbox}/>
              Remember me
            </label>
            <Link to='#' className={loginStyles.forgotLink}>
            Forgot?
            </Link>
          </div>
          {error && <p className={loginStyles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} className={loginStyles.submitButton}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className={loginStyles.signupText}>
          Don't have an account?{' '}
          <Link to='/signup' className={loginStyles.signupLink}>
          Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
