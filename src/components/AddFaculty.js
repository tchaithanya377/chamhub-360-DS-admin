import React, { useState } from "react";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!facultyData.empID) {
      alert("Emp ID is required.");
      return;
    }

    try {
      const facultyCollection = collection(db, "faculty");
      const q = query(facultyCollection, where("empID", "==", facultyData.empID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Faculty Emp ID already exists.");
        return;
      }

      await addDoc(facultyCollection, facultyData);
      alert("Faculty added successfully!");
      setFacultyData(initialFields);
    } catch (error) {
      console.error("Error adding faculty:", error.message);
      alert("Failed to add faculty. Please try again.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please upload a valid Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '',
          header: [
            'sno',
            'name',
            'designation',
            'dateOfJoining',
            'qualifications',
            'contactNo',
            'areaOfSpecialization',
            'pan',
            'aadhaar',
            'emailID',
            'dob',
            'empID',
            'experience',
            'acadExperience',
            'industryExperience',
            'promotionDate',
            'specialization',
            'degr',
            'degrDate',
            'depRole',
            'state',
            'religion',
            'caste',
            'subCaste',
            'bloodGroup',
            'origin',
            'localAddress',
            'permAddress',
            'bankName',
            'bankAccountNumber',
            'branch',
            'ifsc',
            'bankAddr',
            'spouseName',
            'relationshipWithSpouse',
            'fatherName',
            'motherName'
          ]
        });

        // Remove header row if present
        const processedData = jsonData.filter(row => {
          // Check if row has actual data
          return Object.values(row).some(value => value !== '');
        });

        if (processedData.length === 0) {
          alert('No valid data found in the Excel file.');
          return;
        }

        // Log the first row to check the data structure
        console.log('Sample row:', processedData[0]);

        setExcelData(processedData);
        alert(`Excel file processed successfully! Found ${processedData.length} valid entries.`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Failed to process the Excel file. Please check the format.');
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading Excel file:', error);
      alert('Failed to read the Excel file.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    try {
      const facultyCollection = collection(db, 'faculty');
      let successCount = 0;
      let skipCount = 0;

      for (const faculty of excelData) {
        // Skip empty rows or rows without empID
        if (!faculty.empID || faculty.empID.trim() === '') {
          console.log('Skipping entry due to missing empID:', faculty);
          skipCount++;
          continue;
        }

        // Check if faculty already exists
        const q = query(facultyCollection, where('empID', '==', faculty.empID));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Clean the data before uploading
          const cleanedFaculty = {
            empID: faculty.empID.trim(),
            name: faculty.name?.trim() || '',
            designation: faculty.designation?.trim() || '',
            dateOfJoining: faculty.dateOfJoining?.trim() || '',
            qualifications: faculty.qualifications?.trim() || '',
            contactNo: faculty.contactNo?.trim() || '',
            areaOfSpecialization: faculty.areaOfSpecialization?.trim() || '',
            pan: faculty.pan?.trim() || '',
            aadhaar: faculty.aadhaar?.trim() || '',
            emailID: faculty.emailID?.trim() || '',
            dob: faculty.dob?.trim() || '',
            experience: faculty.experience?.trim() || '',
            acadExperience: faculty.acadExperience?.trim() || '',
            industryExperience: faculty.industryExperience?.trim() || '',
            promotionDate: faculty.promotionDate?.trim() || '',
            specialization: faculty.specialization?.trim() || '',
            degr: faculty.degr?.trim() || '',
            degrDate: faculty.degrDate?.trim() || '',
            depRole: faculty.depRole?.trim() || '',
            state: faculty.state?.trim() || '',
            religion: faculty.religion?.trim() || '',
            caste: faculty.caste?.trim() || '',
            subCaste: faculty.subCaste?.trim() || '',
            bloodGroup: faculty.bloodGroup?.trim() || '',
            origin: faculty.origin?.trim() || '',
            localAddress: faculty.localAddress?.trim() || '',
            permAddress: faculty.permAddress?.trim() || '',
            bankName: faculty.bankName?.trim() || '',
            bankAccountNumber: faculty.bankAccountNumber?.trim() || '',
            branch: faculty.branch?.trim() || '',
            ifsc: faculty.ifsc?.trim() || '',
            bankAddr: faculty.bankAddr?.trim() || '',
            spouseName: faculty.spouseName?.trim() || '',
            relationshipWithSpouse: faculty.relationshipWithSpouse?.trim() || '',
            fatherName: faculty.fatherName?.trim() || '',
            motherName: faculty.motherName?.trim() || ''
          };

          await addDoc(facultyCollection, cleanedFaculty);
          successCount++;
        }
      }

      alert(`Upload complete!\nSuccessfully added: ${successCount}\nSkipped entries: ${skipCount}`);
      setExcelData([]);
    } catch (error) {
      console.error('Error uploading faculty data:', error);
      alert('Failed to upload faculty data. Please try again.');
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
                required={field === "empID"}
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
      </div>
    </div>
  );
};

export default AddFaculty;