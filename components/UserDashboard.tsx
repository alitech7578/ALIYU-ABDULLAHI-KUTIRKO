import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Import IDCardLayoutSettings to use for layout settings state.
import { DataRecord, IDCardLayoutSettings } from '../types';
import Header from './Header';
import DataForm from './DataForm';
import DataTable from './DataTable';
import { PlusCircleIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';

const API_URL = 'http://localhost:3001/api';

// FIX: Add initial layout settings to be used with useLocalStorage.
const initialLayoutSettings: IDCardLayoutSettings = {
    staff: {
        visibleFields: ['fullName', 'rank', 'department', 'bloodGroup', 'spNumber', 'qrCode'],
    },
    student: {
        visibleFields: ['fullName', 'department', 'registrationNumber', 'qrCode'],
    },
};

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface UserDashboardProps {
    user: User;
    token: string;
    onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, token, onLogout }) => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [companyName] = useLocalStorage('company-name', 'Data Collector Pro');
  const [companyLogo] = useLocalStorage<string | null>('company-logo', null);
  const [companyEmail] = useLocalStorage('company-email', 'contact@example.com');
  const [companyAddress] = useLocalStorage('company-address', '123 Innovation Drive, Tech City');
  const [companyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
  // FIX: Added provostSignature to provide to DataTable.
  const [provostSignature] = useLocalStorage<string | null>('provost-signature', null);
  // FIX: Add layoutSettings state to pass to DataTable.
  const [layoutSettings] = useLocalStorage<IDCardLayoutSettings>('id-card-layout', initialLayoutSettings);
  // FIX: Add saveStatus state for DataForm.
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');


  // FIX: Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchUserRecords = useCallback(async () => {
    try {
        setError('');
        const response = await fetch(`${API_URL}/user/records`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch your records.');
        const data = await response.json();
        setRecords(data);
    } catch (err: any) {
        setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchUserRecords();
  }, [fetchUserRecords]);

  // FIX: Add effect to handle form closure after a successful save.
  useEffect(() => {
    if (saveStatus === 'saved') {
        const timer = setTimeout(() => {
            setIsFormVisible(false);
            setSaveStatus('idle');
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // FIX: Add pagination calculations
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const currentRecords = useMemo(() => {
      const indexOfLastRecord = currentPage * recordsPerPage;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
      return records.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [records, currentPage]);

  // FIX: Add effect to adjust page number if records are deleted, preventing empty pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const addRecord = async (record: DataRecord) => {
    const dataURLtoFile = (dataurl: string, filename: string): File | null => {
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1].trim());
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    const photoFile = dataURLtoFile(record.photo, `photo-for-${record.id}.png`);
    if (!photoFile) {
        setError("There was an issue processing the uploaded photo.");
        return;
    }

    const formData = new FormData();
    const { id, createdAt, createdBy, photo, ...recordData } = record;
    
    Object.entries(recordData).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    formData.append('photo', photoFile);

    setSaveStatus('saving');
    try {
        setError('');
        const response = await fetch(`${API_URL}/records`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to add record.');
        }
        await fetchUserRecords();
        setSaveStatus('saved');
    } catch (err: any) {
        setError(err.message);
        setSaveStatus('idle');
    }
  };

  const deleteRecord = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
        const response = await fetch(`${API_URL}/records/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete record.');
        await fetchUserRecords();
    } catch (err: any) {
        setError(err.message);
    }
  }, [token, fetchUserRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary text-brand-light font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header user={user} onLogout={onLogout} companyName={companyName} companyLogo={companyLogo} />
        <main className="mt-12">
          <div className="bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-brand-light">
                {isFormVisible ? 'Add New Record' : 'My Records'}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFormVisible(!isFormVisible)}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-semibold"
                  aria-label={isFormVisible ? "Close form" : "Add new record"}
                >
                  <PlusCircleIcon className={`w-6 h-6 transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`} />
                  <span>{isFormVisible ? 'Cancel' : 'Add New'}</span>
                </button>
              </div>
            </div>
            
            {/* FIX: Pass saveStatus prop to DataForm. */}
            {isFormVisible && <DataForm onSubmitRecord={addRecord} recordToEdit={null} saveStatus={saveStatus} />}
          </div>

          <div className="mt-10">
            {/* FIX: Pass all required props to DataTable, including provostSignature and layoutSettings. */}
            <DataTable 
              records={currentRecords} 
              onDeleteRecord={deleteRecord}
              selectedIds={[]}
              onSelectionChange={() => {}}
              showAdminActions={false}
              companyName={companyName}
              companyLogo={companyLogo}
              companyEmail={companyEmail}
              companyAddress={companyAddress}
              companyWebsite={companyWebsite}
              provostSignature={provostSignature}
              layoutSettings={layoutSettings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalRecords={records.length}
              recordsPerPage={recordsPerPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
