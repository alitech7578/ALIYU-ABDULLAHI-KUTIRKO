import React, { useState, useMemo, useCallback } from 'react';
import { DataRecord, Student } from '../types';
import Header from './Header';
import DataForm from './DataForm';
import DataTable from './DataTable';
import BulkIDPrint from './BulkIDPrint';
import { PlusCircleIcon, IdCardIcon, DownloadIcon, PencilIcon, UploadIcon, TrashIcon, DocumentArrowUpIcon, UserCircleIcon, UsersIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ImportModal from './ImportModal';
import StudentForm from './StudentForm';
import StudentTable from './StudentTable';
import StudentIDCardModal from './StudentIDCardModal';
import BulkStudentIDPrint from './BulkStudentIDPrint';
import StudentImportModal from './StudentImportModal';


const AdminDashboard: React.FC = () => {
  const [records, setRecords] = useLocalStorage<DataRecord[]>('data-records', []);
  const [students, setStudents] = useLocalStorage<Student[]>('student-records', []);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPrintViewVisible, setIsPrintViewVisible] = useState(false);
  const [isStudentPrintViewVisible, setIsStudentPrintViewVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isStudentImportModalVisible, setIsStudentImportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');
  const [selectedStudentForId, setSelectedStudentForId] = useState<Student | null>(null);
  
  const [companyName, setCompanyName] = useLocalStorage('company-name', 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI');
  const [companyLogo, setCompanyLogo] = useLocalStorage<string | null>('company-logo', null);
  const [companyEmail, setCompanyEmail] = useLocalStorage('company-email', 'contact@fcetbichi.edu.ng');
  const [companyAddress, setCompanyAddress] = useLocalStorage('company-address', 'P.M.B. 3473, Kano');
  const [companyWebsite, setCompanyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
  const [companyContent, setCompanyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');

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

  const selectedRecords = useMemo(() => {
    return records.filter(r => selectedIds.includes(r.id));
  }, [records, selectedIds]);

  const selectedStudents = useMemo(() => {
    return students.filter(s => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const addRecord = (record: DataRecord) => {
    setRecords(prevRecords => [record, ...prevRecords]);
    setIsFormVisible(false);
  };

  const addStudent = (student: Student) => {
    setStudents(prev => [student, ...prev]);
    setIsFormVisible(false);
  };
  
  const handleImport = (newRecords: DataRecord[]) => {
    if (newRecords.length > 0) {
      setRecords(prevRecords => [...newRecords, ...prevRecords]);
    }
  };

  const handleStudentImport = (newStudents: Student[]) => {
    if (newStudents.length > 0) {
      setStudents(prevStudents => [...newStudents, ...prevStudents]);
    }
  };

  const deleteRecord = useCallback((id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff record?")) return;
    setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    setSelectedIds(prevSelected => prevSelected.filter(selectedId => selectedId !== id));
  }, [setRecords, setSelectedIds]);

  const deleteStudent = useCallback((id: string) => {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;
    setStudents(prev => prev.filter(student => student.id !== id));
    setSelectedStudentIds(prevSelected => prevSelected.filter(selectedId => selectedId !== id));
  }, [setStudents, setSelectedStudentIds]);

  const deleteSelectedRecords = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected record(s)? This action cannot be undone.`)) return;
    setRecords(prevRecords => prevRecords.filter(record => !selectedIds.includes(record.id)));
    setSelectedIds([]);
  }, [selectedIds, setRecords, setSelectedIds]);

  const deleteSelectedStudents = useCallback(() => {
    if (selectedStudentIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedStudentIds.length} selected student(s)? This action cannot be undone.`)) return;
    setStudents(prev => prev.filter(student => !selectedStudentIds.includes(student.id)));
    setSelectedStudentIds([]);
  }, [selectedStudentIds, setStudents, setSelectedStudentIds]);
  
  const handleExport = () => {
    if (records.length === 0) return alert('No records to export.');
    const headers = ['ID','FirstName','MiddleName','Surname','Email','Department','SPNumber','Rank','State','LGA','MaritalStatus','BloodGroup','PhoneNumber','CreatedAt','CreatedBy'];
    const csvRows = [headers.join(',')];
    const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
    records.forEach(record => {
      // Exclude the lengthy base64 photo data from the export
      const { photo, ...rest } = record;
      const row = [rest.id, rest.name, rest.middleName, rest.surname, rest.email, rest.department, rest.spNumber, rest.rank, rest.state, rest.lg, rest.marriedStatus, rest.bloodGroup, rest.phoneNumber, rest.createdAt, rest.createdBy].map(escapeCSV);
      csvRows.push(row.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `records-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for logo
          alert('Logo size should not exceed 1MB.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (isPrintViewVisible) {
    return <BulkIDPrint records={selectedRecords} onClose={() => setIsPrintViewVisible(false)} companyName={companyName} companyLogo={companyLogo} companyEmail={companyEmail} companyAddress={companyAddress} companyWebsite={companyWebsite} />;
  }

  if (isStudentPrintViewVisible) {
    return <BulkStudentIDPrint students={selectedStudents} onClose={() => setIsStudentPrintViewVisible(false)} companyName={companyName} companyLogo={companyLogo} companyEmail={companyEmail} companyAddress={companyAddress} companyWebsite={companyWebsite} />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary text-brand-light font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header companyName={companyName} companyLogo={companyLogo} />
        <main className="mt-12">
          
          {/* Branding Control Section */}
          <div className="bg-brand-secondary/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-brand-light mb-4">Branding Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name Editor */}
                <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Name</label>
                    <div className="flex items-center gap-2">
                        {isEditingName ? (
                            <input type="text" value={tempCompanyName} onChange={(e) => setTempCompanyName(e.target.value)} className="block w-full px-4 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent"/>
                        ) : ( <p className="text-lg font-bold p-2 min-h-[42px]">{companyName}</p> )}
                        {isEditingName ? (
                          <>
                            <button onClick={() => { setCompanyName(tempCompanyName); setIsEditingName(false); }} className="px-3 py-2 bg-green-500 rounded-lg text-white text-sm font-semibold">Save</button>
                            <button onClick={() => setIsEditingName(false)} className="px-3 py-2 bg-gray-500 rounded-lg text-white text-sm font-semibold">Cancel</button>
                          </>
                        ) : ( <button onClick={() => { setTempCompanyName(companyName); setIsEditingName(true); }} className="p-2 text-brand-muted hover:text-brand-light"><PencilIcon className="w-5 h-5"/></button> )}
                    </div>
                </div>
                {/* Company Email Editor */}
                <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Email</label>
                    <div className="flex items-center gap-2">
                        {isEditingEmail ? (
                            <input type="email" value={tempCompanyEmail} onChange={(e) => setTempCompanyEmail(e.target.value)} className="block w-full px-4 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent"/>
                        ) : ( <p className="text-lg font-bold p-2 min-h-[42px]">{companyEmail}</p> )}
                        {isEditingEmail ? (
                          <>
                            <button onClick={() => { setCompanyEmail(tempCompanyEmail); setIsEditingEmail(false); }} className="px-3 py-2 bg-green-500 rounded-lg text-white text-sm font-semibold">Save</button>
                            <button onClick={() => setIsEditingEmail(false)} className="px-3 py-2 bg-gray-500 rounded-lg text-white text-sm font-semibold">Cancel</button>
                          </>
                        ) : ( <button onClick={() => { setTempCompanyEmail(companyEmail); setIsEditingEmail(true); }} className="p-2 text-brand-muted hover:text-brand-light"><PencilIcon className="w-5 h-5"/></button> )}
                    </div>
                </div>
                {/* Company Address Editor */}
                <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Address</label>
                    <div className="flex items-center gap-2">
                        {isEditingAddress ? (
                            <input type="text" value={tempCompanyAddress} onChange={(e) => setTempCompanyAddress(e.target.value)} className="block w-full px-4 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent"/>
                        ) : ( <p className="text-lg font-bold p-2 min-h-[42px]">{companyAddress}</p> )}
                        {isEditingAddress ? (
                          <>
                            <button onClick={() => { setCompanyAddress(tempCompanyAddress); setIsEditingAddress(false); }} className="px-3 py-2 bg-green-500 rounded-lg text-white text-sm font-semibold">Save</button>
                            <button onClick={() => setIsEditingAddress(false)} className="px-3 py-2 bg-gray-500 rounded-lg text-white text-sm font-semibold">Cancel</button>
                          </>
                        ) : ( <button onClick={() => { setTempCompanyAddress(companyAddress); setIsEditingAddress(true); }} className="p-2 text-brand-muted hover:text-brand-light"><PencilIcon className="w-5 h-5"/></button> )}
                    </div>
                </div>
                 {/* Company Website Editor */}
                <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Website</label>
                    <div className="flex items-center gap-2">
                        {isEditingWebsite ? (
                            <input type="text" value={tempCompanyWebsite} onChange={(e) => setTempCompanyWebsite(e.target.value)} className="block w-full px-4 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent"/>
                        ) : ( <p className="text-lg font-bold p-2 min-h-[42px]">{companyWebsite}</p> )}
                        {isEditingWebsite ? (
                          <>
                            <button onClick={() => { setCompanyWebsite(tempCompanyWebsite); setIsEditingWebsite(false); }} className="px-3 py-2 bg-green-500 rounded-lg text-white text-sm font-semibold">Save</button>
                            <button onClick={() => setIsEditingWebsite(false)} className="px-3 py-2 bg-gray-500 rounded-lg text-white text-sm font-semibold">Cancel</button>
                          </>
                        ) : ( <button onClick={() => { setTempCompanyWebsite(companyWebsite); setIsEditingWebsite(true); }} className="p-2 text-brand-muted hover:text-brand-light"><PencilIcon className="w-5 h-5"/></button> )}
                    </div>
                </div>
                 {/* Company Logo Uploader */}
                 <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Logo</label>
                    <div className="flex items-center gap-4">
                        {companyLogo ? (
                            <img src={companyLogo} alt="Company Logo Preview" className="h-12 w-auto bg-white/10 p-1 rounded-lg" />
                        ) : (
                            <div className="h-12 w-24 rounded-lg bg-brand-secondary flex items-center justify-center">
                                <span className="text-xs text-brand-muted">No Logo</span>
                            </div>
                        )}
                        <input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                        <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">
                            <UploadIcon className="w-5 h-5"/>
                            <span>{companyLogo ? 'Change Logo' : 'Upload Logo'}</span>
                        </label>
                    </div>
                </div>
              </div>
               {/* Company Content Editor */}
                <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">Company Content / About Us</label>
                    <div className="flex items-start gap-2">
                        {isEditingContent ? (
                            <textarea value={tempCompanyContent} onChange={(e) => setTempCompanyContent(e.target.value)} rows={3} className="block w-full px-4 py-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent"/>
                        ) : ( <p className="text-md p-2 min-h-[42px] text-brand-muted flex-1">{companyContent}</p> )}
                        
                        <div className="flex flex-col gap-2">
                          {isEditingContent ? (
                            <>
                              <button onClick={() => { setCompanyContent(tempCompanyContent); setIsEditingContent(false); }} className="px-3 py-2 bg-green-500 rounded-lg text-white text-sm font-semibold">Save</button>
                              <button onClick={() => setIsEditingContent(false)} className="px-3 py-2 bg-gray-500 rounded-lg text-white text-sm font-semibold">Cancel</button>
                            </>
                          ) : ( <button onClick={() => { setTempCompanyContent(companyContent); setIsEditingContent(true); }} className="p-2 text-brand-muted hover:text-brand-light"><PencilIcon className="w-5 h-5"/></button> )}
                        </div>
                    </div>
                </div>
            </div>
          </div>


          <div className="bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex border-b border-brand-secondary/50">
              <button 
                  onClick={() => { setActiveTab('staff'); setIsFormVisible(false); }}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-colors focus:outline-none ${activeTab === 'staff' ? 'text-brand-light border-b-2 border-brand-accent' : 'text-brand-muted hover:text-brand-light'}`}
              >
                  <UserCircleIcon className="w-6 h-6" />
                  <span>Staff</span>
              </button>
              <button 
                  onClick={() => { setActiveTab('students'); setIsFormVisible(false); }}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-colors focus:outline-none ${activeTab === 'students' ? 'text-brand-light border-b-2 border-brand-accent' : 'text-brand-muted hover:text-brand-light'}`}
              >
                  <UsersIcon className="w-6 h-6" />
                  <span>Students</span>
              </button>
            </div>

            <div className="flex justify-between items-center my-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-brand-light">
                {isFormVisible ? `Add New ${activeTab === 'staff' ? 'Staff' : 'Student'}` : `${activeTab === 'staff' ? 'Staff' : 'Student'} Records`}
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                {activeTab === 'staff' && selectedIds.length > 0 && (
                  <>
                    <button onClick={() => setIsPrintViewVisible(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-500/80 hover:bg-green-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                      <IdCardIcon className="w-6 h-6" />
                      <span>Generate IDs ({selectedIds.length})</span>
                    </button>
                    <button onClick={deleteSelectedRecords} className="flex items-center space-x-2 px-4 py-2 bg-red-500/80 hover:bg-red-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                      <TrashIcon className="w-6 h-6" />
                      <span>Delete ({selectedIds.length})</span>
                    </button>
                  </>
                )}
                {activeTab === 'students' && selectedStudentIds.length > 0 && (
                  <>
                    <button onClick={() => setIsStudentPrintViewVisible(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-500/80 hover:bg-green-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                      <IdCardIcon className="w-6 h-6" />
                      <span>Generate IDs ({selectedStudentIds.length})</span>
                    </button>
                    <button onClick={deleteSelectedStudents} className="flex items-center space-x-2 px-4 py-2 bg-red-500/80 hover:bg-red-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                      <TrashIcon className="w-6 h-6" />
                      <span>Delete ({selectedStudentIds.length})</span>
                    </button>
                  </>
                )}
                {activeTab === 'staff' && (
                  <>
                    <button onClick={handleExport} disabled={records.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500/100 transition-all duration-300 rounded-lg text-white font-semibold disabled:bg-gray-500/50 disabled:cursor-not-allowed">
                      <DownloadIcon className="w-6 h-6" />
                      <span>Export (CSV)</span>
                    </button>
                    <button onClick={() => setIsImportModalVisible(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-500/80 hover:bg-purple-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                        <DocumentArrowUpIcon className="w-6 h-6" />
                        <span>Import (CSV)</span>
                    </button>
                  </>
                )}
                 {activeTab === 'students' && (
                  <>
                    <button onClick={() => setIsStudentImportModalVisible(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-500/80 hover:bg-purple-500/100 transition-all duration-300 rounded-lg text-white font-semibold">
                        <DocumentArrowUpIcon className="w-6 h-6" />
                        <span>Import (CSV)</span>
                    </button>
                  </>
                )}
                <button onClick={() => setIsFormVisible(!isFormVisible)} className="flex items-center space-x-2 px-4 py-2 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-semibold">
                  <PlusCircleIcon className={`w-6 h-6 transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`} />
                  <span>{isFormVisible ? 'Cancel' : `Add New ${activeTab === 'staff' ? 'Staff' : 'Student'}`}</span>
                </button>
              </div>
            </div>
            
            {isFormVisible && activeTab === 'staff' && <DataForm onAddRecord={addRecord} />}
            {isFormVisible && activeTab === 'students' && <StudentForm onAddStudent={addStudent} />}
          </div>

          <div className="mt-10">
            {activeTab === 'staff' && (
              <DataTable 
                records={records} 
                onDeleteRecord={deleteRecord}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                companyName={companyName}
                companyLogo={companyLogo}
                companyEmail={companyEmail}
                companyAddress={companyAddress}
                companyWebsite={companyWebsite}
              />
            )}
            {activeTab === 'students' && (
              <StudentTable
                records={students}
                onDeleteRecord={deleteStudent}
                onShowIdCard={setSelectedStudentForId}
                selectedIds={selectedStudentIds}
                onSelectionChange={setSelectedStudentIds}
              />
            )}
          </div>
        </main>
      </div>
      <ImportModal 
        isOpen={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImport={handleImport}
      />
      <StudentImportModal
        isOpen={isStudentImportModalVisible}
        onClose={() => setIsStudentImportModalVisible(false)}
        onImport={handleStudentImport}
      />
      {selectedStudentForId && (
        <StudentIDCardModal
          student={selectedStudentForId}
          onClose={() => setSelectedStudentForId(null)}
          companyName={companyName}
          companyLogo={companyLogo}
          companyEmail={companyEmail}
          companyAddress={companyAddress}
          companyWebsite={companyWebsite}
        />
      )}
    </div>
  );
};

export default AdminDashboard;