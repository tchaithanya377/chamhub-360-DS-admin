import React, { useState } from "react";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, query, where, getDocs, setDoc, doc } from "firebase/firestore";
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
    password: "", // Added for Authentication
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { emailID, empID } = facultyData;
  
    if (!emailID || !empID) {
      alert("Emp ID and Email ID are required.");
      return;
    }
  
    if (!validateEmail(emailID)) {
      alert("Please enter a valid Email ID.");
      return;
    }
  
    const auth = getAuth();
    const defaultPassword = "Mits@1234"; // Default password
  
    try {
      // Add to Firebase Authentication with default password
      const userCredential = await createUserWithEmailAndPassword(auth, emailID, defaultPassword);
      const userId = userCredential.user.uid;
  
      // Check for duplicate empID
      const facultyCollection = collection(db, "faculty");
      const q = query(facultyCollection, where("empID", "==", empID));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        alert("Faculty Emp ID already exists.");
        return;
      }
  
      // Add to Firestore
      await setDoc(doc(facultyCollection, emailID), {
        ...facultyData,
        password: defaultPassword, // Save default password for reference
        uid: userId, // Save Auth UID
      });
  
      alert("Faculty added successfully with default password!");
      setFacultyData(initialFields);
    } catch (error) {
      console.error("Error adding faculty:", error.message);
      alert(`Failed to add faculty: ${error.message}`);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please upload a valid Excel file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: "",
          header: Object.keys(initialFields),
        });

        const processedData = jsonData.filter((row) =>
          Object.values(row).some((value) => value !== "")
        );

        if (processedData.length === 0) {
          alert("No valid data found in the Excel file.");
          return;
        }

        setExcelData(processedData);
        alert(`Excel file processed successfully! Found ${processedData.length} valid entries.`);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("Failed to process the Excel file. Please check the format.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading Excel file:", error);
      alert("Failed to read the Excel file.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    const auth = getAuth();
    const facultyCollection = collection(db, "faculty");
    const defaultPassword = "Mits@1234"; // Default password for bulk upload
    let successCount = 0;
    let skipCount = 0;
  
    try {
      for (const faculty of excelData) {
        const { empID, emailID } = faculty;
  
        if (!emailID || !validateEmail(emailID) || !empID) {
          console.log("Skipping entry due to missing/invalid fields:", faculty);
          skipCount++;
          continue;
        }
  
        try {
          // Add to Firebase Authentication with default password
          const userCredential = await createUserWithEmailAndPassword(auth, emailID, defaultPassword);
          const userId = userCredential.user.uid;
  
          // Check for duplicate empID
          const q = query(facultyCollection, where("empID", "==", empID.trim()));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            console.log(`Faculty with Emp ID ${empID} already exists.`);
            skipCount++;
            continue;
          }
  
          // Add to Firestore
          await addDoc(facultyCollection, {
            ...faculty,
            password: defaultPassword, // Save default password for reference
            uid: userId,
          });
  
          successCount++;
          setUploadStatus(`Uploading... ${successCount} added, ${skipCount} skipped.`);
        } catch (authError) {
          console.error("Failed to add to Authentication:", authError.message);
          skipCount++;
        }
      }
  
      alert(`Upload complete!\nSuccessfully added: ${successCount}\nSkipped entries: ${skipCount}`);
      setExcelData([]);
      setUploadStatus("");
    } catch (error) {
      console.error("Error uploading faculty data:", error);
      alert("Failed to upload faculty data. Please try again.");
      setUploadStatus("");
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Faculty</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(initialFields).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, " $1").toLowerCase()}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={facultyData[field]}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                required={["empID", "emailID", "password"].includes(field)}
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Faculty
        </button>
      </form>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={excelData.length === 0}
          className={`px-4 py-2 rounded-lg text-white ${
            excelData.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Upload Bulk Data
        </button>
        {uploadStatus && <p className="mt-4 text-sm text-gray-700">{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default AddFaculty;
