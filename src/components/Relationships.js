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

  // Fetch Data Based on Year and Section
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear || !selectedSection) {
        console.log("Year or Section not selected yet.");
        return;
      }

      try {
        // Normalize Section to match Firestore structure
        const normalizedSection = selectedSection.toUpperCase();

        // Fetch students
        const studentsSnapshot = await getDocs(
          collection(db, `students/years/${selectedYear}/sections/${normalizedSection}`)
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
        const coursesPath = `courses/Computer Science & Engineering (Data Science)/years/${selectedYear}/sections/${normalizedSection}/courseDetails`;
        console.log(`Fetching courses from: ${coursesPath}`);
        const coursesSnapshot = await getDocs(collection(db, coursesPath));
        if (!coursesSnapshot.empty) {
          const coursesData = coursesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(coursesData);
        } else {
          console.warn(`No courses found for Year: ${selectedYear}, Section: ${normalizedSection}`);
          setCourses([]); // Reset courses if none exist
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedYear, selectedSection]);

  const assignRelationships = async () => {
    if (!selectedYear || !selectedSection || !selectedCourse || !selectedFaculty) {
      alert("Please select year, section, course, and faculty.");
      return;
    }

    try {
      const selectedCourseDoc = courses.find((course) => course.id === selectedCourse);
      const assignedFacultyDoc = faculty.find((fac) => fac.id === selectedFaculty);

      if (selectedCourseDoc.instructor) {
        alert("This course already has a faculty assigned. Please choose another course.");
        return;
      }

      // Assign the selected course to students without duplicates
      for (const student of students) {
        const studentRef = doc(db, `students/years/${selectedYear}/sections/${selectedSection}/${student.id}`);
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

      // Update the course to set the selected faculty and students
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
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Assign Relationships by Year and Section
        </h1>

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
      </div>
    </div>
  );
}

export default Relationships;
