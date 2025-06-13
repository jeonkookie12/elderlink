import './index.css';
import React, { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import UserLayout from "./components/layout";
import AdminLayout from "./components/admin-layout";
import Guest from "./pages/guest.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import AboutUs from "./pages/about-us.jsx";
import CityProf from "./pages/about-us/cityprof.jsx";
import CityMayor from "./pages/about-us/mayor.jsx";
import BrgyProf from "./pages/about-us/brgy.jsx";
import BrgyOfficials from "./pages/about-us/brgyofficials.jsx";
import Service from "./pages/service.jsx";
import PrivateRoute from "./components/privateroute";
import UserDashboard from "./pages/user/user-dashboard.jsx";
import EventsAndActivities from "./pages/user/events-activities.jsx";
import Announcement from "./pages/user/announcement.jsx";
import Application from "./pages/user/application.jsx";
import DigitalID from "./pages/user/digital-id.jsx";
import Application_Form from "./pages/user/application-process/application-form.jsx";
import AdminDashboard from "./pages/admin/admin-dashboard.jsx";
import UserProfile from './pages/user/user-profile.jsx';
import AdminApplication from './pages/admin/application.jsx';
import SeniorManager from './pages/admin/senior_manager.jsx';
import AdminEventsAndActivities from './pages/admin/events-and-acts.jsx';
import AdminAnnouncement from './pages/admin/announcement.jsx';
import Feedbacks from './pages/admin/feedbacks.jsx';
import Reports from './pages/admin/reports.jsx';
import AdminProfile from './pages/admin/admin-profile.jsx';
import TermsAndConditions from './pages/tnc.jsx';
import PrivacyPolicy from './pages/privacy-policy.jsx';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* GUEST + USER ROUTES */}
        <Route element={<UserLayout />}>
          {/* Guest Accessible Pages */}
          <Route path="/" element={<Guest />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={< TermsAndConditions/>} />
          <Route path="/data-privacy" element={< PrivacyPolicy/>} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/city-profile" element={<CityProf />} />
          <Route path="/city-mayor" element={<CityMayor />} />
          <Route path="/barangay-profile" element={<BrgyProf />} />
          <Route path="/barangay-officials" element={<BrgyOfficials />} />
          <Route path="/service" element={<Service />} />

          {/* USER-ONLY ROUTES */}
          <Route
            path="/user/user-dashboard"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/EventsAndActivities"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <EventsAndActivities />
              </PrivateRoute>
            }
          />
          <Route
            path="/Announcement"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <Announcement />
              </PrivateRoute>
            }
          />        
          <Route
            path="/Announcement/:id"
            element={ 
              <PrivateRoute allowedRoles={["user"]}>
                <Announcement />
              </PrivateRoute>
            }
          />
          <Route
            path="/Application"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <Application />
              </PrivateRoute>
            }
          />
          <Route
            path="/DigitalID"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <DigitalID />
              </PrivateRoute>
            }
          />
          <Route
            path="/Application_Form"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <Application_Form />
              </PrivateRoute>
            }
          />
          <Route
            path="/UserProfile"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <UserProfile />
              </PrivateRoute>
            }
          />
        </Route>
        

        {/* ADMIN ROUTES */}
        <Route element={<AdminLayout />}>
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-application"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminApplication />
              </PrivateRoute>
            }
          />
          <Route
            path="/senior-manager"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <SeniorManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/events-and-acts"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminEventsAndActivities />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-announcements"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminAnnouncement />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedbacks"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Feedbacks />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-profile"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </PrivateRoute>
            }
          />
        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;
