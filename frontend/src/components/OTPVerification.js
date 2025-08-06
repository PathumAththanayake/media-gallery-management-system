import React, { useState, useEffect } from 'react';
import { FiMail, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';

const OTPVerification = ({ email, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Start countdown when component mounts
  useEffect(() => {
    setCountdown(60); // 60 seconds countdown
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleSubmit(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        email,
        otp: otpValue
      });

      setSuccess('Email verified successfully!');
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      
      // Call success callback
      if (onVerificationSuccess) {
        onVerificationSuccess(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-otp`, {
        email
      });

      setSuccess('Verification code sent successfully!');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setCanResend(false);
      
      // Focus on first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FiMail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900">{email}</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <FiX className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <FiCheck className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter Verification Code
              </label>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <FiRefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Sending...
                </div>
              ) : canResend ? (
                'Resend Code'
              ) : (
                `Resend in ${countdown}s`
              )}
            </button>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="mt-6 text-center">
              <button
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification; 