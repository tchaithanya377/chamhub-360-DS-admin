import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Fetch Courses and Instructors from Firebase
  useEffect(() => {
    const fetchCoursesAndInstructors = async () => {
      try {
        const years = ["I", "II", "III", "IV"];
        const sections = ["A", "B", "C"];

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
    setSelectedCourse(course);
    setIsViewing(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditing(true);
  };

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course: ${course.courseName}?`)) {
      try {
        const courseRef = doc(
          db,
          `courses/Computer Science & Engineering (Data Science)/years/${course.year}/sections/${course.section}/courseDetails/${course.id}`
        );
        await deleteDoc(courseRef);

        setCourses((prevCourses) =>
          prevCourses.filter((existingCourse) => existingCourse.id !== course.id)
        );
        alert("Course deleted successfully!");
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete the course. Please try again.");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCourse) return;

    try {
      const courseRef = doc(
        db,
        `courses/Computer Science & Engineering (Data Science)/years/${selectedCourse.year}/sections/${selectedCourse.section}/courseDetails/${selectedCourse.id}`
      );
      await updateDoc(courseRef, {
        courseName: selectedCourse.courseName,
        courseCode: selectedCourse.courseCode,
        coveragePercentage: selectedCourse.coveragePercentage || "N/A",
        syllabusCoverage: selectedCourse.syllabusCoverage || "N/A",
        unitsCompleted: selectedCourse.unitsCompleted || "N/A",
        deviationReasons: selectedCourse.deviationReasons || "N/A",
      });

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === selectedCourse.id ? selectedCourse : course
        )
      );

      setIsEditing(false);
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to update course. Please try again.");
    }
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
                <strong>Year:</strong> {course.year}
              </p>
              <p className="text-gray-600">
                <strong>Section:</strong> {course.section}
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
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete
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

      {/* View Modal */}
      {isViewing && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Course Details</h2>
            <p>
              <strong>Course Name:</strong> {selectedCourse.courseName}
            </p>
            <p>
              <strong>Course Code:</strong> {selectedCourse.courseCode}
            </p>
            <p>
              <strong>Year:</strong> {selectedCourse.year}
            </p>
            <p>
              <strong>Section:</strong> {selectedCourse.section}
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
              onClick={() => setIsViewing(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
{isEditing && selectedCourse && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      <div className="space-y-4">
        {Object.entries(selectedCourse).map(([key, value]) => {
          // Exclude fields that shouldn't be edited
          if (key === "id" || key === "year" || key === "section") {
            return (
              <div key={key}>
                <label className="block font-semibold mb-1 capitalize">
                  {key === "year" ? "Year" : key === "section" ? "Section" : key}
                </label>
                <input
                  type="text"
                  value={value}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            );
          }
          return (
            <div key={key}>
              <label className="block font-semibold mb-1 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) =>
                  setSelectedCourse((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIsEditing(false)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Courses;
