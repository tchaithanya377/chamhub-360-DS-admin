import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const WeeklyTimetable = () => {
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [timetable, setTimetable] = useState({});
  const [days] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  const [periods] = useState([1, 2, 3, 4, 5, 6, 7]);

  const fetchTimetable = async () => {
    if (!year || !section) {
      alert("Please select Year and Section to view the timetable.");
      return;
    }

    try {
      const timetablePath = `/timetable/years/${year}/sections/${section}/data`;
      const timetableDoc = await getDoc(doc(db, timetablePath));

      if (timetableDoc.exists()) {
        const data = timetableDoc.data();
        setTimetable(data.timetable || {});
      } else {
        setTimetable({});
        console.warn("No timetable found for the selected year and section.");
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      alert("Failed to fetch timetable.");
    }
  };

  const renderTimetable = (day, periods) => {
    const dayData = timetable?.[day] || {};
    let renderedPeriods = [];

    for (let period = 1; period <= periods.length; period++) {
      if (dayData[period]?.combinedPeriods) {
        // Check if the period has combined slots
        const combinedPeriods = dayData[period].combinedPeriods;
        const colSpan = combinedPeriods.length;

        renderedPeriods.push(
          <td
            key={`${day}-${period}`}
            colSpan={colSpan}
            className="border border-gray-300 p-2 text-center bg-gray-100"
          >
            <div className="font-bold">{dayData[period].course}</div>
            <div className="text-sm">{dayData[period].faculty}</div>
          </td>
        );

        // Skip rendering the combined periods
        period += colSpan - 1;
      } else if (!renderedPeriods.some((td) => td.key === `${day}-${period}`)) {
        renderedPeriods.push(
          <td
            key={`${day}-${period}`}
            className="border border-gray-300 p-2 text-center"
          ></td>
        );
      }
    }

    return renderedPeriods;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Weekly Timetable Management
        </h1>

        {/* Filter Section */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter Timetable</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Year --</option>
                {["I", "II", "III", "IV"].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Section --</option>
                {["A", "B", "C"].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchTimetable}
                className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Load Timetable
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Weekly Timetable</h2>
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-200">Day</th>
                  {periods.map((period) => (
                    <th key={period} className="border border-gray-300 p-2 bg-gray-200">
                      Period {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="border border-gray-300 p-2 font-semibold">{day}</td>
                    {renderTimetable(day, periods)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimetable;
