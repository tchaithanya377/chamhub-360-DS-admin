import React from "react";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/students" className="block py-2 px-4 hover:bg-gray-700">
                Manage Students
              </a>
            </li>
            <li className="mb-2">
              <a href="/faculty" className="block py-2 px-4 hover:bg-gray-700">
                Manage faculty
              </a>
            </li>
            <li className="mb-2">
              <a href="/courses" className="block py-2 px-4 hover:bg-gray-700">
                Manage Courses
              </a>
            </li>
            <li className="mb-2">
              <a href="/attendance" className="block py-2 px-4 hover:bg-gray-700">
                Attendance
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
        <p className="mt-4">Select a task from the sidebar to get started.</p>
      </main>
    </div>
  );
};

export default AdminDashboard;
