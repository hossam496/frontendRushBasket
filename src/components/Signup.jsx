import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupStyles } from "../assets/dummyStyles";
import { FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import API from "../services/api";
import toast from "react-hot-toast";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // form handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  // validating all fields
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await API.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        toast.success("Account created successfully! Please login.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(response.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.page}>
      <Link to="/login" className={signupStyles.backLink}>
        <FaArrowLeft className="mr-2" />
        Back to Login
      </Link>

      {/* signup card */}
      <div className={signupStyles.signupCard}>
        <div className={signupStyles.logoContainer}>
            <div className={signupStyles.logoOuter}>
                <div className={signupStyles.logoInner}>
                    <FaUser className={signupStyles.logoIcon} />
                </div>
            </div>
        </div>

        <h2 className={signupStyles.title}>
            Create Account
        </h2>

        <form onSubmit={handleSubmit} className={signupStyles.form}>
            
            <div className={signupStyles.inputContainer}>
                <FaUser className={signupStyles.inputIcon} />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Full Name" required className={signupStyles.input} />

                {errors.name && <p className={signupStyles.error}>{errors.name}</p>}
            </div>

            <div className={signupStyles.inputContainer}>
                <FaEnvelope className={signupStyles.inputIcon} />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Email Address" required className={signupStyles.input} />

                {errors.email && <p className={signupStyles.error}>{errors.email}</p>}
            </div>

            <div className={signupStyles.inputContainer}>
                <FaLock className={signupStyles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} name="password"
                 value={formData.password} onChange={handleChange}
                placeholder="Password" required className={signupStyles.passwordInput} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className={signupStyles.toggleButton}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>

                {errors.password && <p className={signupStyles.error}>{errors.password}</p>}
            </div>

            <div className={signupStyles.termsContainer}>
                <label className={signupStyles.termsLabel}>
                    <input type="checkbox" name="remember" checked={formData.remember}
                    onChange={handleChange} className={signupStyles.termsCheckbox} required />
                    I agree to the Terms and conditions
                </label>
            </div>

            {error && <p className={signupStyles.error}>{error}</p>}

            <button type="submit" disabled={isLoading} className={signupStyles.submitButton}>
                {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
        </form>

        <p className={signupStyles.signinText}>
            Already have an Account? {' '}
            <Link to='/login' className={signupStyles.signinLink}>
            Sign In
            </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
