import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupStyles } from "../assets/dummyStyles";
import { FaArrowLeft, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false); // تعديل: خليناها boolean بسيط
  const [apiError, setApiError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Redirect logic now handled in handleSubmit for better control

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const isStrongPassword = (pass) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol;
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
    if (!formData.remember)
      newErrors.remember = "You must agree to terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post(
        '/api/auth/register',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
      );

      if (res.data.success) {
        const { token, user } = res.data;
        login(user, token, formData.remember);
        
        setShowToast(true);
        
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        setApiError(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Signup full error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        const errorMsg = err.response.data.message || err.response.data || "Server error";
        setApiError(typeof errorMsg === 'string' ? errorMsg : "Registration failed");
      } else if (err.request) {
        console.error("Request made but no response received:", err.request);
        setApiError("Unable to reach server - please check your connection");
      } else {
        console.error("Error setting up request:", err.message);
        setApiError("Signup setup error");
      }
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

      {showToast && (
        <div className={signupStyles.toast}>
          <FaCheck className="mr-2" /> Account created successfully!
        </div>
      )}

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
          <div className={signupStyles.inputContainer}>
            <FaUser className={signupStyles.inputIcon} />
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Full Name" className={signupStyles.input} />
            {errors.name && <p className={signupStyles.error}>{errors.name}</p>}
          </div>

          <div className={signupStyles.inputContainer}>
            <FaEnvelope className={signupStyles.inputIcon} />
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email Address" className={signupStyles.input} />
            {errors.email && <p className={signupStyles.error}>{errors.email}</p>}
          </div>

          <div className={signupStyles.inputContainer}>
            <FaLock className={signupStyles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'} // تعديل: مسحنا .password
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={signupStyles.passwordInput}
            />
            <button type="button" onClick={togglePasswordVisibility}
              className={signupStyles.toggleButton}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className={signupStyles.error}>{errors.password}</p>}
          </div>

          <div className={signupStyles.termsContainer}>
            <label className={signupStyles.termsLabel}>
              <input type="checkbox" name="remember" checked={formData.remember}
                onChange={handleChange} className={signupStyles.termsCheckbox} />
              I agree to the Terms and conditions
            </label>
            {errors.remember && <p className={signupStyles.error}>{errors.remember}</p>}
          </div>

          <button type="submit" className={signupStyles.submitButton}>Sign Up</button>
        </form>

        <p className={signupStyles.signinText}>
          Already have an Account? <Link to='/login' className={signupStyles.signinLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;