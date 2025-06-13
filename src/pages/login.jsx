import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import bgcover from '../assets/bgcover.jpg';

function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [formState, setFormState] = useState({
    showForgotPassword: false,
    showOTPForm: false,
    showChangePassword: false,
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: '',
    emailError: '',
    otpError: '',
    newPasswordError: '',
    confirmPasswordError: '',
  });
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [showSentModal, setShowSentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180); 
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(true); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(true); 
  const [isOtpInvalidated, setIsOtpInvalidated] = useState(false);
  const [showPasswordUpdatedModal, setShowPasswordUpdatedModal] = useState(false);

  // Password validation checks
  const passwordValidations = {
    length: formState.newPassword.length >= 8,
    lowercase: /[a-z]/.test(formState.newPassword),
    uppercase: /[A-Z]/.test(formState.newPassword),
    specialChar: /[^A-Za-z0-9]/.test(formState.newPassword),
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/user/user-dashboard');
    }
  }, [user, navigate]);

  // OTP timer
  useEffect(() => {
    let interval;
    if (formState.showOTPForm && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [formState.showOTPForm, otpTimer]);

  // Invalidate OTP on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsOtpInvalidated(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@(gmail|yahoo)\.com$/;
    if (!emailPattern.test(email)) {
      setFormState({ ...formState, emailError: 'Please enter a valid Gmail or Yahoo email address' });
      return false;
    }
    setFormState({ ...formState, emailError: '' });
    return true;
  };

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...formState.otp];
      newOtp[index] = value;
      setFormState({ ...formState, otp: newOtp, otpError: '' });
      
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSendOTP = async () => {
    if (!validateEmail(formState.email)) return;

    setShowSendingModal(true);
    setFormState({ ...formState, emailError: '', otpError: '' });

    try {
      // Check if email exists
      const checkResponse = await fetch('http://localhost/elder-dB/check_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email }),
      });
      const checkResult = await checkResponse.json();

      if (!checkResult.exists) {
        throw new Error('Email not found in our system');
      }

      // Send OTP
      const response = await fetch('http://localhost/elder-dB/send_forgot_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email, action: 'forgot_password' }),
      });

      const result = await response.json();
      setShowSendingModal(false);

      if (result.success) {
        setShowSentModal(true);
        setIsOtpInvalidated(false);
        setTimeout(() => {
          setShowSentModal(false);
          setFormState({ ...formState, showOTPForm: true, showForgotPassword: false });
          setOtpTimer(180);
          setCanResendOtp(false);
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      setShowSendingModal(false);
      setFormState({ ...formState, emailError: error.message || 'Failed to send OTP. Please try again.' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setShowSendingModal(true);
    try {
      const response = await fetch('http://localhost/elder-dB/resend_forgot_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email }),
      });

      const result = await response.json();
      setShowSendingModal(false);

      if (result.success) {
        setShowSentModal(true);
        setIsOtpInvalidated(false);
        setTimeout(() => {
          setShowSentModal(false);
          setOtpTimer(180);
          setCanResendOtp(false);
          setFormState({ ...formState, otp: ['', '', '', '', '', ''], otpError: '' });
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setShowSendingModal(false);
      setFormState({ ...formState, otpError: error.message || 'Failed to resend OTP' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    }
  };

  const handleVerifyOTP = async () => {
    if (isOtpInvalidated) {
      setFormState({ ...formState, otpError: 'Session expired. Please request a new OTP.' });
      return;
    }

    const otpCode = formState.otp.join('');
    if (otpCode.length !== 6) {
      setFormState({ ...formState, otpError: 'Please enter a 6-digit OTP' });
      return;
    }

    try {
      const response = await fetch('http://localhost/elder-dB/user-process/verify_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode, email: formState.email }),
      });

      const result = await response.json();
      if (result.success) {
        setFormState({ ...formState, showOTPForm: false, showChangePassword: true });
      } else {
        setFormState({ ...formState, otpError: result.message || 'Invalid OTP' });
        if (otpTimer > 0) {
          setTimeout(() => setFormState((prev) => ({ ...prev, otpError: '' })), 5000);
        }
      }
    } catch (error) {
      setFormState({ ...formState, otpError: 'An error occurred. Please try again.' });
    }
  };

  const handleConfirmPassword = async () => {
    // Password validations
    if (formState.newPassword.length < 8) {
      setFormState({ ...formState, newPasswordError: 'Password must be at least 8 characters.' });
      return;
    }
    if (!passwordValidations.lowercase) {
      setFormState({ ...formState, newPasswordError: 'Password must contain at least one lowercase letter.' });
      return;
    }
    if (!passwordValidations.uppercase) {
      setFormState({ ...formState, newPasswordError: 'Password must contain at least one uppercase letter.' });
      return;
    }
    if (!passwordValidations.specialChar) {
      setFormState({ ...formState, newPasswordError: 'Password must contain at least one special character.' });
      return;
    }
    if (formState.newPassword !== formState.confirmPassword) {
      setFormState({ ...formState, confirmPasswordError: 'Passwords do not match.' });
      return;
    }

    try {
      const response = await fetch('http://localhost/elder-dB/update_forgotten_password.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          newPassword: formState.newPassword,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowPasswordUpdatedModal(true);
        setTimeout(() => {
          setShowPasswordUpdatedModal(false);
          setFormState({
            showForgotPassword: false,
            showOTPForm: false,
            showChangePassword: false,
            email: '',
            otp: ['', '', '', '', '', ''],
            newPassword: '',
            confirmPassword: '',
            emailError: '',
            otpError: '',
            newPasswordError: '',
            confirmPasswordError: '',
          });
        }, 2000);
      } else {
        setFormState({ ...formState, newPasswordError: result.message || 'Failed to update password' });
      }
    } catch (error) {
      setFormState({ ...formState, newPasswordError: 'An error occurred. Please try again.' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await fetch('http://localhost/elder-dB/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        setLoginError('');
        login(data.user);
        navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/user/user-dashboard');
      } else {
        setLoginError(data.message);
      }
    } catch (error) {
      setLoginError('Something went wrong. Please try again.');
    }
  };

  if (isOtpInvalidated && formState.showOTPForm) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center px-4 py-10 bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">Session Expired</h2>
          <p className="mt-2">The OTP session has been invalidated. Please request a new OTP.</p>
          <button
            onClick={() => setFormState({ ...formState, showOTPForm: false, showForgotPassword: true })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Request New OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Modals */}
      {showSendingModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <h2 className="text-xl font-bold">Sending OTP</h2>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordUpdatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate">
            <CheckCircleIcon className="h-32 w-16 text-green-600 mx-auto"/>
            <h2 className="text-xl font-bold mt-4">Password Updated Successfully!</h2>
            <p className="mt-2">Your password has been updated. You can now log in with your new password.</p>
          </div>
        </div>
      )}

      {showSentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold mt-4">OTP Sent Successfully!</h2>
            <p className="mt-2">Please check your email for the OTP code.</p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <XMarkIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold mt-4">An Error Occurred</h2>
            <p className="mt-2">{formState.emailError || 'Please try again.'}</p>
          </div>
        </div>
      )}

      <section
        className="relative flex-grow flex flex-col items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6"
        style={{
          backgroundImage: `url(${bgcover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Login Form */}
        {!formState.showForgotPassword && !formState.showOTPForm && !formState.showChangePassword && (
          <div id="login-form" className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-10">
            <form onSubmit={handleLogin}>
              <h1 className="text-center text-2xl font-bold mb-8">Login</h1>
              {loginError && (
                <div className="mb-4 text-red-600 text-sm font-semibold bg-red-100 p-2 rounded">
                  {loginError}
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="username" className="block font-semibold text-sm mb-1">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                />
              </div>
              <div className="mb-4 relative">
                <label htmlFor="password" className="block font-semibold text-sm mb-1">Password:</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  className="w-full border border-gray-300 p-2 rounded text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[34px] right-3 text-gray-500 hover:text-yellow-500 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <div className="text-left mb-4">
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, showForgotPassword: true })}
                  className="text-sm text-gray-700 hover:text-yellow-500"
                >
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className="w-full py-2 bg-green-900 text-white rounded hover:bg-yellow-500">
                Login
              </button>
              <div className="text-center mt-4 text-sm">
                <p>
                  Don't have an account?{' '}
                  <a href="/signup" className="text-gray-700 hover:text-yellow-500 font-semibold">
                    Signup
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {formState.showForgotPassword && (
          <div id="forgot-password-form" className="space-y-4 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-center mb-4">Forgot Password</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1">Enter your email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
              {formState.emailError && <p className="text-sm text-red-600 mt-1">{formState.emailError}</p>}
            </div>
            <button
              onClick={handleSendOTP}
              className="w-full py-2 bg-green-900 text-white rounded hover:bg-yellow-500"
            >
              Send OTP
            </button>
            <div className="text-center text-sm">
              <p>
                Remembered your password?{' '}
                <button
                  onClick={() => setFormState({ ...formState, showForgotPassword: false })}
                  className="text-gray-700 hover:text-yellow-500 font-semibold"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        )}

        {/* OTP Form */}
        {formState.showOTPForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Verify OTP</h2>
                <button
                  onClick={() => setFormState({ ...formState, showOTPForm: false })}
                  className="text-2xl leading-none p-1 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <hr className="mb-4" />
              <div className="flex-1">
                <p className="mb-6 text-center">OTP was sent to: {formState.email}</p>
                <div className="flex justify-center space-x-2 mb-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={formState.otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !e.target.value && index > 0) {
                          document.getElementById(`otp-${index - 1}`).focus();
                        }
                        if (e.key === 'ArrowLeft' && index > 0) {
                          document.getElementById(`otp-${index - 1}`).focus();
                        }
                        if (e.key === 'ArrowRight' && index < 5) {
                          document.getElementById(`otp-${index + 1}`).focus();
                        }
                      }}
                      className="w-12 h-12 text-center border border-gray-300 bg-gray-100 text-gray-700 rounded text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                {formState.otpError && <p className="text-red-500 text-sm mb-4 text-center">{formState.otpError}</p>}
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm text-gray-500">OTP Expires in: {formatTime(otpTimer)}</span>
                  <button
                    onClick={handleResendOtp}
                    disabled={!canResendOtp}
                    className={`text-sm ${canResendOtp ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setFormState({ ...formState, showOTPForm: false })}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all text-sm"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Form */}
        {formState.showChangePassword && (
          <div id="change-password-form" className="space-y-4 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-center mb-4">Change Password</h2>
            <div className="relative">
              <label htmlFor="new-password" className="block text-sm font-semibold mb-1">New Password:</label>
              <input
                type="text"
                id="new-password"
                name="new-password"
                value={formState.newPassword}
                onChange={(e) => setFormState({ ...formState, newPassword: e.target.value, newPasswordError: '' })}
                required
                className="w-full p-2 border rounded"
              />
              {formState.newPasswordError && (
                <p className="text-sm text-red-600 mt-1">{formState.newPasswordError}</p>
              )}
              {formState.newPassword && (
                <div className="text-sm ml-1 mt-2 space-y-1 text-gray-700">
                  <p className={passwordValidations.length ? 'text-green-600' : 'text-red-600'}>
                    • At least 8 characters
                  </p>
                  <p className={passwordValidations.lowercase ? 'text-green-600' : 'text-red-600'}>
                    • At least one lowercase letter
                  </p>
                  <p className={passwordValidations.uppercase ? 'text-green-600' : 'text-red-600'}>
                    • At least one uppercase letter
                  </p>
                  <p className={passwordValidations.specialChar ? 'text-green-600' : 'text-red-600'}>
                    • At least one special character (e.g. !, @, #)
                  </p>
                </div>
              )}
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="block text-sm font-semibold mb-1">Confirm Password:</label>
              <input
                type="text"
                id="confirm-password"
                name="confirm-password"
                value={formState.confirmPassword}
                onChange={(e) => setFormState({ ...formState, confirmPassword: e.target.value, confirmPasswordError: '' })}
                required
                className="w-full p-2 border rounded"
              />
              {formState.confirmPasswordError && (
                <p className="text-sm text-red-600 mt-1">{formState.confirmPasswordError}</p>
              )}
            </div>
            <button
              onClick={handleConfirmPassword}
              className="w-full py-2 bg-green-900 text-white rounded hover:bg-yellow-500"
            >
              Confirm Password
            </button>
            <div className="text-center text-sm">
              <p>
                Return to{' '}
                <button
                  onClick={() => setFormState({ ...formState, showChangePassword: false })}
                  className="text-gray-700 hover:text-yellow-500 font-semibold"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Login;