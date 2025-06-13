import React from 'react';
import brgyBanner from '../../assets/about/brgy.png';
import { Link } from "react-router-dom";
import ReturnIcon from "../../assets/icons/back.svg";

const Brgy = () => {
  

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
      <section className="w-full h-screen relative pt-24 md:pt-28">
        <img
          src={brgyBanner}
          alt="Scenic Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* City Profile Content Centered */}
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">SABANG DASMARIÑAS CAVITE</h2>
            <p className="text-base md:text-2xl leading-relaxed text-center">
              Sabang is a barangay in the city of Dasmariñas, in the province of Cavite.
              Its population as determined by the 2020 Census was 17,329. This represented
              2.46% of the total population of Dasmariñas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Brgy;
