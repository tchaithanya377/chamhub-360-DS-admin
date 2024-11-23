import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const NoDuesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCourses, setSelectedCourses] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchCoursesAndFaculty = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };

    fetchCoursesAndFaculty();
  }, []);

  const handleFilter = () => {
    if (!selectedYear || !selectedSection) {
      alert("Please select both year and section.");
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.year === selectedYear &&
        course.section === selectedSection &&
        course.instructor // Ensure an instructor is assigned
    );
    setFilteredCourses(filtered);
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId], // Toggle selection
    }));
  };

  const handleGenerateNoDues = async () => {
    const coursesToGenerate = filteredCourses.filter(
      (course) => selectedCourses[course.id]
    );

    if (coursesToGenerate.length === 0) {
      alert("Please select at least one course for no dues.");
      return;
    }

    setIsLoading(true);
    try {
      for (const course of coursesToGenerate) {
        const coursePath = `courses/Computer Science & Engineering (Data Science)/years/${course.year}/sections/${course.section}/courseDetails/${course.id}`;
        const courseRef = doc(db, coursePath);

        // Update Firestore to mark no dues generation at the course level
        await updateDoc(courseRef, {
          noDuesGenerated: true,
        });

        // Fetch students for the course's year and section
        const studentsPath = `students/${course.year}/${course.section}`;
        const studentSnapshot = await getDocs(collection(db, studentsPath));
        const students = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update each student's no dues field
        for (const student of students) {
          const studentRef = doc(
            db,
            `students/${course.year}/${course.section}/${student.id}`
          );

          const noDues = student.noDues || {};
          noDues[course.id] = {
            status: "Pending Faculty Approval",
            courseName: course.courseName,
            facultyId: course.instructor,
          };

          await updateDoc(studentRef, {
            noDues,
          });
        }

        // Update faculty with no dues approvals for students
        const facultyRef = doc(db, `faculty/${course.instructor}`);
        const assignedFaculty = faculty.find((fac) => fac.id === course.instructor);
        const facultyApprovals = assignedFaculty?.noDuesApprovals || {};
        facultyApprovals[course.id] = {
          courseName: course.courseName,
          students: students.map((student) => ({
            id: student.id,
            name: student.name,
          })),
        };

        await updateDoc(facultyRef, {
          noDuesApprovals: facultyApprovals,
        });
      }

      alert("No Dues generated successfully for the selected courses!");
      setSelectedCourses({});
    } catch (error) {
      console.error("Error generating no dues:", error);
      alert("Failed to generate no dues.");
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          No Dues Management
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-lg text-gray-700">Processing...</p>
          </div>
        ) : (
          <>
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

            {/* Filtered Courses List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Select Courses for No Dues
              </h2>
              {filteredCourses.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 border border-gray-300">Select</th>
                      <th className="p-3 border border-gray-300">Course Name</th>
                      <th className="p-3 border border-gray-300">Faculty</th>
                      <th className="p-3 border border-gray-300">Year</th>
                      <th className="p-3 border border-gray-300">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => {
                      const assignedFaculty = faculty.find(
                        (fac) => fac.id === course.instructor
                      );
                      return (
                        <tr key={course.id} className="hover:bg-gray-100">
                          <td className="p-3 border border-gray-300 text-center">
                            <input
                              type="checkbox"
                              checked={selectedCourses[course.id] || false}
                              onChange={() => handleCourseSelection(course.id)}
                            />
                          </td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 text-center">
                  No courses found for the selected year and section with an assigned instructor.
                </p>
              )}
            </div>

            {/* Generate No Dues Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleGenerateNoDues}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
              >
                Generate No Dues
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoDuesManagement;
