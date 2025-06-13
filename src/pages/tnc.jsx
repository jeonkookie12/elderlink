import React, { useState, useRef, useEffect } from 'react';

export default function TermsAndConditions({ show, onClose, onAgree }) {
   if (!show) return null;
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const termsRef = useRef(null);

  const handleScroll = () => {
    const el = termsRef.current;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setScrolledToBottom(true);
    }
  };

  useEffect(() => {
  if (show) {
    console.log('T&C modal opened');
  }
}, [show]);

  return (
    <div className="max-w-3xl mx-auto rounded-lg overflow-hidden flex flex-col h-[90vh]">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-5">
        <h2 className="text-2xl font-bold text-center">ElderLink Terms and Conditions</h2>
      </div>

      {/* Body */}
      <div
        ref={termsRef}
        onScroll={handleScroll}
        className="overflow-y-auto px-6 py-6 flex-1 leading-relaxed text-base text-gray-800 space-y-4"
      >
        <p>
          Welcome to ElderLink. By accessing or using our services, you agree to be bound by the following terms and conditions. Please read them carefully:
        </p>

        <h1 className="text-lg font-bold">1. Service Overview</h1>
        <p>
          ElderLink is a platform dedicated to providing support, information, and community services for senior citizens and their caregivers. We aim to foster a safe and helpful environment for all users.
        </p>

        <h1 className="text-lg font-bold">2. Eligibility</h1>
        <p>
          Our services are intended primarily for individuals aged 60 and above, their caregivers, or authorized family members. By registering, you confirm that you meet these criteria.
        </p>

        <h1 className="text-lg font-bold">3. Account Responsibilities</h1>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your login details and to notify us immediately of any unauthorized use.
        </p>

        <h1 className="text-lg font-bold">4. Acceptable Use</h1>
        <p>
          You agree to use ElderLink for lawful and respectful purposes only. Harassment, discrimination, misinformation, or abusive behavior will result in account suspension or termination.
        </p>

        <h1 className="text-lg font-bold">5. Health and Wellness Information</h1>
        <p>
          ElderLink provides information for educational and general support purposes. It does not replace professional medical advice. Always consult a qualified health provider for personal medical decisions.
        </p>

        <h1 className="text-lg font-bold">6. Privacy and Data Collection</h1>
        <p>
          We collect certain information to improve our services. Your data will be handled according to our Privacy Policy. We do not sell or share your information without your consent.
        </p>

        <h1 className="text-lg font-bold">7. Third-Party Services</h1>
        <p>
          ElderLink may contain links to third-party websites or services. We are not responsible for the content or practices of those services.
        </p>

        <h1 className="text-lg font-bold">8. Service Changes</h1>
        <p>
          We reserve the right to modify or discontinue any part of our services at any time without prior notice. We will strive to notify users of significant changes.
        </p>

        <h1 className="text-lg font-bold">9. Limitation of Liability</h1>
        <p>
          ElderLink is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Use of the service is at your own risk.
        </p>

        <h1 className="text-lg font-bold">10. Termination</h1>
        <p>
          We may suspend or terminate your access to ElderLink at any time, especially if you violate these terms. You may also delete your account at your discretion.
        </p>

        <h1 className="text-lg font-bold">11. Agreement to Terms</h1>
        <p className="font-semibold">
          By continuing, you acknowledge that you have read, understood, and agreed to all the terms and conditions above.
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-right">
        <button
  disabled={!scrolledToBottom}
  onClick={() => {
    console.log('T&C modal accepted');
    onAgree(); // trigger parent callback
  }}
  className={`w-full py-3 px-4 rounded-md font-semibold text-white text-lg transition  ${
    scrolledToBottom ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
  }`}
>
  Accept & Continue
</button>
      </div>
    </div>
  );
}
