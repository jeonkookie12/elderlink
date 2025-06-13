import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileIcon from '../assets/icons/profile.svg';
import LogoutIcon from '../assets/icons/logout.svg';
import SearchIcon from '../assets/admin-assets/admin-nav/search.svg';
import MicrophoneIcon from '../assets/admin-assets/admin-nav/microphone.svg';
import MicrophoneDisabledIcon from '../assets/admin-assets/admin-nav/microphone-disabled.svg';
import XIcon from '../assets/admin-assets/admin-nav/x.svg';
import { useAuth } from "../context/AuthContext";

const pages = [
  { name: "About Us", path: "/about-us" },
  { name: "City Profile", path: "/city-profile" },
  { name: "City Mayor", path: "/city-mayor" },
  { name: "Barangay Profile", path: "/barangay-profile" },
  { name: "Barangay Officials", path: "/barangay-officials" },
  { name: "Service", path: "/service" },
  { name: "User Dashboard", path: "/user/user-dashboard" },
  { name: "Events and Activities", path: "/EventsAndActivities" },
  { name: "Announcement", path: "/Announcement" },
  { name: "Application", path: "/Application" },
  { name: "Digital ID", path: "/DigitalID" },
  { name: "Pension", path: "/Pension" },
  { name: "User Profile", path: "/UserProfile" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [hoverMic, setHoverMic] = useState(false);
  const [filteredPages, setFilteredPages] = useState([]);
  const { user, logout } = useAuth(); 
  const imageUrl = user?.image ? `http://localhost/elder-dB/user-profile/${user.image}` : null;
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const searchContainerRef = useRef(null);

  console.log(user ? user.image : "No user or image");

  // Filter pages based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPages([]);
    } else {
      const filtered = pages.filter(page =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    }
  }, [searchQuery]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setFilteredPages([]);
        setSearchQuery('');
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Disable scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAboutDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      showMicError('Speech recognition error');
    };

    recognition.onend = () => {
      setListening(false);
    };

    // Check mic permission
    const checkMicPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        setMicPermissionDenied(permission.state === 'denied');
      } catch (err) {
        console.warn('Permission API not supported', err);
      }
    };
    checkMicPermission();
  }, []);

  const handleMicClick = async () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      await recognitionRef.current.start();
    } catch (err) {
      showMicError('Microphone access denied');
      setMicPermissionDenied(true);
    }
  };

  const showMicError = (msg) => {
    setMicError(msg);
    setTimeout(() => setMicError(''), 3000);
  };

  // Auto-hide mobile search bar on resize to large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && showSearch) {
        setShowSearch(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSearch]);

  // Handle clicking a search result
  const handleResultClick = () => {
    setFilteredPages([]);
    setSearchQuery('');
    setShowSearch(false); // Close mobile search bar
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="flex items-center justify-between px-6 py-6 lg:px-20 lg:py-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-6">
          <img src={logo} alt="Barangay Logo" className="h-16 lg:h-16" />
          <div className="text-green-900 text-left">
            <div className="text-2xl lg:text-2xl font-bold">Barangay Sabang</div>
            <div className="text-md lg:text-lg">Dasmariñas Cavite</div>
          </div>
        </div>

        {/* Search Bar - Desktop (visible only on lg and above, for logged-in users) */}
        {user && (
          <div className="hidden lg:flex flex-1 mx-8 max-w-xl relative" ref={searchContainerRef}>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-inner w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="ml-2">
                  <img src={XIcon} alt="Clear" className="w-4 h-4" />
                </button>
              )}
              <div
                onClick={handleMicClick}
                onMouseEnter={() => setHoverMic(true)}
                onMouseLeave={() => setHoverMic(false)}
                className={`ml-2 cursor-pointer ${listening ? 'animate-pulse' : ''}`}
              >
                <img
                  src={micPermissionDenied ? MicrophoneDisabledIcon : MicrophoneIcon}
                  alt="Mic"
                  className="w-5 h-5"
                />
                {hoverMic && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 text-gray-800 text-xs rounded-md px-3 py-2 shadow-md z-50 whitespace-nowrap">
                    {micPermissionDenied ? 'Microphone disabled' : 'Click to speak'}
                  </div>
                )}
              </div>
            </div>
            {micError && (
              <div className="absolute top-full mt-1 text-red-500 text-xs z-50">{micError}</div>
            )}
            {/* Search Results Dropdown - Desktop */}
            {searchQuery && (
              <div className="absolute top-full mt-2 w-80 sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg z-40 overflow-x-hidden">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      className="block px-4 py-2 text-green-900 hover:bg-gray-100 text-base truncate"
                      onClick={handleResultClick}
                    >
                      {page.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-green-900 text-base">
                    No result
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile/Tablet Header Right Side (Search Icon + Menu) */}
        <div className="lg:hidden flex items-center gap-4">
          {/* Search Toggle for Mobile/Tablet (only for logged-in users, visible below lg) */}
          {user && (
            <button 
              className="text-green-900"
              onClick={() => setShowSearch(!showSearch)}
            >
              <img src={SearchIcon} alt="Search" className="w-6 h-6" />
            </button>
          )}
          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="transition-transform duration-300 transform"
          >
            <span
              className={`text-3xl text-green-900 font-bold transition-transform duration-300 transform ${menuOpen ? 'rotate-90' : ''}`}
            >
              {menuOpen ? "×" : "☰"}
            </span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-14 relative">
          <Link
            to={user ? "/user/user-dashboard" : "/guest"}
            className="text-green-900 font-bold text-xl hover:underline transition-all duration-300"
          >
            HOME
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
              className="text-green-900 font-bold text-xl hover:underline focus:outline-none"
            >
              ABOUT US
            </button>
            {aboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg flex flex-col z-50">
                <Link to="/about-us" className="px-4 py-2 text-green-900 hover:bg-gray-100" onClick={() => setAboutDropdownOpen(false)}>About Us</Link>
                <Link to="/city-profile" className="px-4 py-2 text-green-900 hover:bg-gray-100" onClick={() => setAboutDropdownOpen(false)}>City Profile</Link>
                <Link to="/city-mayor" className="px-4 py-2 text-green-900 hover:bg-gray-100" onClick={() => setAboutDropdownOpen(false)}>City Mayor</Link>
                <Link to="/barangay-profile" className="px-4 py-2 text-green-900 hover:bg-gray-100" onClick={() => setAboutDropdownOpen(false)}>Barangay Profile</Link>
                <Link to="/barangay-officials" className="px-4 py-2 text-green-900 hover:bg-gray-100" onClick={() => setAboutDropdownOpen(false)}>Barangay Officials</Link>
              </div>
            )}
          </div>
          <Link to="/service" className="text-green-900 font-bold text-xl hover:underline transition-all duration-300">SERVICE</Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 transition-all duration-200"
              >
                {user.image ? (
                  <img
                    src={imageUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-200 text-green-900 rounded-full text-sm font-semibold">
                    {user.username ? user.username[0] : 'U'}
                  </span>
                )}
                <span className="text-green-900 font-semibold">{user.username}</span>
                <svg
                  className="w-4 h-4 ml-1 fill-current text-green-900"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293L10 12l4.707-4.707-1.414-1.414L10 9.172 6.707 5.879 5.293 7.293z" />
                </svg>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <Link
                    to="/UserProfile"
                    className="flex items-center px-4 py-2 text-green-900 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <img 
                      src={ProfileIcon} 
                      alt="Profile Icon" 
                      className="w-5 h-5 mr-2"
                    />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-green-900 hover:bg-gray-100"
                  >
                    <img 
                      src={LogoutIcon} 
                      alt="Logout Icon" 
                      className="w-5 h-5 mr-2"
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-green-900 text-white font-bold text-lg px-6 py-2 rounded hover:bg-green-800 transition-all duration-300">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Search Bar (appears when toggled, only for logged-in users) */}
      {user && showSearch && (
        <div className="lg:hidden px-4 pb-4 relative" ref={searchContainerRef}>
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-inner w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="ml-2">
                <img src={XIcon} alt="Clear" className="w-4 h-4" />
              </button>
            )}
            <div
              onClick={handleMicClick}
              className={`ml-2 cursor-pointer ${listening ? 'animate-pulse' : ''}`}
            >
              <img
                src={micPermissionDenied ? MicrophoneDisabledIcon : MicrophoneIcon}
                alt="Mic"
                className="w-5 h-5"
              />
            </div>
          </div>
          {micError && (
            <div className="text-red-500 text-xs mt-1 z-50">{micError}</div>
          )}
          {/* Search Results Dropdown - Mobile/Tablet */}
          {searchQuery && (
            <div className="absolute top-full mt-2 w-80 sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg z-40 overflow-x-hidden">
              {filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <Link
                    key={index}
                    to={page.path}
                    className="block px-4 py-2 text-green-900 hover:bg-gray-100 text-base truncate"
                    onClick={handleResultClick}
                  >
                    {page.name}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-green-900 text-base">
                  No result
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile/Tablet Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-white flex flex-col items-start justify-center px-6 py-10 lg:hidden z-40 transition-all duration-500 ease-in-out ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <button
          className="absolute top-7 right-9 text-5xl text-green-900 font-bold transition-transform duration-300"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>
        <div className="flex flex-col items-start space-y-6 w-full mt-20">
          <Link
            to={user ? "/user/user-dashboard" : "/guest"}
            className="text-green-900 font-bold text-2xl hover:underline"
            onClick={() => setMenuOpen(false)}
          >
            HOME
          </Link>
          <div className="flex flex-col items-start space-y-2">
            <Link
              to="/about-us"
              className="text-green-900 font-bold text-2xl hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              ABOUT US
            </Link>
            <Link
              to="/city-profile"
              className="text-green-900 font-bold text-xl hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              City Profile
            </Link>
            <Link
              to="/city-mayor"
              className="text-green-900 font-bold text-xl hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              City Mayor
            </Link>
            <Link
              to="/barangay-profile"
              className="text-green-900 font-bold text-xl hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Barangay Profile
            </Link>
            <Link
              to="/barangay-officials"
              className="text-green-900 font-bold text-xl hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Barangay Officials
            </Link>
          </div>
          <Link
            to="/service"
            className="text-green-900 font-bold text-2xl hover:underline"
            onClick={() => setMenuOpen(false)}
          >
            SERVICE
          </Link>
          {user ? (
            <div className="mt-auto w-full">
              <div className="relative w-full flex justify-center mt-10">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center px-6 py-3 rounded bg-gray-100 hover:bg-gray-200 w-full justify-center"
                >
                  {user.image ? (
                    <img
                      src={imageUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-200 text-green-900 rounded-full text-sm font-semibold">
                      {user.username ? user.username[0] : 'U'}
                    </span>
                  )}
                  <span className="ml-3 text-green-900 font-semibold">{user.username}</span>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute bottom-full mb-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <Link
                      to="/UserProfile"
                      className="flex items-center px-4 py-2 text-green-900 hover:bg-gray-100"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      <img 
                        src={ProfileIcon} 
                        alt="Profile Icon" 
                        className="w-5 h-5 mr-2"
                      />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-green-900 hover:bg-gray-100"
                    >
                      <img 
                        src={LogoutIcon} 
                        alt="Logout Icon" 
                        className="w-5 h-5 mr-2"
                      />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login">
              <button className="mt-auto bg-green-900 text-white font-bold text-lg px-6 py-2 rounded hover:bg-green-800 transition-all duration-300 w-full">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;