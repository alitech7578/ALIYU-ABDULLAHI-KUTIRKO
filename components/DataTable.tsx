import React, { useState, useMemo } from 'react';
import { DataRecord, IDCardLayoutSettings } from '../types';
import { TrashIcon, TableIcon, IdCardIcon, PencilIcon, UserCircleIcon } from './IconComponents';
import IDCardModal from './IDCardModal';
import PaginationControls from './PaginationControls';

interface DataTableProps {
  records: DataRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord?: (record: DataRecord) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  showAdminActions?: boolean;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
  provostSignature: string | null;
  layoutSettings: IDCardLayoutSettings;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  recordsPerPage: number;
}

const DataTable: React.FC<DataTableProps> = ({ records, onDeleteRecord, onEditRecord, selectedIds, onSelectionChange, showAdminActions = true, companyName, companyLogo, companyEmail, companyAddress, companyWebsite, provostSignature, layoutSettings, currentPage, totalPages, onPageChange, totalRecords, recordsPerPage }) => {
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);

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
        <h3 className="mt-4 text-xl font-semibold text-brand-light">No Records Found</h3>
        <p className="mt-2 text-brand-muted">Start by adding a new record using the form above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-brand-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-primary/50">
              <tr>
                {showAdminActions && (
                  <th scope="col" className="p-4 sm:p-5">
                      <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          aria-label="Select all records on this page"
                      />
                  </th>
                )}
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Photo</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">First Name</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Middle Name</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Surname</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Department</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">SP Number</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Rank</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Email</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">State</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Local Gov.</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Marital Status</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Blood Group</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Created By</th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Created At</th>
                {showAdminActions && <th scope="col" className="p-4 sm:p-5 text-sm font-semibold text-brand-muted">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-secondary">
              {records.map((record) => (
                <tr key={record.id} className={`transition-colors ${selectedIds.includes(record.id) ? 'bg-brand-accent/20' : 'hover:bg-brand-primary/20'}`}>
                    {showAdminActions && (
                      <td className="p-4 sm:p-5">
                        <input 
                              type="checkbox"
                              className="h-4 w-4 rounded border-brand-secondary text-brand-accent focus:ring-brand-accent bg-brand-primary"
                              checked={selectedIds.includes(record.id)}
                              onChange={() => handleSelectRow(record.id)}
                              aria-label={`Select record for ${record.name} ${record.surname}`}
                          />
                    </td>
                    )}
                  <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">
                    {record.photo ? (
                      <img src={record.photo} alt="Staff" className="w-10 h-10 rounded-full object-cover border border-brand-secondary" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-brand-muted" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.name}</td>
                  <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.middleName}</td>
                  <td className="p-4 sm:p-5 text-sm font-medium text-brand-light whitespace-nowrap">{record.surname}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.department}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.spNumber}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.rank}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{record.email}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.state}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.lg}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.marriedStatus}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.bloodGroup}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-light whitespace-nowrap">{record.createdBy}</td>
                  <td className="p-4 sm:p-5 text-sm text-brand-muted whitespace-nowrap">{new Date(record.createdAt).toLocaleDateString()}</td>
                  {showAdminActions && (
                    <td className="p-4 sm:p-5 text-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedRecord(record)} className="text-blue-400 hover:text-blue-300 transition-colors" title="View ID Card"><IdCardIcon className="w-5 h-5"/></button>
                            <button onClick={() => onEditRecord?.(record)} className="text-yellow-400 hover:text-yellow-300 transition-colors" title="Edit Record"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDeleteRecord(record.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Record"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </td>
                  )}
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
      {selectedRecord && (
        <IDCardModal 
            record={selectedRecord} 
            onClose={() => setSelectedRecord(null)} 
            companyName={companyName}
            companyLogo={companyLogo}
            companyEmail={companyEmail}
            companyAddress={companyAddress}
            companyWebsite={companyWebsite}
            provostSignature={provostSignature}
            layoutSettings={layoutSettings}
        />
      )}
    </>
  );
};

export default DataTable;
