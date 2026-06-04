import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DataRecord, IDCardLayoutSettings } from '../types';
import IDCard from './IDCard';
import IDCardBack from './IDCardBack';
import { XMarkIcon, DownloadIcon, SpinnerIcon } from './IconComponents';

interface BulkIDPrintProps {
  records: DataRecord[];
  onClose: () => void;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
  provostSignature: string | null;
  layoutSettings: IDCardLayoutSettings;
}

const BulkIDPrint: React.FC<BulkIDPrintProps> = ({ records, onClose, companyName, companyLogo, companyEmail, companyAddress, companyWebsite, provostSignature, layoutSettings }) => {
  const [isGenerating, setIsGenerating] = useState(false);
    
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let y = margin;

    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    for (const record of records) {
      const element = document.getElementById(`card-pair-${record.id}`);
      if (!element) continue;

      try {
        const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 2 });
        const elWidth = element.offsetWidth;
        const elHeight = element.offsetHeight;
        const aspectRatio = elWidth / elHeight;
        
        let pdfImageWidth = availWidth;
        let pdfImageHeight = pdfImageWidth / aspectRatio;

        if (pdfImageHeight > availHeight) {
            pdfImageHeight = availHeight;
            pdfImageWidth = pdfImageHeight * aspectRatio;
        }

        if (y + pdfImageHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }

        const x = margin + (availWidth - pdfImageWidth) / 2;
        pdf.addImage(dataUrl, 'PNG', x, y, pdfImageWidth, pdfImageHeight);
        y += pdfImageHeight + 5;
      } catch (error) {
        console.error(`Failed to process card for ${record.name}`, error);
      }
    }

    pdf.save('Staff-ID-Cards.pdf');
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-brand-primary z-50 overflow-y-auto">
        <header className="sticky top-0 bg-brand-secondary/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-lg z-10">
            <h1 className="text-xl font-bold text-brand-light">Print Preview ({records.length} Cards)</h1>
            <div className="flex items-center gap-4">
                 <button
                    onClick={handleDownloadPdf}
                    disabled={isGenerating}
                    className="flex items-center justify-center w-48 gap-2 px-4 py-2 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold disabled:bg-brand-accent/50 disabled:cursor-wait"
                >
                    {isGenerating ? (
                      <>
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download PDF</span>
                      </>
                    )}
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

        <main className="p-4 sm:p-8 bg-gray-300">
            <div className="flex flex-wrap justify-center gap-8">
                {records.map(record => (
                   <div key={record.id}>
                       <div id={`card-pair-${record.id}`} className="flex flex-row gap-4 items-start p-2 bg-gray-300">
                           <div className="transform scale-90">
                               <IDCard record={record} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} layoutSettings={layoutSettings.staff} />
                           </div>
                           <div className="transform scale-90">
                               <IDCardBack record={record} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} provostSignature={provostSignature} />
                           </div>
                       </div>
                   </div>
                ))}
            </div>
        </main>
    </div>
  );
};

export default BulkIDPrint;