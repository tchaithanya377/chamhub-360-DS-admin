import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, FaBook, FaLink, FaTasks, FaPlus, FaUsersCog } from "react-icons/fa";

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
    { name: "Faculty Assignments", path: "/FacultyAssignments", icon: <FaTasks /> },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-500">
              CampusHub360
            </h1>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
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
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-200"
              aria-label="Notifications"
            >
              <i className="fas fa-bell text-orange-500"></i>
            </button>
            <button className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md hover:bg-gray-700 transition duration-200">
              <img
                className="h-8 w-8 rounded-full"
                src="https://via.placeholder.com/150"
                alt="Admin"
              />
              <span>Admin</span>
            </button>
          </div>
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
