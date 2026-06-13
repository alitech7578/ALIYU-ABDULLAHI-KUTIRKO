import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DataRecord, Student, IDCardLayoutSettings, FieldConfig } from '../types';
import Header from './Header';
import DataForm from './DataForm';
import DataTable from './DataTable';
import BulkIDPrint from './BulkIDPrint';
import { PlusCircleIcon, IdCardIcon, DownloadIcon, PencilIcon, UploadIcon, TrashIcon, DocumentArrowUpIcon, UserCircleIcon, UsersIcon, SearchIcon, SpinnerIcon, CheckCircleIcon, PrinterIcon, UserPlusIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ImportModal from './ImportModal';
import StudentForm from './StudentForm';
import StudentTable from './StudentTable';
import StudentIDCardModal from './StudentIDCardModal';
import BulkStudentIDPrint from './BulkStudentIDPrint';
import StudentImportModal from './StudentImportModal';
import ConfirmationModal from './ConfirmationModal';

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
    { id: 'department', label: 'Department' },
    { id: 'registrationNumber', label: 'Registration No.' },
];

const initialLayoutSettings: IDCardLayoutSettings = {
    staff: {
        visibleFields: allStaffFields.map(f => f.id),
    },
    student: {
        visibleFields: allStudentFields.map(f => f.id),
    },
};

const EditableField = ({ label, value, onSave }: { label: string, value: string, onSave: (newValue: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-4 py-2">
      <label className="w-40 text-sm font-semibold text-brand-muted flex-shrink-0">{label}:</label>
      <div className="flex-grow">
        {isEditing ? (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-2 py-1 bg-brand-primary border border-brand-accent rounded text-brand-light font-sans"
            autoFocus
          />
        ) : (
          <span className="text-brand-light cursor-pointer" onClick={() => setIsEditing(true)}>
            {value}
          </span>
        )}
      </div>
      <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="p-1 text-yellow-400 hover:text-yellow-300" aria-label={`Edit ${label}`}>
        <PencilIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
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

  // Offline / PWA application installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showOfflineInstructions, setShowOfflineInstructions] = useState(true); // Default to expanded for immediate ease of use
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already running standalone (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleExportBackup = () => {
    const backupData = {
      records,
      students,
      companyName,
      companyLogo,
      companyEmail,
      companyAddress,
      companyWebsite,
      provostSignature,
      layoutSettings,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-collector-offline-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // Pagination State
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [companyName, setCompanyName] = useLocalStorage('company-name', 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI');
  const [companyLogo, setCompanyLogo] = useLocalStorage<string | null>('company-logo', null);
  const [companyEmail, setCompanyEmail] = useLocalStorage('company-email', 'contact@fcetbichi.edu.ng');
  const [companyAddress, setCompanyAddress] = useLocalStorage('company-address', 'P.M.B. 3473, Kano');
  const [companyWebsite, setCompanyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
  const [companyContent, setCompanyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');
  const [provostSignature, setProvostSignature] = useLocalStorage<string | null>('provost-signature', null);
  const [layoutSettings, setLayoutSettings] = useLocalStorage<IDCardLayoutSettings>('id-card-layout', initialLayoutSettings);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    // This effect ensures that if the stored settings are partial (from an older version),
    // they get merged with the latest default structure to prevent crashes.
    setLayoutSettings(prev => ({
        staff: {
            ...initialLayoutSettings.staff,
            ...(prev?.staff || {}),
        },
        student: {
            ...initialLayoutSettings.student,
            ...(prev?.student || {}),
        }
    }));
    setSettingsReady(true);
  }, []); // Run only once on mount to hydrate settings safely
  


  // Note: Parent-level editing state variables removed. EditableField now manages its own state self-contained.

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
      const staffHeaders = ['FirstName','MiddleName','Surname','Email','Department','SPNumber','Rank','State','LGA','MaritalStatus','BloodGroup','PhoneNumber'];
      const staffKeys: (keyof DataRecord)[] = ['name', 'middleName', 'surname', 'email', 'department', 'spNumber', 'rank', 'state', 'lg', 'marriedStatus', 'bloodGroup', 'phoneNumber'];
      handleExport(recordsToExport, staffKeys, staffHeaders, 'staff-records-export');
  };

  const handleExportStudents = (studentsToExport: Student[]) => {
      const studentHeaders = ['FirstName','MiddleName','Surname','Email','Department','RegistrationNumber'];
      const studentKeys: (keyof Student)[] = ['firstName', 'middleName', 'surname', 'email', 'department', 'registrationNumber'];
      handleExport(studentsToExport, studentKeys, studentHeaders, 'student-records-export');
  };

  const handleExportSystemBackup = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      records,
      students,
      companyName,
      companyLogo,
      companyEmail,
      companyAddress,
      companyWebsite,
      companyContent,
      provostSignature,
      layoutSettings
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `data-collector-pro-backup-${date}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSystemBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        
        if (backupData.records) setRecords(backupData.records);
        if (backupData.students) setStudents(backupData.students);
        if (backupData.companyName) setCompanyName(backupData.companyName);
        if (backupData.companyLogo !== undefined) setCompanyLogo(backupData.companyLogo);
        if (backupData.companyEmail) setCompanyEmail(backupData.companyEmail);
        if (backupData.companyAddress) setCompanyAddress(backupData.companyAddress);
        if (backupData.companyWebsite) setCompanyWebsite(backupData.companyWebsite);
        if (backupData.companyContent) setCompanyContent(backupData.companyContent);
        if (backupData.provostSignature !== undefined) setProvostSignature(backupData.provostSignature);
        if (backupData.layoutSettings) setLayoutSettings(backupData.layoutSettings);

        alert('System backup restored successfully!');
      } catch (err) {
        console.error(err);
        alert('Invalid backup file format. Please upload a valid Data Collector Pro backup JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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

        <div className="absolute top-4 right-4 text-xs text-brand-muted flex items-center gap-2">
          {combinedSaveStatus === 'saving' && <><SpinnerIcon className="w-4 h-4 animate-spin" /><span>Saving...</span></>}
          {combinedSaveStatus === 'saved' && <><CheckCircleIcon className="w-4 h-4 text-green-400" /><span>Saved to Local Storage</span></>}
        </div>

        <main className="mt-8">
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

          {/* Backup & Restore Data section */}
          <div className="mt-12 bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-light">System Backup & Persistence</h2>
                <p className="text-brand-muted text-sm mt-1">Export all staff records, student records, branding, and layout settings to a backup file, or restore them instantly.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleExportSystemBackup}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-opacity-90 rounded-lg text-white font-semibold transition-all shadow-md hover:scale-[1.01]"
                >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Save Backup File (JSON)</span>
                </button>
                <input
                  id="system-backup-upload"
                  type="file"
                  className="hidden"
                  accept=".json,application/json"
                  onChange={handleImportSystemBackup}
                />
                <label
                  htmlFor="system-backup-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition-all shadow-md hover:scale-[1.01]"
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Restore Backup File</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-light mb-4">Branding Settings</h2>
            <div className="space-y-4">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <EditableField label="Company Name" value={companyName} onSave={setCompanyName} />
                  <EditableField label="Company Email" value={companyEmail} onSave={setCompanyEmail} />
                  <EditableField label="Company Address" value={companyAddress} onSave={setCompanyAddress} />
                  <EditableField label="Company Website" value={companyWebsite} onSave={setCompanyWebsite} />
                  <div className="md:col-span-2">
                    <EditableField label="Public Page Content" value={companyContent} onSave={setCompanyContent} />
                  </div>
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

              <div className="border-t border-brand-secondary/50 pt-4">
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

              {/* Offline & Autosave Quick Info Desk / Install App Banner (Moved directly under ID layout customization) */}
              <div className="border-t border-brand-secondary/40 pt-8 mt-8">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-950/20 to-blue-900/40 border border-blue-500/30 flex flex-col gap-5 shadow-xl shadow-blue-950/10 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600/25 text-blue-400 rounded-xl mt-0.5 flex-shrink-0 border border-blue-500/30 shadow-inner">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-white flex items-center gap-2 flex-wrap tracking-tight">
                        <span>Download and Run Application Offline</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest animate-pulse">
                          ● Ready
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                          🔄 Autosaving Active
                        </span>
                      </h3>
                      <p className="text-xs text-brand-muted leading-relaxed max-w-4xl">
                        This app runs fully offline. Your records, pictures, school/college details, and custom configurations auto-save instantly to your device's persistent offline storage. You can edit, search, and export gorgeous student/staff ID cards without any internet connection!
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pt-2 border-t border-blue-500/10">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {/* Standalone new tab link (Crucial for bypass inside iframe!) */}
                      {isIframe ? (
                        <a
                          href={window.location.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 text-white font-black text-xs rounded-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 border border-emerald-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          <span>1. Click to Open Standalone (Required to Install)</span>
                        </a>
                      ) : (
                        isInstallable && (
                          <button
                            onClick={handleInstallApp}
                            className="px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 text-white font-black text-xs rounded-xl transition-all duration-350 transform active:scale-95 flex items-center justify-center gap-2 border border-indigo-500"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Install Application Offline</span>
                          </button>
                        )
                      )}

                      {/* Physical Backup Exporter */}
                      <button
                        onClick={handleExportBackup}
                        title="Download data.json backup file to save hard copies of custom biometrics offline"
                        className="px-4 py-2 bg-brand-secondary border border-brand-accent/30 hover:border-brand-accent text-brand-light font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                      >
                        <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                        <span>Download Offline Backup File (.json)</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowOfflineInstructions(!showOfflineInstructions)}
                      className="text-center px-4 py-2 bg-brand-secondary/60 hover:bg-brand-secondary text-brand-muted hover:text-brand-light font-black text-xs rounded-xl transition-all border border-brand-secondary/80 focus:outline-none"
                    >
                      {showOfflineInstructions ? 'Hide Setup Help' : 'Show Setup Guide'}
                    </button>
                  </div>
                </div>

                {showOfflineInstructions && (
                  <div className="mt-3 p-5 rounded-2xl bg-brand-secondary/35 border border-brand-secondary/60 text-xs text-brand-light leading-relaxed animate-fadeIn space-y-4">
                    <h4 className="font-extrabold text-sm text-brand-accent flex items-center gap-2">
                      <span>🚀 Two Easy Steps to Install & Setup Your Standalone Offline Application:</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                      <div className="space-y-2.5">
                        <p className="font-extrabold text-emerald-400 border-b border-brand-secondary/40 pb-1.5 flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                          <span>Open Standalone App</span>
                        </p>
                        <p className="text-brand-muted leading-relaxed">
                          Inside the AI Studio editor frame, web security blocks native downloads. Click the <span className="text-emerald-400 font-bold">"1. Click to Open Standalone"</span> button above to launch the application full-screen in a top-level tab.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <p className="font-extrabold text-teal-400 border-b border-brand-secondary/40 pb-1.5 flex items-center gap-2">
                          <span className="bg-teal-500/20 text-teal-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                          <span>Install Web App Outright</span>
                        </p>
                        <div className="space-y-2 text-brand-muted leading-relaxed">
                          <p>
                            Once open in the new tab, you can install the application to your Desktop, Phone, or Tablet:
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 pl-1">
                            <li><strong className="text-brand-light">Windows & Macs</strong>: Click the small <strong className="text-brand-accent">Install / Download Button (🖥️ or ⊕)</strong> in your browser's top URL address bar, or click Chrome's top menu (⫶) and choose <strong className="text-brand-accent">"Install App"</strong>.</li>
                            <li><strong className="text-brand-light">iPhone & iPads (iOS)</strong>: Open in Safari, press the menu's <strong className="text-brand-accent">Share Button (⎋)</strong>, scroll down and click <strong className="text-brand-accent">"Add to Home Screen"</strong>.</li>
                            <li><strong className="text-brand-light">Android Devices</strong>: Open in Chrome, click the top menu (⫶) and select <strong className="text-brand-accent">"Install App"</strong>.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-brand-secondary/30 text-[11px] text-brand-muted flex items-start sm:items-center gap-2">
                      <span className="text-amber-400 font-bold">⚠️ Data Portability Notice:</span>
                      <span>Because data saves locally in browser cache folders, you can use the <strong className="text-brand-light">Download Offline Backup File</strong> button anytime to export/backup records, meaning you never lose your printed cards!</span>
                    </div>
                  </div>
                )}
              </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard;