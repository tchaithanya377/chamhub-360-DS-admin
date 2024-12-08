import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Relationships() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch Data Based on Year and Section
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear || !selectedSection) {
        console.log("Year or Section not selected yet.");
        return;
      }

      setIsLoading(true); // Start loading

      try {
        const normalizedSection = selectedSection.toUpperCase();

        // Fetch students
        const studentsSnapshot = await getDocs(
          collection(db, `students/${selectedYear}/${normalizedSection}`)
        );
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);

        // Fetch faculty
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const facultyData = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaculty(facultyData);

        // Fetch courses
        const coursesSnapshot = await getDocs(
          collection(
            db,
            `courses/Computer Science & Engineering (Data Science)/years/${selectedYear}/sections/${normalizedSection}/courseDetails`
          )
        );
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setIsLoading(false); // Stop loading
    };

    fetchData();
  }, [selectedYear, selectedSection]);

  const assignRelationships = async () => {
    if (!selectedYear || !selectedSection || !selectedCourse || !selectedFaculty) {
      alert("Please select year, section, course, and faculty.");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const selectedCourseDoc = courses.find((course) => course.id === selectedCourse);
      const assignedFacultyDoc = faculty.find((fac) => fac.id === selectedFaculty);

      if (selectedCourseDoc.instructor) {
        alert("This course already has a faculty assigned. Please choose another course.");
        setIsLoading(false);
        return;
      }

      // Assign the selected course to students without duplicates
      for (const student of students) {
        const studentRef = doc(
          db,
          `students/${selectedYear}/${selectedSection}/${student.id}`
        );
        const updatedCourses = student.courses
          ? [...new Set([...student.courses, selectedCourse])]
          : [selectedCourse];
        await updateDoc(studentRef, {
          courses: updatedCourses,
        });
      }

      // Assign the selected course to the selected faculty without duplicates
      const facultyRef = doc(db, `faculty/${selectedFaculty}`);
      const updatedFacultyCourses = assignedFacultyDoc.courses
        ? [...new Set([...assignedFacultyDoc.courses, selectedCourse])]
        : [selectedCourse];
      await updateDoc(facultyRef, {
        courses: updatedFacultyCourses,
      });

      // Update the course with assigned faculty and students
      const courseRef = doc(
        db,
        `courses/Computer Science & Engineering (Data Science)/years/${selectedYear}/sections/${selectedSection}/courseDetails/${selectedCourse}`
      );
      await updateDoc(courseRef, {
        instructor: selectedFaculty,
        students: students.map((student) => student.id),
      });

      alert("Relationships successfully assigned!");
    } catch (error) {
      console.error("Error assigning relationships:", error);
      alert("An error occurred while assigning relationships.");
    }

    setIsLoading(false); // Stop loading
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Assign Faculty to Course and Students
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-lg text-gray-700">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 bg-white shadow-lg rounded-lg p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Year</h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Year --</option>
                <option value="IV">IV</option>
                <option value="III">III</option>
                <option value="II">II</option>
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Section</h2>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Section --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Course</h2>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={courses.length === 0}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Faculty</h2>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={faculty.length === 0}
              >
                <option value="">-- Select Faculty --</option>
                {faculty.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.designation})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={assignRelationships}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
            >
              Assign Relationships
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relationships;
