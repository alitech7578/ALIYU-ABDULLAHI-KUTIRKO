import React, { useState } from 'react';
import { Student } from '../types';
import { PlusIcon, UploadIcon } from './IconComponents';

interface StudentFormProps {
  onAddStudent: (student: Student) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onAddStudent }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError('Image size should not exceed 2MB.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setPhotoBase64(base64String);
          setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !surname || !email || !department || !registrationNumber || !photoBase64) {
      setError('All fields, including photo, are required.');
      return;
    }
    setError('');
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin', // Hardcoded as there are no users
      firstName, middleName, surname, email, department, registrationNumber,
      photo: photoBase64,
    };

    onAddStudent(newStudent);

    // Reset form
    setFirstName('');
    setMiddleName('');
    setSurname('');
    setEmail('');
    setDepartment('');
    setRegistrationNumber('');
    setPhotoBase64('');
    setPhotoPreview('');
  };

  const InputField = ({ id, label, type, value, onChange, placeholder, isRequired = true }: { id: string, label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, isRequired?: boolean }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-muted mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={isRequired}
        className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4 border-t border-brand-secondary/50 pt-6">
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      
      <div>
        <label className="block text-sm font-medium text-brand-muted mb-2">
            Passport Photo
        </label>
        <div className="mt-2 flex items-center gap-x-4">
            {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
            ) : (
                <div className="h-24 w-24 rounded-full bg-brand-secondary flex items-center justify-center">
                    <UploadIcon className="h-10 w-10 text-brand-muted" />
                </div>
            )}
            <div className="flex-1">
                 <input 
                    id="student-photo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoChange}
                />
                <label 
                    htmlFor="student-photo-upload"
                    className="cursor-pointer rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                >
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                <p className="text-xs leading-5 text-brand-muted mt-2">PNG, JPG, WEBP up to 2MB.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField id="firstName" label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g., Jane" />
        <InputField id="middleName" label="Middle Name (Optional)" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="e.g., Marie" isRequired={false} />
        <InputField id="surname" label="Surname" type="text" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g., Smith" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="email" label="Student Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student.email@example.com" />
        <InputField id="registrationNumber" label="Registration Number" type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g., 2024/CS/001" />
      </div>
      <div className="grid grid-cols-1">
        <InputField id="department" label="Department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Computer Science" />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold text-lg"
        >
          <PlusIcon className="w-6 h-6" />
          <span>Add Student Record</span>
        </button>
      </div>
    </form>
  );
};

export default StudentForm;