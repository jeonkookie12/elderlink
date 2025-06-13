import React from 'react';
import logo from "../assets/logo.png";


export default function Footer() {
  return (
    <footer className="bg-white text-center py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between mb-8">
        <div className="flex items-center mb-4 lg:mb-0">
          <img src={logo} alt="Barangay Logo" className="w-16 lg:w-20 mr-4" />
          <div className="text-green-900 font-bold text-left text-sm lg:text-base">
            BARANGAY <br /> SABANG DASMARIÑAS <br /> CAVITE
          </div>
        </div>
        <div className="text-green-900 text-left space-y-4 text-sm lg:text-base">
          <div>
            <p className="font-semibold">BARANGAY FACEBOOK PAGE</p>
            <a href="https://www.facebook.com/BarangaySabangDasma" className="hover:underline ml-4 block">Barangay Sabang City of Dasmariñas, Cavite</a>
          </div>
          <div>
            <p className="font-semibold">SANGGUNIANG KABATAAN FACEBOOK PAGE</p>
            <a href="https://www.facebook.com/SKSabangDasma" className="hover:underline ml-4 block">Sangguniang Kabataan - Barangay Sabang</a>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600">© 2024 All Rights Reserved | Terms of Use and Privacy Policy</p>
    </footer>
  );
}
