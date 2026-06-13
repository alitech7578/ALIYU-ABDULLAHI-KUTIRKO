import React from 'react';
import { Student, IDCardLayout } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface StudentIDCardProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  companyAddress: string;
  layoutSettings: IDCardLayout;
}

const backgroundPatternStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)',
  backgroundSize: '15px 15px',
};

const StudentIDCard: React.FC<StudentIDCardProps> = ({ student, companyName, companyLogo, companyWebsite, companyAddress, layoutSettings }) => {
  const { visibleFields } = layoutSettings;

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === '(technical)' ? (
            <span key={index} className="text-red-500">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  
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

  return (
    <div
      className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg p-0 flex flex-col font-sans text-gray-800 overflow-hidden relative border border-gray-100"
      style={backgroundPatternStyle}
    >
      {/* Sleek category visual pill in top-right area */}
      <div className="absolute top-[68px] right-4 bg-orange-600 text-white text-[9px] font-black tracking-widest px-3.5 py-1 rounded-full uppercase shadow-sm z-10">
        STUDENT ID
      </div>

      <div className="flex flex-col h-full justify-between">
        {/* Header */}
        <header className="flex items-center gap-3 p-3 bg-white relative">
          {companyLogo && (
            <div className="flex-shrink-0 bg-white p-0.5 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
              <img src={companyLogo} alt="Company Logo" className="h-[46px] w-[46px] object-contain" />
            </div>
          )}
          <div className="text-left flex-grow">
            <h1 className="text-[13px] font-extrabold text-blue-900 uppercase tracking-tight leading-tight" style={{ color: '#1e3a8a' }}>
              FEDERAL COLLEGE OF EDUCATION
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[12px] font-black text-red-600 uppercase tracking-wide leading-none">{renderCompanyName('(TECHNICAL)')}</span>
              <span className="text-[12px] font-black text-blue-900 uppercase tracking-wide leading-none" style={{ color: '#1e3a8a' }}>BICHI</span>
            </div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">{companyAddress || 'P.M.B. 3473, Kano'}</p>
          </div>
        </header>

        {/* Dual Accent Colored Bar separating Header & Body */}
        <div className="w-full flex flex-col">
          <div className="h-1 bg-blue-900"></div>
          <div className="h-[2px] bg-orange-500"></div>
        </div>

        {/* Main Content */}
        <main className="flex-grow flex items-center p-3 gap-5 relative bg-white/40">
          {/* Left: Photo Frame */}
          <div className="flex-shrink-0 p-1 bg-white border border-gray-200 shadow-md rounded-lg">
            {student.photo ? (
              <img
                src={student.photo}
                alt={fullName}
                className="w-[105px] h-[135px] object-cover rounded-md"
              />
            ) : (
              <div className="w-[105px] h-[135px] rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-[8px] mt-1.5 uppercase tracking-widest font-black text-gray-400">No Photo</span>
              </div>
            )}
          </div>
          
          {/* Middle: Professional labeled fields */}
          <div className="flex-grow flex flex-col justify-center gap-2 min-w-0 pr-4">
            {visibleFields.includes('fullName') && (
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Surname</span>
                  <span className="text-[16px] font-black text-gray-950 uppercase tracking-tight truncate leading-tight">
                    {student.surname || '—'}
                  </span>
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Other Names</span>
                  <span className="text-[14px] font-extrabold text-gray-800 uppercase tracking-tight truncate leading-tight">
                    {[student.firstName, student.middleName].filter(Boolean).join(' ') || '—'}
                  </span>
                </div>
              </div>
            )}
            
            {visibleFields.includes('department') && (
              <div className="flex flex-col mt-0.5">
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Department</span>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide truncate mt-0.5">
                  {student.department || '—'}
                </span>
              </div>
            )}

            {visibleFields.includes('registrationNumber') && (
              <div className="flex flex-col mt-1">
                <span className="text-[8px] text-orange-600 font-black uppercase tracking-widest leading-none mb-1">REGISTRATION NO.</span>
                <div className="bg-blue-900 border border-blue-950 text-white rounded px-2.5 py-1 inline-block self-start font-mono text-xs font-bold tracking-widest shadow-sm">
                  {student.registrationNumber || '—'}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full mt-auto">
          <div className="h-7 bg-blue-900 flex items-center justify-between px-4 text-white text-[10px] font-bold tracking-wider uppercase">
            <span>FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI</span>
            <span className="text-orange-400 font-bold font-mono lowercase">{companyWebsite}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentIDCard;