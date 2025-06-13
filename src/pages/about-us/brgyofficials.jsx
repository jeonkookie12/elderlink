import React from 'react';
import brgyBanner from '../../assets/about/brgy.png';
import brgyOfficials from '../../assets/about/officials.jpg';
import { Link } from "react-router-dom";
import ReturnIcon from "../../assets/icons/back.svg";

const BrgyOfficials = () => {


    return (
      <div className="min-h-screen bg-cover bg-center bg-green-900 relative" style={{ backgroundImage: "url('/images/bgimage.png')" }}>
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
        {/* Banner Section */}
        <section className="w-full h-screen pt-20 relative">
          <img
            src={brgyBanner}
            alt="Scenic Banner"
            className="w-full h-full object-cover opacity-40 absolute top-0 left-0 z-0"
          />
  
          <div className="relative z-10 flex items-center justify-center h-full px-6">
            <div className="bg-white shadow-2xl rounded-lg p-6 md:p-10 max-w-5xl w-full">
              <img
                src={brgyOfficials}
                alt="Barangay Sabang Officials"
                className="w-full h-auto rounded object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default BrgyOfficials;
  