import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import idCardIcon from "../../assets/digital_id/digital_id_header.svg";
import ReturnIcon from "../../assets/icons/back.svg";

function DigitalID() {
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount
    const timer = setTimeout(() => setFadeIn(true), 50);

    fetch("http://localhost/elder-dB/user-process/get_id_image.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.images)) {
          const urls = data.images.map(
            (filename) => `http://localhost/elder-dB/identification_cards/${filename}`
          );
          setImageUrls(urls);
        } else {
          console.warn("No images found.");
        }
      })
      .catch((error) => console.error("Fetch error:", error));

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-green-800 to-green-600 px-4 sm:px-6 py-6 sm:py-12 transition-opacity duration-1000 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
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

      <div className="w-full max-w-7xl mx-auto mb-20">
        {/* Title Section */}
        <div className="flex flex-col items-center text-center text-white mb-10 px-4 mt-40">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 mt-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide uppercase">
              Digital Identification Cards
            </h1>
            <img src={idCardIcon} alt="ID Icon" className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <p className="text-sm sm:text-base mt-2 mb-4">
            Below are your digital ID cards. Click to view them in full screen.
          </p>
        </div>

        {/* Grid of ID Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 px-2 sm:px-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(url)}
              className="bg-white rounded-xl shadow-lg border border-gray-200 w-full aspect-[16/10] flex flex-col items-center justify-center cursor-pointer transform transition hover:scale-105 hover:shadow-2xl"
            >
              <div className="text-green-700 font-semibold text-lg mt-4 mb-2">
                ID Card {index + 1}
              </div>
              <img
                src={url}
                alt={`ID ${index + 1}`}
                className="w-full h-full object-contain rounded-b-xl px-4 pb-4"
              />
            </div>
          ))}
          {imageUrls.length === 0 && (
            <p className="text-white col-span-full text-center">
              No ID images available.
            </p>
          )}
        </div>
      </div>

      {/* Modal Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-auto transform scale-95 animate-fadeIn">
            <img
              src={selectedImage}
              alt="Enlarged ID"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitalID;
