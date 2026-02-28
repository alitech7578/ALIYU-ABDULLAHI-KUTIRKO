import React, { useState, useEffect } from 'react';
import { DataRecord, Student, IDCardLayoutSettings } from '../types';
import IDCard from './IDCard';
import StudentIDCard from './StudentIDCard';
import { DatabaseIcon, UserCircleIcon, SpinnerIcon } from './IconComponents';
import { fetchData } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Helper to get initial layout settings to avoid mismatch
const getInitialLayoutSettings = (): IDCardLayoutSettings => ({
    staff: {
        visibleFields: ['fullName', 'rank', 'department', 'bloodGroup', 'spNumber', 'qrCode'],
    },
    student: {
        visibleFields: ['fullName', 'department', 'registrationNumber', 'school', 'qrCode'],
    },
});

// Type guard to check if the record is a staff member (DataRecord)
const isDataRecord = (person: DataRecord | Student): person is DataRecord => {
  return (person as DataRecord).spNumber !== undefined;
};

const ClientPage: React.FC = () => {
    const [person, setPerson] = useState<DataRecord | Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Local states for branding (will be updated from server)
    const [companyName, setCompanyName] = useState('Data Collector Pro');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [companyEmail, setCompanyEmail] = useState('contact@example.com');
    const [companyAddress, setCompanyAddress] = useState('123 Innovation Drive, Tech City');
    const [companyWebsite, setCompanyWebsite] = useState('www.fcetbichi.edu.ng');
    const [companyContent, setCompanyContent] = useState('Streamlining data management with intuitive solutions.');
    const [layoutSettings, setLayoutSettings] = useState<IDCardLayoutSettings>(getInitialLayoutSettings());

    useEffect(() => {
        const fetchRecordFromServer = async () => {
             try {
                const hash = window.location.hash;
                const recordId = hash.split('/id/')[1];

                if (!recordId) {
                    setError('No Record ID provided.');
                    setLoading(false);
                    return;
                }

                const data = await fetchData();
                
                // Update branding from server
                if (data.branding) {
                    if (data.branding.companyName) setCompanyName(data.branding.companyName);
                    if (data.branding.companyLogo) setCompanyLogo(data.branding.companyLogo);
                    if (data.branding.companyEmail) setCompanyEmail(data.branding.companyEmail);
                    if (data.branding.companyAddress) setCompanyAddress(data.branding.companyAddress);
                    if (data.branding.companyWebsite) setCompanyWebsite(data.branding.companyWebsite);
                    if (data.branding.companyContent) setCompanyContent(data.branding.companyContent);
                    if (data.branding.layoutSettings) setLayoutSettings(data.branding.layoutSettings);
                }

                // Search for staff records first
                const allStaffRecords: DataRecord[] = data.records || [];
                let foundPerson: DataRecord | Student | undefined = allStaffRecords.find(r => r.id === recordId);

                // If not found in staff, search in students
                if (!foundPerson) {
                    const allStudentRecords: Student[] = data.students || [];
                    foundPerson = allStudentRecords.find(s => s.id === recordId);
                }

                if (foundPerson) {
                    setPerson(foundPerson);
                } else {
                    throw new Error('Record not found. The link may be invalid or the record has been deleted.');
                }

            } catch (e: any) {
                setError(e.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        }
        
        fetchRecordFromServer();
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary text-brand-light font-sans flex flex-col items-center justify-center p-4">
             <header className="absolute top-0 left-0 w-full p-6 flex items-center gap-3 z-10">
                {companyLogo ? (
                  <img src={companyLogo} alt={`${companyName} Logo`} className="h-8 object-contain"/>
                ) : (
                  <DatabaseIcon className="w-8 h-8 text-brand-accent" />
                )}
                <h1 className="text-lg font-bold text-brand-light">{companyName}</h1>
            </header>
            
            <main className="flex flex-col items-center justify-center">
                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <SpinnerIcon className="w-12 h-12 text-brand-accent animate-spin" />
                        <p className="text-brand-muted animate-pulse">Fetching Record...</p>
                    </div>
                )}
                
                {error && (
                    <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-2xl">
                        <UserCircleIcon className="w-16 h-16 mx-auto text-red-400/50" />
                        <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
                        <p className="mt-2 max-w-md">{error}</p>
                    </div>
                )}
                
                {person && (
                    isDataRecord(person)
                        ? <IDCard record={person} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} layoutSettings={layoutSettings.staff} />
                        : <StudentIDCard student={person as Student} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} layoutSettings={layoutSettings.student} />
                )}
            </main>

            <footer className="absolute bottom-0 w-full p-6 text-center text-brand-muted text-sm">
                <p className="max-w-2xl mx-auto">{companyContent}</p>
                <div className="mt-2 flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                    <span>{companyAddress}</span>
                    <span className="hidden sm:inline">|</span>
                    <a href={`mailto:${companyEmail}`} className="text-brand-accent hover:underline">{companyEmail}</a>
                </div>
            </footer>
        </div>
    );
};

export default ClientPage;