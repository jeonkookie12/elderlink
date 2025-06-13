// src/components/AdminLayout.jsx
import React, { useState } from "react";
import AdminNavbar from "./admin-navbar";

const AdminLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('Dashboard');

  return (
    // Only render AdminNavbar since it already wraps Outlet
    <AdminNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} title={title} setTitle={setTitle} />
  );
};

export default AdminLayout;
