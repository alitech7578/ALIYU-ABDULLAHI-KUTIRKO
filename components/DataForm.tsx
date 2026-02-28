import React, { useState, useEffect } from 'react';
import { DataRecord, MarriedStatus } from '../types';
import { PlusIcon, UploadIcon, SpinnerIcon, CheckCircleIcon } from './IconComponents';
import { nigeriaStates } from '../data/nigeria-data';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DataFormProps {
  onSubmitRecord: (record: DataRecord) => void;
  recordToEdit: DataRecord | null;
  saveStatus: 'idle' | 'saving' | 'saved';
}

const marriedStatuses: MarriedStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];
const bloodGroups: string[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

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
  name: '',
  middleName: '',
  surname: '',
  email: '',
  department: '',
  spNumber: '',
  rank: '',
  state: '',
  lg: '',
  marriedStatus: 'Single' as MarriedStatus,
  bloodGroup: '',
  phoneNumber: '',
  photo: '',
};

type FormState = typeof initialFormState;

const DataForm: React.FC<DataFormProps> = ({ onSubmitRecord, recordToEdit, saveStatus }) => {
  const isEditing = !!recordToEdit;
  const [draft, setDraft] = useLocalStorage<FormState>('staff-form-draft', initialFormState);

  const [fields, setFields] = useState<FormState>(() => {
    if (isEditing) {
      return {
        name: recordToEdit.name,
        middleName: recordToEdit.middleName,
        surname: recordToEdit.surname,
        email: recordToEdit.email,
        department: recordToEdit.department,
        spNumber: recordToEdit.spNumber,
        rank: recordToEdit.rank,
        state: recordToEdit.state,
        lg: recordToEdit.lg,
        marriedStatus: recordToEdit.marriedStatus,
        bloodGroup: recordToEdit.bloodGroup,
        phoneNumber: recordToEdit.phoneNumber,
        photo: recordToEdit.photo || '',
      };
    }
    return draft;
  });
  
  const [error, setError] = useState('');
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);

  // Update draft in local storage when fields change in 'add new' mode
  useEffect(() => {
    if (!isEditing) {
      setDraft(fields);
    }
  }, [fields, isEditing, setDraft]);

  useEffect(() => {
    if (fields.state) {
      setLgaOptions(nigeriaStates[fields.state] || []);
    } else {
      setLgaOptions([]);
    }
  }, [fields.state]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFields = { ...fields, [name]: value };

    // If state changes, reset LG
    if (name === 'state') {
        updatedFields.lg = '';
    }

    setFields(updatedFields);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setError('Photo size must be less than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFields(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.surname || !fields.email || !fields.state || !fields.lg || !fields.phoneNumber || !fields.marriedStatus || !fields.department || !fields.spNumber || !fields.rank || !fields.bloodGroup) {
      setError('All fields are required.');
      return;
    }
    setError('');
    
    if (recordToEdit) {
       const updatedRecord: DataRecord = {
        ...recordToEdit,
        ...fields,
      };
      onSubmitRecord(updatedRecord);
    } else {
      const newRecord: DataRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin', // Hardcoded as there are no users
        ...fields
      };
      onSubmitRecord(newRecord);
      setDraft(initialFormState); // Clear draft after submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4 border-t border-brand-secondary/50 pt-6">
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-secondary rounded-xl bg-brand-primary/30">
        <div className="relative w-32 h-32 mb-4 group">
          {fields.photo ? (
            <img src={fields.photo} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-brand-accent shadow-lg" />
          ) : (
            <div className="w-full h-full bg-brand-secondary rounded-full flex items-center justify-center border-4 border-brand-secondary shadow-inner">
              <UploadIcon className="w-12 h-12 text-brand-muted" />
            </div>
          )}
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
          >
            <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
          </label>
        </div>
        <p className="text-sm text-brand-muted">Upload a professional passport photo (Max 1MB)</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField id="name" label="First Name" type="text" value={fields.name} onChange={handleChange} placeholder="e.g., John" />
        <InputField id="middleName" label="Middle Name (Optional)" type="text" value={fields.middleName} onChange={handleChange} placeholder="e.g., Quincy" isRequired={false} />
        <InputField id="surname" label="Surname" type="text" value={fields.surname} onChange={handleChange} placeholder="e.g., Doe" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="email" label="Associated Email" type="email" value={fields.email} onChange={handleChange} placeholder="contact@example.com" />
        <InputField id="phoneNumber" label="Phone Number" type="tel" value={fields.phoneNumber} onChange={handleChange} placeholder="e.g., 08012345678" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField id="department" label="Department" type="text" value={fields.department} onChange={handleChange} placeholder="e.g., Operations" />
        <InputField id="spNumber" label="SP Number" type="text" value={fields.spNumber} onChange={handleChange} placeholder="e.g., SP12345" />
        <InputField id="rank" label="Rank" type="text" value={fields.rank} onChange={handleChange} placeholder="e.g., Officer" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-brand-muted mb-2">
            State
          </label>
          <select
            id="state"
            name="state"
            value={fields.state}
            onChange={handleChange}
            required
            className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors"
          >
            <option value="" disabled>Select a State</option>
            {Object.keys(nigeriaStates).sort().map((stateName) => (
              <option key={stateName} value={stateName}>{stateName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lg" className="block text-sm font-medium text-brand-muted mb-2">
            Local Government
          </label>
          <select
            id="lg"
            name="lg"
            value={fields.lg}
            onChange={handleChange}
            disabled={!fields.state}
            required
            className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>Select a Local Government</option>
            {lgaOptions.sort().map((lgaName) => (
              <option key={lgaName} value={lgaName}>{lgaName}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="marriedStatus" className="block text-sm font-medium text-brand-muted mb-2">
            Marital Status
          </label>
          <select
            id="marriedStatus"
            name="marriedStatus"
            value={fields.marriedStatus}
            onChange={handleChange}
            required
            className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors"
          >
            {marriedStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bloodGroup" className="block text-sm font-medium text-brand-muted mb-2">
            Blood Group
          </label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={fields.bloodGroup}
            onChange={handleChange}
            required
            className="block w-full px-4 py-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors"
          >
            <option value="" disabled>Select a Blood Group</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className="flex items-center justify-center space-x-2 w-full md:w-auto min-w-[200px] px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold text-lg disabled:bg-brand-accent/70 disabled:cursor-not-allowed"
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
              <span>{recordToEdit ? 'Update Record' : 'Add Record'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DataForm;