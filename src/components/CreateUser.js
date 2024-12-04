import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import Firebase configuration
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    profileLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // Fetch faculty list from Firestore
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const facultySnapshot = await getDocs(collection(db, 'faculty'));
        const facultyData = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Include all document fields
        }));
        setFacultyList(facultyData);
      } catch (error) {
        console.error('Error fetching faculty:', error.message);
        setErrorMessage('Failed to fetch faculty list. Please try again.');
      }
    };

    if (formData.role === 'Faculty') {
      fetchFaculty();
    }
  }, [formData.role]);

  // Auto-fill email when a faculty member is selected
  useEffect(() => {
    if (selectedFaculty) {
      const selected = facultyList.find((faculty) => faculty.id === selectedFaculty);
      if (selected && selected.emailID) {
        setFormData((prev) => ({ ...prev, email: selected.emailID }));
      }
    } else {
      setFormData((prev) => ({ ...prev, email: '' }));
    }
  }, [selectedFaculty, facultyList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'role' && value !== 'Faculty') {
      setSelectedFaculty('');
      setFormData((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Validate faculty selection if the role is Faculty
      if (formData.role === 'Faculty' && !selectedFaculty) {
        throw new Error('Please select a faculty member.');
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const userId = userCredential.user.uid;

      if (formData.role === 'Faculty') {
        // Fetch existing faculty data
        const selectedFacultyData = facultyList.find(
          (faculty) => faculty.id === selectedFaculty
        );

        if (!selectedFacultyData) {
          throw new Error('Selected faculty not found in the database.');
        }

        // Delete the old faculty document
        await deleteDoc(doc(db, 'faculty', selectedFaculty));

        // Create a new faculty document with UID as the document ID
        const facultyRef = doc(db, 'faculty', userId); // Use UID as document ID
        await setDoc(facultyRef, {
          ...selectedFacultyData, // Copy the existing faculty details
          userId, // Add UID to the faculty document
        });

        setSuccessMessage(`Faculty user created and linked successfully!`);
      } else {
        // Save non-faculty user data to Firestore
        const userData = {
          role: formData.role,
          email: formData.email,
          profileLink: formData.profileLink,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', userId), userData);

        setSuccessMessage('User account created successfully!');
      }

      // Reset the form
      setFormData({
        email: '',
        password: '',
        role: '',
        profileLink: '',
      });
      setSelectedFaculty('');
    } catch (error) {
      console.error('Error creating user:', error.message);
      setErrorMessage(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create User Account</h1>

      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Admin">Admin</option>
        </select>

        {formData.role === 'Faculty' && (
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select Faculty</option>
            {facultyList.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          readOnly={formData.role === 'Faculty'}
          onChange={handleInputChange}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
          className="border p-2 rounded w-full"
        />

        {formData.role !== 'Faculty' && (
          <input
            type="text"
            name="profileLink"
            value={formData.profileLink}
            onChange={handleInputChange}
            placeholder="Profile Link (optional)"
            className="border p-2 rounded w-full"
          />
        )}

        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
