import React from 'react';
import { Student, IDCardLayout } from '../types';

interface StudentIDCardProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  companyAddress: string;
  layoutSettings: IDCardLayout;
}

const StudentIDCard: React.FC<StudentIDCardProps> = ({ student, companyName, companyLogo, companyWebsite, companyAddress, layoutSettings }) => {
  const { visibleFields } = layoutSettings;

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    if (parts.length > 1) {
      return (
        <div className="flex flex-col items-center">
          <span className="block font-black text-slate-900 tracking-tight leading-none">{parts[0].trim().toUpperCase()}</span>
          <span className="block mt-0.5 leading-none">
            <span className="text-amber-500 font-black tracking-wide">(TECHNICAL)</span>
            <span className="font-black text-slate-900 tracking-wide ml-1">{parts.slice(2).join('').trim().toUpperCase()}</span>
          </span>
        </div>
      );
    }
    return <span className="font-black tracking-tight leading-none">{name.toUpperCase()}</span>;
  };

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length >= 2) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        if (monthIndex >= 0 && monthIndex < 12) {
            return `${monthNames[monthIndex]} ${year}`;
        }
    }
    return dateString;
  };
  
  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');

  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-[8px] shadow-xl overflow-hidden relative flex flex-col print:shadow-none font-sans text-slate-900 leading-normal border border-gray-100">
        {/* Background Dot Pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-50"></div>
        
        {/* Watermark Pattern */}
        {companyLogo && (
            <div className="absolute inset-0 z-0 grid grid-cols-5 grid-rows-4 items-center justify-items-center p-2 pointer-events-none opacity-[0.08] overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <img key={i} src={companyLogo} alt="" className="h-10 w-auto -rotate-12 sepia saturate-[6] hue-rotate-15 brightness-[0.85] contrast-[1.2]" />
                ))}
            </div>
        )}

        {/* Top Header Strip */}
        <div className="relative z-10 bg-slate-900 h-[14px] w-full flex items-center justify-center px-4 shadow-sm shrink-0">
             <div className="flex items-center w-full max-w-[90%] gap-4">
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
                <span className="text-white text-[6px] font-bold uppercase tracking-[0.2em]">Student Identity Card</span>
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
             </div>
        </div>
        
        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex pl-3 pr-2 py-1 gap-2 items-start overflow-hidden">
             {/* Photo - Adjusted position and standard aspect ratio */}
            <div className="flex-shrink-0 mt-4">
                <div className="w-[76px] h-[95px] bg-white rounded-md shadow-md border-[2px] border-white overflow-hidden ring-1 ring-gray-100">
                    <img src={student.photo} alt={fullName} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Details Column */}
            <div className="flex-grow flex flex-col items-center h-full">
                 {/* Header Info */}
                 <div className="mb-2 w-full flex flex-col items-center text-center">
                     {companyLogo && (
                        <img src={companyLogo} alt="Logo" className="w-6 h-6 object-contain mb-0.5 drop-shadow-sm" />
                     )}
                     <div className="text-[9px] leading-none">
                        {renderCompanyName(companyName)}
                     </div>
                     <p className="text-[5px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide opacity-80 leading-none">{companyAddress}</p>
                 </div>

                 {/* Student Fields - Increased spacing */}
                 <div className="w-full pl-1 text-left">
                     {visibleFields.includes('fullName') && (
                        <div className="mb-2">
                            <p className="text-[5px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 leading-none">NAME</p>
                            <h2 className="text-[12px] font-black text-slate-900 uppercase leading-tight tracking-tight">
                                {student.surname}
                            </h2>
                            <p className="text-[9px] font-bold text-slate-700 uppercase leading-snug">
                                {student.firstName} {student.middleName}
                            </p>
                        </div>
                     )}

                     <div className="space-y-1">
                        {visibleFields.includes('registrationNumber') && (
                            <div className="flex items-baseline gap-1">
                                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wide min-w-[30px]">REG NO:</span>
                                <span className="text-[9px] font-bold text-slate-900 uppercase tracking-tight leading-none">{student.registrationNumber}</span>
                            </div>
                        )}
                        {visibleFields.includes('department') && (
                            <div className="flex items-baseline gap-1">
                                 <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wide min-w-[30px]">DEPT:</span>
                                 <span className="text-[8px] font-bold text-slate-900 uppercase tracking-tight leading-none">{student.department}</span>
                            </div>
                        )}
                         {visibleFields.includes('school') && (
                            <div className="flex items-baseline gap-1">
                                 <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wide min-w-[30px]">SCHOOL:</span>
                                 <span className="text-[8px] font-bold text-slate-900 uppercase tracking-tight leading-none">{student.school}</span>
                            </div>
                        )}
                         {visibleFields.includes('expirationDate') && student.expirationDate && (
                            <div className="flex items-baseline gap-1">
                                 <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wide min-w-[30px]">EXP:</span>
                                 <span className="text-[8px] font-bold text-slate-900 uppercase tracking-tight leading-none">{formatExpirationDate(student.expirationDate)}</span>
                            </div>
                        )}
                     </div>
                 </div>
            </div>
        </div>

        {/* Footer Accent */}
        <div className="relative z-10 w-full mt-auto shrink-0">
            <div className="bg-slate-900 h-[8px] w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-1/3 h-[3px] bg-amber-400 rounded-t-lg"></div>
            </div>
        </div>
    </div>
  );
};

export default StudentIDCard;