import React from 'react';
import bgImg from "../../assets/about/brgy.png";
import { Link } from "react-router-dom";
import ReturnIcon from "../../assets/icons/back.svg";

const CityProf = () => {
  return (
    <div className="min-h-screen bg-green-800 relative overflow-hidden">
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
      {/* Banner Image with overlay */}
      <section className="w-full h-screen relative">
        <img
          src={bgImg}
          alt="Barangay Image"
          className="w-full h-full object-cover opacity-40"
        />

        {/* City Profile Content Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-6xl z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">DASMARIÑAS CAVITE</h2>
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-center">
              The City of Dasmariñas is known as the “University Capital of Cavite” and is classified as one of the most competitive cities in the country today.
              It has a total land area of 82.34 square kilometers and is composed of 75 barangays.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-center mt-4">
              The City of Dasmariñas is also known as the Industrial Giant of CALABARZON because it is one of Cavite’s most rapidly growing local government units.
              The city has a wide variety of commercial establishments, including retail malls, fast food chains, groceries, convenience stores, restaurants, etc.
              It is famous for its Paru-Paro Festival aptly so as the beautiful and colorful “Paru-Paro” (butterfly) is a universal symbol for change, transformation, and festivity in this city.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityProf;
