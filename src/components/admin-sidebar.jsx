import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import logo from '../assets/logo.png';
import logo1 from '../assets/admin-assets/sidebar/sidebar-close.svg';

import dashboardIconGreen from '../assets/admin-assets/sidebar/dashboard-green.svg';
import dashboardIconWhite from '../assets/admin-assets/sidebar/dashboard-white.svg';
import applicationIconGreen from '../assets/admin-assets/sidebar/application-green.svg';
import applicationIconWhite from '../assets/admin-assets/sidebar/application-white.svg';
import managerIconGreen from '../assets/admin-assets/sidebar/manager-green.svg';
import managerIconWhite from '../assets/admin-assets/sidebar/manager-white.svg';
import eventsIconGreen from '../assets/admin-assets/sidebar/events-green.svg';
import eventsIconWhite from '../assets/admin-assets/sidebar/events-white.svg';
import announcementIconGreen from '../assets/admin-assets/sidebar/announcement-green.svg';
import announcementIconWhite from '../assets/admin-assets/sidebar/announcement-white.svg';
import feedbacksIconGreen from '../assets/admin-assets/sidebar/feedback-green.svg';
import feedbacksIconWhite from '../assets/admin-assets/sidebar/feedback-white.svg';
import reportsIconGreen from '../assets/admin-assets/sidebar/reports-green.svg';
import reportsIconWhite from '../assets/admin-assets/sidebar/reports-white.svg';
import logoutIcon from '../assets/admin-assets/sidebar/logout.svg';
import { useAuth } from "../context/AuthContext";



function AdminSidebar({ open, hover, setHover, setOpen, setTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); 
  const isVisible = open || hover;

  const menuItems = [
    {
      icon: { active: dashboardIconGreen, inactive: dashboardIconWhite },
      label: 'Dashboard',
      path: '/admin-dashboard',
    },
    {
      icon: { active: applicationIconGreen, inactive: applicationIconWhite },
      label: 'Application',
      path: '/admin-application',
    },
    {
      icon: { active: managerIconGreen, inactive: managerIconWhite },
      label: 'Senior Manager',
      path: '/senior-manager',
    },
    {
      icon: { active: eventsIconGreen, inactive: eventsIconWhite },
      label: 'Events and Activities',
      path: '/events-and-acts',
    },
    {
      icon: { active: announcementIconGreen, inactive: announcementIconWhite },
      label: 'Announcements',
      path: '/admin-announcements',
    },
    {
      icon: { active: feedbacksIconGreen, inactive: feedbacksIconWhite },
      label: 'Feedbacks',
      path: '/feedbacks',
    },
    {
      icon: { active: reportsIconGreen, inactive: reportsIconWhite },
      label: 'Reports',
      path: '/reports',
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
        setHover(false);
      } else {
        setHover(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen, setHover]);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setHover(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) setHover(false);
  };

  const handleNavigation = (path, label) => {
    setTitle(label);

    if (window.innerWidth < 1024) {
      setOpen(false);
      setHover(false);

      // Optional: add slight delay for smoother sidebar close before navigating
      setTimeout(() => navigate(path), 150);
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const activeItem = menuItems.find((item) => item.path === location.pathname);
    if (activeItem) {
      setTitle(activeItem.label);
    }
  }, [location.pathname, menuItems, setTitle]);

  return (
    <aside
      className={`z-50 h-full bg-green-800 text-white flex flex-col fixed lg:static
        transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${isVisible ? 'w-64' : 'w-20'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-4 px-4 py-4 relative">
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-white rounded-full p-1.5"
            title="Collapse Sidebar"
          >
            <img src={logo1} alt="Toggle Sidebar" className="w-6 h-6" />
          </button>
        )}

        <div className="min-w-[54px] pt-7 pb-8 flex items-center justify-center transition-all duration-300">
          <img
            src={logo}
            alt="Logo"
            className={`w-13 h-13 rounded-full transition-transform duration-300 ${
              isVisible ? 'translate-x-0' : '-translate-x-1'
            }`}
          />
        </div>

        <div
          className={`pl-2 pt-7 pb-8 overflow-hidden ${
            isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <h1 className="text-xs font-semibold leading-tight whitespace-nowrap">
            BARANGAY SABANG<br />DASMARINAS CAVITE
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => handleNavigation(path, label)}
              className={`flex items-center px-3.5 py-2.5 rounded-lg min-h-[44px] w-full text-left ${
                isActive ? 'bg-white text-green-700 font-semibold ' : 'font-semibold text-white hover:bg-green-900'
              }`}
            >
              <div
                className={`min-w-[52px] flex items-center justify-start transition-transform duration-300 ${
                  isVisible ? 'translate-x-1' : '-translate-x-1'
                }`}
              >
                <img
                  src={isActive ? icon.active : icon.inactive}
                  alt={label}
                  className="w-8 h-6"
                />
              </div>
              <div
                className={`overflow-hidden transform transition-transform duration-300 ${
                  isVisible ? 'translate-x-0' : '-translate-x-1'
                }`}
              >
                <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout button (unchanged from original) */}
      <div className="px-4 pb-4">
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setOpen(false);
              setHover(false);
              setTimeout(() => navigate('/guest'), 150);
            } else {
              navigate('/guest');
            }
          }}
          className="flex items-center px-3.5 py-2.5 rounded-lg min-h-[44px] w-full text-left text-white hover:bg-green-900"
        >
          <div className={`min-w-[52px] flex items-center justify-start transition-transform duration-300 ${
            isVisible ? 'translate-x-1' : '-translate-x-1'
          }`}>
            <img
              src={logoutIcon}
              alt="Logout"
              className="w-7 h-5 filter invert"
            />
          </div>
          <div className={`overflow-hidden transform transition-transform duration-300 ${
            isVisible ? 'translate-x-0' : '-translate-x-2'
          }`}>
            <span className="text-sm">Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
