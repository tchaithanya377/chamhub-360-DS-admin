import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminNavbar from "./components/Navbar"; // Import the AdminNavbar
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import ManageStudents from "./components/Students";
import Students from "./components/Student-manage";
import AddStudent from "./components/AddStudent";
import Faculty from "./components/Faculty-manage";
import AddFaculty from "./components/AddFaculty";
import AddCourse from "./components/AddCourse";
import Courses from "./components/Courses";
import Relationships from "./components/Relationships";
import FacultyAssignments from "./components/FacultyAssignments";
import NoDues from "./components/NoDues";
import NoDuesManagement from "./components/NoDuesManagement";
import WeeklyTimetable from "./components/WeeklyTimetable";
import CreateTimetable from "./components/CreateTImeTable";
import CreateUser from "./components/CreateUser";
import Attendance from "./components/Attendance";
import CoordinatorAssignment from "./components/CoordinatorAssignment";
import MentorAssignment from "./components/MentorAssignment";
import ManageMentors from "./components/ManageMentors";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Login Route */}
          <Route path="/" element={<Login />} />

          {/* Authenticated Routes (with AdminNavbar) */}
          <Route
            path="*"
            element={
              <>
                <AdminNavbar />
                <div className="p-4">
                  <Routes>
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/home" element={<Students />} />
                    <Route path="/addstudent" element={<AddStudent />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/addfaculty" element={<AddFaculty />} />
                    <Route path="/addcourse" element={<AddCourse />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/relationships" element={<Relationships />} />
                    <Route
                      path="/facultyassignments"
                      element={<FacultyAssignments />}
                    />
                    <Route path="/nodues" element={<NoDues />} />
                    <Route path="/noduesmanagement" element={<NoDuesManagement />} />
                    <Route path='/weeklytimetable' element={<WeeklyTimetable />} />
                    <Route path='/createtimetable' element={<CreateTimetable />} />
                    <Route path='/createuser' element={<CreateUser />} />
                    <Route path='attendance' element={<Attendance />} />
                    <Route path="/coordinator" element={<CoordinatorAssignment />} />
                    <Route path="/mentor" element={<MentorAssignment />} />
                    <Route path="/managementors" element={<ManageMentors />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
