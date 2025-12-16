import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { PlusIcon, UploadIcon, SpinnerIcon, CheckCircleIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface StudentFormProps {
  onSubmitStudent: (student: Student) => void;
  studentToEdit: Student | null;
  saveStatus: 'idle' | 'saving' | 'saved';
}

const InputField = ({ id, label, type, value, onChange, placeholder, isRequired = true }: { id: string, label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, isRequired?: boolean }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-muted mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={isRequired}
      className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors"
    />
  </div>
);

const initialFormState = {
  firstName: '',
  middleName: '',
  surname: '',
  email: '',
  school: 'BUSINESS',
  department: '',
  registrationNumber: '',
  expirationDate: '',
  photo: '',
};

type FormState = typeof initialFormState;

const StudentForm: React.FC<StudentFormProps> = ({ onSubmitStudent, studentToEdit, saveStatus }) => {
  const isEditing = !!studentToEdit;
  const [draft, setDraft] = useLocalStorage<FormState>('student-form-draft', initialFormState);

  const [fields, setFields] = useState<FormState>(() => {
      if (isEditing) {
          return {
              firstName: studentToEdit.firstName,
              middleName: studentToEdit.middleName,
              surname: studentToEdit.surname,
              email: studentToEdit.email,
              school: studentToEdit.school || 'BUSINESS',
              department: studentToEdit.department,
              registrationNumber: studentToEdit.registrationNumber,
              expirationDate: studentToEdit.expirationDate || '',
              photo: studentToEdit.photo,
          };
      }
      return draft;
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');
      
  useEffect(() => {
    setPhotoPreview(fields.photo);
  }, [fields.photo]);

  // Update draft in local storage when fields change in 'add new' mode
  useEffect(() => {
    if (!isEditing) {
      setDraft(fields);
    }
  }, [fields, isEditing, setDraft]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFields(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(''); // Clear previous error

      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file format. Please upload a PNG, JPG, or WEBP image.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image size should not exceed 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setFields(prev => ({ ...prev, photo: base64String }));
          setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.firstName || !fields.surname || !fields.email || !fields.school || !fields.department || !fields.registrationNumber || !fields.expirationDate || !fields.photo) {
      setError('All fields, including photo and expiration date, are required.');
      return;
    }
    setError('');
    
    if (studentToEdit) {
      const updatedStudent: Student = {
        ...studentToEdit,
        ...fields
      };
      onSubmitStudent(updatedStudent);
    } else {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin', // Hardcoded as there are no users
        ...fields
      };
      onSubmitStudent(newStudent);
      setDraft(initialFormState); // Clear draft after submission
    }
  };

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
        <InputField id="firstName" label="First Name" type="text" value={fields.firstName} onChange={handleChange} placeholder="e.g., Jane" />
        <InputField id="middleName" label="Middle Name (Optional)" type="text" value={fields.middleName} onChange={handleChange} placeholder="e.g., Marie" isRequired={false} />
        <InputField id="surname" label="Surname" type="text" value={fields.surname} onChange={handleChange} placeholder="e.g., Smith" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="email" label="Student Email" type="email" value={fields.email} onChange={handleChange} placeholder="student.email@example.com" />
        <InputField id="registrationNumber" label="Registration Number" type="text" value={fields.registrationNumber} onChange={handleChange} placeholder="e.g., 2024/CS/001" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField id="school" label="School" type="text" value={fields.school} onChange={handleChange} placeholder="e.g., School of Sciences" />
        <InputField id="department" label="Department" type="text" value={fields.department} onChange={handleChange} placeholder="e.g., Computer Science" />
        <InputField id="expirationDate" label="Expiration Date" type="date" value={fields.expirationDate} onChange={handleChange} placeholder="" />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className="flex items-center justify-center space-x-2 w-full md:w-auto min-w-[260px] px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold text-lg disabled:bg-brand-accent/70 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? (
            <>
              <SpinnerIcon className="w-6 h-6 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckCircleIcon className="w-6 h-6" />
              <span>Record Saved!</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-6 h-6" />
              <span>{studentToEdit ? 'Update Student Record' : 'Add Student Record'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;