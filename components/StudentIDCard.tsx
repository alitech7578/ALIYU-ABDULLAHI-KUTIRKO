import React from 'react';
import { Student } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface StudentIDCardProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  companyAddress: string;
}

const StudentIDCard: React.FC<StudentIDCardProps> = ({ student, companyName, companyLogo, companyWebsite, companyAddress }) => {
  
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
  const qrCodeContent = JSON.stringify({
    ID: student.id,
    FullName: fullName,
    RegistrationNumber: student.registrationNumber,
    Department: student.department,
    Email: student.email,
  });

  return (
    <div
      className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg p-0 flex flex-col font-sans text-gray-800 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-3 p-3 border-b">
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
        <main className="flex-grow flex items-center p-3 gap-4">
          {/* Left: Photo */}
          <div className="flex-shrink-0">
            <img
              src={student.photo}
              alt={fullName}
              className="w-32 h-40 object-cover rounded-md border-2 border-gray-300"
            />
          </div>
          
          {/* Middle: Details */}
          <div className="flex-grow flex flex-col justify-center gap-2">
            <h2 className="text-3xl font-bold uppercase tracking-tight leading-tight">
              {fullName}
            </h2>
            <p className="text-md text-gray-600 uppercase">{student.department}</p>
            <div className="mt-2 border-t pt-2">
              <p className="font-semibold text-gray-500 text-xs">REGISTRATION NO.</p>
              <p className="font-bold text-lg">{student.registrationNumber}</p>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="flex flex-col items-center justify-center gap-2 pr-2">
              <div title="Scan to view student details" className="cursor-help">
                <div className="p-1 bg-white border rounded-md shadow-sm">
                    <QRCodeCanvas value={qrCodeContent} size={80} />
                </div>
              </div>
          </div>
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