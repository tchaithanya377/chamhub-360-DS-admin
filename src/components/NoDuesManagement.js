import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const NoDuesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [noDuesStatus, setNoDuesStatus] = useState({});

  useEffect(() => {
    const fetchCoursesAndFaculty = async () => {
      try {
        const department = "Computer Science & Engineering (Data Science)";
        const years = ["I", "II", "III", "IV"];
        const sections = ["A", "B", "C"];
        const fetchedCourses = [];

        // Fetch courses for each year and section
        for (const year of years) {
          for (const section of sections) {
            const coursePath = `courses/${department}/years/${year}/sections/${section}/courseDetails`;
            const courseCollection = collection(db, coursePath);
            const courseSnapshot = await getDocs(courseCollection);
            courseSnapshot.forEach((doc) => {
              fetchedCourses.push({
                id: doc.id,
                ...doc.data(),
                year,
                section,
              });
            });
          }
        }

        setCourses(fetchedCourses);

        // Fetch Faculty
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const fetchedFaculty = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaculty(fetchedFaculty);
      } catch (error) {
        console.error("Error fetching courses or faculty:", error);
      }
    };

    fetchCoursesAndFaculty();
  }, []);

  const fetchStudents = async () => {
    if (!selectedYear || !selectedSection) return;

    try {
      const studentsPath = `students/${selectedYear}/${selectedSection}`;
      const studentsSnapshot = await getDocs(collection(db, studentsPath));
      const fetchedStudents = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(fetchedStudents);

      // Calculate no dues status for each course
      const status = {};
      for (const course of filteredCourses) {
        const completed = fetchedStudents.filter(
          (student) =>
            student.noDues &&
            student.noDues[course.id] &&
            student.noDues[course.id].status === "Completed"
        ).length;

        const pending = fetchedStudents.length - completed;

        status[course.id] = { completed, pending };
      }
      setNoDuesStatus(status);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleFilter = () => {
    const filtered = courses.filter(
      (course) =>
        (!selectedYear || course.year === selectedYear) &&
        (!selectedSection || course.section === selectedSection)
    );
    setFilteredCourses(filtered);

    // Fetch students for the selected filters
    fetchStudents();
  };

  const handleToggleNoDues = async (courseId, currentStatus) => {
    try {
      const course = filteredCourses.find((c) => c.id === courseId);
      const coursePath = `courses/Computer Science & Engineering (Data Science)/years/${course.year}/sections/${course.section}/courseDetails/${course.id}`;
      const courseRef = doc(db, coursePath);

      // Toggle the no dues status
      const updatedStatus = !currentStatus;
      await updateDoc(courseRef, {
        noDuesGenerated: updatedStatus,
      });

      // Update the UI
      setFilteredCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, noDuesGenerated: updatedStatus } : c
        )
      );
      alert(`No Dues ${updatedStatus ? "granted" : "removed"} successfully!`);
    } catch (error) {
      console.error("Error updating no dues status:", error);
      alert("Failed to update no dues status.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          No Dues Management - Edit and Modify
        </h1>

        {/* Filter Section */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Filter Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Year --</option>
                {["I", "II", "III", "IV"].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Select Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Section --</option>
                {["A", "B", "C"].map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Courses List
          </h2>
          {filteredCourses.length > 0 ? (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border border-gray-300">Course Name</th>
                  <th className="p-3 border border-gray-300">Faculty</th>
                  <th className="p-3 border border-gray-300">Year</th>
                  <th className="p-3 border border-gray-300">Section</th>
                  <th className="p-3 border border-gray-300">No Dues</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => {
                  const assignedFaculty = faculty.find(
                    (fac) => fac.id === course.instructor
                  );
                  return (
                    <tr key={course.id} className="hover:bg-gray-100">
                      <td className="p-3 border border-gray-300">
                        {course.courseName}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {assignedFaculty ? assignedFaculty.name : "N/A"}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {course.year}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {course.section}
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        {course.noDuesGenerated ? "Yes" : "No"}
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        <button
                          onClick={() =>
                            handleToggleNoDues(
                              course.id,
                              course.noDuesGenerated
                            )
                          }
                          className={`px-4 py-2 rounded-md ${
                            course.noDuesGenerated
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {course.noDuesGenerated ? "Remove No Dues" : "Grant No Dues"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center">
              No courses found for the selected filters.
            </p>
          )}
        </div>

        {/* No Dues Pending List */}
        {Object.keys(noDuesStatus).length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              No Dues Pending List
            </h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border border-gray-300">Course Name</th>
                  <th className="p-3 border border-gray-300">Completed</th>
                  <th className="p-3 border border-gray-300">Pending</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-100">
                    <td className="p-3 border border-gray-300">
                      {course.courseName}
                    </td>
                    <td className="p-3 border border-gray-300 text-center">
                      {noDuesStatus[course.id]?.completed || 0}
                    </td>
                    <td className="p-3 border border-gray-300 text-center">
                      {noDuesStatus[course.id]?.pending || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoDuesManagement;
