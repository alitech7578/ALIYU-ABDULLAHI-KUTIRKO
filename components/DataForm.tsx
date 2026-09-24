import React, { useState, useEffect } from 'react';
import { DataRecord, MarriedStatus } from '../types';
import { PlusIcon, UploadIcon, SpinnerIcon, CheckCircleIcon } from './IconComponents';
import { nigeriaStates } from '../data/nigeria-data';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { compressImage } from '../utils/imageCompressor';

interface DataFormProps {
  onSubmitRecord: (record: DataRecord) => Promise<void> | void;
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
  const [draft, setDraft] = useIndexedDB<FormState>('staff-form-draft', initialFormState);

  const [fields, setFields] = useState<FormState>(() => {
    if (isEditing && recordToEdit) {
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
        photo: recordToEdit.photo,
      };
    }
    return initialFormState;
  });
  
  const [hasHydrated, setHasHydrated] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Hydrate fields with the asynchronous draft once loaded
  useEffect(() => {
    if (!isEditing && draft && !hasHydrated) {
      const hasContent = Object.values(draft).some(val => val !== '');
      if (hasContent) {
        setFields(draft);
      }
      setHasHydrated(true);
    }
  }, [draft, isEditing, hasHydrated]);

  useEffect(() => {
    setPhotoPreview(fields.photo);
  }, [fields.photo]);

  // Update draft in local storage when fields change in 'add new' mode (only after we've hydrated)
  useEffect(() => {
    if (!isEditing && hasHydrated && fields !== initialFormState) {
      setDraft(fields);
    }
  }, [fields, isEditing, setDraft, hasHydrated]);

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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setError('Image size should not exceed 15MB.');
        return;
      }
      try {
        setError('');
        // Automatically compress image into optimized passport size (30-50KB)
        const compressedBase64 = await compressImage(file, 400, 500, 0.8);
        setFields(prev => ({ ...prev, photo: compressedBase64 }));
        setPhotoPreview(compressedBase64);
      } catch (imgErr) {
        console.error('Failed to compress image:', imgErr);
        setError('Failed to process image. Please try another image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim() || !fields.surname.trim()) {
      setError('First Name and Surname are required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setIsSavedSuccess(false);
    
    try {
      if (recordToEdit) {
        const updatedRecord: DataRecord = {
          ...recordToEdit,
          ...fields,
        };
        await onSubmitRecord(updatedRecord);
      } else {
        const newRecord: DataRecord = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
          ...fields
        };
        await onSubmitRecord(newRecord);
        setDraft(initialFormState); // Clear draft after submission
      }
      setIsSavedSuccess(true);
    } catch (submitErr: any) {
      console.error('Error saving staff record:', submitErr);
      setError(submitErr?.message || 'Failed to save record. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4 border-t border-brand-secondary/50 pt-6">
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      
      <div>
        <label className="block text-sm font-medium text-brand-muted mb-2">
            Passport Photo (Optional)
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
                    id="photo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoChange}
                />
                <label 
                    htmlFor="photo-upload"
                    className="cursor-pointer rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                >
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                <p className="text-xs leading-5 text-brand-muted mt-2">PNG, JPG, WEBP up to 2MB.</p>
            </div>
        </div>
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
          disabled={isSubmitting || saveStatus === 'saving' || isSavedSuccess || saveStatus === 'saved'}
          className="flex items-center justify-center space-x-2 w-full md:w-auto min-w-[200px] px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold text-lg disabled:bg-brand-accent/70 disabled:cursor-not-allowed"
        >
          {isSubmitting || saveStatus === 'saving' ? (
            <>
              <SpinnerIcon className="w-6 h-6 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isSavedSuccess || saveStatus === 'saved' ? (
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