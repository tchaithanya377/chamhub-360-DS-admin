import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch Courses and Instructors from Firebase
  useEffect(() => {
    const fetchCoursesAndInstructors = async () => {
      try {
        const years = ["I", "II", "III", "IV"];
        const sections = ["A", "B", "C"]; // Add all sections you have

        let coursesList = [];
        for (const year of years) {
          for (const section of sections) {
            const querySnapshot = await getDocs(
              collection(
                db,
                `courses/Computer Science & Engineering (Data Science)/years/${year}/sections/${section}/courseDetails`
              )
            );
            const sectionCourses = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              year,
              section,
              ...doc.data(),
            }));
            coursesList = [...coursesList, ...sectionCourses];
          }
        }

        // Fetch instructors for the courses
        const instructorIds = [...new Set(coursesList.map((course) => course.instructor))];
        const instructorData = {};
        for (const id of instructorIds) {
          if (id) {
            const docRef = doc(db, "faculty", id);
            const instructorSnapshot = await getDoc(docRef);
            if (instructorSnapshot.exists()) {
              instructorData[id] = instructorSnapshot.data().name;
            }
          }
        }

        setCourses(coursesList);
        setInstructors(instructorData);
      } catch (error) {
        console.error("Error fetching courses or instructors:", error);
      }
    };

    fetchCoursesAndInstructors();
  }, []);

  const handleViewDetails = (course) => {
    alert(`Viewing details for ${course.courseName}`);
    setSelectedCourse(course);
    // Add logic to display more detailed information about the course
  };

  const handleEditCourse = (course) => {
    alert(`Editing course: ${course.courseName}`);
    // Add logic to navigate to an edit form or handle editing inline
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Course Details
        </h1>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                {course.courseCode}
              </h2>
              <p className="text-gray-600">
                <strong>Course Name:</strong> {course.courseName}
              </p>
              <p className="text-gray-600">
                <strong>Instructor:</strong>{" "}
                {instructors[course.instructor] || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Coverage Percentage:</strong>{" "}
                {course.coveragePercentage || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Syllabus Coverage:</strong>{" "}
                {course.syllabusCoverage || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Units Completed:</strong>{" "}
                {course.unitsCompleted || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Deviation Reasons:</strong>{" "}
                {course.deviationReasons || "N/A"}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-center text-gray-600 mt-6">
            No courses found. Please add some data in Firebase.
          </p>
        )}
      </div>

      {/* Optional: Display Selected Course Details */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.courseName}</h2>
            <p>
              <strong>Course Code:</strong> {selectedCourse.courseCode}
            </p>
            <p>
              <strong>Instructor:</strong>{" "}
              {instructors[selectedCourse.instructor] || "N/A"}
            </p>
            <p>
              <strong>Coverage Percentage:</strong>{" "}
              {selectedCourse.coveragePercentage || "N/A"}
            </p>
            <p>
              <strong>Syllabus Coverage:</strong>{" "}
              {selectedCourse.syllabusCoverage || "N/A"}
            </p>
            <p>
              <strong>Units Completed:</strong>{" "}
              {selectedCourse.unitsCompleted || "N/A"}
            </p>
            <p>
              <strong>Deviation Reasons:</strong>{" "}
              {selectedCourse.deviationReasons || "N/A"}
            </p>
            <button
              onClick={() => setSelectedCourse(null)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
