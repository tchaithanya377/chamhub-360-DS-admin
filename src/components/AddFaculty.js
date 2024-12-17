import React, { useState } from "react";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import * as XLSX from "xlsx";

const AddFaculty = () => {
  const initialFields = {
    sno: "",
    name: "",
    designation: "",
    dateOfJoining: "",
    qualifications: "",
    contactNo: "",
    areaOfSpecialization: "",
    pan: "",
    aadhaar: "",
    emailID: "",
    password: "", // For Authentication
    dob: "",
    empID: "",
    experience: "",
    acadExperience: "",
    industryExperience: "",
    promotionDate: "",
    specialization: "",
    degr: "",
    degrDate: "",
    depRole: "",
    state: "",
    religion: "",
    caste: "",
    subCaste: "",
    bloodGroup: "",
    origin: "",
    localAddress: "",
    permAddress: "",
    bankName: "",
    bankAccountNumber: "",
    branch: "",
    ifsc: "",
    bankAddr: "",
    spouseName: "",
    relationshipWithSpouse: "",
    fatherName: "",
    motherName: "",
  };

  const [facultyData, setFacultyData] = useState(initialFields);
  const [excelData, setExcelData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { emailID, empID } = facultyData;
    if (!emailID || !empID) return alert("Emp ID and Email ID are required.");
    if (!validateEmail(emailID)) return alert("Please enter a valid Email ID.");

    const auth = getAuth();
    const defaultPassword = "Mits@1234";
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, emailID, defaultPassword);
      const userId = userCredential.user.uid;

      const q = query(collection(db, "faculty"), where("empID", "==", empID));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return alert("Faculty Emp ID already exists.");

      await setDoc(doc(db, "faculty", userId), {
        ...facultyData,
        uid: userId,
        password: defaultPassword, 
      });

      setUploadStatus("Faculty added successfully!");
      setFacultyData(initialFields);
    } catch (error) {
      console.error("Error adding faculty:", error);
      setUploadStatus(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return alert("Please upload a valid Excel file.");

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
        header: Object.keys(initialFields),
      }).filter((row) => Object.values(row).some((value) => value !== ""));

      if (jsonData.length === 0) return alert("No valid data found in the Excel file.");
      setExcelData(jsonData);
      setUploadStatus(`Excel file processed. ${jsonData.length} entries found.`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    const auth = getAuth();
    const defaultPassword = "Mits@1234";
    let successCount = 0;
    let skipCount = 0;
    setLoading(true);

    for (const faculty of excelData) {
      const { empID, emailID } = faculty;
      if (!emailID || !validateEmail(emailID) || !empID) {
        skipCount++;
        continue;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailID, defaultPassword);
        const userId = userCredential.user.uid;

        const q = query(collection(db, "faculty"), where("empID", "==", empID));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          skipCount++;
          continue;
        }

        await setDoc(doc(db, "faculty", userId), {
          ...faculty,
          uid: userId,
          password: defaultPassword,
        });

        successCount++;
        setUploadStatus(`Uploading... ${successCount} added, ${skipCount} skipped.`);
      } catch (error) {
        console.error("Error uploading faculty:", error);
        skipCount++;
      }
    }

    setUploadStatus(`Upload complete: ${successCount} added, ${skipCount} skipped.`);
    setLoading(false);
    setExcelData([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Add Faculty</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(initialFields).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-600">
                {field.replace(/([A-Z])/g, " $1").toUpperCase()}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={facultyData[field]}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                required={field === "empID" || field === "emailID"}
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`mt-6 px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Adding Faculty..." : "Add Faculty"}
        </button>
      </form>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full mb-4 border rounded-lg p-2"
        />
        <button
          onClick={handleUpload}
          disabled={excelData.length === 0 || loading}
          className={`px-4 py-2 rounded-lg text-white ${
            excelData.length === 0 || loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload Bulk Data"}
        </button>
        {uploadStatus && (
          <p className="mt-4 text-sm text-gray-700 bg-gray-200 p-2 rounded-md">
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddFaculty;
