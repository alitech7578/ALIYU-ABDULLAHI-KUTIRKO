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

  // Function to format the college name logic specifically for "(TECHNICAL)" coloring
  const renderHeader = () => {
    // Check if the name follows the pattern "FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI"
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

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-[8px] shadow-xl overflow-hidden relative flex flex-col font-sans text-slate-900 border border-gray-100 print:shadow-none">
        {/* Corner Designs */}
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

        {/* Header Section */}
        <div className="relative z-10 w-full pt-4 px-2 flex flex-row items-start pl-3">
            {/* Logo positioned top left - over the green shape */}
            <div className="w-12 h-12 flex-shrink-0 z-20 mr-2 -mt-0.5 bg-white rounded-full p-0.5 shadow-sm">
                {companyLogo && (
                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                )}
            </div>
            
            {/* Header Text */}
            <div className="flex-grow flex flex-col items-center justify-start -ml-2 pt-1">
                {renderHeader()}
                <p className="text-[6px] font-bold text-slate-700 mt-1.5 uppercase tracking-wide leading-none">{companyAddress}</p>
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-0 text-[5px] text-red-600 font-bold mt-1.5 leading-none">
                    <span>website:- {companyWebsite.replace(/^https?:\/\//, '')}</span>
                    <span>email:- info@{companyWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
                </div>
            </div>
        </div>

        {/* Main Content Body */}
        <div className="relative z-10 flex-1 flex flex-row px-4 pt-0 pb-1">
            {/* Left: Photo */}
            <div className="flex flex-col justify-start w-[80px] mr-2 pt-5">
                 <div className="w-[75px] h-[85px] bg-gray-100 border-2 border-white shadow-md overflow-hidden rounded-sm">
                    <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                 </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 flex flex-col pt-3">
                {/* Banner */}
                <div className="self-center transform -skew-x-12 bg-green-700 text-white px-5 py-0.5 mb-2 shadow-sm border-b-2 border-black/20">
                    <span className="block transform skew-x-12 text-[9px] font-black uppercase tracking-wider font-sans leading-none">Student I.D. Card</span>
                </div>

                {/* Fields - Adjusted Spacing */}
                <div className="flex flex-col pl-1 w-full space-y-1.5">
                    {visibleFields.includes('fullName') && (
                        <div className="flex items-baseline">
                            <span className="w-12 text-[8px] text-red-700 font-bold leading-none shrink-0">Name:</span>
                            <span className="flex-1 text-[9px] font-black text-black uppercase leading-tight">
                                {student.surname} {student.firstName} {student.middleName}
                            </span>
                        </div>
                    )}
                     {visibleFields.includes('registrationNumber') && (
                        <div className="flex items-baseline">
                             <span className="w-12 text-[8px] text-red-700 font-bold leading-none shrink-0">Reg. No.:</span>
                             <span className="flex-1 text-[9px] font-black text-black uppercase leading-tight">{student.registrationNumber}</span>
                        </div>
                    )}
                    {visibleFields.includes('department') && (
                        <div className="flex items-baseline">
                             <span className="w-12 text-[8px] text-red-700 font-bold leading-none shrink-0">Dept.:</span>
                             <span className="flex-1 text-[8px] font-black text-black uppercase leading-tight">{student.department}</span>
                        </div>
                    )}
                     {visibleFields.includes('school') && (
                        <div className="flex items-baseline">
                             <span className="w-12 text-[8px] text-red-700 font-bold leading-none shrink-0">School:</span>
                             <span className="flex-1 text-[8px] font-black text-black uppercase leading-tight">
                                {student.school}
                             </span>
                        </div>
                    )}
                </div>

                {/* Expiration Date Footer */}
                <div className="mt-auto self-center flex items-center mb-1">
                     <div className="bg-black text-white text-[6px] font-bold px-2 py-0.5 rounded-l-sm leading-none">
                        EXP. DATE
                     </div>
                     <div className="bg-gray-200 text-[7px] font-bold text-slate-800 px-2 py-0.5 rounded-r-sm uppercase min-w-[50px] text-center border-y border-r border-gray-300 leading-none">
                        {student.expirationDate ? formatExpirationDate(student.expirationDate) : 'DEC 2025'}
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StudentIDCard;