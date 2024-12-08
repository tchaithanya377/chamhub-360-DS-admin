import React, { useState } from "react"; 
import * as XLSX from "xlsx";
import { db } from "../firebase"; // Adjust the path to your Firebase configuration file
import { doc, collection, addDoc } from "firebase/firestore";

const AddCourse = () => {
  const [excelData, setExcelData] = useState([]);
  const [formData, setFormData] = useState({
    department: "Computer Science & Engineering (Data Science)",
    courseName: "",
    courseCode: "",
    instructor: "",
    year: "",
    section: "",
    actualHours: "",
    deviationReasons: "",
    leavesAvailed: "",
    cls: "",
    ods: "",
    permissions: "",
    unitsCompleted: "",
    syllabusCoverage: "",
    coveragePercentage: "",
  });

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Map the data to the expected fields
      const mappedData = jsonData.slice(1).map((row, index) => {
        const mappedRow = {
          department: row[0] || "",
          year: row[1] || "",
          section: row[2] || "",
          courseName: row[3] || "",
          courseCode: row[4] || "",
          instructor: row[5] || "",
          actualHours: row[6] || "",
          deviationReasons: row[7] || "",
          leavesAvailed: row[8] || "",
          cls: row[9] || "",
          ods: row[10] || "",
          permissions: row[11] || "",
          unitsCompleted: row[12] || "",
          syllabusCoverage: row[13] || "",
          coveragePercentage: row[14] || "",
        };

        // Debug invalid rows
        if (
          !mappedRow.department &&
          !mappedRow.year &&
          !mappedRow.section &&
          !mappedRow.courseName &&
          !mappedRow.courseCode
        ) {
          console.warn(`Invalid row at index ${index}:`, mappedRow);
          return null;
        }
        return mappedRow;
      });

      // Filter out null values
      const validData = mappedData.filter((row) => row !== null);
      console.log("Validated Excel Data:", validData); // Debugging log
      setExcelData(validData);
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadExcelDataToFirebase = async () => {
    const promises = excelData.map(async (row) => {
      const sectionRef = doc(
        db,
        "courses",
        row.department,
        "years",
        row.year,
        "sections",
        row.section
      );
      const courseCollection = collection(sectionRef, "courseDetails");
      await addDoc(courseCollection, row);
    });
    await Promise.all(promises);
    alert("Excel data uploaded successfully!");
    setExcelData([]);
  };

  // Handle manual form submission
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { department, year, section, ...courseDetails } = formData;

    if (!department || !year || !section) {
      alert("Please fill in all required fields (department, year, section)");
      return;
    }

    const sectionRef = doc(
      db,
      "courses",
      department,
      "years",
      year,
      "sections",
      section
    );
    const courseCollection = collection(sectionRef, "courseDetails");

    await addDoc(courseCollection, courseDetails);
    alert("Manual data added successfully!");
    setFormData({
      department: "Computer Science & Engineering (Data Science)",
      year: "",
      section: "",
      courseName: "",
      courseCode: "",
      instructor: "",
      actualHours: "",
      deviationReasons: "",
      leavesAvailed: "",
      cls: "",
      ods: "",
      permissions: "",
      unitsCompleted: "",
      syllabusCoverage: "",
      coveragePercentage: "",
    });
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Add Course</h1>

      {/* Excel Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block mb-4 border p-2 rounded w-full"
        />
        {excelData.length > 0 && (
          <button
            onClick={uploadExcelDataToFirebase}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Excel Data
          </button>
        )}
      </div>

      {/* Manual Data Entry Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Add Course Manually</h2>
        <form onSubmit={handleFormSubmit} className="bg-white p-5 rounded shadow">
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleFormChange}
            placeholder="Department"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleFormChange}
            placeholder="Year"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleFormChange}
            placeholder="Section"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleFormChange}
            placeholder="Course Name"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleFormChange}
            placeholder="Course Code"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleFormChange}
            placeholder="Instructor Name"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="actualHours"
            value={formData.actualHours}
            onChange={handleFormChange}
            placeholder="Actual Hours"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="deviationReasons"
            value={formData.deviationReasons}
            onChange={handleFormChange}
            placeholder="Deviation Reasons"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="leavesAvailed"
            value={formData.leavesAvailed}
            onChange={handleFormChange}
            placeholder="Leaves Availed"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="cls"
            value={formData.cls}
            onChange={handleFormChange}
            placeholder="CLs"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="ods"
            value={formData.ods}
            onChange={handleFormChange}
            placeholder="ODs"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="permissions"
            value={formData.permissions}
            onChange={handleFormChange}
            placeholder="Permissions"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="unitsCompleted"
            value={formData.unitsCompleted}
            onChange={handleFormChange}
            placeholder="Units Completed"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="syllabusCoverage"
            value={formData.syllabusCoverage}
            onChange={handleFormChange}
            placeholder="Syllabus Coverage"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="coveragePercentage"
            value={formData.coveragePercentage}
            onChange={handleFormChange}
            placeholder="Coverage Percentage"
            className="block mb-3 p-2 border rounded w-full"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
