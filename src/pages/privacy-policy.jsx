import React, { useState, useRef, useEffect } from 'react';

const PrivacyPolicy = ({ show, onClose, onAgree }) => {
  if (!show) return null;
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const policyRef = useRef(null);

  const handleScroll = () => {
    const el = policyRef.current;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setScrolledToBottom(true);
    }
  };

  useEffect(() => {
  if (show) {
    console.log('Privacy Policy modal opened');
  }
}, [show]);

  return (
    <div className="max-w-3xl mx-auto rounded-lg overflow-hidden flex flex-col h-[90vh]">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-5">
        <h2 className="text-2xl font-bold text-center">Privacy Notice</h2>
      </div>

      {/* Body */}
      <div
        ref={policyRef}
        onScroll={handleScroll}
        className="overflow-y-auto px-6 py-6 flex-1 leading-relaxed text-base text-gray-800 space-y-4"
      >
        <h3 className="text-lg font-bold uppercase">Introduction</h3>
        <p>
          Welcome to Barangay Sabang's privacy notice. We respect your privacy and are committed to protecting your personal data. This notice explains how we handle your data when you use our services or submit personal information through our forms.
        </p>

        <h3 className="text-lg font-bold">1. Important Information and Who We Are</h3>
        <p>
          This privacy notice is issued on behalf of Barangay Sabang. If you have any questions about this notice or our privacy practices, please contact our office directly.
        </p>

        <h3 className="text-lg font-bold">2. The Data We Collect About You</h3>
        <p>
          We may collect, use, store, and transfer different kinds of personal data such as your name, address, contact number, email, and any information you voluntarily provide for official barangay transactions.
        </p>

        <h3 className="text-lg font-bold">3. How Your Personal Data Is Used</h3>
        <p>
          Your personal data will be used only for legitimate purposes including communication, documentation, service eligibility verification, and reporting. We do not use your data for marketing purposes or share it with third parties without your consent.
        </p>

        <h3 className="text-lg font-bold">4. Data Security</h3>
        <p>
          We implement appropriate security measures to prevent unauthorized access, loss, or misuse of your personal data. Only authorized personnel are granted access under strict confidentiality obligations.
        </p>

        <h3 className="text-lg font-bold">5. Your Rights</h3>
        <p>
          Under the Data Privacy Act of 2012, you have the right to access, correct, and object to the processing of your personal data. You may withdraw your consent anytime by contacting our office.
        </p>

        <p className="font-semibold">
          By continuing, you acknowledge that you have read and understood this notice.
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-right">
        <button
  disabled={!scrolledToBottom}
  onClick={() => {
    console.log('Privacy Policy modal accepted');
    onAgree(); // trigger parent callback
  }}
  className={`w-full py-3 px-4 rounded-md font-semibold text-white text-lg transition ${
    scrolledToBottom ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
  }`}
>
  Accept & Continue
</button>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
