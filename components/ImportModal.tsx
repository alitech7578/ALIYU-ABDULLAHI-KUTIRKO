import React, { useState } from 'react';
import { DataRecord, MarriedStatus } from '../types';
import { XMarkIcon, UploadIcon } from './IconComponents';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (newRecords: DataRecord[]) => void;
}

type ImportResult = {
    success: number;
    failed: number;
    errors: string[];
};

const CSV_HEADERS = ['FirstName','MiddleName','Surname','Email','Department','SPNumber','Rank','State','LGA','MaritalStatus','BloodGroup','PhoneNumber','Photo'];
const CSV_TEMPLATE = CSV_HEADERS.join(',');

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                setError('Invalid file type. Please upload a CSV file.');
                setFile(null);
            } else {
                setError('');
                setFile(selectedFile);
                setImportResult(null);
            }
        }
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'staff-import-template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const processImport = () => {
        if (!file) return;
        setIsProcessing(true);
        setError('');
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) {
                setError("CSV file is empty or contains only headers.");
                setIsProcessing(false);
                return;
            }
            
            const headerRow = rows[0].trim().split(',');
            const headersMatch = CSV_HEADERS.every((h, i) => headerRow[i]?.trim() === h);
            if (!headersMatch) {
                setError(`Invalid CSV headers. Please use the template. Expected: ${CSV_HEADERS.join(', ')}`);
                setIsProcessing(false);
                return;
            }
            
            const newRecords: DataRecord[] = [];
            const errors: string[] = [];
            let successfulImports = 0;

            for (let i = 1; i < rows.length; i++) {
                const rowData = rows[i].trim().split(',');
                if (rowData.length < CSV_HEADERS.length - 1) { // Photo is optional at the end
                    errors.push(`Row ${i + 1}: Incorrect number of columns.`);
                    continue;
                }
                
                const [name, middleName, surname, email, department, spNumber, rank, state, lg, marriedStatus, bloodGroup, phoneNumber, photo] = rowData.map(d => d?.trim() || '');
                
                // Basic validation
                if (!name || !surname || !email || !department || !spNumber || !rank || !state || !lg || !marriedStatus || !bloodGroup || !phoneNumber) {
                     errors.push(`Row ${i + 1}: Missing one or more required fields.`);
                     continue;
                }

                newRecords.push({
                    id: crypto.randomUUID(),
                    name,
                    middleName,
                    surname,
                    email,
                    department,
                    spNumber,
                    rank,
                    state,
                    lg,
                    marriedStatus: marriedStatus as MarriedStatus,
                    bloodGroup,
                    phoneNumber,
                    createdAt: new Date().toISOString(),
                    photo: photo || '', // Use photo string if provided in CSV
                    createdBy: 'admin-import',
                });
                successfulImports++;
            }

            onImport(newRecords);
            setImportResult({ success: successfulImports, failed: errors.length, errors: errors.slice(0, 10) });
            setIsProcessing(false);
            setFile(null);
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsProcessing(false);
        }
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
            <div className="bg-brand-secondary/90 rounded-2xl shadow-2xl w-full max-w-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="import-modal-title" className="text-2xl font-bold text-brand-light">Import Staff Records</h2>
                    <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-light rounded-full transition-colors" aria-label="Close import dialog">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-brand-light">Instructions</h3>
                        <p className="text-brand-muted mt-2 text-sm">
                            Upload a CSV file with the following columns in order: <br/>
                            <code className="text-xs bg-brand-primary p-1 rounded break-all">{CSV_HEADERS.join(', ')}</code>
                        </p>
                        <p className="text-brand-muted mt-2 text-sm">
                           The 'Photo' column is optional and should contain a base64 Data URL.
                        </p>
                        <button onClick={downloadTemplate} className="mt-3 text-sm text-brand-accent hover:underline">Download CSV Template</button>
                    </div>

                    <div className="p-6 border-2 border-dashed border-brand-secondary rounded-lg text-center">
                         <input
                            type="file"
                            id="csv-upload"
                            className="hidden"
                            accept=".csv,text/csv"
                            onChange={handleFileChange}
                            disabled={isProcessing}
                        />
                        <label htmlFor="csv-upload" className={`cursor-pointer ${isProcessing ? 'cursor-not-allowed' : ''}`}>
                            <UploadIcon className="w-12 h-12 mx-auto text-brand-muted" />
                            <p className="mt-2 font-semibold text-brand-light">{file ? file.name : 'Click to upload a file'}</p>
                        </label>
                    </div>

                    {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

                    {importResult && (
                        <div className="bg-brand-primary/50 p-4 rounded-lg" role="status">
                            <h4 className="font-semibold text-brand-light">Import Complete</h4>
                            <p className="text-green-400">Successfully imported: {importResult.success} record(s).</p>
                            <p className="text-red-400">Failed to import: {importResult.failed} record(s).</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="px-4 py-2 bg-brand-muted/20 hover:bg-brand-muted/40 rounded-lg text-white font-semibold transition-colors">
                            Close
                        </button>
                        <button
                            onClick={processImport}
                            disabled={!file || isProcessing}
                            className="px-4 py-2 bg-brand-accent hover:bg-opacity-80 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-accent/50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Start Import'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportModal;