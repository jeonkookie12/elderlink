import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnnouncementIcon from "../../assets/announcements/notif.svg";
import StaticIcon from "../../assets/announcements/application-notif.svg";
import HeaderIcon from "../../assets/announcements/announcement.svg";
import ReturnIcon from "../../assets/icons/back.svg";


const staticAnnouncements = [
  {
    id: "senior-id",
    title: "New Senior ID Applicant",
    isStatic: true,
    content: (
      <ul className="list-disc list-inside mt-2 text-gray-700">
        <li>Submit Accomplished Application Form</li>
        <li>PSA Birth Certificate</li>
        <li>One (1) Government Issued ID</li>
      </ul>
    ),
  },
  {
    id: "pwd-id",
    title: "PWD ID Application",
    isStatic: true,
    content: (
      <ul className="list-disc list-inside mt-2 text-gray-700">
        <li>Application Form</li>
        <li>Two (2) 1x1 ID Photos</li>
        <li>Valid Government ID or Barangay Certificate</li>
        <li>Medical Certificate</li>
        <li>Certificate of Disability</li>
      </ul>
    ),
  },
  {
    id: "pension",
    title: "Pension Application",
    isStatic: true,
    content: (
      <ul className="list-disc list-inside mt-2 text-gray-700">
        <li>RA 8291</li>
        <li>PD 1146</li>
        <li>RA 1616</li>
        <li>RA 660</li>
      </ul>
    ),
  },
];

const ITEMS_PER_PAGE = 6;

const Announcement = () => {
  const { id } = useParams(); // 👈 get URL param
  const [openId, setOpenId] = useState(id || null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);


// Inside useEffect:

  useEffect(() => {
    fetch("http://localhost/elder-dB/user-process/get_announcements.php")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        const merged = [...sorted, ...staticAnnouncements];
        setAnnouncements(merged);
        setIsLoaded(true);
        if (id) {
  const exists = merged.find((item) => item.id === id);
  if (exists) {
    setOpenId(id);
  }
}

        // auto-open announcement by ID if present
        if (id) {
          const exists = merged.find((item) => item.id === id);
          if (exists) {
            setOpenId(id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch announcements:", err);
      });
  }, [id]);

  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const paginated = announcements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setOpenId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    
    <div className="min-h-screen pt-42 pb-10 px-4 md:px-10">
      {/* Header */}
        <div className="absolute top-36  left-4 md:left-20 z-20">
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
      <div
        className={`max-w-4xl mx-auto mb-14 mt-5 text-center transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex justify-center items-center space-x-3 mb-2">
          <img src={HeaderIcon} alt="Header Icon" className="w-9 h-9 animate-fade-in" />
          <h1 className="text-4xl font-extrabold text-white animate-fade-in  tracking-wide">ANNOUNCEMENTS</h1>
        </div>
        <p className="text-gray-200 animate-fade-in ">
          Stay updated with the latest information and application updates.
        </p>
      </div>

      {/* Announcement List */}
      <div
        key={currentPage}
        className={`space-y-6 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"

        }`}
      >
        {paginated.map((item) => (
          <div
            key={item.id}
            className="relative max-w-4xl mx-auto bg-white text-green-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-opacity duration-700"
          >
            <div
              className="flex justify-between items-center font-semibold cursor-pointer"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              <div className="flex items-center space-x-2">
                <img
                  src={item.isStatic ? StaticIcon : AnnouncementIcon}
                  alt="Icon"
                  className="w-6 h-6"
                />
                <span>{item.title}</span>
              </div>
              {!item.isStatic && (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {openId === item.id && (
              <div className="mt-4 px-2 text-gray-700">
                <div className="mb-10 space-y-3">{item.content}</div>

                {/* Static items = apply button */}
                {item.isStatic && (
                  <Link
                    to="/Application"
                    className="absolute bottom-4 right-4 bg-green-800 text-white px-4 py-2 text-sm md:text-base rounded hover:bg-green-700 transition"
                  >
                    Apply
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className={`max-w-4xl mx-auto mt-11 flex justify-end pr-2 text-white space-x-2 transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPage(idx + 1)}
              className={`px-3 py-1.5 rounded ${
                currentPage === idx + 1
                  ? "bg-white text-green-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded ${
              currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Announcement;
