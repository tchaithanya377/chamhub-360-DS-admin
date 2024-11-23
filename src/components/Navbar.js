import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaLink,
  FaTasks,
  FaPlus,
  FaUsersCog,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Students", path: "/students", icon: <FaUserGraduate /> },
    { name: "Add Student", path: "/addstudent", icon: <FaPlus /> },
    { name: "Faculty", path: "/faculty", icon: <FaChalkboardTeacher /> },
    { name: "Add Faculty", path: "/addfaculty", icon: <FaPlus /> },
    { name: "Courses", path: "/courses", icon: <FaBook /> },
    { name: "Add Course", path: "/addcourse", icon: <FaPlus /> },
    { name: "Relationships", path: "/relationships", icon: <FaLink /> },
    { name: "Faculty Assignments", path: "/facultyassignments", icon: <FaTasks /> },
    { name: "No Dues", path: "/nodues", icon: <FaClipboardList /> },
    { name: "No Dues Management", path: "/noduesmanagement", icon: <FaUsersCog /> },
    { name: "Weekly Timetable", path: "/weeklytimetable", icon: <FaCalendarAlt /> },
    { name: "Create Timetable", path: "/createtimetable", icon: <FaPlus /> },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-orange-500">
              CampusHub360
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex flex-wrap items-center justify-between space-x-4">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-orange-500 hover:text-white transition duration-200"
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Hamburger Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-800 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"} bg-gray-800`}>
        <div className="px-4 pt-4 pb-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-orange-500 hover:text-white transition duration-200"
            >
              {link.icon}
              <span className="ml-2">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
