import React, { useEffect, useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import Logout from "./Logout";
import api, { saveAuthTokens } from '../services/api';

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("userData")),
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShawPassword] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("userData")));
    };
    window.addEventListener("authStateChanged", handler);
    return () => window.removeEventListener("authStateChanged", handler);
  }, []);
  if (isAuthenticated) {
    return <Logout />;
  }

  // form handler 
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
    if (!formData.remember) {
      setError("You must agree to terms and conditions")
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
        saveAuthTokens(token)
        localStorage.setItem('userData', JSON.stringify(user))
        localStorage.setItem('userRole', user.role || 'user')

        setShowToast(true)
        window.dispatchEvent(new Event('authStateChanged'))

        setTimeout(() => {
          if (user.role === 'admin') {
            navigate("/admin")
          } else {
            navigate("/")
          }
        }, 1000)
      } else {
        setError(response.data.message || "Login Failed")
      }
    }
    catch (err) {
      console.error("Login full error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        setError(err.response.data.message || "Login error")
      } else if (err.request) {
        console.error("Request made but no response received:", err.request);
        setError("Unable to reach server - please check your connection")
      } else {
        console.error("Error setting up request:", err.message);
        setError("Login setup error")
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

            <button type="button" onClick={() => setShawPassword((v) => !v)}
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
                required />
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