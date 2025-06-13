import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser ] = useState(null);
  const [initialUser , setInitialUser ] = useState(null); // Track initial user state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageError, setImageError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Verification flow states
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [showSentModal, setShowSentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [canResendOtp, setCanResendOtp] = useState(false);

  // New state to track if changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  const validateUsername = (username) => {
    const usernamePattern = /^(?!.*[_.]{2})(?!.*[_.]$)(?!^[_.])[a-zA-Z0-9._]{8,20}$/;
    if (username && !usernamePattern.test(username)) {
      setUsernameError("Username must be 8-20 characters, can contain letters, numbers, '.', '_', but cannot start/end with or repeat '.' or '_'");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@(gmail|yahoo)\.com$/;
    if (email && !emailPattern.test(email)) {
      setEmailError("Please enter a valid Gmail or Yahoo email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
    
    // Clear error when user changes input
    if (otpError) {
      setOtpError('');
    }
  };

  const handleVerifyClick = async () => {
    // First validate the email
    if (!user?.email || !validateEmail(user.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (user.email !== initialUser.email) {
      setOtpError('Please save your email changes before verifying.');
      return;
    }

    setShowSendingModal(true);
    setOtpError('');

    try {
      // Log the email being sent for debugging
      console.log('Attempting to send OTP to:', user.email);

      const response = await fetch('http://localhost/elder-dB/user-process/send_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email,
          action: 'send_otp' // Add explicit action if needed by your backend
        }),
      });

      // First check if we got any response at all
      if (!response) {
        throw new Error('No response from server');
      }

      // Get the raw text first
      const rawText = await response.text();
      console.log('Raw server response:', rawText);

      // Check if response is empty
      if (!rawText || rawText.trim() === '') {
        throw new Error('Server returned empty response');
      }

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Response that failed to parse:', rawText);
        throw new Error(`Server returned invalid JSON: ${rawText.substring(0, 100)}`);
      }

      setShowSendingModal(false);
      
      if (result.success) {
        setShowSentModal(true);
        setTimeout(() => {
          setShowSentModal(false);
          setShowOtpModal(true);
          setOtpTimer(300);
          setCanResendOtp(false);
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }

    } catch (error) {
      console.error('Error in handleVerifyClick:', error);
      setShowSendingModal(false);
      
      let errorMessage = error.message || 'Failed to send OTP. Please try again.';
      if (error.message.includes('JSON')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      setOtpError(errorMessage);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setShowSendingModal(true);

    try {
      const response = await fetch('http://localhost/elder-dB/user-process/resend_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }) 
      });

      const result = await response.json();
      setShowSendingModal(false);

      if (result.success) {
        setShowSentModal(true);
        setTimeout(() => {
          setShowSentModal(false);
          setOtpTimer(300);
          setCanResendOtp(false);
          setOtp(['', '', '', '', '', '']);
        }, 2000);
      } else {
        setShowErrorModal(true);
        setTimeout(() => {
          setShowErrorModal(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setShowSendingModal(false);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
    }
  };

  const handleVerifySubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    try {
      const response = await fetch('http://localhost/elder-dB/user-process/verify_otp.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      });
      
      const result = await response.json();
      if (result.success) {
        setShowOtpModal(false);
        // Update user state to show verified
        setUser ({ ...user, is_email_verified: 'yes' });
      } else {
        setOtpError(result.message || 'Invalid OTP');
        
        // Clear error after 5 seconds if timer is still running
        if (otpTimer > 0) {
          setTimeout(() => {
            setOtpError('');
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('An error occurred. Please try again.');
    }
  };

  // Password validation checks
  const passwordValidations = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    specialChar: /[^A-Za-z0-9]/.test(newPassword)
  };

  useEffect(() => {
    fetch('http://localhost/elder-dB/user-process/fetch_user_profile.php', {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        console.log('User  data:', data);
        if (data && data.username) {
          setUser (data);
          setInitialUser (data); // Set initial user state
        }
      })
      .catch(error => console.error("Fetch error:", error));
  }, []);

  useEffect(() => {
    // Validate password match whenever either field changes
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  }, [newPassword, confirmNewPassword]);

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  // Check if there are changes made
  useEffect(() => {
    if (user && initialUser ) {
      const isChanged = 
        user.username !== initialUser .username ||
        user.email !== initialUser .email ||
        currentPassword ||
        newPassword ||
        confirmNewPassword ||
        selectedImage; // Add any other fields you want to track
      setHasChanges(isChanged);
    }
  }, [user, initialUser , currentPassword, newPassword, confirmNewPassword, selectedImage]);

  const validatePasswords = () => {
    // Frontend password validation
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters.');
      return false;
    }

    if (newPassword && !passwordValidations.lowercase) {
      setNewPasswordError('Password must contain at least one lowercase letter.');
      return false;
    }

    if (newPassword && !passwordValidations.uppercase) {
      setNewPasswordError('Password must contain at least one uppercase letter.');
      return false;
    }

    if (newPassword && !passwordValidations.specialChar) {
      setNewPasswordError('Password must contain at least one special character.');
      return false;
    }

    // Check if new password matches current password
    if (newPassword === currentPassword) {
      setNewPasswordError('New password cannot be the same as the current password.');
      return false;
    }

    // Check if passwords match and are not empty
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      if (!currentPassword) setCurrentPasswordError('Current password is required.');
      if (!newPassword) setNewPasswordError('New password is required.');
      if (!confirmNewPassword) setConfirmPasswordError('Please confirm your new password.');
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return false;
    }

    return true; // All validations passed
  };

const handleSave = async (e) => {
  e.preventDefault();
  setCurrentPasswordError('');
  setNewPasswordError('');
  setConfirmPasswordError('');

  // Validate username and email
  const isUsernameValid = validateUsername(user.username);
  const isEmailValid = validateEmail(user.email);
  
  if (!isUsernameValid || !isEmailValid) {
    return;
  }

  // Only validate passwords if they have been modified
  if (currentPassword || newPassword || confirmNewPassword) {
    // Frontend password validation
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword && !passwordValidations.lowercase) {
      setNewPasswordError('Password must contain at least one lowercase letter.');
      return;
    }

    if (newPassword && !passwordValidations.uppercase) {
      setNewPasswordError('Password must contain at least one uppercase letter.');
      return;
    }

    if (newPassword && !passwordValidations.specialChar) {
      setNewPasswordError('Password must contain at least one special character.');
      return;
    }

    // Check if new password matches current password
    if (newPassword === currentPassword) {
      setNewPasswordError('New password cannot be the same as the current password.');
      return;
    }

    // Check if passwords match and are not empty
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      if (!currentPassword) setCurrentPasswordError('Current password is required.');
      if (!newPassword) setNewPasswordError('New password is required.');
      if (!confirmNewPassword) setConfirmPasswordError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
  }

  const formData = new FormData();
  formData.append('username', user.username);
  formData.append('email', user.email);
  formData.append('currentPassword', currentPassword);
  formData.append('newPassword', newPassword);

  if (selectedImage) {
    const ext = selectedImage.name.split('.').pop();
    const randomName = Math.random().toString(36).substring(2, 8);
    const newFilename = `${randomName}.${ext}`;
    formData.append('profile', selectedImage, newFilename);
  }

  try {
    const response = await fetch('http://localhost/elder-dB/user-process/update_user_info.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      setShowSuccessModal(true);
    } else {
      // Handle backend errors
      if (result.message === 'Current password is incorrect.') {
        setCurrentPasswordError(result.message);
      } else {
        console.error('Backend error:', result.message);
      }
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};


  if (!user) return <div className="text-center mt-10">Loading...</div>;

  const profileImage = previewImage || (user.profile && user.profile.trim() !== ''
    ? `http://localhost/elder-dB/user-profile/${user.profile}`
    : null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPG and PNG formats are allowed.');
      setSelectedImage(null);
      setImageName('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size should be 5MB or less.');
      setSelectedImage(null);
      setImageName('');
      return;
    }

    setSelectedImage(file);
    setImageError('');
    setImageName(file.name);
    setPreviewImage(URL.createObjectURL(file));
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center px-4 py-10">
      {/* Success Modal (profile update) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 animate-checkmark" />
            </div>
            <h2 className="text-2xl font-bold mt-4">Profile Updated Successfully!</h2>
            <p className="mt-2">Your changes have been saved.</p>
          </div>
        </div>
      )}
      
      {/* Sending OTP Modal */}
      {showSendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Verify Email</h2>
              <button 
                onClick={() => setShowOtpModal(false)}
                className="text-2xl leading-none p-1 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <hr className="mb-4" />

            {/* Modal Content */}
            <div className="flex-1">
              <p className="mb-6 text-center">Enter the 6-digit OTP sent to {user.email}</p>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      // Handle backspace
                      if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        document.getElementById(`otp-${index - 1}`).focus();
                      }
                      // Handle arrow keys
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
              
              {otpError && <p className="text-red-500 text-sm mb-4 text-center">{otpError}</p>}
              
              <div className="flex justify-between items-center px-2">
                <span className="text-sm text-gray-500">
                  Expires in: {formatTime(otpTimer)}
                </span>
                <button
                  onClick={handleResendOtp}
                  disabled={!canResendOtp}
                  className={`text-sm ${canResendOtp ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Resend OTP
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifySubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all text-sm"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resend OTP Modals (should appear above OTP modal) */}
      {showSendingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
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

      {showSentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mt-4">Email Sent Successfully!</h2>
            <p className="mt-2">Please check your email for the OTP code.</p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <div className="flex justify-center">
              <XMarkIcon className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mt-4">An Error Occurred</h2>
            <p className="mt-2">Please try again.</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-7">
            {profileImage ? (
              <img
                src={profileImage}
                alt="User  "
                className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500 text-white text-2xl font-bold border-2 border-green-500">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="relative">
              <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
                Upload Picture
                <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleImageChange} />
              </label>
              {imageName && (
                <div className="text-sm mt-1 truncate max-w-[200px]">{imageName}</div>
              )}
              {imageError && (
                <div className="text-sm text-red-600 mt-1">{imageError}</div>
              )}
            </div>
          </div>
          <p>
            Member Since: <strong>{user.member_since}</strong>
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h1 className="text-base font-semibold">Username</h1>
              <input
                type="text"
                value={user.username}
                onChange={(e) => {
                  setUser  ({ ...user, username: e.target.value });
                  validateUsername(e.target.value);
                }}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              />
              {usernameError && <p className="text-sm text-red-600 mt-1">{usernameError}</p>}
            </div>
            {/* Email verification button in your form */}
            <div className="relative">
              <h1 className="text-base font-semibold">Email</h1>
              <div className="flex items-center">
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => {
                    setUser  ({ ...user, email: e.target.value });
                    validateEmail(e.target.value);
                  }}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  disabled={user.is_email_verified === 'yes' || user.email !== initialUser.email}
                  className={`ml-2 px-4 py-2 rounded transition-colors ${
                    user.is_email_verified === 'yes'
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : user.email !== initialUser.email
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
                  style={{ minWidth: '80px' }}
                >
                  {user.is_email_verified === 'yes' ? (
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
              {user.email !== initialUser.email && (
                <p className="text-sm text-gray-500 mt-1">
                  Please save your email changes before verifying.
                </p>
              )}
              {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <h1 className="text-base font-semibold">Current Password</h1>
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 pr-10"
              />
              {currentPasswordError && <p className="text-sm text-red-600">{currentPasswordError}</p>}
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-[42px] text-gray-500"
              >
                {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              <h1 className="text-base font-semibold">New Password</h1>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[42px] text-gray-500"
              >
                {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              {newPasswordError && <p className="text-sm text-red-600">{newPasswordError}</p>}
              
              {/* Password Validation Checklist */}
              {newPassword && (
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
              <h1 className="text-base font-semibold">Confirm New Password</h1>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[42px] text-gray-500"
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              {confirmPasswordError && <p className="text-sm text-red-600">{confirmPasswordError}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => navigate('/user/user-dashboard')} // Replace with actual route
            >
              Close
            </button>

            <button 
              type="submit" 
              className={`bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-white ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`} 
              disabled={!hasChanges} // Disable button if no changes
            >
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
