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
        <>
          <span className="block font-extrabold">{parts[0].trim().toUpperCase()}</span>
          <span className="block">
            <span className="text-amber-500 font-extrabold">(TECHNICAL)</span>
            <span className="font-extrabold">{parts.slice(2).join('').toUpperCase()}</span>
          </span>
        </>
      );
    }
    return <span className="font-extrabold">{name.toUpperCase()}</span>;
  };
  
  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');

  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-[6px] shadow-xl overflow-hidden relative flex flex-col print:shadow-none font-sans text-slate-900 leading-normal">
        {/* Background Dot Pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-60"></div>
        
        {/* Watermark Pattern (20 Logos in 5x4 Grid) */}
        {companyLogo && (
            <div className="absolute inset-0 z-0 grid grid-cols-5 grid-rows-4 items-center justify-items-center p-2 pointer-events-none opacity-[0.10] overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <img key={i} src={companyLogo} alt="" className="h-10 w-auto -rotate-12 sepia saturate-[6] hue-rotate-15 brightness-[0.85] contrast-[1.2]" />
                ))}
            </div>
        )}

        {/* Top Header Strip - Matching Staff Style */}
        <div className="relative z-10 bg-slate-800 h-[18px] w-full flex items-center justify-between px-4">
            <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
            <span className="text-white text-[6px] font-bold uppercase tracking-widest px-2">Student Identity Card</span>
            <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
        </div>
        
        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex p-3 gap-3 items-center">
             {/* Photo */}
            <div className="flex-shrink-0">
                <div className="w-[90px] h-[100px] bg-gray-200 rounded-md shadow-md border border-gray-200 overflow-hidden">
                    <img src={student.photo} alt={fullName} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Details */}
            <div className="flex-grow flex flex-col justify-center h-full">
                 <div className="mb-2 w-full flex flex-col items-center text-center">
                     {companyLogo && (
                        <img src={companyLogo} alt="Logo" className="w-6 h-6 object-contain mb-0.5" />
                     )}
                     <h1 className="text-[9px] font-extrabold text-slate-900 leading-normal">
                        {renderCompanyName(companyName)}
                     </h1>
                     <p className="text-[5px] font-bold text-slate-500 mt-0.5 uppercase">{companyAddress}</p>
                 </div>

                 {visibleFields.includes('fullName') && (
                    <div className="mb-1.5">
                        <p className="text-[6px] text-slate-500 uppercase font-bold">NAME</p>
                        <h2 className="text-[12px] font-extrabold text-slate-900 uppercase leading-tight">
                            {student.surname}
                        </h2>
                        <p className="text-[9px] font-bold text-slate-700 uppercase leading-tight">
                            {student.firstName} {student.middleName}
                        </p>
                    </div>
                 )}

                 <div className="space-y-1">
                    {visibleFields.includes('registrationNumber') && (
                        <div>
                            <span className="text-[6.5px] text-slate-500 uppercase font-bold mr-1">REG NO:</span>
                            <span className="text-[8.5px] font-bold text-slate-900">{student.registrationNumber}</span>
                        </div>
                    )}
                    {visibleFields.includes('school') && (
                        <div>
                             <span className="text-[6.5px] text-slate-500 uppercase font-bold mr-1">SCHOOL:</span>
                             <span className="text-[8px] font-bold text-slate-800">{student.school}</span>
                        </div>
                    )}
                     {visibleFields.includes('department') && (
                        <div>
                             <span className="text-[6.5px] text-slate-500 uppercase font-bold mr-1">DEPT:</span>
                             <span className="text-[8px] font-bold text-slate-800">{student.department}</span>
                        </div>
                    )}
                     {visibleFields.includes('expirationDate') && student.expirationDate && (
                        <div>
                             <span className="text-[6.5px] text-slate-500 uppercase font-bold mr-1">EXP DATE:</span>
                             <span className="text-[8.5px] font-bold text-slate-900">{student.expirationDate}</span>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Footer Accent - Adjusted floor */}
        <div className="relative z-10 w-full">
            <div className="bg-slate-800 h-[12px] w-full flex items-center justify-center">
                <div className="w-1/3 h-[2px] bg-amber-400 rounded-full"></div>
            </div>
            <div className="bg-white py-0.5 text-center border-t border-slate-100">
                <p className="text-[5px] text-slate-800 font-bold tracking-wide">{companyWebsite}</p>
            </div>
        </div>
    </div>
  );
};

export default StudentIDCard;