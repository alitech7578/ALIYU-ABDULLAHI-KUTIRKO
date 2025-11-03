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
      className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg p-0 flex flex-col font-sans text-gray-800 overflow-hidden"
      style={backgroundPatternStyle}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-3 p-2 border-b">
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-12 w-12 object-contain" />
          )}
          <div className="text-left">
            <h1 className="text-lg font-bold text-gray-600 uppercase tracking-wide">
              {renderCompanyName(companyName)}
            </h1>
            <p className="text-xs text-gray-500">{companyAddress}</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center p-2 gap-4">
          {/* Left: Photo */}
          <div className="flex-shrink-0">
            <img
              src={student.photo}
              alt={fullName}
              className="w-28 h-36 object-cover rounded-md border-2 border-gray-300"
            />
          </div>
          
          {/* Middle: Details */}
          <div className="flex-grow flex flex-col justify-center gap-0 min-w-0">
            {visibleFields.includes('fullName') && (
              <h2 className="text-lg font-extrabold uppercase tracking-tighter leading-tight">
                <span className="break-words">{student.firstName}</span>
                {student.middleName && <span className="block break-words">{student.middleName}</span>}
                <span className="block break-words">{student.surname}</span>
              </h2>
            )}
            {visibleFields.includes('department') && <p className="text-md text-gray-600 uppercase font-bold break-words mt-1">{student.department}</p>}
            {visibleFields.includes('registrationNumber') && (
              <div className="mt-1 border-t pt-1">
                <p className="font-semibold text-gray-500 text-xs">REGISTRATION NO.</p>
                <p className="font-bold text-lg">{student.registrationNumber}</p>
              </div>
            )}
          </div>

          {/* Right: QR Code */}
          {visibleFields.includes('qrCode') && (
            <div className="flex flex-col items-center justify-center gap-2 pr-2">
                <div title="Scan to save contact details (vCard)" className="cursor-help">
                  <div className="p-1 bg-white border rounded-md shadow-sm">
                      <QRCodeCanvas value={vCardData} size={80} />
                  </div>
                </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full">
          <div className="h-6 bg-gray-800 flex items-center justify-center">
              <p className="text-white text-sm font-semibold tracking-wider">{companyWebsite}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentIDCard;