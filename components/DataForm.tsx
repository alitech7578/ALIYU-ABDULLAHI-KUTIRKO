import React, { useState, useEffect } from 'react';
import { DataRecord, MarriedStatus } from '../types';
import { PlusIcon, UploadIcon } from './IconComponents';
import { nigeriaStates } from '../data/nigeria-data';

interface DataFormProps {
  onAddRecord: (record: DataRecord) => void;
}

const marriedStatuses: MarriedStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];
const bloodGroups: string[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const DataForm: React.FC<DataFormProps> = ({ onAddRecord }) => {
  const [name, setName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [spNumber, setSpNumber] = useState('');
  const [rank, setRank] = useState('');
  const [state, setState] = useState('');
  const [lg, setLg] = useState('');
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [marriedStatus, setMarriedStatus] = useState<MarriedStatus>('Single');
  const [bloodGroup, setBloodGroup] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (state) {
      setLgaOptions(nigeriaStates[state] || []);
      setLg(''); // Reset LG when state changes
    } else {
      setLgaOptions([]);
      setLg('');
    }
  }, [state]);

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
    if (!name || !surname || !email || !state || !lg || !phoneNumber || !photoBase64 || !marriedStatus || !department || !spNumber || !rank || !bloodGroup) {
      setError('All fields, including photo, are required.');
      return;
    }
    setError('');
    
    const newRecord: DataRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin', // Hardcoded as there are no users
      name, middleName, surname, email, department, spNumber, rank, state, lg, phoneNumber, marriedStatus, bloodGroup,
      photo: photoBase64
    };

    onAddRecord(newRecord);

    // Reset form
    setName('');
    setMiddleName('');
    setSurname('');
    setEmail('');
    setDepartment('');
    setSpNumber('');
    setRank('');
    setState('');
    setLg('');
    setPhoneNumber('');
    setMarriedStatus('Single');
    setBloodGroup('');
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
        <InputField id="name" label="First Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John" />
        <InputField id="middleName" label="Middle Name (Optional)" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="e.g., Quincy" isRequired={false} />
        <InputField id="surname" label="Surname" type="text" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g., Doe" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="email" label="Associated Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" />
        <InputField id="phoneNumber" label="Phone Number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g., 08012345678" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField id="department" label="Department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Operations" />
        <InputField id="spNumber" label="SP Number" type="text" value={spNumber} onChange={(e) => setSpNumber(e.target.value)} placeholder="e.g., SP12345" />
        <InputField id="rank" label="Rank" type="text" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="e.g., Officer" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-brand-muted mb-2">
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
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
            value={lg}
            onChange={(e) => setLg(e.target.value)}
            disabled={!state}
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
            value={marriedStatus}
            onChange={(e) => setMarriedStatus(e.target.value as MarriedStatus)}
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
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
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
          className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold text-lg"
        >
          <PlusIcon className="w-6 h-6" />
          <span>Add Record</span>
        </button>
      </div>
    </form>
  );
};

export default DataForm;