import React, { useEffect, useState } from "react";
import Senior from "../../assets/senior-bg.jpg";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import IdIcon from "../../assets/user-icons/id.svg";
import EventsIcon from "../../assets/user-icons/events.svg";
import AnnouncementsIcon from "../../assets/user-icons/announcements.svg";
import ApplicationsIcon from "../../assets/user-icons/applications.svg";
import ProfileIcon from "../../assets/user-icons/profile.svg";
import { useAuth } from "../../context/AuthContext";
import AnnouncementIcon from "../../assets/announcements/announcement-user.svg";
import importIcon from "../../assets/announcements/user-notify.svg"; 
import CheckIcon from "../../assets/announcements/check.svg";


const UserDashboard = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [notification, setNotification] = useState(null);
  const [announcements, setAnnouncements] = useState([]);


const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost/elder-dB/user-process/get_announcements.php")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.slice(0, 4)))
      .catch((err) => console.error("Failed to fetch latest announcements:", err));
  }, []);

const confirmSubmit = (e) => {
  e.preventDefault();
  setFormTouched(true);

  if (message.trim() && rating > 0) {
    setShowConfirmModal(true);
  }
};
const handleSubmit = async () => {
  const feedbackData = {
    user_id: user?.id || null,
    name,
    email,
    message,
    rating,
  };

  try {
    const res = await fetch('http://localhost/elder-dB/submit_feedback.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(feedbackData),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("Non-JSON response:", text);
     setNotification("Server error: Please contact support.");
      return;
    }

    if (data.success) {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setName('');
      setEmail('');
      setMessage('');
      setRating(0);
      setFormTouched(false); 

    } else {
      setNotification(data.message || 'Failed to submit feedback.');
    }
  } catch (err) {
    console.error('Submit error:', err);
   setNotification('Network error.');
  }
};


  return (
    <div className="min-h-screen bg-green-900 text-white">

      {/* Top Section */}
      <section className="relative w-full h-[130vh] sm:h-[150vh] md:h-[120vh] lg:h-screen mt-[100px] md:mt-[120px] lg:mt-[60px] animate-fade-in-up">
        {/* Background Image */}
        <img
          src={Senior}
          alt="Senior Background"
          className="w-full h-full object-cover opacity-30"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          
          {/* Logo */}
          <img
            src={Logo}
            alt="ElderLink Logo"
            className="w-36 h-36 md:w-48 md:h-48 lg:w-52 lg:h-52 mb-6 md:mb-10 transition-transform duration-500"
          />

          {/* Welcome Message */}
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-normal uppercase">
            Welcome, <span className="font-bold">{user.username.toUpperCase()}</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl mt-4 font-normal">What would you like to do?</p>

          {/* Icons */}
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-35 mt-14 md:mt-20 px-4 md:px-12 max-w-7xl">
            {[
              { to: "/DigitalID", icon: IdIcon, label: "Identification Card" },
              { to: "/EventsAndActivities", icon: EventsIcon, label: "Events & Activities" },
              { to: "/Announcement", icon: AnnouncementsIcon, label: "Announcements" },
              { to: "/Application", icon: ApplicationsIcon, label: "Applications" },
              { to: "/UserProfile", icon: ProfileIcon, label: "Profile" },
            ].map(({ to, icon, label }) => (
              <Link key={label} to={to} className="group flex flex-col items-center transition-all">
                <img
                  src={icon}
                  alt={label}
                  className="w-24 h-24 md:w-28 md:h-28 lg:w-28 lg:h-28 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:animate-bounce-soft group-hover:drop-shadow-glow"
                />
                <span className="text-sm md:text-base font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white text-green-900 px-6 lg:px-20 py-20">
        <div className="text-center">
          <h2 className="text-2xl lg:text-4xl font-bold">Your Direct Connection to Senior Benefits & Services</h2>
          <p className="text-base lg:text-lg mt-6 leading-relaxed text-gray-800">
            We offer a simple way for seniors to access important services, including applying for senior ID cards and pensions. We provide clear guidance and easy steps, ensuring you can quickly connect to the benefits you need without any hassle. Whether you're looking to apply, renew, or get information, ElderLink is your trusted, reliable link to everything you need.
          </p>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-bold mb-6">Population of Seniors</h3>
            <div className="grid grid-cols-2 gap-6">
              {[{ age: "60-70 years old", count: 30 }, { age: "70-80 years old", count: 50 }, { age: "80-90 years old", count: 50 }, { age: "90-100 years old", count: 10 }].map(({ age, count }) => (
                <div key={age} className="bg-green-900 text-white p-4 lg:p-6 rounded-lg text-center">
                  <h4 className="text-xl lg:text-2xl font-bold">{count}</h4>
                  <p>{age}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-bold mb-6">Services</h3>
            <ul className="list-disc list-inside space-y-3 text-base lg:text-lg text-gray-800">
              <li>Senior ID Card Application & Renewal</li>
              <li>Pension Benefit Enrollment</li>
              <li>Eligibility Checker for Senior IDs & Pensions</li>
              <li>Document Assistance & Live Support</li>
              <li>Assistance with Lost or Replacement IDs</li>
            </ul>
          </div>
        </div>
      </section>

      
        
    <section className="bg-white text-green-900 min-h-screen px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-bold text-green-900">
            Latest Announcements
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-lg shadow-md bg-white flex flex-col overflow-hidden"
            >
              {/* Green Accent Bar */}
              <div className="bg-green-900 h-12 w-full" ><h3 className="text-xl text-white text-center py-2 font-semibold mb-1">{item.title}</h3></div>

              {/* Card Content */}
              <div className="flex flex-col items-center text-center p-6">
                {/* Icon */}
                <img
                  src={AnnouncementIcon}
                  alt="Announcement Icon"
                  className="w-16 h-16 mb-4"
                />

                {/* Title */}
                

                {/* Date */}
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                {/* Content Preview */}
                <p className="text-gray-700 mb-6 line-clamp-3">
                  {item.content.length > 200
                    ? item.content.slice(0, 200) + "..."
                    : item.content}
                </p>

                {/* Read More */}
                <Link to={`/Announcement/${item.id}`}>
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-all duration-200">
                    Read More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Emergency Contact */}
      <section className="bg-green-900 text-white py-16 px-6">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.58848970184843!2d120.92464799955818!3d14.345330096011665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d4ec07eb352b%3A0x77762febeca5d50f!2sDon%20Placido%20Campos%20Avenue%2C%20Dasmari%C3%B1as%2C%20Cavite!5e0!3m2!1sen!2sph!4v1737978219994!5m2!1sen!2sph"
            width="100%"
            height="300"
            allowFullScreen=""
            loading="lazy"
            className="border-0 max-w-md w-full"
          ></iframe>
          <div className="text-center max-w-md text-base lg:text-lg">
            <p>Don Placido Campos Avenue, Brgy. Sabang Dasmariñas, Cavite</p>
            <h3 className="text-lg lg:text-xl font-bold mt-6">IN CASE OF EMERGENCY HOTLINE</h3>
            <p className="mt-4">Barangay Hall Sabang Hotline: <br />(046) 432-0454</p>
            <p className="mt-2">Tanod Hotline: <br />0976-510-4322</p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
        <section className="py-20 px-4 lg:px-6">
      <form onSubmit={confirmSubmit}  className="max-w-3xl mx-auto bg-white text-green-900 p-6 lg:p-10 rounded-lg shadow-md">
        <p className="bg-green-800 text-white py-3 text-center rounded-t-lg font-semibold">FEEDBACK FORM</p>

        <label htmlFor="name" className="block mt-4 font-bold">Name (optional)</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Type here..." className="w-full border rounded p-2 mt-1" />

        <label htmlFor="email" className="block mt-4 font-bold">Email (optional)</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Type here..." className="w-full border rounded p-2 mt-1" />

        <label className="block mt-4 font-bold">Message <span className="text-red-500">*</span></label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type here..."
            className={`w-full border rounded p-2 mt-1 h-32 ${
              formTouched && !message.trim() ? "border-red-500" : ""
            }`}
          />
          {formTouched && !message.trim() && (
            <p className="text-sm text-red-500 mt-1">Message is required.</p>
          )}
       <label className="block mt-6 font-bold">Rate our service <span className="text-red-500">*</span></label>
            <div className="rating flex flex-row justify-start mt-2 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <React.Fragment key={star}>
                  <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    className="hidden peer"
                    onChange={() => setRating(star)}
                    checked={rating === star}
                  />
                  <label
                    htmlFor={`star${star}`}
                    className={`text-3xl cursor-pointer transition-transform transform hover:scale-110 ${
                      rating >= star ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </label>
                </React.Fragment>
              ))}
            </div>
            {formTouched && rating === 0 && (
              <p className="text-sm text-red-500 mt-1">Rating is required.</p>
            )}


        <button
          type="submit"
          disabled={formTouched && (!message.trim() || rating === 0)}
          className={`mt-6 px-6 py-2 rounded block mx-auto text-white ${
            formTouched && (!message.trim() || rating === 0)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-900 hover:bg-green-800"
          }`}
        >
          Submit
        </button>
      </form>
    </section>



        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-50">
            <div className="bg-white rounded-xl shadow-xl w-[465px] min-h-[200px] p-8 text-center animate-fadeIn">
              {/* Icon + Label side by side with bigger gap */}
              <div className="flex items-center justify-center gap-1 mb-2 mt-4">
                <img src={importIcon} alt="Prompt" className="w-12 h-12" />
                <h3 className="text-xl font-semibold text-green-900">
                  Confirm Feedback Submission
                </h3>
              </div>

              <p className="text-gray-800 text-lg mb-12">
                Are you sure you want to submit this feedback?
              </p>

              <div className="flex justify-center gap-5 mb-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition-colors text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    setIsSubmitting(true);
                    await new Promise((res) => setTimeout(res, 800));
                    await handleSubmit();
                    setIsSubmitting(false);
                    setShowSuccessModal(true);
                  }}
                  className="flex items-center justify-center gap-3 px-6 py-2 rounded bg-green-800 hover:bg-green-700 text-white font-semibold transition-colors text-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}


       {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-50">
            <div className="bg-white rounded-xl shadow-xl w-100 p-5 text-center animate-fadeIn">
              {/* Icon on top */}
              <div className="flex justify-center mb-2 ">
                <img
                  src={CheckIcon}
                  alt="Success"
                  className="w-18 h-16"
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Thank You!</h3>
              <p className="text-gray-600 mb-10">
                Your feedback has been submitted successfully.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-7 py-2 rounded bg-green-800 hover:bg-green-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {notification && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <span className="block sm:inline">{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
          )}
        {/* Processing Modal */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-xs backdrop-brightness-50">
            <div className="bg-white rounded-xl shadow-xl w-80 p-6 text-center animate-fadeIn">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 mb-4 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <h3 className="text-lg font-semibold text-gray-800">Processing...</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we submit your feedback.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default UserDashboard;
