import { useState, useEffect, useContext } from 'react';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import bgcover from '../assets/bgcover.jpg';
import TermsAndConditions from './tnc';
import PrivacyPolicy from './privacy-policy';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showTncModal, setShowTncModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [tncViewed, setTncViewed] = useState(false);
  const [privacyViewed, setPrivacyViewed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });


  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      const usernamePattern = /^(?!.*[_.]{2})(?!.*[_.]$)(?!^[_.])[a-zA-Z0-9._]{8,20}$/;
      if (value && !usernamePattern.test(value)) {
        setUsernameError("Username must be 8–20 characters and cannot start/end with or repeat '.' or '_'");
      } else {
        setUsernameError("");
      }
    }


    if (name === "email") {
    const emailPattern = /^[^\s@]+@(gmail|yahoo)\.com$/;
    if (value && !emailPattern.test(value)) {
      setEmailError("Please enter a valid Gmail or Yahoo email address");
    } else {
      setEmailError("");
    }
  }
    
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordValidations({
        length: value.length >= 8,
        lowercase: /[a-z]/.test(value),
        uppercase: /[A-Z]/.test(value),
        specialChar: /[^A-Za-z0-9]/.test(value),
      });
    }
  };

  const { user } = useContext(AuthContext);  

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user/user-dashboard'); 
      }
    }
  }, [user, navigate]);
  

  const handleSignup = async (e) => {
  e.preventDefault();
  setApiError(null);
  setIsLoading(true);

  // Frontend validation
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost/elder-dB/signup.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password
      }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.reload();
        }, 2000); // Wait 1 second to show the success message
      } else {
        // Handle specific backend validation errors
        if (result.error.includes('username')) {
          setApiError('Username already exists. Please choose another.');
        } else if (result.error.includes('email')) {
          setApiError('Email already registered. Please use another email or login.');
        } else {
          setApiError(result.error || 'Registration failed. Please try again.');
        }
      }
      } else {
        console.error('Signup failed:', result.error);
        setApiError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setApiError('Connection problem. Please check your internet and try again.');
      
    } finally {
      setIsLoading(false);
    }
  };
  

  const isFormValid = () => {
    return (
      formData.username &&
      !usernameError &&
      formData.email &&
      !emailError &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      Object.values(passwordValidations).every(Boolean) &&
      termsAgreed &&
      !isLoading
    );
  };


  return (
    <div className="font-sans min-h-screen flex flex-col">
      <section
        className="relative flex justify-center items-center min-h-screen pt-20 sm:pt-24 px-4 sm:px-6"
        style={{
          backgroundImage: `url(${bgcover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 -z-10"></div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignup} className="bg-white px-6 py-8 sm:px-8 sm:py-10 rounded-lg shadow-lg w-full max-w-md z-10">
          <h1 className="text-center text-2xl font-bold mb-8">Sign Up</h1>
        
          <div className="mb-3 text-left">
            {apiError && (
              <div className="mb-4 text-red-600 text-sm font-semibold bg-red-100 p-2 rounded">
                <span className="block">{apiError}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm"
            />
            {/* Username validation message */}
            {formData.username && usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>


          <div className="mb-3 text-left">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm"
            />
            {/* Email validation message */}
            {formData.email && emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-3 text-left relative">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </span>
          </div>

          {/* Pass Validation */}
          {formData.password && (
            <div className="text-sm mb-3 ml-1 space-y-1">
              {[
                { label: 'Must be at least 8 characters', valid: passwordValidations.length },
                { label: 'Must have at least one lowercase letter', valid: passwordValidations.lowercase },
                { label: 'Must have at least one uppercase letter', valid: passwordValidations.uppercase },
                { label: 'Must have at least one special character', valid: passwordValidations.specialChar },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center 
                      ${item.valid ? 'bg-green-600' : 'bg-gray-300'}`}
                  >
                    {item.valid && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}





          {/* Confirm Password Field */}
          <div className="mb-4 text-left relative">
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm Password:</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm pr-10"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-8 right-3 cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </span>
            {formData.confirmPassword && formData.confirmPassword !== formData.password && (
            <p className="text-red-500 text-sm mt-1 ml-1">Password does not match</p>
          )}
          </div>
          

          <div className="mb-4 text-left text-sm">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={termsAgreed}
                disabled={!(tncViewed && privacyViewed)}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className={`form-checkbox text-green-600 ${
                  tncViewed && privacyViewed ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              />
              <span className="ml-2">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTncModal(true)}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

          </div>

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full text-sm py-2 rounded mt-2 mb-3 transition duration-300 cursor-pointer
              ${isFormValid() ? 'bg-green-900 text-white hover:bg-yellow-500' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          >
            Sign Up
          </button>


          <div className="text-center mt-4 text-sm">
            <p>Already have an account? <a href="/login" className="text-gray-700 hover:text-yellow-500 transition font-medium">Log In</a></p>
          </div>
        </form>
      </section>
      {showTncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setShowTncModal(false)}
              className="absolute top-8 right-8 text-white hover:text-red-400 text-3xl font-bold transition cursor-pointer"
            >
              &times;
            </button>
            <TermsAndConditions
              show={showTncModal}
              onClose={() => setShowTncModal(false)}
              onAgree={() => {
                console.log('T&C modal accepted');
                setTncViewed(true);
                setShowTncModal(false);
                if (!privacyViewed) {
                  console.log('Opening Privacy Policy modal...');
                  setTimeout(() => setShowPrivacyModal(true), 100);
                } else {
                  setTermsAgreed(true);
                  console.log('All policies viewed. User agreed to all.');
                }
              }}
            />
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-8 right-8 text-white hover:text-red-400 text-3xl font-bold transition cursor-pointer"
            >
              &times;
            </button>
            <PrivacyPolicy
              show={showPrivacyModal}
              onClose={() => setShowPrivacyModal(false)}
              onAgree={() => {
                console.log('Privacy Policy modal accepted');
                setPrivacyViewed(true);
                setShowPrivacyModal(false);
                if (!tncViewed) {
                  console.log('Opening T&C modal...');
                  setTimeout(() => setShowTncModal(true), 100);
                } else {
                  setTermsAgreed(true);
                  console.log('All policies viewed. User agreed to all.');
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
