import React from 'react';
import { Student } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface StudentIDCardBackProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  provostSignature: string | null;
}

const StudentIDCardBack: React.FC<StudentIDCardBackProps> = ({ student, companyName, companyLogo, companyWebsite, provostSignature }) => {
  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${student.surname};${student.firstName};${student.middleName};;`,
    `FN:${fullName}`,
    `ORG:${companyName.replace(/,/g, '\\,')}`,
    `TITLE:Student`,
    `EMAIL;TYPE=INTERNET:${student.email}`,
    `NOTE:Registration No: ${student.registrationNumber}\\nDepartment: ${student.department}`,
    'END:VCARD'
  ].join('\n');

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    if (parts.length > 1) {
      return (
        <>
          <span className="block">{parts[0].trim().toUpperCase()}</span>
          <span className="block">
            <span className="text-amber-500 font-bold">(TECHNICAL)</span>
            {parts.slice(2).join('').toUpperCase()}
          </span>
        </>
      );
    }
    return <>{name.toUpperCase()}</>;
  };

  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-[6px] shadow-xl overflow-hidden relative flex flex-col font-sans print:shadow-none text-slate-900 leading-normal">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-60"></div>
        
        {/* Top Bar */}
        <div className="relative z-10 bg-slate-800 w-full h-[14px] flex items-center justify-between px-8 mt-2">
             <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
             <div className="w-4"></div>
             <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
        </div>

        <div className="flex-1 relative z-10 flex p-3 gap-4 items-center justify-center">
            {/* Left Column: Disclaimer & Signature */}
            <div className="flex-1 flex flex-col justify-center text-center items-center">
                 {companyLogo && (
                    <img src={companyLogo} alt="Logo" className="w-6 h-6 object-contain mx-auto mb-1" />
                 )}
                 <p className="text-[5px] text-slate-500 mb-0.5">Property of</p>
                 <h3 className="text-[6px] font-bold uppercase mb-2 text-slate-800 leading-tight">
                    {renderCompanyName(companyName)}
                 </h3>
                 
                 <p className="text-[5px] text-slate-600 leading-relaxed mb-2 max-w-[140px]">
                    This card remains the property of the institution. If found, please return to the Security Unit.
                 </p>

                 <div className="flex flex-col items-center w-full">
                    {provostSignature ? (
                        <img src={provostSignature} alt="Signature" className="h-5 object-contain mb-0.5" />
                    ) : (
                         <div className="h-5 w-16 border-b border-dashed border-slate-300"></div>
                    )}
                    <div className="w-20 border-t border-slate-400 mt-0.5"></div>
                    <p className="text-[5px] text-slate-500 mt-0.5">Registrar / Provost</p>
                 </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-20 bg-slate-200"></div>

            {/* Right Column: QR Code */}
            <div className="w-1/3 flex flex-col items-center justify-center">
                <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-100 mb-0.5">
                    <QRCodeCanvas 
                        value={vCardData} 
                        size={256} 
                        style={{ width: '50px', height: '50px' }} 
                        level="M"
                    />
                </div>
                <p className="text-[5px] text-slate-400 font-medium">Scan for Details</p>
            </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="relative z-10 w-full mt-auto">
             <div className="bg-slate-800 w-full h-[14px] flex items-center justify-between px-8">
                 <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
                 <div className="w-4"></div>
                 <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
            </div>
             <div className="bg-white py-0.5 text-center border-t border-slate-100 mb-0.5">
                <p className="text-[5px] text-slate-800 font-bold tracking-wide">{companyWebsite}</p>
            </div>
        </div>
    </div>
  );
};

export default StudentIDCardBack;