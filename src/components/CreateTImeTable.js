import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [combinedPeriods, setCombinedPeriods] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const facultyData = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaculty(facultyData);

        if (selectedYear && selectedSection) {
          const coursesPath = `courses/Computer Science & Engineering (Data Science)/years/${selectedYear}/sections/${selectedSection}/courseDetails`;
          const coursesSnapshot = await getDocs(collection(db, coursesPath));
          const coursesData = coursesSnapshot.docs.map((doc) => ({
            id: doc.id,
            courseName: doc.data().courseName || "Unnamed Course", // Ensure courseName is fetched
            ...doc.data(),
          }));
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedYear, selectedSection]);

  useEffect(() => {
    if (selectedCourse) {
      const assignedFaculty = faculty.filter((fac) =>
        fac.courses?.includes(selectedCourse)
      );
      setFilteredFaculty(assignedFaculty);
    } else {
      setFilteredFaculty([]);
    }
  }, [selectedCourse, faculty]);

  const handleAddEntry = () => {
    if (!selectedDay || !selectedPeriod || !selectedCourse || !selectedFaculty) {
      alert("Please fill all fields correctly.");
      return;
    }

    // Find the course object based on the selectedCourse (document ID)
    const course = courses.find((c) => c.id === selectedCourse);

    const updatedTimetable = { ...timetable };
    if (!updatedTimetable[selectedDay]) updatedTimetable[selectedDay] = {};
    updatedTimetable[selectedDay][selectedPeriod] = {
      course: course?.courseName || "Unknown Course", // Save courseName instead of ID
      faculty: selectedFaculty,
      combinedPeriods: combinedPeriods.map((p) => parseInt(p)),
    };

    setTimetable(updatedTimetable);
    setSelectedCourse("");
    setSelectedFaculty("");
    setCombinedPeriods([]);
  };

  const handleSaveTimetable = async () => {
    if (!selectedYear || !selectedSection) {
      alert("Please select a year and section.");
      return;
    }

    try {
      const timetableRef = doc(
        db,
        `timetable/years/${selectedYear}/sections/${selectedSection}/data`
      );
      await setDoc(timetableRef, { timetable });

      const studentsSnapshot = await getDocs(
        collection(db, `students/years/${selectedYear}/sections/${selectedSection}`)
      );

      const studentUpdates = studentsSnapshot.docs.map(async (studentDoc) => {
        const studentRef = doc(
          db,
          `students/years/${selectedYear}/sections/${selectedSection}/${studentDoc.id}`
        );
        await setDoc(
          studentRef,
          { timetable },
          { merge: true }
        );
      });

      const facultyUpdates = Object.values(timetable).flatMap((day) =>
        Object.values(day).map(async (entry) => {
          if (entry.faculty) {
            const facultyDoc = faculty.find((fac) => fac.name === entry.faculty);
            if (facultyDoc) {
              const facultyRef = doc(db, `faculty/${facultyDoc.id}`);
              const facultyTimetableRef = {
                [`timetable/${selectedYear}/${selectedSection}`]: timetable,
              };
              await setDoc(facultyRef, facultyTimetableRef, { merge: true });
            }
          }
        })
      );

      await Promise.all([...studentUpdates, ...facultyUpdates]);

      alert("Timetable saved and linked successfully!");
    } catch (error) {
      console.error("Error saving timetable:", error);
      alert("Failed to save timetable.");
    }
  };

  const toggleCombinePeriod = (period) => {
    setCombinedPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period]
    );
  };

  const renderPreviewTable = () => (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Preview Timetable
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border border-gray-300 text-center">Day</th>
              {periods.map((period) => (
                <th key={period} className="p-3 border border-gray-300 text-center">
                  Period {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="text-center">
                <td className="p-3 border border-gray-300">{day}</td>
                {periods.map((period) => (
                  <td key={period} className="p-3 border border-gray-300">
                    {timetable[day]?.[period]?.course || "-"}
                    <br />
                    <span className="text-sm text-gray-600">
                      {timetable[day]?.[period]?.faculty || ""}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Create Timetable
      </h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Select Year & Section
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Year</label>
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
            <label className="block font-medium text-gray-700 mb-2">Section</label>
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
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add Timetable Entry
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Day --</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Period --</option>
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Combine Periods
            </label>
            <div className="flex flex-wrap">
              {periods.map((period) => (
                <label key={period} className="mr-3">
                  <input
                    type="checkbox"
                    value={period}
                    checked={combinedPeriods.includes(period)}
                    onChange={() => toggleCombinePeriod(period)}
                  />
                  Period {period}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Faculty</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              disabled={!selectedCourse}
            >
              <option value="">-- Select Faculty --</option>
              {filteredFaculty.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={handleAddEntry}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Add Entry
          </button>
        </div>
      </div>

      {renderPreviewTable()}

      <div className="text-center mt-6">
        <button
          onClick={handleSaveTimetable}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Save Timetable
        </button>
      </div>
    </div>
  );
};

export default Timetable;
