import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { Student, IDCardLayoutSettings } from '../types';
import StudentIDCard from './StudentIDCard';
import StudentIDCardBack from './StudentIDCardBack';
import { XMarkIcon, DownloadIcon, SpinnerIcon } from './IconComponents';

interface BulkStudentIDPrintProps {
  students: Student[];
  onClose: () => void;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
  provostSignature: string | null;
  layoutSettings: IDCardLayoutSettings;
}

const BulkStudentIDPrint: React.FC<BulkStudentIDPrintProps> = ({ students, onClose, companyName, companyLogo, companyEmail, companyAddress, companyWebsite, provostSignature, layoutSettings }) => {
  const [isGenerating, setIsGenerating] = useState(false);
    
  const handleDownloadPdf = async () => {
    setIsGenerating(true);

    // Use Portrait A4 for Landscape ID Cards (wide pairs fit best in a single column)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const itemGap = 5;

    let currentX = margin;
    let currentY = margin;

    // Standard CR80 Height in mm (Landscape card)
    const targetHeight = 54;

    for (const student of students) {
        const element = document.getElementById(`student-card-pair-${student.id}`);
        if (!element) continue;

        try {
            const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 4 });
            
            const elWidth = element.offsetWidth;
            const elHeight = element.offsetHeight;
            const aspectRatio = elWidth / elHeight;
            
            const pdfItemHeight = targetHeight;
            const pdfItemWidth = pdfItemHeight * aspectRatio;

            // Check if we need to wrap to next row (mostly for robustness, as these usually only fit 1 per row)
            if (currentX + pdfItemWidth > pageWidth - margin) {
                currentX = margin;
                currentY += pdfItemHeight + itemGap;
            }

            // Check if we need a new page
            if (currentY + pdfItemHeight > pageHeight - margin) {
                pdf.addPage();
                currentX = margin;
                currentY = margin;
            }
            
            pdf.addImage(dataUrl, 'PNG', currentX, currentY, pdfItemWidth, pdfItemHeight);
            
            // Move X cursor (though usually we wrap immediately for wide items)
            currentX += pdfItemWidth + itemGap;

        } catch (error) {
            console.error(`Failed to process card for ${student.firstName}`, error);
        }
    }

    pdf.save('Student-ID-Cards.pdf');
    setIsGenerating(false);
  };


  return (
    <div className="fixed inset-0 bg-brand-primary z-50 overflow-y-auto">
        <header className="sticky top-0 bg-brand-secondary/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-lg z-10">
            <h1 className="text-xl font-bold text-brand-light">Print Preview ({students.length} Student Cards)</h1>
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

        <main className="p-4 sm:p-8 bg-gray-300 min-h-screen">
            <div className="flex flex-wrap justify-center gap-8">
                {students.map(student => (
                   <div key={student.id}>
                       <div id={`student-card-pair-${student.id}`} className="flex flex-row gap-4 items-start p-2 bg-gray-300">
                           <div className="transform scale-90">
                               <StudentIDCard student={student} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} layoutSettings={layoutSettings.student} />
                           </div>
                           <div className="transform scale-90">
                               <StudentIDCardBack student={student} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} companyAddress={companyAddress} provostSignature={provostSignature} />
                           </div>
                       </div>
                   </div>
                ))}
            </div>
        </main>
    </div>
  );
};

export default BulkStudentIDPrint;