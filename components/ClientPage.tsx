import React, { useState, useEffect } from 'react';
import { DataRecord, Student } from '../types';
import IDCard from './IDCard';
import StudentIDCard from './StudentIDCard';
import { DatabaseIcon, UserCircleIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Type guard to check if the record is a staff member (DataRecord)
const isDataRecord = (person: DataRecord | Student): person is DataRecord => {
  return (person as DataRecord).spNumber !== undefined;
};

const ClientPage: React.FC = () => {
    const [person, setPerson] = useState<DataRecord | Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Fetch branding from local storage
    const [companyName] = useLocalStorage('company-name', 'Data Collector Pro');
    const [companyLogo] = useLocalStorage<string | null>('company-logo', null);
    const [companyEmail] = useLocalStorage('company-email', 'contact@example.com');
    const [companyAddress] = useLocalStorage('company-address', '123 Innovation Drive, Tech City');
    const [companyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
    const [companyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');

    useEffect(() => {
        const fetchRecordFromLocalStorage = () => {
             try {
                const hash = window.location.hash;
                const recordId = hash.split('/id/')[1];

                if (!recordId) {
                    setError('No Record ID provided.');
                    setLoading(false);
                    return;
                }

                // Search for staff records first
                const allStaffRecords: DataRecord[] = JSON.parse(window.localStorage.getItem('data-records') || '[]');
                let foundPerson: DataRecord | Student | undefined = allStaffRecords.find(r => r.id === recordId);

                // If not found in staff, search in students
                if (!foundPerson) {
                    const allStudentRecords: Student[] = JSON.parse(window.localStorage.getItem('student-records') || '[]');
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
        
        fetchRecordFromLocalStorage();
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
                {loading && <p>Loading Record...</p>}
                
                {error && (
                    <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-2xl">
                        <UserCircleIcon className="w-16 h-16 mx-auto text-red-400/50" />
                        <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
                        <p className="mt-2 max-w-md">{error}</p>
                    </div>
                )}
                
                {person && (
                    isDataRecord(person)
                        ? <IDCard record={person} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} />
                        : <StudentIDCard student={person as Student} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} />
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