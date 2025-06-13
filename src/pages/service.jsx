import React from "react";
import { Link } from "react-router-dom";
import HomeHealthcareImg from "../assets/services/services_img/teleservice.jpg";
import TelehealthImg from "../assets/services/services_img/senior-bg.jpg";
import SocialImg from "../assets/services/services_img/community.jpg";
import OutreachImg from "../assets/services/services_img/programs.jpg";
import BannerImg from "../assets/services/services.svg";
import ReturnIcon from "../assets/icons/back.svg";


// Local SVG icons
import SafetyIcon from "../assets/services/safety.svg";
import HealthcareIcon from "../assets/services/healthcare_services.svg";
import TelehealthIcon from "../assets/services/telehealth.svg";
import SocialIcon from "../assets/services/socials.svg";
import ActivitiesIcon from "../assets/services/activities.svg";
import OutreachIcon from "../assets/services/programs.svg";
import CommunityIcon from "../assets/services/community.svg";

const Service = () => {
  return (
    <div className="bg-[#08732B] text-white font-sans">
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
      <div className="max-w-7xl mx-auto px-6 pt-[calc(200px+2rem)] pb-8 space-y-24">

        {/* Banner Section */}
        <section className="flex flex-col lg:flex-row items-center gap-10">
          <img
            src={BannerImg}
            alt="Senior Program Banner"
            className="w-full max-w-md"
          />
          <p className="text-2xl leading-relaxed text-white/90 text-center max-w-xl">
            A comprehensive program designed to empower older adults and their caregivers by providing access to vital resources, information, and community support.
          </p>
          
        </section>

        <div className="border-t border-white/30"></div>

        {/* Programs Intro */}
        <section className="text-center space-y-2 px-4">
          <h2 className="text-4xl font-bold tracking-wider">PROGRAMS</h2>
          <p className="text-xl text-white/80">Explore the services offered by ElderLink</p>
        </section>

        {/* I. Home Healthcare */}
        <section className="bg-white bg-opacity-90 rounded-xl p-10 shadow-md space-y-10 text-black">
          <div className="flex items-center gap-3 mb-4">
           <img src={HealthcareIcon} alt="Healthcare Icon" className="w-8 h-8" />
            <h3 className="text-3xl font-bold">Healthcare Services</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center text-center">

             <div >
              <img
                src={SafetyIcon}
                alt="Telehealth Icon"
                className="w-65 h-45 mx-auto mb-4"
              />
              <h4 className="text-xl font-semibold mb-3 text-left lg:text-center">I. Home Healthcare</h4>
              <p className="text-xl px-6">
                 Medical care provided at home, including nursing, physical therapy, and medication management.
              </p>
            </div>
            <img
              src={HomeHealthcareImg}
              alt="Home Healthcare"
              className="w-full max-w-lg rounded-lg shadow-lg mx-auto"
            />
          </div>
        </section>

        {/* II. Telehealth */}
       <section className="bg-white bg-opacity-90 rounded-xl p-10 shadow-md space-y-10 text-black">
          <div className="grid lg:grid-cols-2 gap-10 items-center text-center">
            <img
              src={TelehealthImg}
              alt="Telehealth"
              className="w-full max-w-lg rounded-lg shadow-lg mx-auto order-2 lg:order-1"
            />
            <div className="order-1 lg:order-2">
              <img
                src={TelehealthIcon}
                alt="Telehealth Icon"
                className="w-65 h-45 mx-auto mb-4"
              />
              <h4 className="text-xl font-semibold mb-3 text-left lg:text-center">II. TELEHEALTH</h4>
              <p className="text-xl px-6">
                Remote consultations with healthcare providers via phone or video calls.
              </p>
            </div>
          </div>
        </section>

        {/* III. Social and Recreational Services */}
        <section className="bg-white bg-opacity-90 rounded-xl p-10 shadow-md space-y-10 text-black">
          <div className="flex items-center gap-3 mb-4">
            <img src={SocialIcon} alt="Social Icon" className="w-8 h-8" />
            <h4 className="text-2xl font-bold">Social and Recreational Services</h4>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center text-center">
            <img
              src={SocialImg}
              alt="Social Activities"
              className="w-full max-w-lg rounded-lg shadow-lg mx-auto"
            />

            <div className="order-1 lg:order-2">
              <img
                src={ActivitiesIcon}
                alt="Telehealth Icon"
                className="w-65 h-45 mx-auto mb-4"
              />
              <p className="text-xl px-6">
                Annual general assemblies foster wellness, accessibility, and stronger social connections among seniors.
              </p>
                <p className="text-xl px-6 mt-4 mb-8">
                Annual general assemblies foster wellness, accessibility, and stronger social connections among seniors.
                 Annual general assemblies foster wellness, accessibility, and stronger social connections among seniors.
              </p>
            </div>
          </div>
        </section>

        {/* IV. Outreach Program */}
        <section className="bg-white bg-opacity-90 rounded-xl p-10 shadow-md space-y-10 text-black">
          <div className="flex items-center gap-3 mb-4">
            <img src={OutreachIcon} alt="Outreach Icon" className="w-8 h-8" />
            <h4 className="text-2xl font-semibold">IV. Outreach Program</h4>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center text-center">
            <div>
              <img
                src={CommunityIcon}
                alt="Telehealth Icon"
                className="w-65 h-45 mx-auto mb-4"
              />
              <p className="text-xl px-6">
                Connecting isolated seniors with community volunteers for companionship and essential service support.
              </p>
            </div>
            <img
              src={OutreachImg}
              alt="Outreach Program"
              className="w-full max-w-lg rounded-lg shadow-lg mx-auto"
            />
          </div>
        </section>

        <div className="border-t border-white/30"></div>

      </div>
        {/* Emergency Contact Section */}
   <section className="bg-[#095321] mt-20 p-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.58848970184843!2d120.92464799955818!3d14.345330096011665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d4ec07eb352b%3A0x77762febeca5d50f!2sDon%20Placido%20Campos%20Avenue%2C%20Dasmari%C3%B1as%2C%20Cavite!5e0!3m2!1sen!2sph!4v1737978219994!5m2!1sen!2sph"
            width="400"
            height="300"
            className="border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="text-center text-xl">
            <p>Don Placido Campos Avenue, Brgy. Sabang Dasmariñas, Cavite</p>
            <h3 className="text-2xl font-semibold mt-4">IN CASE OF EMERGENCY HOTLINE</h3>
            <p className="mt-4">Barangay Hall Sabang Hotline:<br /> (046) 432-0454</p>
            <p className="mt-4">Tanod Hotline:<br /> 0976-510-4322</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Service;