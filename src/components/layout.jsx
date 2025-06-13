// src/components/UserLayout.jsx
import React from "react";
import UserNavbar from "./Navbar";
import UserFooter from "./Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <UserNavbar />
      <Outlet />
      <UserFooter />
    </div>
  );
};

export default UserLayout;
