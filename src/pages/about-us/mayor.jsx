import React from 'react';
import logo from '../../assets/logo.png';
import mayora from '../../assets/about/mayora.png';
import brgyBanner from '../../assets/about/brgy.png';
import { Link } from "react-router-dom";
import ReturnIcon from "../../assets/icons/back.svg";

const Mayor = () => {
  return (
    <div className="min-h-screen bg-green-900 text-white relative overflow-hidden">
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
      <section className="relative w-full h-[130vh] sm:h-[150vh] md:h-[160vh] lg:h-screen">
        <img
          src={brgyBanner}
          alt="Scenic Banner"
          className="w-full h-full object-cover opacity-40"
        />

        {/* Mayor Profile Container */}
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center px-4 py-12 md:py-20 z-10 w-full">
  <div className="flex flex-col lg:flex-row bg-white p-6 lg:p-8 rounded-lg shadow-lg max-w-5xl w-full relative z-20 gap-8">
    
    {/* Image + Watermark */}
    <div className="relative w-full flex justify-center items-center mb-6 lg:mb-0 lg:w-1/3">
      <img
        src={logo}
        alt="Watermark"
        className="absolute 
          w-[250px] sm:w-[250px] md:w-[280px] lg:w-[320px] xl:w-[350px]
          opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"
      />
      <img
        src={mayora}
        alt="Mayor Jenny A. Barzaga"
        className="w-[260px] sm:w-[300px] md:w-[340px] lg:w-[350px] xl:w-[420px] h-auto rounded-lg object-cover z-20"
      />
    </div>

    {/* Text Section */}
    <div className="lg:w-2/3">
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6">
        MAYOR JENNY A. BARZAGA
      </h1>
      <p className="text-gray-700 text-base mb-4">
        Mayor Jennifer Narvaez Austria-Barzaga of Dasmariñas City, the Philippines, is the first woman leader in the area. Mayor Jenny, who was once a registered nurse, has great compassion and care for the struggle of her people. Becoming the first person in the area, Mayor Jenny puts great efforts into livelihood, environment, children protection, as well as clean governance.
      </p>
      <p className="text-gray-700 text-base">
        As the wife of the late Mayor Elpidio Barzaga Jr., who also served as a congressman of Dasmariñas, Mayor Jenny established the <strong>Kababaihan ng Dasmariñas sa Bagong Milenyo (KDBM)</strong>, an all-women volunteer organization dedicated to community service. This initiative was a significant step towards empowering women by providing them with livelihood programs, which, as noted by media, greatly enhanced the financial independence of its members.
      </p>
    </div>
  </div>
</div>

      </section>
    </div>
  );
};

export default Mayor;
