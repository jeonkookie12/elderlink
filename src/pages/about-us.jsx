import React, { useState } from "react";
import bannerImage from "../assets/senior-bg.jpg";
import sheranImage from "../assets/about/sheran.png";
import jianImage from "../assets/about/jian.png";
import jasminImage from "../assets/about/jasmin.jpg";
import shaiImage from "../assets/about/shai.png";
import shaneImage from "../assets/about/shane.jpg";
import { Link } from "react-router-dom";
import ReturnIcon from "../assets/icons/back.svg";

const AboutUs = () => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false); // New state for fade-out effect

  const closeModal = () => {
    setFadeOut(true); // Trigger fade-out effect
    setTimeout(() => {
      setShowMoreInfo(false); // Close modal after animation
      setFadeOut(false); // Reset fade-out state
    }, 300); // Match the duration of the fade-out animation
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#08732B]">
      {/* About Us Banner Section */}
      <div className="absolute top-35 left-4 md:left-20 z-20">
        <Link
          to="/user/user-dashboard"
          className="group flex items-center space-x-2 transition-transform duration-300 transform hover:-translate-y-1 hover:drop-shadow-md"
        >
        <img
          src={ReturnIcon}
          alt="Home"
          className="w-6 h-6 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="text-sm md:text-xl font-medium text-white">
          Return
        </span>
       </Link>
      </div>
      <section className="relative h-screen mt-0">
        <img
          src={bannerImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative flex flex-col justify-center items-center text-white text-center px-4 h-full">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-3xl">
            At ElderLink, we understand the importance of providing high-quality care and support to seniors and their families. Our senior management system is designed to help elders who are struggling to apply for Senior IDs and Pensions, ensuring they receive the benefits they deserve.
          </p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="bg-white py-50 x-4 text-center">
        <div className="flex flex-wrap justify-center gap-8 max-w-8xl mx-auto">
          <div className="bg-gray-100 text-black p-10 shadow-lg w-full sm:w-2/5 rounded">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-lg leading-relaxed">
              Our mission is to empower elders to live independently and with dignity, by providing a comprehensive and user-friendly platform that simplifies the application process for senior IDs and pensions.
            </p>
          </div>
          <div className="bg-gray-100 text-black p-10 shadow-lg w-full sm:w-2/5 rounded">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg leading-relaxed">
              Our vision is to create a society where seniors are valued, respected, and supported, and where they have access to the resources and benefits they need to thrive.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="text-center py-12 text-white px-4 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <img src={sheranImage} alt="Team Member 1" className="w-72 h-72 object-cover border" />
          <img src={jianImage} alt="Team Member 2" className="w-72 h-72 object-cover border" />
          <img src={jasminImage} alt="Team Member 3" className="w-72 h-72 object-cover border" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex flex-wrap gap-6">
            <img src={shaiImage} alt="Team Member 4" className="w-72 h-72 object-cover border" />
            <img src={shaneImage} alt="Team Member 5" className="w-72 h-72 object-cover border" />
          </div>
          {/* Our Team Section */}
          <div className="flex flex-col items-start justify-center max-w-xs mt-4 lg:ml-8">
            <h2 className="text-2xl font-bold italic">Our Team</h2>
            <p className="mt-2">Here are the creators of this website</p>
            <button
              onClick={() => setShowMoreInfo(true)}
              className="mt-4 bg-white text-green-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              View More
            </button>
          </div>
        </div>

        {/* Modal for Team Info */}
        {showMoreInfo && (
          <div className="fixed inset-0 flex justify-center items-center z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">

            <div
              className={`bg-white text-[#08732B] px-6 py-8 max-w-4xl mx-auto rounded shadow-lg transform opacity-0 animate-fadeIn relative ${
                fadeOut ? "fade-out" : ""
              }`}
            >
              <button
                onClick={closeModal} // Close with fade-out effect
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700"
              >
                X
              </button>
              <h3 className="text-2xl font-bold mb-4">Our Team</h3>
              <p className="text-lg text-gray-800">
                At Cavite State University Imus Campus, a group of dedicated students has come together to create ElderLink, a project aimed at making government services more accessible to senior citizens. Recognizing the challenges faced by the elderly in navigating complex processes for pensions and identification, these students developed ElderLink as a streamlined, user-friendly platform. With ElderLink, seniors can more easily access their pension details and ID services, reducing the stress and hassle often associated with these essential tasks.
              </p>
              <p className="mt-4 text-green-800 text-lg">
                This initiative not only highlights the technical skills of Cavite State University students but also their commitment to community service and social responsibility. ElderLink is designed to be a bridge, connecting the senior community to the services they need, fostering independence, and enhancing quality of life.
              </p>
            </div>
          </div>
        )}
      </section>


    </div>
  );
};

export default AboutUs;
