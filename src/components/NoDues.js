import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

const NoDuesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCourses, setSelectedCourses] = useState({});
  const [selectedCoordinators, setSelectedCoordinators] = useState({});
  const [selectedMentors, setSelectedMentors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filteredMentors, setFilteredMentors] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const department = "Computer Science & Engineering (Data Science)";
        const years = ["I", "II", "III", "IV"];
        const sections = ["A", "B", "C"];
        const fetchedCourses = [];
        const fetchedStudents = [];

        // Fetch courses and students for each year and section
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
            const studentsPath = `students/${year.toUpperCase()}/${section.toUpperCase()}`;
            const studentCollection = collection(db, studentsPath);
            const studentSnapshot = await getDocs(studentCollection);            
            studentSnapshot.forEach((doc) => {
              fetchedStudents.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          }
        }

        setCourses(fetchedCourses);
        setStudents(fetchedStudents);

        // Fetch faculty
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const fetchedFaculty = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaculty(fetchedFaculty);

        // Pre-select coordinators and mentors
        const defaultCoordinators = fetchedFaculty.reduce((acc, faculty) => {
          if (faculty.coordinator) acc[faculty.id] = true;
          return acc;
        }, {});

        const defaultMentors = fetchedFaculty.reduce((acc, faculty) => {
          if (fetchedStudents.some((student) => student.mentorId === faculty.id))
            acc[faculty.id] = true;
          return acc;
        }, {});

        setSelectedCoordinators(defaultCoordinators);
        setSelectedMentors(defaultMentors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    if (!selectedYear || !selectedSection) {
      alert("Please select both year and section.");
      return;
    }
  
    // Filter courses based on selected year and section
    const filtered = courses.filter(
      (course) =>
        course.year === selectedYear &&
        course.section === selectedSection &&
        course.instructor
    );
    setFilteredCourses(filtered);
    const mentorsForSection = faculty.filter((mentor) =>
      students.some(
        (student) =>
          student.mentorId?.trim() === mentor.id?.trim() && // Ensure IDs match
          student.Section?.toUpperCase() === selectedSection.toUpperCase() &&
          student.Year?.toUpperCase() === selectedYear.toUpperCase()
      )
    );
    setFilteredMentors(mentorsForSection);
    
    
  };
  
  const handleCourseSelection = (courseId) => {
    setSelectedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };
  
  const handleCoordinatorSelection = (coordinatorId) => {
    setSelectedCoordinators((prev) => ({
      ...prev,
      [coordinatorId]: !prev[coordinatorId],
    }));
  };
  
  const handleMentorSelection = (mentorId) => {
    setSelectedMentors((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };
  
  const handleGenerateNoDues = async (year, section) => {
    setIsLoading(true);
  
    try {
      const selectedCourseIds = Object.keys(selectedCourses).filter(
        (courseId) => selectedCourses[courseId]
      );
  
      const selectedCoordinatorIds = Object.keys(selectedCoordinators).filter(
        (coordinatorId) => selectedCoordinators[coordinatorId]
      );
  
      const selectedMentorIds = Object.keys(selectedMentors).filter(
        (mentorId) => selectedMentors[mentorId]
      );
  
      const linkedStudents = students.map((student) => {
        const studentSection = student.Section?.toLowerCase().trim();
        const studentYear = student.Year?.toLowerCase().trim();
        const selectedSection = section.toLowerCase().trim();
        const selectedYear = year.toLowerCase().trim();
  
        const matchesSection = studentSection === selectedSection;
        const matchesYear = studentYear === selectedYear;
  
        if (!matchesSection || !matchesYear) return null;
  
        const associatedCourses = student.courses?.filter((courseId) =>
          selectedCourseIds.includes(courseId)
        );
  
        const coursesFaculty = associatedCourses.map((courseId) => ({
          courseId,
          facultyId: courses.find((course) => course.id === courseId)?.instructor || null,
          status: "Pending",
        }));
  
        return {
          id: student.id,
          name: student.name,
          courses: associatedCourses.map((id) => ({ id, status: "Pending" })),
          courses_faculty: coursesFaculty,
          coordinators: selectedCoordinatorIds.map((id) => ({ id, status: "Pending" })),
          mentors: selectedMentorIds.includes(student.mentorId)
            ? [{ id: student.mentorId, status: "Pending" }]
            : [],
          generatedAt: new Date().toISOString(),
          status: "Pending",
        };
      }).filter(Boolean);
  
      // Create the noDues document with detailed student records
      const noDuesRef = doc(collection(db, `noDues/${year}/${section}`));
      await setDoc(noDuesRef, {
        students: linkedStudents, // Detailed student records
        generatedAt: new Date(),
        status: "Pending",
      });
  
      alert("No Dues generated successfully with detailed student records!");
      setSelectedCourses({});
      setSelectedCoordinators({});
      setSelectedMentors({});
    } catch (error) {
      console.error("Error generating no dues:", error);
      alert("Failed to generate no dues.");
    }
  
    setIsLoading(false);
  };
  console.log("Students:", students);
console.log("Faculty:", faculty);
console.log("Filtered Mentors:", filteredMentors);

  
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
                      const instructor = faculty.find(
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
                          <td className="p-3 border border-gray-300">{course.courseName}</td>
                          <td className="p-3 border border-gray-300">{instructor?.name || "N/A"}</td>
                          <td className="p-3 border border-gray-300">{course.year}</td>
                          <td className="p-3 border border-gray-300">{course.section}</td>
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

            {/* Coordinators Section */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Select Coordinators for No Dues
              </h2>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 border border-gray-300">Select</th>
                    <th className="p-3 border border-gray-300">Coordinator Name</th>
                    <th className="p-3 border border-gray-300">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty
                    .filter((fac) => fac.coordinator)
                    .map((coordinator) => (
                      <tr key={coordinator.id} className="hover:bg-gray-100">
                        <td className="p-3 border border-gray-300 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCoordinators[coordinator.id] || false}
                            onChange={() => handleCoordinatorSelection(coordinator.id)}
                          />
                        </td>
                        <td className="p-3 border border-gray-300">{coordinator.name}</td>
                        <td className="p-3 border border-gray-300">{coordinator.coordinator}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Mentors Section */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Select Mentors for No Dues
              </h2>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 border border-gray-300">Select</th>
                    <th className="p-3 border border-gray-300">Mentor Name</th>
                    <th className="p-3 border border-gray-300">Assigned Students</th>
                  </tr>
                </thead>
                <tbody>
                {filteredMentors.length > 0 ? (
  filteredMentors.map((mentor) => {
    const assignedStudents = students.filter(
      (student) =>
        student.mentorId === mentor.id &&
        student.Section?.toUpperCase() === selectedSection.toUpperCase() &&
        student.Year?.toUpperCase() === selectedYear.toUpperCase()
    ).length;

    return (
      <tr key={mentor.id} className="hover:bg-gray-100">
        <td className="p-3 border border-gray-300 text-center">
          <input
            type="checkbox"
            checked={selectedMentors[mentor.id] || false}
            onChange={() => handleMentorSelection(mentor.id)}
          />
        </td>
        <td className="p-3 border border-gray-300">{mentor.name}</td>
        <td className="p-3 border border-gray-300">{assignedStudents}</td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan="3" className="text-center p-3 text-gray-600">
      No mentors found for the selected year and section.
    </td>
  </tr>
)}


                </tbody>
              </table>
            </div>

            {/* Generate No Dues Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => handleGenerateNoDues(selectedYear, selectedSection)}
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
