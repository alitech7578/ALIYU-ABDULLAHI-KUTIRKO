import React, { useMemo } from 'react';
import { Student } from '../types';
import { TrashIcon, TableIcon, IdCardIcon } from './IconComponents';

interface StudentTableProps {
  records: Student[];
  onDeleteRecord: (id: string) => void;
  onShowIdCard: (student: Student) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ records, onDeleteRecord, onShowIdCard, selectedIds, onSelectionChange }) => {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(records.map(r => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };
  
  const isAllSelected = useMemo(() => records.length > 0 && selectedIds.length === records.length, [records, selectedIds]);


  if (records.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-brand-secondary/30 rounded-2xl">
        <TableIcon className="w-16 h-16 mx-auto text-brand-muted/50" />
        <h3 className="mt-4 text-xl font-semibold text-brand-light">No Student Records Found</h3>
        <p className="mt-2 text-brand-muted">Start by adding a new student record using the form.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-primary/50">
            <tr>
              <th scope="col" className="p-4 sm:p-5">
                  <input 
                      type="checkbox"
                      className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all student records"
                  />
              </th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Photo</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">First Name</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Middle Name</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Surname</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Email</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Department</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Registration No.</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Created At</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-secondary">
            {records.map((record) => (
              <tr key={record.id} className={`transition-colors ${selectedIds.includes(record.id) ? 'bg-brand-accent/20' : 'hover:bg-brand-primary/20'}`}>
                <td className="p-4 sm:p-5">
                  <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => handleSelectRow(record.id)}
                        aria-label={`Select record for ${record.firstName} ${record.surname}`}
                    />
                </td>
                <td className="p-4 sm:p-5">
                    {record.photo && <img src={record.photo} alt={`${record.firstName} ${record.surname}`} className="h-10 w-10 rounded-full object-cover"/>}
                </td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.firstName}</td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.middleName}</td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.surname}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{record.email}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.department}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.registrationNumber}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{new Date(record.createdAt).toLocaleDateString()}</td>
                <td className="p-4 sm:p-5 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onShowIdCard(record)} className="text-blue-400 hover:text-blue-300 transition-colors" title="View ID Card"><IdCardIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteRecord(record.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Record"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;