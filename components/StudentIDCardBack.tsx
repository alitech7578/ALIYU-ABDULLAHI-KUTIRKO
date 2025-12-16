import React from 'react';
import { Student } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface StudentIDCardBackProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  companyAddress: string;
  provostSignature: string | null;
}

const StudentIDCardBack: React.FC<StudentIDCardBackProps> = ({ student, companyName, companyLogo, companyWebsite, companyAddress, provostSignature }) => {
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

  // Function to format the college name logic specifically for "(TECHNICAL)" coloring (Matching Front)
  const renderHeader = () => {
    const nameUpper = companyName.toUpperCase();
    if (nameUpper.includes("TECHNICAL")) {
        const parts = nameUpper.split("(TECHNICAL)");
        return (
            <div className="text-center leading-none">
                <h1 className="text-[10px] font-black text-slate-800 tracking-tight scale-y-110">
                    {parts[0].trim()} <span className="text-red-600 inline-block mx-0.5">(TECHNICAL)</span> {parts[1]?.trim()}
                </h1>
            </div>
        )
    }
    return (
        <h1 className="text-[10px] font-black text-slate-800 text-center leading-none tracking-tight uppercase scale-y-110">
            {companyName}
        </h1>
    );
  };

  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-[8px] shadow-xl overflow-hidden relative flex flex-col font-sans text-slate-900 border border-gray-100 print:shadow-none">
        {/* Corner Designs - Identical to Front */}
        {/* Top Left Green Triangle */}
        <div className="absolute top-0 left-0 w-[55px] h-[55px] bg-green-600 z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="absolute top-0 left-0 w-[60px] h-[60px] bg-yellow-400 -z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        
        {/* Bottom Right Green Triangle */}
        <div className="absolute bottom-0 right-0 w-[40px] h-[40px] bg-green-600 z-0" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
        <div className="absolute bottom-0 right-0 w-[45px] h-[45px] bg-yellow-400 -z-10" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>

        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] [background-size:8px_8px]"></div>

        {/* Watermark Logo Pattern */}
        {companyLogo && (
            <div className="absolute inset-0 z-0 grid grid-cols-6 grid-rows-4 items-center justify-items-center p-2 pointer-events-none opacity-[0.07] overflow-hidden">
                {[...Array(24)].map((_, i) => (
                    <img key={i} src={companyLogo} alt="" className="w-8 -rotate-12 grayscale contrast-125" />
                ))}
            </div>
        )}

        {/* Header Section - Identical to Front */}
        <div className="relative z-10 w-full pt-4 px-2 flex flex-row items-start pl-3">
            {/* Logo positioned top left - over the green shape */}
            <div className="w-12 h-12 flex-shrink-0 z-20 mr-2 -mt-1 bg-white rounded-full p-0.5 shadow-sm">
                {companyLogo && (
                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                )}
            </div>
            
            {/* Header Text */}
            <div className="flex-grow flex flex-col items-center justify-start -ml-2">
                {renderHeader()}
                <p className="text-[6px] font-bold text-slate-700 mt-1.5 uppercase tracking-wide">{companyAddress}</p>
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-0 text-[5px] text-red-600 font-bold mt-1.5 leading-tight">
                    <span>website:- {companyWebsite.replace(/^https?:\/\//, '')}</span>
                    <span>email:- info@{companyWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
                </div>
            </div>
        </div>

        {/* Main Content Body */}
        <div className="relative z-10 flex-1 flex flex-row px-6 pt-1 pb-3 items-center">
            {/* Left: Disclaimer & Signature */}
            <div className="flex-1 flex flex-col items-center text-center pr-4">
                 <h3 className="text-[9px] font-black uppercase text-green-700 mb-2 mt-1">Property of the Institution</h3>
                 <p className="text-[7px] leading-relaxed text-slate-800 font-semibold mb-3">
                    This card remains the property of the College. If found, please return to the Security Unit or the Student Affairs Division.
                 </p>
                 
                 {/* Signature */}
                 <div className="flex flex-col items-center mt-auto w-full">
                    {provostSignature ? (
                        <img src={provostSignature} alt="Signature" className="h-8 object-contain mb-0.5" />
                    ) : (
                         <div className="h-8 w-24 border-b border-dashed border-slate-400"></div>
                    )}
                    <div className="w-32 border-t border-slate-800 mt-0.5"></div>
                    <p className="text-[6px] font-bold text-slate-900 mt-0.5 uppercase tracking-wide">Registrar / Provost</p>
                 </div>
            </div>

            {/* Vertical Separator */}
            <div className="w-px h-[70%] bg-slate-200 mx-2"></div>

            {/* Right: QR Code */}
             <div className="flex flex-col items-center justify-center pl-2">
                <div className="bg-white p-1 rounded-sm shadow-sm border border-gray-100">
                    <QRCodeCanvas 
                        value={vCardData} 
                        size={256} 
                        style={{ width: '55px', height: '55px' }} 
                        level="M"
                    />
                </div>
                <span className="text-[5px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Scan for Details</span>
             </div>
        </div>
    </div>
  );
};

export default StudentIDCardBack;