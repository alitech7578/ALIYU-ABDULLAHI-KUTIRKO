import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { DataRecord, IDCardLayoutSettings } from '../types';
import IDCard from './IDCard';
import IDCardBack from './IDCardBack';
import { XMarkIcon, DownloadIcon, PrinterIcon } from './IconComponents';

interface IDCardModalProps {
  record: DataRecord | null;
  onClose: () => void;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
  provostSignature: string | null;
  layoutSettings: IDCardLayoutSettings;
}

const IDCardModal: React.FC<IDCardModalProps> = ({ record, onClose, companyName, companyLogo, companyEmail, companyAddress, companyWebsite, provostSignature, layoutSettings }) => {
  const idCardRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const fullName = [record.name, record.middleName, record.surname].filter(Boolean).join(' ');
  const filename = `ID-Card-${[record.name, record.middleName, record.surname].filter(Boolean).join('-')}.png`;

  const handleDownload = async () => {
    if (idCardRef.current === null) {
      return;
    }
    try {
      // With the card size set to ~54mm (approx 200px), a pixelRatio of 4 gives ~800px width, suitable for print.
      const dataUrl = await toPng(idCardRef.current, { cacheBust: true, pixelRatio: 4 });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ID card image', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="id-card-title"
    >
        <div className="relative" onClick={(e) => e.stopPropagation()}>
             <h2 id="id-card-title" className="sr-only">ID Card for {fullName}</h2>
            <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 p-2 bg-brand-light text-brand-primary rounded-full shadow-lg hover:scale-110 transition-transform"
                aria-label="Close ID Card view"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
            <div ref={idCardRef} className="printable-id-card">
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                <IDCard record={record} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} layoutSettings={layoutSettings.staff} />
                <IDCardBack record={record} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} provostSignature={provostSignature} />
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-4">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download PNG</span>
                </button>
                 <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-lg text-white font-bold"
                >
                    <PrinterIcon className="w-5 h-5" />
                    <span>Print</span>
                </button>
            </div>
        </div>
        <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-id-card, .printable-id-card * {
              visibility: visible;
            }
            .printable-id-card {
              position: absolute;
              left: 0;
              top: 0;
              transform: scale(1);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
        </style>
    </div>
  );
};

export default IDCardModal;