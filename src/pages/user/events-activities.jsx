import { useEffect, useState, useRef } from "react";
import "../../css/transitions.css";

import { Link } from "react-router-dom";

import ReturnIcon from "../../assets/icons/back.svg";
import HeaderIcon from "../../assets/user-icons/events-header.svg";

import calendarIcon from "../../assets/admin-assets/events/calendar.svg";
import locationIcon from "../../assets/admin-assets/events/location.svg";
import typeIcon from "../../assets/admin-assets/events/type.svg";
import starIcon from "../../assets/events/star-gray.svg";
import starIconActive from "../../assets/events/star-active.svg";
import goingIcon from "../../assets/events/check-white.svg";
import defaultIcon from "../../assets/events/check-gray.svg";
import goingIconDropdown from "../../assets/events/going-green.svg";


import attendIconDropdown from "../../assets/events/attend.svg";
import notAttendingIconDropdown from "../../assets/events/negative-white.svg";

import removeIconDropdown from "../../assets/events/x-gray.svg";
import notGoingIconDropdown from "../../assets/events/notgoing.svg";

import interestedTagIcon from "../../assets/events/star.svg";

function EventsAndActs() {
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [events, setEvents] = useState([]);
  const [interestedEvents, setInterestedEvents] = useState(new Set());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [openAttendanceDropdown, setOpenAttendanceDropdown] = useState(null);
  const [openInterestDropdown, setOpenInterestDropdown] = useState(null);

  const dropdownRef = useRef(null);
useEffect(() => {
  // Call cleanup script once on mount
  fetch("http://localhost/elder-dB/user-process/cleanup_expired_event_data.php", {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Cleanup result:", data);
    })
    .catch((err) => console.error("Cleanup error:", err));

  // Fetch events and related data
  fetch("http://localhost/elder-dB/user-process/fetch_events.php")
    .then((res) => res.json())
    .then((data) => {
      setEvents(data);
      const interestedSet = new Set();

      data.forEach((event) => {
        fetch(`http://localhost/elder-dB/user-process/check_interest.php?event_id=${event.id}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((interestData) => {
            if (interestData.success && interestData.is_interested) {
              setInterestedEvents((prev) => new Set(prev).add(event.id));
            }
          });

        fetch(`http://localhost/elder-dB/user-process/check_attendance.php?event_id=${event.id}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((attendanceData) => {
            if (attendanceData.success) {
              setAttendanceStatus((prev) => ({
                ...prev,
                [event.id]: attendanceData.status || null,
              }));
            }
          });
      });
    })
    .catch((err) => console.error("Error fetching events:", err));
}, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenAttendanceDropdown(null);
        setOpenInterestDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAttendance = (eventId, newStatus) => {
    fetch("http://localhost/elder-dB/user-process/mark_attendance.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        setAttendanceStatus((prev) => {
          const updated = { ...prev };
          if (newStatus === "remove") {
            delete updated[eventId];
          } else {
            updated[eventId] = newStatus;
          }
          return updated;
        });
        setOpenAttendanceDropdown(null);
      })
      .catch((err) => console.error("Error setting attendance:", err));
  };

  const handleInterest = (eventId) => {
    fetch("http://localhost/elder-dB/user-process/mark_interested.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId }),
    })
      .then((res) => res.json())
      .then(() => {
        setInterestedEvents((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(eventId)) {
            newSet.delete(eventId);
          } else {
            newSet.add(eventId);
          }
          return newSet;
        });
        setOpenInterestDropdown(null);
      })
      .catch((err) => console.error("Error marking interest:", err));
  };

  const getDaysLeft = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const formatDateTime = (dateStr, timeStr) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    const date = new Date(`${dateStr}T${timeStr}`);
    return `${date.toLocaleDateString("en-US", options)} • ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const upcomingEvents = events.filter((ev) => new Date(ev.s_date) >= new Date());
  const pastEvents = events.filter((ev) => new Date(ev.s_date) < new Date());

const renderCard = (event, isPast = false) => (
  <div
    key={event.id}
    className="relative bg-white rounded-lg shadow hover:-translate-y-1 transition overflow-hidden cursor-pointer animate-fade-in"
    onClick={() => {
      setModalData(event);
      fetchInterestStatus(event.id);
      fetchAttendanceStatus(event.id);
    }}
  >
    <div className="relative w-full h-56 overflow-hidden">
      <img
        src={`http://localhost/elder-dB/events-img//${event.upload_pic}`}
        alt={event.title}
        className="w-full h-full object-cover transition duration-700 brightness-98 hover:brightness-105"
      />
    </div>
    
    <div className="p-5 space-y-2">
      <small>{formatDateTime(event.s_date, event.s_time)}</small>
      <h5 className="font-bold text-xl">{event.title}</h5>
      <p className="text-sm">{event.location}</p>
      <small>
        {isPast ? "Event Ended" : `Event will start in ${getDaysLeft(event.s_date)} days`}
      </small>
    </div>

    {/* Combined label container positioned bottom-right */}
    {!isPast && (
      <div className="absolute bottom-6 right-6 flex flex-row flex-wrap gap-2 items-end">
        {interestedEvents.has(event.id) && (
          <div className="flex items-center gap-1 bg-amber-400 text-white text-[0.7rem] font-semibold px-4 py-2.5 rounded-md shadow-md animate-fade-in">
            <img src={interestedTagIcon} alt="Interested" className="w-4 h-4" />
            Interested
          </div>
        )}

        {attendanceStatus && attendanceStatus[event.id] && (
          <div
            className={`flex items-center gap-1 text-white text-[0.7rem] font-semibold px-4 py-2.5 rounded-md shadow-md animate-fade-in ${
              attendanceStatus[event.id] === "going" ? "bg-green-600" : "bg-gray-500"
            }`}
          >
            <img
              src={
                attendanceStatus[event.id] === "going"
                  ? attendIconDropdown
                  : notAttendingIconDropdown
              }
              alt={attendanceStatus[event.id]}
              className="w-4 h-4"
            />
            {attendanceStatus[event.id] === "going" ? "Going" : "Not Going"}
          </div>
        )}
      </div>
    )}
  </div>
);


  const fetchAttendanceStatus = (eventId) => {
    fetch(`http://localhost/elder-dB/user-process/check_attendance.php?event_id=${eventId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAttendanceStatus((prev) => ({
            ...prev,
            [eventId]: data.status || null,
          }));
        }
      })
      .catch((err) => console.error("Error checking attendance:", err));
  };

  const fetchInterestStatus = (eventId) => {
    fetch(`http://localhost/elder-dB/user-process/check_interest.php?event_id=${eventId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInterestedEvents((prev) => {
            const newSet = new Set(prev);
            if (data.is_interested) {
              newSet.add(eventId);
            } else {
              newSet.delete(eventId);
            }
            return newSet;
          });
        }
      })
      .catch((err) => console.error("Error checking interest status:", err));
  };

  return (
    <div className="min-h-screen text-black font-sans animate-fade-in delay-800">
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
                    
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-10 pb-30 ">
        <div className="flex justify-center items-center space-x-3 mb-3 mt-46  ">
                      
                      <h1 className="text-4xl font-extrabold text-white text-center uppercase animate-fade-in tracking-wide">Events & Activities</h1>
                      <img src={HeaderIcon} alt="Header Icon" className="w-10 h-10 animate-fade-in " />
                    </div>
                    <p className="text-white text-center animate-fade-in">
                      Stay informed about upcoming events, activities, and programs within our community.
                    </p>

        
        <div className="flex justify-start mb-7 mt-10 px-3">
          <div className="flex bg-gray-200 rounded-full shadow px-1 py-1">
            <button
              className={`px-5 py-2.5 rounded-full font-semibold ${showUpcoming ? "bg-green-700 text-white" : ""}`}
              onClick={() => setShowUpcoming(true)}
            >
              Upcoming Events
            </button>
            <button
              className={`px-5 py-2.5 rounded-full font-semibold ${!showUpcoming ? "bg-green-700 text-white" : ""}`}
              onClick={() => setShowUpcoming(false)}
            >
              Past Events
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(showUpcoming ? upcomingEvents : pastEvents).map((event) => renderCard(event, !showUpcoming))}
        </div>
      </div>

    {modalData && (
  <div className="fixed inset-0 z-50 flex items-start justify-center px-4 sm:px-8 pt-20 pb-12  overflow-y-auto">
    <div className="absolute inset-0 bg-black/45"></div>

    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-7xl h-[82vh] overflow-y-auto z-100 flex flex-col animate-fade-in2" ref={dropdownRef}>
      <img
        src={`http://localhost/elder-dB/events-img//${modalData.upload_pic}`}
        alt={modalData.title}
        className="w-full h-86 object-cover rounded-t-xl"
      />
      <div className="flex-1 flex flex-col md:flex-row gap-6 px-6 py-6 md:py-8 md:px-10">
        <div className="flex-1 text-sm text-gray-700 space-y-4 ">
          <h2 className="text-3xl font-bold text-green-700">{modalData.title}</h2>

          <div className="flex items-center gap-2">
            <img src={calendarIcon} alt="calendar" className="w-5 h-5" />
            <span>{formatDateTime(modalData.s_date, modalData.s_time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={locationIcon} alt="location" className="w-5 h-5" />
            <span>{modalData.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={typeIcon} alt="event type" className="w-5 h-5 text-green-700" />
            <span>{modalData.event_type}</span>
          </div>

          {new Date(modalData.s_date) >= new Date() && (
            <div className="flex flex-wrap gap-3 mt-7 mb-8 items-center">
              {/* Interested Button */}
              <div className="relative">
                <button
                  className={`flex items-center gap-2 text-base font-semibold px-5 py-2 rounded-lg shadow transition-all duration-500 ease-in-out ${
                    interestedEvents.has(modalData.id) ? "text-white bg-green-700" : "text-gray-600 bg-gray-200"
                  }`}
                  onClick={() =>
                    interestedEvents.has(modalData.id)
                      ? setOpenInterestDropdown((prev) => (prev === modalData.id ? null : modalData.id))
                      : handleInterest(modalData.id)
                  }
                >
                  <img
                    src={interestedEvents.has(modalData.id) ? starIconActive : starIcon}
                    alt="Interested"
                    className="w-5 h-5"
                  />
                  Interested{interestedEvents.has(modalData.id) ? " ▾" : ""}
                </button>
                {interestedEvents.has(modalData.id) && openInterestDropdown === modalData.id && (
                  <div className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-full">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-gray-100"
                      onClick={() => handleInterest(modalData.id)}
                    >
                      Not Interested
                    </button>
                  </div>
                )}
              </div>

              {/* Going / Not Going Button */}
              <div className="relative">
                <button
                  className={`flex items-center gap-2 text-base font-semibold px-10 py-2 rounded-lg shadow transition-all duration-500 ${
                    attendanceStatus[modalData.id] === "going"
                      ? "text-white bg-green-700"
                      : attendanceStatus[modalData.id] === "not_going"
                      ? "text-white bg-gray-500"
                      : "text-gray-600 bg-gray-200"
                  }`}
                  onClick={() => {
                    const currentStatus = attendanceStatus[modalData.id];
                    if (currentStatus === "going" || currentStatus === "not_going") {
                      setOpenAttendanceDropdown((prev) => (prev === modalData.id ? null : modalData.id));
                    } else {
                      handleAttendance(modalData.id, "going");
                    }
                  }}
                >
                  <img
                    src={
                      attendanceStatus[modalData.id] === "going"
                        ? goingIcon
                        : attendanceStatus[modalData.id] === "not_going"
                        ? undefined // No icon when selected as Not Going
                        : defaultIcon
                    }
                    alt="status"
                    className="w-5 h-5"
                    style={{ display: attendanceStatus[modalData.id] === "not_going" ? "none" : "block" }}
                  />
                  {attendanceStatus[modalData.id] === "going"
                    ? "Going ▾"
                    : attendanceStatus[modalData.id] === "not_going"
                    ? "Not Going ▾"
                    : "Going"}
                </button>

                {(attendanceStatus[modalData.id] === "going" || attendanceStatus[modalData.id] === "not_going") &&
                  openAttendanceDropdown === modalData.id && (
                   <div className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-full">
                    {attendanceStatus[modalData.id] !== "going" && (
                      <button
                        className="flex justify-between items-center px-4 py-2 text-sm text-green-800 hover:bg-gray-100 w-full"
                        onClick={() => handleAttendance(modalData.id, "going")}
                      >
                        <span>Going</span>
                        <img src={goingIconDropdown} alt="Going" className="w-5 h-5" />
                      </button>
                    )}
                    {attendanceStatus[modalData.id] !== "not_going" && (
                      <button
                        className="flex justify-between items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full"
                        onClick={() => handleAttendance(modalData.id, "not_going")}
                      >
                        <span>Not Going</span>
                        
                        {notGoingIconDropdown ? <img src={notGoingIconDropdown} alt="Going" className="w-5 h-5"  /> : null}
                      </button>
                    )}
                    <button
                      className="flex justify-between items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full"
                      onClick={() => handleAttendance(modalData.id, "remove")}
                    >
                      <span>Remove Option</span>
                      <img src={removeIconDropdown} alt="Remove" className="w-5 h-5" />
                    </button>
                  </div>
                  )}
              </div>
            </div>
          )}

          <p className="text-justify leading-relaxed">{modalData.details}</p>
        </div>

          <div className="md:w-1/2 w-full">
            <div className="aspect-video border rounded-md overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?..."
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Map"
              ></iframe>
            </div>
          </div>
        </div>

              <div className="flex justify-end px-6 pb-6">
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
                  onClick={() => setModalData(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default EventsAndActs;
