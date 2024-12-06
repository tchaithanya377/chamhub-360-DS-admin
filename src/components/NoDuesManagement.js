import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase"; // Your Firebase configuration

const NoDuesPage = () => {
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const academicYears = ["I", "II", "III", "IV"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    // No initialization required here
  }, []);

  const fetchData = async () => {
    if (!academicYear || !section) {
      setError("Please select both academic year and section.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Query the latest document in the specified collection
      const collectionPath = `/noDues/${academicYear}/${section}`;
      const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        const documentData = latestDoc.data();

        if (documentData && documentData.students) {
          // Process the student data if available
          const enrichedData = documentData.students.map((student, index) => ({
            ...student,
            rollNo: student.rollNo || `N/A (${index + 1})`, // Ensure roll number fallback
          }));

          setData(
            enrichedData.sort((a, b) =>
              sortOrder === "asc"
                ? a.rollNo.localeCompare(b.rollNo)
                : b.rollNo.localeCompare(a.rollNo)
            )
          );
        } else {
          setError("No student data found in the latest document.");
          setData([]);
        }
      } else {
        setError("No data found for the selected year and section.");
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    }

    setIsLoading(false);
  };

  const handleFetchClick = () => {
    fetchData();
  };

  const handleSortClick = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    setData((prevData) =>
      [...prevData].sort((a, b) =>
        sortOrder === "asc"
          ? b.rollNo.localeCompare(a.rollNo)
          : a.rollNo.localeCompare(b.rollNo)
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 flex flex-col items-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-7xl">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          No Dues Data
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Academic Year:
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Year</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Section:
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleFetchClick}
            disabled={isLoading}
            className={`w-full p-3 rounded-md text-white font-semibold ${
              isLoading
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isLoading ? "Fetching..." : "Fetch Data"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-center mt-4 text-lg">{error}</p>
        )}

        {data.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Data for Academic Year: {academicYear}, Section: {section}
            </h2>
            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead>
                <tr className="bg-purple-500 text-white text-left">
                  <th className="py-4 px-6 cursor-pointer" onClick={handleSortClick}>
                    Roll No {sortOrder === "asc" ? "↑" : "↓"}
                  </th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((student, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-6">{student.rollNo || "N/A"}</td>
                    <td className="py-3 px-6">{student.name || "N/A"}</td>
                    <td className="py-3 px-6">
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-200 text-green-800">
                        {student.status || "N/A"}
                      </span>
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

export default NoDuesPage;
