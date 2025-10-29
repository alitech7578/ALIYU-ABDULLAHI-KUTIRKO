import React, { useState } from 'react';
import { DataRecord, Student, MarriedStatus } from '../types';
import { XMarkIcon, UsersIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon } from './IconComponents';

interface BulkGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBulkAdd: (newRecords: (DataRecord | Student)[]) => void;
    recordType: 'staff' | 'students';
}

const staffInstructions = "Paste comma-separated data with columns in this exact order: FirstName, MiddleName, Surname, Email, Department, SPNumber, Rank, PhoneNumber, MarriedStatus, BloodGroup, State, LGA.";
const staffExample = "John,Quincy,Doe,john.q.doe@example.com,Security,SP123,Sergeant,08012345678,Married,O+,Kano,Kano Municipal";
const staffColumnCount = 12;

const studentInstructions = "Paste comma-separated data with columns in this exact order: FirstName, MiddleName, Surname, Email, Department, RegistrationNumber.";
const studentExample = "Jane,Marie,Smith,jane.m.smith@example.com,Computer Science,2024/CS/001";
const studentColumnCount = 6;


type ParsedRecord = (DataRecord | Student) & { originalLine: number };
type ErrorLine = { lineNumber: number; line: string; error: string };

const BulkGenerateModal: React.FC<BulkGenerateModalProps> = ({ isOpen, onClose, onBulkAdd, recordType }) => {
    const [textInput, setTextInput] = useState('');
    const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
    const [errorLines, setErrorLines] = useState<ErrorLine[]>([]);
    const [isParsed, setIsParsed] = useState(false);

    const instructions = recordType === 'staff' ? staffInstructions : studentInstructions;
    const example = recordType === 'staff' ? staffExample : studentExample;
    const expectedColumns = recordType === 'staff' ? staffColumnCount : studentColumnCount;

    const handleReset = () => {
        setTextInput('');
        setParsedRecords([]);
        setErrorLines([]);
        setIsParsed(false);
    };
    
    const handleParse = () => {
        const lines = textInput.split('\n').filter(line => line.trim() !== '');
        const newParsedRecords: ParsedRecord[] = [];
        const newErrorLines: ErrorLine[] = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const columns = line.split(',').map(c => c.trim());

            if (columns.length !== expectedColumns) {
                newErrorLines.push({ lineNumber, line, error: `Expected ${expectedColumns} columns, but found ${columns.length}.` });
                return;
            }

            if (recordType === 'staff') {
                const [name, middleName, surname, email, department, spNumber, rank, phoneNumber, marriedStatus, bloodGroup, state, lg] = columns;
                newParsedRecords.push({
                    id: crypto.randomUUID(),
                    name, middleName, surname, email, department, spNumber, rank, phoneNumber,
                    marriedStatus: marriedStatus as MarriedStatus, bloodGroup, state, lg,
                    photo: '',
                    createdAt: new Date().toISOString(),
                    createdBy: 'admin-bulk-add',
                    originalLine: lineNumber,
                });
            } else {
                const [firstName, middleName, surname, email, department, registrationNumber] = columns;
                newParsedRecords.push({
                    id: crypto.randomUUID(),
                    firstName, middleName, surname, email, department, registrationNumber,
                    photo: '',
                    createdAt: new Date().toISOString(),
                    createdBy: 'admin-bulk-add',
                    originalLine: lineNumber,
                });
            }
        });

        setParsedRecords(newParsedRecords);
        setErrorLines(newErrorLines);
        setIsParsed(true);
    };

    const handleConfirmAdd = () => {
        onBulkAdd(parsedRecords);
        handleReset();
        onClose();
    };
    
    const handleClose = () => {
        handleReset();
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="bulk-add-modal-title">
            <div className="bg-brand-secondary/90 rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 id="bulk-add-modal-title" className="text-2xl font-bold text-brand-light">Bulk Add {recordType === 'staff' ? 'Staff' : 'Student'} Records</h2>
                    <button onClick={handleClose} className="p-2 text-brand-muted hover:text-brand-light rounded-full transition-colors" aria-label="Close dialog">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                    {!isParsed ? (
                        <>
                            <div>
                                <h3 className="font-semibold text-brand-light">Instructions</h3>
                                <p className="text-brand-muted mt-1 text-sm">{instructions}</p>
                                <p className="text-brand-muted mt-2 text-sm">Example:</p>
                                <code className="text-xs bg-brand-primary p-2 rounded block mt-1 break-all">{example}</code>
                            </div>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Paste data here, one record per line..."
                                className="w-full h-64 p-3 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-brand-accent focus:border-brand-accent transition-colors text-sm font-mono"
                            />
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-brand-light text-lg">Preview & Confirm</h3>
                                <p className="text-brand-muted text-sm">Review the parsed data before adding it to the database.</p>
                            </div>
                            {parsedRecords.length > 0 && (
                                <div className="bg-brand-primary/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-400">Successfully Parsed Records ({parsedRecords.length})</h4>
                                    <div className="max-h-60 overflow-y-auto mt-2 text-xs">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-brand-secondary">
                                                    <th className="p-1">Line</th>
                                                    <th className="p-1">Name</th>
                                                    <th className="p-1">Email</th>
                                                    <th className="p-1">{recordType === 'staff' ? 'SP Number' : 'Reg. Number'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {parsedRecords.map(rec => (
                                                <tr key={rec.id} className="border-t border-brand-secondary/50">
                                                    <td className="p-1">{rec.originalLine}</td>
                                                    <td className="p-1">{'firstName' in rec ? `${rec.firstName} ${rec.surname}` : `${(rec as DataRecord).name} ${(rec as DataRecord).surname}`}</td>
                                                    <td className="p-1">{rec.email}</td>
                                                    <td className="p-1">{'registrationNumber' in rec ? rec.registrationNumber : (rec as DataRecord).spNumber}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                             {errorLines.length > 0 && (
                                <div className="bg-red-900/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-400">Lines with Errors ({errorLines.length})</h4>
                                    <div className="max-h-60 overflow-y-auto mt-2 text-xs font-mono">
                                       {errorLines.map(err => (
                                           <div key={err.lineNumber} className="p-1 border-b border-red-400/20">
                                               <p><span className="font-bold">Line {err.lineNumber}:</span> {err.error}</p>
                                               <p className="text-red-300/70 truncate">Content: {err.line}</p>
                                           </div>
                                       ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-auto flex-shrink-0 border-t border-brand-secondary">
                    {!isParsed ? (
                         <>
                            <button onClick={handleClose} className="px-4 py-2 bg-brand-muted/20 hover:bg-brand-muted/40 rounded-lg text-white font-semibold transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleParse}
                                disabled={!textInput.trim()}
                                className="px-6 py-2 bg-brand-accent hover:bg-opacity-80 rounded-lg text-white font-semibold transition-colors disabled:bg-brand-accent/50 disabled:cursor-not-allowed"
                            >
                                Parse & Preview
                            </button>
                         </>
                    ) : (
                        <>
                            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-brand-muted/20 hover:bg-brand-muted/40 rounded-lg text-white font-semibold transition-colors">
                                <TrashIcon className="w-5 h-5"/>
                                <span>Start Over</span>
                            </button>
                            <button
                                onClick={handleConfirmAdd}
                                disabled={parsedRecords.length === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors disabled:bg-green-600/50 disabled:cursor-not-allowed"
                            >
                                <PlusCircleIcon className="w-6 h-6"/>
                                <span>Add {parsedRecords.length} Valid Records</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkGenerateModal;
