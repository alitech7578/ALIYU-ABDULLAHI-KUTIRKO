import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Student } from '../types';
import StudentIDCard from './StudentIDCard';
import { XMarkIcon, DownloadIcon } from './IconComponents';

interface StudentIDCardModalProps {
  student: Student | null;
  onClose: () => void;
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
}

const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({ student, onClose, companyName, companyLogo, companyEmail, companyAddress, companyWebsite }) => {
  const idCardRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  const filename = `Student-ID-Card-${[student.firstName, student.middleName, student.surname].filter(Boolean).join('-')}.png`;

  const handleDownload = async () => {
    if (idCardRef.current === null) {
      return;
    }
    try {
      const dataUrl = await toPng(idCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ID card image', err);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-id-card-title"
    >
        <div className="relative" onClick={(e) => e.stopPropagation()}>
             <h2 id="student-id-card-title" className="sr-only">ID Card for {fullName}</h2>
            <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 p-2 bg-brand-light text-brand-primary rounded-full shadow-lg hover:scale-110 transition-transform"
                aria-label="Close ID Card view"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
            <div ref={idCardRef}>
                <StudentIDCard student={student} companyName={companyName} companyLogo={companyLogo} companyWebsite={companyWebsite} />
            </div>
            <div className="mt-4 flex justify-center">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-opacity-80 transition-all duration-300 rounded-lg text-white font-bold"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download PNG</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default StudentIDCardModal;