import React from 'react';
import { DataRecord } from '../types';
import IDCard from './IDCard';
import { XMarkIcon, PrinterIcon } from './IconComponents';

interface BulkIDPrintProps {
  records: DataRecord[];
  onClose: () => void;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
}

const BulkIDPrint: React.FC<BulkIDPrintProps> = ({ records, onClose, companyName, companyLogo, companyEmail, companyAddress, companyWebsite }) => {
    
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-brand-primary z-50 overflow-y-auto">
        <header className="sticky top-0 bg-brand-secondary/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-lg z-10 print:hidden">
            <h1 className="text-xl font-bold text-brand-light">Print Preview ({records.length} Cards)</h1>
            <div className="flex items-center gap-4">
                 <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold"
                >
                    <PrinterIcon className="w-5 h-5" />
                    <span>Print All</span>
                </button>
                <button
                    onClick={onClose}
                    className="p-2 bg-brand-light/10 text-brand-light rounded-full hover:bg-brand-light/20 transition-colors"
                    aria-label="Close print preview"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <main className="p-4 sm:p-8 bg-gray-300 print:bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                {records.map(record => (
                   <div key={record.id} className="mx-auto my-4 break-inside-avoid page-break">
                       {/* Scaling the ID card for a better fit on paper */}
                       <div className="transform scale-95">
                           <IDCard record={record} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} />
                       </div>
                   </div>
                ))}
            </div>
        </main>
         {/* Simple style override for printing */}
        <style>
        {`
          @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            main {
                padding: 0;
                background-color: #FFFFFF;
            }
            .page-break {
                page-break-inside: avoid;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BulkIDPrint;