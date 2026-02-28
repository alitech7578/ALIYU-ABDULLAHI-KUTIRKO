import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DataRecord, Student, IDCardLayoutSettings, FieldConfig } from '../types';
import Header from './Header';
import DataForm from './DataForm';
import DataTable from './DataTable';
import BulkIDPrint from './BulkIDPrint';
import { PlusCircleIcon, IdCardIcon, DownloadIcon, PencilIcon, UploadIcon, TrashIcon, DocumentArrowUpIcon, UserCircleIcon, UsersIcon, SearchIcon, SpinnerIcon, CheckCircleIcon, PrinterIcon, UserPlusIcon, XMarkIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchData, saveData } from '../services/api';
import ImportModal from './ImportModal';
import StudentForm from './StudentForm';
import StudentTable from './StudentTable';
import StudentIDCardModal from './StudentIDCardModal';
import BulkStudentIDPrint from './BulkStudentIDPrint';
import StudentImportModal from './StudentImportModal';
import ConfirmationModal from './ConfirmationModal';
import PWAInstallPrompt from './PWAInstallPrompt';

type SortDirection = 'ascending' | 'descending';
interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

const allStaffFields: FieldConfig[] = [
    { id: 'fullName', label: 'Full Name' },
    { id: 'rank', label: 'Rank' },
    { id: 'department', label: 'Department' },
    { id: 'bloodGroup', label: 'Blood Group' },
    { id: 'spNumber', label: 'SP Number (Footer)' },
];

const allStudentFields: FieldConfig[] = [
    { id: 'fullName', label: 'Full Name' },
    { id: 'school', label: 'School' },
    { id: 'department', label: 'Department' },
    { id: 'registrationNumber', label: 'Registration No.' },
    { id: 'expirationDate', label: 'Exp. Date' },
];

const initialLayoutSettings: IDCardLayoutSettings = {
    staff: {
        visibleFields: allStaffFields.map(f => f.id),
    },
    student: {
        visibleFields: allStudentFields.map(f => f.id),
    },
};

const EditableField = ({ label, value, isEditing, onEditToggle, tempValue, onTempChange, onSave }: { label: string, value: string, isEditing: boolean, onEditToggle: (isEditing: boolean) => void, tempValue: string, onTempChange: (value: string) => void, onSave: () => void }) => (
    <div className="flex items-center gap-4 py-2">
      <label className="w-40 text-sm font-semibold text-brand-muted flex-shrink-0">{label}:</label>
      <div className="flex-grow">
        {isEditing ? (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => onTempChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="w-full px-2 py-1 bg-brand-primary border border-brand-accent rounded-md"
            autoFocus
          />
        ) : (
          <span className="text-brand-light cursor-pointer" onClick={() => onEditToggle(true)}>
            {value}
          </span>
        )}
      </div>
      <button onClick={isEditing ? onSave : () => onEditToggle(true)} className="p-1 text-yellow-400 hover:text-yellow-300">
        <PencilIcon className="w-4 h-4" />
      </button>
    </div>
  );

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [records, setRecords, recordsSaveStatus] = useLocalStorage<DataRecord[]>('data-records', []);
  const [students, setStudents, studentsSaveStatus] = useLocalStorage<Student[]>('student-records', []);
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPrintViewVisible, setIsPrintViewVisible] = useState(false);
  const [isStudentPrintViewVisible, setIsStudentPrintViewVisible] = useState(false);
  const [recordsToPrint, setRecordsToPrint] = useState<DataRecord[]>([]);
  const [studentsToPrint, setStudentsToPrint] = useState<Student[]>([]);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isStudentImportModalVisible, setIsStudentImportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');
  const [selectedStudentForId, setSelectedStudentForId] = useState<Student | null>(null);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'staff' | 'student' } | null>(null);
  const [studentSortConfig, setStudentSortConfig] = useState<SortConfig<Student> | null>(null);


  // Pagination State
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [companyName, setCompanyName] = useLocalStorage('company-name', 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI');
  const [companyLogo, setCompanyLogo] = useLocalStorage<string | null>('company-logo', null);
  const [companyEmail, setCompanyEmail] = useLocalStorage('company-email', 'contact@fcetbichi.edu.ng');
  const [companyAddress, setCompanyAddress] = useLocalStorage('company-address', 'P.M.B 3473 KANO, KANO STATE');
  const [companyWebsite, setCompanyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
  const [companyContent, setCompanyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');
  const [provostSignature, setProvostSignature] = useLocalStorage<string | null>('provost-signature', null);
  const [layoutSettings, setLayoutSettings] = useLocalStorage<IDCardLayoutSettings>('id-card-layout', initialLayoutSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [serverSyncStatus, setServerSyncStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Security Settings State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load from server on mount
  useEffect(() => {
    const loadData = async () => {
      // Small delay to ensure session cookie is fully settled in browser
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServerSyncStatus('loading');
      try {
        const data = await fetchData();
        // Only update if data exists on server to avoid wiping local storage on first run
        if (data.records && data.records.length > 0) setRecords(data.records);
        if (data.students && data.students.length > 0) setStudents(data.students);
        if (data.branding) {
          if (data.branding.companyName) setCompanyName(data.branding.companyName);
          if (data.branding.companyLogo) setCompanyLogo(data.branding.companyLogo);
          if (data.branding.companyEmail) setCompanyEmail(data.branding.companyEmail);
          if (data.branding.companyAddress) setCompanyAddress(data.branding.companyAddress);
          if (data.branding.companyWebsite) setCompanyWebsite(data.branding.companyWebsite);
          if (data.branding.companyContent) setCompanyContent(data.branding.companyContent);
          if (data.branding.provostSignature) setProvostSignature(data.branding.provostSignature);
          if (data.branding.layoutSettings) setLayoutSettings(data.branding.layoutSettings);
        }
        setServerSyncStatus('idle');
        setIsInitialLoadComplete(true);
      } catch (error) {
        console.error('Failed to sync with server:', error);
        setServerSyncStatus('error');
        // Still mark as complete so we can try to save later if needed, 
        // but maybe we should wait for a successful load?
        // Let's mark it complete so the user can at least try to save their local changes.
        setIsInitialLoadComplete(true);
      }
    };
    loadData();
  }, []);

  // Save to server when data changes
  useEffect(() => {
    // Skip initial save if we are still loading or haven't finished the initial load attempt
    if (serverSyncStatus === 'loading' || !isInitialLoadComplete) return;

    const timer = setTimeout(async () => {
      setServerSyncStatus('saving');
      try {
        await saveData({
          records,
          students,
          branding: {
            companyName,
            companyLogo,
            companyEmail,
            companyAddress,
            companyWebsite,
            companyContent,
            provostSignature,
            layoutSettings
          }
        });
        setServerSyncStatus('saved');
        setTimeout(() => setServerSyncStatus('idle'), 3000);
      } catch (error) {
        console.error('Failed to save to server:', error);
        setServerSyncStatus('error');
      }
    }, 3000); // 3 second debounce to avoid excessive writes

    return () => clearTimeout(timer);
  }, [records, students, companyName, companyLogo, companyEmail, companyAddress, companyWebsite, companyContent, provostSignature, layoutSettings]);

  useEffect(() => {
    // This effect ensures that if the stored settings are partial (from an older version),
    // they get merged with the latest default structure to prevent crashes.
    setLayoutSettings(prev => {
        // Use initialLayoutSettings.student/staff as fallback if stored value is missing or empty
        const prevStudent = prev?.student || initialLayoutSettings.student;
        const prevStaff = prev?.staff || initialLayoutSettings.staff;

        // Force 'school' into visibleFields if it's missing (migration for existing users)
        let studentVisibleFields = prevStudent.visibleFields || initialLayoutSettings.student.visibleFields;
        if (!studentVisibleFields.includes('school')) {
            studentVisibleFields = [...studentVisibleFields, 'school'];
            // Re-sort to match default order by filtering allStudentFields
            studentVisibleFields = allStudentFields
                .map(f => f.id)
                .filter(id => studentVisibleFields.includes(id));
        }

        return {
            staff: {
                ...initialLayoutSettings.staff,
                ...prevStaff,
            },
            student: {
                ...initialLayoutSettings.student,
                ...prevStudent,
                visibleFields: studentVisibleFields
            }
        };
    });
    setSettingsReady(true);
  }, []); 
  


  const [isEditingName, setIsEditingName] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempCompanyEmail, setTempCompanyEmail] = useState(companyEmail);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempCompanyAddress, setTempCompanyAddress] = useState(companyAddress);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [tempCompanyWebsite, setTempCompanyWebsite] = useState(companyWebsite);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [tempCompanyContent, setTempCompanyContent] = useState(companyContent);

  const combinedSaveStatus = useMemo(() => {
    if (recordsSaveStatus === 'saving' || studentsSaveStatus === 'saving') {
      return 'saving';
    }
    if (recordsSaveStatus === 'saved' || studentsSaveStatus === 'saved') {
      return 'saved';
    }
    return 'idle';
  }, [recordsSaveStatus, studentsSaveStatus]);

  const selectedRecords = useMemo(() => {
    return records.filter(r => selectedIds.includes(r.id));
  }, [records, selectedIds]);

  const selectedStudents = useMemo(() => {
    return students.filter(s => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const filteredRecords = useMemo(() => {
    const validRecords = records.filter(r => r); // Filter out any falsy records
    if (!staffSearchQuery) return validRecords;
    const lowerCaseQuery = staffSearchQuery.toLowerCase();
    return validRecords.filter(record =>
        (record.name ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (record.surname ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (record.email ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (record.spNumber ?? '').toLowerCase().includes(lowerCaseQuery)
    );
  }, [records, staffSearchQuery]);
  
  const sortedStudents = useMemo(() => {
    let sortableStudents = students.filter(s => s); // Filter out any falsy records
    if (studentSortConfig !== null) {
      sortableStudents.sort((a, b) => {
        const key = studentSortConfig.key;
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'string' && typeof valB === 'string') {
          const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          return studentSortConfig.direction === 'ascending' ? comparison : -comparison;
        }

        if (valA < valB) return studentSortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return studentSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableStudents;
  }, [students, studentSortConfig]);

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery) return sortedStudents;
    const lowerCaseQuery = studentSearchQuery.toLowerCase();
    return sortedStudents.filter(student =>
        (student.firstName ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (student.surname ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (student.email ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (student.registrationNumber ?? '').toLowerCase().includes(lowerCaseQuery)
    );
  }, [sortedStudents, studentSearchQuery]);
  
  const totalStaffPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentStaffRecords = useMemo(() => {
      const indexOfLastRecord = staffCurrentPage * recordsPerPage;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
      return filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredRecords, staffCurrentPage, recordsPerPage]);

  const totalStudentPages = Math.ceil(filteredStudents.length / recordsPerPage);
  const currentStudentRecords = useMemo(() => {
      const indexOfLastRecord = studentCurrentPage * recordsPerPage;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
      return filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredStudents, studentCurrentPage, recordsPerPage]);
  
  const handleAddOrUpdateRecord = (record: DataRecord) => {
    if (editingRecord) {
      setRecords(records.map(r => r.id === record.id ? record : r));
    } else {
      setRecords([record, ...records]);
    }
  };

  // This effect handles closing the form after a successful save.
  useEffect(() => {
    if (isFormVisible) {
      const isStaffSaveDone = activeTab === 'staff' && recordsSaveStatus === 'saved';
      const isStudentSaveDone = activeTab === 'students' && studentsSaveStatus === 'saved';

      if (isStaffSaveDone || isStudentSaveDone) {
        // Wait a bit so the user can see the "Saved" message on the button
        const timer = setTimeout(() => {
          setIsFormVisible(false);
          setEditingRecord(null);
          setEditingStudent(null);
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [isFormVisible, activeTab, recordsSaveStatus, studentsSaveStatus]);

  const handleEditRecord = (record: DataRecord) => {
    setEditingRecord(record);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecords = (ids: string[]) => {
    setRecords(records.filter(r => !ids.includes(r.id)));
    setSelectedIds([]);
  };

  const handleImportRecords = (newRecords: DataRecord[]) => {
    setRecords(prev => [...newRecords, ...prev]);
    setIsImportModalVisible(false);
  };

  const handleAddOrUpdateStudent = (student: Student) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === student.id ? student : s));
    } else {
      setStudents([student, ...students]);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteStudents = (ids: string[]) => {
    setStudents(students.filter(s => !ids.includes(s.id)));
    setSelectedStudentIds([]);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => [...newStudents, ...prev]);
    setIsStudentImportModalVisible(false);
  };
  
  const handleRequestSort = (key: keyof Student) => {
    let direction: SortDirection = 'ascending';
    if (studentSortConfig && studentSortConfig.key === key && studentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setStudentSortConfig({ key, direction });
  };
  
  const confirmDeletion = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'staff') {
      handleDeleteRecords([itemToDelete.id]);
    } else if (itemToDelete.type === 'student') {
      handleDeleteStudents([itemToDelete.id]);
    }
    setItemToDelete(null);
  };

  const handleExport = (data: any[], keys: (keyof any)[], headers: string[], baseFilename: string) => {
      if (data.length === 0) {
          alert(`No records to export.`);
          return;
      }
      
      const escapeCsvCell = (cell: any): string => {
          const cellStr = String(cell ?? ''); // handle null/undefined
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
      };

      const headerRow = headers.join(',');
      const csvRows = data.map(record => {
          return keys.map(key => escapeCsvCell(record[key])).join(',');
      });

      const csvContent = [headerRow, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${baseFilename}-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportStaff = (recordsToExport: DataRecord[]) => {
      const staffHeaders = ['FirstName','MiddleName','Surname','Email','Department','SPNumber','Rank','State','LGA','MaritalStatus','BloodGroup','PhoneNumber', 'Photo'];
      const staffKeys: (keyof DataRecord)[] = ['name', 'middleName', 'surname', 'email', 'department', 'spNumber', 'rank', 'state', 'lg', 'marriedStatus', 'bloodGroup', 'phoneNumber', 'photo'];
      handleExport(recordsToExport, staffKeys, staffHeaders, 'staff-records-export');
  };

  const handleExportStudents = (studentsToExport: Student[]) => {
      const studentHeaders = ['FirstName','MiddleName','Surname','Email','School','Department','RegistrationNumber','ExpirationDate','Photo'];
      const studentKeys: (keyof Student)[] = ['firstName', 'middleName', 'surname', 'email', 'school', 'department', 'registrationNumber', 'expirationDate', 'photo'];
      handleExport(studentsToExport, studentKeys, studentHeaders, 'student-records-export');
  };

  useEffect(() => {
    setStaffCurrentPage(1);
  }, [staffSearchQuery]);

  useEffect(() => {
    setStudentCurrentPage(1);
  }, [studentSearchQuery]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProvostSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProvostSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLayoutChange = (cardType: 'staff' | 'student', fieldId: string, isVisible: boolean) => {
    setLayoutSettings(prev => {
      const currentFields = prev[cardType].visibleFields;
      const newFields = isVisible
        ? [...currentFields, fieldId]
        : currentFields.filter(f => f !== fieldId);
      
      const allFields = cardType === 'staff' ? allStaffFields : allStudentFields;
      const orderedNewFields = allFields.map(f => f.id).filter(id => newFields.includes(id));
        
      return {
        ...prev,
        [cardType]: { visibleFields: orderedNewFields },
      };
    });
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityMessage(null);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      if (response.ok) {
        setSecurityMessage({ type: 'success', text: 'Credentials updated successfully!' });
        setNewUsername('');
        setNewPassword('');
      } else {
        setSecurityMessage({ type: 'error', text: 'Failed to update credentials.' });
      }
    } catch (err) {
      setSecurityMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  if (isPrintViewVisible) {
    return <BulkIDPrint records={recordsToPrint} onClose={() => setIsPrintViewVisible(false)} companyName={companyName} companyLogo={companyLogo} companyEmail={companyEmail} companyAddress={companyAddress} companyWebsite={companyWebsite} provostSignature={provostSignature} layoutSettings={layoutSettings} />;
  }

  if (isStudentPrintViewVisible) {
    return <BulkStudentIDPrint students={studentsToPrint} onClose={() => setIsStudentPrintViewVisible(false)} companyName={companyName} companyLogo={companyLogo} companyEmail={companyEmail} companyAddress={companyAddress} companyWebsite={companyWebsite} provostSignature={provostSignature} layoutSettings={layoutSettings} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary text-brand-light font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header companyName={companyName} companyLogo={companyLogo} />

        <div className="absolute top-4 right-4 text-xs text-brand-muted flex flex-col items-end gap-1">
          <button 
            onClick={onLogout}
            className="mb-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded border border-red-500/30 transition-colors text-xs font-bold"
          >
            LOGOUT
          </button>
          <div className="flex items-center gap-2">
            {combinedSaveStatus === 'saving' && <><SpinnerIcon className="w-4 h-4 animate-spin" /><span>Saving to Browser...</span></>}
            {combinedSaveStatus === 'saved' && <><CheckCircleIcon className="w-4 h-4 text-green-400" /><span>Saved to Browser</span></>}
          </div>
          <div className="flex items-center gap-2">
            {serverSyncStatus === 'loading' && <><SpinnerIcon className="w-4 h-4 animate-spin" /><span>Syncing with Server...</span></>}
            {serverSyncStatus === 'saving' && <><SpinnerIcon className="w-4 h-4 animate-spin" /><span>Saving to Server...</span></>}
            {serverSyncStatus === 'saved' && <><CheckCircleIcon className="w-4 h-4 text-blue-400" /><span>Synced with Server</span></>}
            {serverSyncStatus === 'error' && <><XMarkIcon className="w-4 h-4 text-red-400" /><span>Server Sync Error</span></>}
          </div>
        </div>

        <main className="mt-12">
          {/* Tabs */}
          <div className="flex border-b border-brand-secondary/50 mb-6">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'staff' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-muted hover:text-brand-light'}`}
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Staff Records ({records.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'students' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-muted hover:text-brand-light'}`}
            >
              <UsersIcon className="w-5 h-5" />
              <span>Student Records ({students.length})</span>
            </button>
          </div>

          <div className="bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-brand-light">
                {isFormVisible ? (activeTab === 'staff' ? (editingRecord ? 'Edit Staff Record' : 'Add New Staff Record') : (editingStudent ? 'Edit Student Record' : 'Add New Student Record')) : 'Manage Records'}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                      setIsFormVisible(!isFormVisible);
                      setEditingRecord(null);
                      setEditingStudent(null);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-semibold"
                  aria-label={isFormVisible ? "Close form" : "Add new record"}
                >
                  <PlusCircleIcon className={`w-6 h-6 transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`} />
                  <span>{isFormVisible ? 'Cancel' : 'Add New'}</span>
                </button>
              </div>
            </div>
            
            {isFormVisible && activeTab === 'staff' && <DataForm onSubmitRecord={handleAddOrUpdateRecord} recordToEdit={editingRecord} saveStatus={recordsSaveStatus} />}
            {isFormVisible && activeTab === 'students' && <StudentForm onSubmitStudent={handleAddOrUpdateStudent} studentToEdit={editingStudent} saveStatus={studentsSaveStatus} />}
          </div>

          <div className="mt-10">
            {activeTab === 'staff' && (
              <>
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="relative flex-grow max-w-lg">
                        <input 
                            type="search"
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                            placeholder="Search staff by name, surname, email, or SP no."
                            className="w-full pl-10 pr-4 py-2.5 bg-brand-secondary/50 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setIsImportModalVisible(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/80 hover:bg-brand-primary rounded-lg text-white font-semibold transition-colors">
                          <UploadIcon className="w-5 h-5" />
                          <span>Import</span>
                      </button>
                       <button onClick={() => handleExportStaff(selectedRecords)} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <DocumentArrowUpIcon className="w-5 h-5" />
                          <span>Export Selected ({selectedIds.length})</span>
                      </button>
                      <button onClick={() => handleExportStaff(filteredRecords)} disabled={filteredRecords.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <DocumentArrowUpIcon className="w-5 h-5" />
                          <span>Export All ({filteredRecords.length})</span>
                      </button>
                      <button onClick={() => { setRecordsToPrint(selectedRecords); setIsPrintViewVisible(true); }} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print Selected ({selectedIds.length})</span>
                      </button>
                      <button onClick={() => { setRecordsToPrint(filteredRecords); setIsPrintViewVisible(true); }} disabled={filteredRecords.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print All ({filteredRecords.length})</span>
                      </button>
                      <button onClick={() => handleDeleteRecords(selectedIds)} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                        <TrashIcon className="w-5 h-5" />
                        <span>Delete ({selectedIds.length})</span>
                      </button>
                    </div>
                 </div>
                <DataTable
                  records={currentStaffRecords}
                  onDeleteRecord={(id) => setItemToDelete({ id, type: 'staff' })}
                  onEditRecord={handleEditRecord}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  companyName={companyName}
                  companyLogo={companyLogo}
                  companyEmail={companyEmail}
                  companyAddress={companyAddress}
                  companyWebsite={companyWebsite}
                  provostSignature={provostSignature}
                  layoutSettings={layoutSettings}
                  currentPage={staffCurrentPage}
                  totalPages={totalStaffPages}
                  onPageChange={setStaffCurrentPage}
                  totalRecords={filteredRecords.length}
                  recordsPerPage={recordsPerPage}
                />
              </>
            )}
            {activeTab === 'students' && (
               <>
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="relative flex-grow max-w-lg">
                        <input 
                            type="search"
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            placeholder="Search students by name, surname, email, or reg. no."
                            className="w-full pl-10 pr-4 py-2.5 bg-brand-secondary/50 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setIsStudentImportModalVisible(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/80 hover:bg-brand-primary rounded-lg text-white font-semibold transition-colors">
                          <UploadIcon className="w-5 h-5" />
                          <span>Import</span>
                      </button>
                       <button onClick={() => handleExportStudents(selectedStudents)} disabled={selectedStudentIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <DocumentArrowUpIcon className="w-5 h-5" />
                          <span>Export Selected ({selectedStudentIds.length})</span>
                      </button>
                      <button onClick={() => handleExportStudents(filteredStudents)} disabled={filteredStudents.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <DocumentArrowUpIcon className="w-5 h-5" />
                          <span>Export All ({filteredStudents.length})</span>
                      </button>
                       <button onClick={() => { setStudentsToPrint(selectedStudents); setIsStudentPrintViewVisible(true); }} disabled={selectedStudentIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <PrinterIcon className="w-5 h-5" />
                          <span>Print Selected ({selectedStudentIds.length})</span>
                        </button>
                        <button onClick={() => { setStudentsToPrint(filteredStudents); setIsStudentPrintViewVisible(true); }} disabled={filteredStudents.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <PrinterIcon className="w-5 h-5" />
                          <span>Print All ({filteredStudents.length})</span>
                        </button>
                       <button onClick={() => handleDeleteStudents(selectedStudentIds)} disabled={selectedStudentIds.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-secondary/50 disabled:cursor-not-allowed">
                          <TrashIcon className="w-5 h-5" />
                          <span>Delete ({selectedStudentIds.length})</span>
                       </button>
                    </div>
                 </div>
                <StudentTable
                  records={currentStudentRecords}
                  onDeleteRecord={(id) => setItemToDelete({ id, type: 'student' })}
                  onShowIdCard={setSelectedStudentForId}
                  onEditRecord={handleEditStudent}
                  selectedIds={selectedStudentIds}
                  onSelectionChange={setSelectedStudentIds}
                  onSort={handleRequestSort}
                  sortConfig={studentSortConfig}
                  currentPage={studentCurrentPage}
                  totalPages={totalStudentPages}
                  onPageChange={setStudentCurrentPage}
                  totalRecords={filteredStudents.length}
                  recordsPerPage={recordsPerPage}
                />
              </>
            )}
          </div>

          <div className="mt-12 bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-brand-light mb-4">Branding Settings</h2>
                <div className="space-y-4">
                  <div>
                    <div className="grid grid-cols-1 gap-y-2">
                      <EditableField label="Company Name" value={companyName} isEditing={isEditingName} onEditToggle={setIsEditingName} tempValue={tempCompanyName} onTempChange={setTempCompanyName} onSave={() => { setCompanyName(tempCompanyName); setIsEditingName(false); }} />
                      <EditableField label="Company Email" value={companyEmail} isEditing={isEditingEmail} onEditToggle={setIsEditingEmail} tempValue={tempCompanyEmail} onTempChange={setTempCompanyEmail} onSave={() => { setCompanyEmail(tempCompanyEmail); setIsEditingEmail(false); }} />
                      <EditableField label="Company Address" value={companyAddress} isEditing={isEditingAddress} onEditToggle={setIsEditingAddress} tempValue={tempCompanyAddress} onTempChange={setTempCompanyAddress} onSave={() => { setCompanyAddress(tempCompanyAddress); setIsEditingAddress(false); }} />
                      <EditableField label="Company Website" value={companyWebsite} isEditing={isEditingWebsite} onEditToggle={setIsEditingWebsite} tempValue={tempCompanyWebsite} onTempChange={setTempCompanyWebsite} onSave={() => { setCompanyWebsite(tempCompanyWebsite); setIsEditingWebsite(false); }} />
                      <EditableField label="Public Page Content" value={companyContent} isEditing={isEditingContent} onEditToggle={setIsEditingContent} tempValue={tempCompanyContent} onTempChange={setTempCompanyContent} onSave={() => { setCompanyContent(tempCompanyContent); setIsEditingContent(false); }} />
                      
                      <div className="flex items-center gap-4 py-2">
                          <label className="w-40 text-sm font-semibold text-brand-muted flex-shrink-0">Company Logo:</label>
                          <div className="flex items-center gap-4">
                              {companyLogo ? <img src={companyLogo} alt="Logo Preview" className="h-10 w-auto bg-white/10 p-1 rounded-lg" /> : <div className="h-10 w-24 rounded-lg bg-brand-secondary flex items-center justify-center"><span className="text-xs text-brand-muted">No Logo</span></div>}
                              <input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                              <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">
                                  <UploadIcon className="w-5 h-5"/>
                                  <span>{companyLogo ? 'Change' : 'Upload'}</span>
                              </label>
                          </div>
                      </div>
                      <div className="flex items-center gap-4 py-2">
                          <label className="w-40 text-sm font-semibold text-brand-muted flex-shrink-0">Provost Signature:</label>
                          <div className="flex items-center gap-4">
                              {provostSignature ? <img src={provostSignature} alt="Signature Preview" className="h-10 w-auto bg-white/10 p-1 rounded-lg" /> : <div className="h-10 w-24 rounded-lg bg-brand-secondary flex items-center justify-center"><span className="text-xs text-brand-muted">No Signature</span></div>}
                              <input id="signature-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleProvostSignatureUpload} />
                              <label htmlFor="signature-upload" className="cursor-pointer flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">
                                  <UploadIcon className="w-5 h-5"/>
                                  <span>{provostSignature ? 'Change' : 'Upload'}</span>
                              </label>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-brand-light mb-4">Security Settings</h2>
                <form onSubmit={handleUpdateSecurity} className="space-y-4 bg-brand-primary/30 p-6 rounded-xl border border-brand-secondary/30">
                  <p className="text-sm text-brand-muted mb-4">Update your login credentials here. Leave blank if you don't want to change.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">New Username</label>
                    <input 
                      type="text" 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent text-brand-light"
                      placeholder="Enter new username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent text-brand-light"
                      placeholder="Enter new password"
                    />
                  </div>

                  {securityMessage && (
                    <div className={`text-sm p-2 rounded ${securityMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {securityMessage.text}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={securityLoading || (!newUsername && !newPassword)}
                    className="w-full py-2 bg-brand-accent hover:bg-opacity-80 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {securityLoading ? 'Updating...' : 'Update Credentials'}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-12 border-t border-brand-secondary/50 pt-8">
                <h3 className="text-xl font-bold text-brand-light mb-4">ID Card Layout Customization</h3>
                {settingsReady ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-brand-light mb-2">Staff ID Card Fields</h4>
                      <div className="space-y-2">
                        {allStaffFields.map(field => (
                          <label key={field.id} className="flex items-center gap-3 text-brand-light cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                              checked={layoutSettings.staff.visibleFields.includes(field.id)}
                              onChange={(e) => handleLayoutChange('staff', field.id, e.target.checked)}
                            />
                            {field.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-light mb-2">Student ID Card Fields</h4>
                        <div className="space-y-2">
                          {allStudentFields.map(field => (
                            <label key={field.id} className="flex items-center gap-3 text-brand-light cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                                checked={layoutSettings.student.visibleFields.includes(field.id)}
                                onChange={(e) => handleLayoutChange('student', field.id, e.target.checked)}
                              />
                              {field.label}
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center">
                    <SpinnerIcon className="w-8 h-8 text-brand-muted animate-spin" />
                  </div>
                )}
              </div>
            </div>
        </main>

        {isImportModalVisible && (
            <ImportModal 
                isOpen={isImportModalVisible}
                onClose={() => setIsImportModalVisible(false)}
                onImport={handleImportRecords}
            />
        )}
        {isStudentImportModalVisible && (
            <StudentImportModal 
                isOpen={isStudentImportModalVisible}
                onClose={() => setIsStudentImportModalVisible(false)}
                onImport={handleImportStudents}
            />
        )}
        {selectedStudentForId && (
            <StudentIDCardModal 
                student={selectedStudentForId}
                onClose={() => setSelectedStudentForId(null)}
                companyName={companyName}
                companyLogo={companyLogo}
                companyEmail={companyEmail}
                companyAddress={companyAddress}
                companyWebsite={companyWebsite}
                provostSignature={provostSignature}
                layoutSettings={layoutSettings}
            />
        )}
        {itemToDelete && (
          <ConfirmationModal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={confirmDeletion}
            title="Confirm Deletion"
            message={`Are you sure you want to permanently delete this ${itemToDelete.type} record? This action cannot be undone.`}
          />
        )}
        <PWAInstallPrompt />
      </div>
    </div>
  );
};

export default AdminDashboard;