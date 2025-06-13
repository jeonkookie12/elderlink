import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './admin-sidebar';
import beepSound from '../assets/admin-assets/admin-nav/beep.mp3';
import { useAuth } from "../context/AuthContext";

// SVG icons
import BarsIcon from '../assets/admin-assets/admin-nav/bar.svg';
import SearchIcon from '../assets/admin-assets/admin-nav/search.svg';
import MicrophoneIcon from '../assets/admin-assets/admin-nav/microphone.svg';
import MicrophoneDisabledIcon from '../assets/admin-assets/admin-nav/microphone-disabled.svg';
import ChevronDownIcon from '../assets/admin-assets/admin-nav/dropdown.svg';
import UserIcon from '../assets/admin-assets/admin-nav/profile.svg';
import LogoutIcon from '../assets/admin-assets/admin-nav/logout.svg';
import XIcon from '../assets/admin-assets/admin-nav/x.svg';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('Applications');
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [hoverMic, setHoverMic] = useState(false);
  const [hideMicPrompt, setHideMicPrompt] = useState(false);
  const { user, logout } = useAuth(); 


  const dropdownRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const isSidebarVisible = sidebarOpen || sidebarHover;

  const showMicError = (msg) => {
    setMicError(msg);
    setTimeout(() => setMicError(''), 3000);
  };

  const checkMicPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' });
      const updatePermission = () => {
        setMicPermissionDenied(permission.state === 'denied');
        if (permission.state !== 'denied') {
          setHideMicPrompt(false);
        }
      };
      updatePermission();
      permission.onchange = updatePermission;
    } catch (err) {
      console.warn('Permission API not fully supported', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const confirmed = window.confirm('Speech recognition is not supported. Would you like to try granting microphone permissions manually?');
      if (confirmed) {
        alert('Please check your browser microphone settings and refresh the page.');
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let hasSpoken = false;

    recognition.onstart = () => {
      setListening(true);
      hasSpoken = false;
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
    };

    recognition.onresult = (event) => {
      hasSpoken = true;
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      showMicError('Speech recognition error.');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    recognition.onend = () => {
      if (!hasSpoken) showMicError('No voice detected.');
      setListening(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleMicClick = async () => {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    if (permission.state === 'denied') {
      setMicPermissionDenied(true);
      setHideMicPrompt(false);
      return;
    }

    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      showMicError('Failed to access microphone.');
    }
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        setMicPermissionDenied(false);
        stream.getTracks().forEach((track) => track.stop());
        setHideMicPrompt(false);
      }
    } catch (err) {
      setMicPermissionDenied(true);
    }
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <audio ref={audioRef} src={beepSound} preload="auto" />

      {/* MIC PERMISSION PROMPT */}
      {micPermissionDenied && !hideMicPrompt && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-50 flex items-center gap-4">
          <span className="text-sm">
            Microphone access denied or unavailable. Please enable it in your browser settings.
          </span>
          <button
            onClick={() => setHideMicPrompt(true)}
            className="text-red-700 hover:text-red-900 font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <Sidebar
        open={sidebarOpen}
        hover={sidebarHover}
        setHover={setSidebarHover}
        setOpen={setSidebarOpen}
        isVisible={isSidebarVisible}
        setTitle={setTitle}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white shadow-md mt-5 rounded-md z-40 transition-all duration-300 mx-4 sm:mx-6 lg:mx-10">
          <div className="px-4 sm:px-6 lg:px-12 py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Menu + Title */}
              <div className="flex items-start gap-4 min-w-0">
                <button
                  className="lg:hidden bg-green-800 text-white p-2 rounded text-sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <img src={BarsIcon} alt="Menu" className="w-4 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-green-800 text-sm sm:text-base font-semibold">{title}</h1>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    Last login: October 30, 2024 08:50:10 pm
                  </span>
                </div>
              </div>

              {/* Right: Search, Profile */}
              <div className="flex items-center gap-3 sm:gap-5 min-w-0 relative">
                {/* Search Toggle */}
                <button className="text-green-800 lg:hidden" onClick={() => setShowSearch(!showSearch)}>
                  <img src={SearchIcon} alt="Search" className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Search Bar */}
                <div
                  className={`
                    transition-all duration-300 overflow-hidden min-w-0
                    ${showSearch ? 'max-w-[400px] sm:max-w-[400px] w-[280px] sm:w-[400px] opacity-100' : 'max-w-0 opacity-0'}
                    lg:max-w-[400px] lg:w-[400px] lg:opacity-100 lg:block
                  `}
                >
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 sm:px-4 sm:py-2 shadow-inner relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent outline-none text-xs sm:text-sm w-full"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')}>
                        <img src={XIcon} alt="Clear" className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                      {hoverMic && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-md px-3 py-2 shadow-md z-50 whitespace-nowrap">
                          {micPermissionDenied ? 'Microphone disabled or unavailable' : 'Click to speak'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <div
                  ref={dropdownRef}
                  className="lg:ml-8 relative flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setTitle('Profile');
                  }}
                >
                  {user?.image ? (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${user.image}`}
                      alt={user.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-200 text-green-900 rounded-full text-sm font-semibold shadow-md">
                      {user?.username ? user.username[0] : 'U'}
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
                    <img src={ChevronDownIcon} alt="Dropdown" className="w-4 h-4" />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md w-40 py-2 z-30">
                      <button
                        onClick={() => navigate('/admin-profile')}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm w-full text-left"
                      >
                        <img src={UserIcon} alt="User" className="w-5 h-5 mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm w-full text-left"
                      >
                        <img src={LogoutIcon} alt="Logout" className="w-5 h-5 mr-2" />
                        Logout
                      </button>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="px-4 sm:px-6 lg:px-10 py-8 mt-2">
          <Outlet context={{ searchQuery, setSearchQuery, setTitle }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
