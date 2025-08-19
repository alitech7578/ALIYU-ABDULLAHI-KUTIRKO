import React from 'react';
import { Student } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface StudentIDCardProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
}

const StudentIDCard: React.FC<StudentIDCardProps> = ({ student, companyName, companyLogo, companyWebsite }) => {
  
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
  
  const baseUrl = window.location.href.split('#')[0];
  const verificationUrl = `${baseUrl}#/id/${student.id}`;
  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');

  return (
    <div className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg flex flex-col font-sans text-gray-800 relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-200">
        {companyLogo && (
          <img src={companyLogo} alt="Company Logo" className="h-10 w-10 object-contain" />
        )}
        <h1 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          {renderCompanyName(companyName)}
        </h1>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-row flex-grow p-4">
        {/* Photo */}
        <div className="flex items-center justify-center w-40 flex-shrink-0">
          <img
            src={student.photo}
            alt={fullName}
            className="w-36 h-36 rounded-full object-cover border-4 border-gray-300"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center pl-4 text-left">
          <h2 className="text-3xl font-bold uppercase tracking-tight leading-tight">
            {fullName}
          </h2>
          <p className="mt-2 text-lg text-gray-500 uppercase">{student.department}</p>
          <div className="mt-6 flex items-end justify-between">
            <div className="text-md">
                <p className="font-semibold text-gray-500 text-sm">REGISTRATION NO.</p>
                <p className="font-bold text-lg">{student.registrationNumber}</p>
            </div>
            <div className="p-1 bg-white border rounded-md shadow-sm ml-4">
                <QRCodeCanvas value={verificationUrl} size={64} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="w-full h-8 bg-gray-800 flex items-center justify-center">
          <div 
            className="absolute bottom-8 left-0 w-full h-1 bg-yellow-400"
          ></div>
          <p className="text-center text-white text-xs tracking-wider">{companyWebsite}</p>
      </footer>
    </div>
  );
};

export default StudentIDCard;