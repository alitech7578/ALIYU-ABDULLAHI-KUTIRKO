import React, { useState, useEffect } from 'react';
import { DataRecord, Student, IDCardLayoutSettings } from '../types';
import IDCard from './IDCard';
import StudentIDCard from './StudentIDCard';
import { DatabaseIcon, UserCircleIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { dbGet } from '../hooks/useIndexedDB';

// Helper to get initial layout settings to avoid mismatch
const getInitialLayoutSettings = (): IDCardLayoutSettings => ({
    staff: {
        visibleFields: ['fullName', 'rank', 'department', 'bloodGroup', 'spNumber', 'qrCode'],
    },
    student: {
        visibleFields: ['fullName', 'department', 'registrationNumber', 'expiryDate', 'qrCode'],
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
    
    // Fetch branding from local storage with setters to allow cloud sync hydration
    const [companyName, setCompanyName] = useLocalStorage('company-name', 'Data Collector Pro');
    const [companyLogo, setCompanyLogo] = useLocalStorage<string | null>('company-logo', null);
    const [companyEmail, setCompanyEmail] = useLocalStorage('company-email', 'contact@example.com');
    const [companyAddress, setCompanyAddress] = useLocalStorage('company-address', '123 Innovation Drive, Tech City');
    const [companyWebsite, setCompanyWebsite] = useLocalStorage('company-website', 'www.fcetbichi.edu.ng');
    const [companyContent, setCompanyContent] = useLocalStorage('company-content', 'Streamlining data management with intuitive solutions.');
    const [layoutSettings, setLayoutSettings] = useLocalStorage<IDCardLayoutSettings>('id-card-layout', getInitialLayoutSettings());

    useEffect(() => {
        // Hydrate branding configurations from Firestore in case we are verifying from a separate scanning device
        const fetchSystemSettings = async () => {
            try {
                const { db, doc, getDoc } = await import('../hooks/useFirebase');
                const docSnap = await getDoc(doc(db, "system-settings", "general"));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.companyName) setCompanyName(data.companyName);
                    if (data.companyLogo) setCompanyLogo(data.companyLogo);
                    if (data.companyEmail) setCompanyEmail(data.companyEmail);
                    if (data.companyAddress) setCompanyAddress(data.companyAddress);
                    if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
                    if (data.companyContent) setCompanyContent(data.companyContent);
                    if (data.layoutSettings) setLayoutSettings(data.layoutSettings);
                }
            } catch (err) {
                console.error("Failed to fetch system settings from Firestore:", err);
            }
        };
        fetchSystemSettings();
    }, []);

    useEffect(() => {
        const fetchRecord = async () => {
             try {
                const hash = window.location.hash;
                const recordId = hash.split('/id/')[1];

                if (!recordId) {
                    setError('No Record ID provided.');
                    setLoading(false);
                    return;
                }

                // Search for staff records first in IndexedDB
                let allStaffRecords: DataRecord[] = await dbGet('data-records') || [];
                if (allStaffRecords.length === 0) {
                    try {
                        allStaffRecords = JSON.parse(window.localStorage.getItem('data-records') || '[]');
                    } catch (e) {}
                }
                let foundPerson: DataRecord | Student | undefined = allStaffRecords.find(r => r.id === recordId);

                // If not found in staff, search in students
                if (!foundPerson) {
                    let allStudentRecords: Student[] = await dbGet('student-records') || [];
                    if (allStudentRecords.length === 0) {
                        try {
                            allStudentRecords = JSON.parse(window.localStorage.getItem('student-records') || '[]');
                        } catch (e) {}
                    }
                    foundPerson = allStudentRecords.find(s => s.id === recordId);
                }

                // If still not found locally (common when scanned on another device like a phone), fetch directly from Firestore cloud!
                if (!foundPerson) {
                    try {
                        const { db, doc, getDoc } = await import('../hooks/useFirebase');
                        // Try fetching from staff-records
                        const staffDocRef = doc(db, 'staff-records', recordId);
                        const staffDocSnap = await getDoc(staffDocRef);
                        if (staffDocSnap.exists()) {
                            foundPerson = staffDocSnap.data() as DataRecord;
                        } else {
                            // Try fetching from student-records
                            const studentDocRef = doc(db, 'student-records', recordId);
                            const studentDocSnap = await getDoc(studentDocRef);
                            if (studentDocSnap.exists()) {
                                foundPerson = studentDocSnap.data() as Student;
                            }
                        }
                    } catch (fbErr) {
                        console.error("Failed to query from Firebase Firestore:", fbErr);
                    }
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
        
        fetchRecord();
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
