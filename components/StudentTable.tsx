import React, { useMemo } from 'react';
import { Student } from '../types';
import { TrashIcon, TableIcon, IdCardIcon, PencilIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, UserCircleIcon } from './IconComponents';
import PaginationControls from './PaginationControls';

type SortDirection = 'ascending' | 'descending';
interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

interface StudentTableProps {
  records: Student[];
  onDeleteRecord: (id: string) => void;
  onShowIdCard: (student: Student) => void;
  onEditRecord: (student: Student) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onSort: (key: keyof Student) => void;
  sortConfig: SortConfig<Student> | null;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  recordsPerPage: number;
}

const SortableHeader = ({ label, columnKey, sortConfig, onSort }: { label: string; columnKey: keyof Student; sortConfig: SortConfig<Student> | null; onSort: (key: keyof Student) => void; }) => {
    const getSortIcon = () => {
        const iconClass = "w-4 h-4 ml-1 transition-opacity";
        if (sortConfig?.key !== columnKey) {
            return <ChevronUpDownIcon className={`${iconClass} opacity-25 group-hover:opacity-75`} />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className={iconClass} />;
        }
        return <ChevronDownIcon className={iconClass} />;
    };
    return (
        <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">
            <button onClick={() => onSort(columnKey)} className="flex items-center group hover:text-brand-light transition-colors">
                <span>{label}</span>
                {getSortIcon()}
            </button>
        </th>
    );
};

const StudentTable: React.FC<StudentTableProps> = ({ records, onDeleteRecord, onShowIdCard, onEditRecord, selectedIds, onSelectionChange, currentPage, totalPages, onPageChange, totalRecords, recordsPerPage, onSort, sortConfig }) => {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageIds = records.map(r => r.id);
    const selectionSet = new Set(selectedIds);
    if (e.target.checked) {
      currentPageIds.forEach(id => selectionSet.add(id));
    } else {
      currentPageIds.forEach(id => selectionSet.delete(id));
    }
    onSelectionChange(Array.from(selectionSet));
  };

  const handleSelectRow = (id: string) => {
    const selectionSet = new Set(selectedIds);
    if (selectionSet.has(id)) {
      selectionSet.delete(id);
    } else {
      selectionSet.add(id);
    }
    onSelectionChange(Array.from(selectionSet));
  };
  
  const isAllSelected = useMemo(() => records.length > 0 && records.every(r => selectedIds.includes(r.id)), [records, selectedIds]);
  
  if (totalRecords === 0) {
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
                      aria-label="Select all student records on this page"
                  />
              </th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Photo</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">First Name</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Middle Name</th>
              <SortableHeader label="Surname" columnKey="surname" sortConfig={sortConfig} onSort={onSort} />
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Email</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">School</th>
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Department</th>
              <SortableHeader label="Registration No." columnKey="registrationNumber" sortConfig={sortConfig} onSort={onSort} />
              <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Exp. Date</th>
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
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">
                  {record.photo ? (
                    <img src={record.photo} alt="Student" className="w-10 h-10 rounded-full object-cover border border-brand-secondary" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-brand-muted" />
                    </div>
                  )}
                </td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.firstName}</td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.middleName}</td>
                <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.surname}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{record.email}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.school}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.department}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.registrationNumber}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.expirationDate}</td>
                <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{new Date(record.createdAt).toLocaleDateString()}</td>
                <td className="p-4 sm:p-5 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onShowIdCard(record)} className="text-blue-400 hover:text-blue-300 transition-colors" title="View ID Card"><IdCardIcon className="w-5 h-5"/></button>
                    <button onClick={() => onEditRecord(record)} className="text-yellow-400 hover:text-yellow-300 transition-colors" title="Edit Record"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteRecord(record.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Record"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
        />
    </div>
  );
};

export default StudentTable;