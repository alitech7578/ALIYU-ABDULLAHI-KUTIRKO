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

const backgroundPatternStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)',
  backgroundSize: '15px 15px',
};

const StudentIDCardBack: React.FC<StudentIDCardBackProps> = ({ student, companyName, companyLogo, companyWebsite, provostSignature }) => {
  const isBichi = companyName.toUpperCase().includes('FEDERAL COLLEGE OF EDUCATION') && companyName.toUpperCase().includes('BICHI');

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === '(technical)' ? (
            <span key={index} className="text-red-500 font-extrabold">
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
    `N:${student.surname};${student.firstName};${student.middleName || ''};;`,
    `FN:${fullName}`,
    `ORG:${companyName.replace(/,/g, '\\,')}`,
    `TITLE:Student`,
    `EMAIL;TYPE=INTERNET:${student.email}`,
    `NOTE:Reg:${student.registrationNumber}`,
    'END:VCARD'
  ].join('\n');

  return (
    <div
      className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg p-0 overflow-hidden flex flex-col items-center justify-between font-sans text-black border border-gray-100"
      style={{ ...backgroundPatternStyle, color: '#000000' }}
    >
      {/* Top bar matching front's footer */}
      <div className="w-full flex flex-col">
        <div className="h-4 bg-blue-900 flex items-center justify-between px-4">
          <span className="text-[7.5px] text-white/80 font-black tracking-widest uppercase">OFFICIAL STUDENT RECORDS</span>
          <span className="text-[7.5px] text-orange-400 font-bold font-mono lowercase">{companyWebsite}</span>
        </div>
        <div className="h-[2px] bg-orange-500"></div>
      </div>

      <main className="flex-grow flex flex-row items-center text-center px-4 py-2 w-full justify-around gap-1">
        {/* Left Side: Property and Institution Details */}
        <div className="flex-1 flex flex-col justify-center items-center">
            {companyLogo && (
              <img src={companyLogo} alt="Company Logo" className="h-[38px] w-[38px] object-contain mb-1.5 mx-auto" />
            )}
            <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-widest leading-none">This card is the property of</p>
            
            {isBichi ? (
              <div className="mt-1">
                <h2 className="text-[12px] font-black text-blue-900 uppercase tracking-tight leading-tight" style={{ color: '#1e3a8a' }}>
                  FEDERAL COLLEGE OF EDUCATION
                </h2>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[11px] font-black text-red-600 uppercase tracking-wide leading-none">(TECHNICAL)</span>
                  <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide leading-none" style={{ color: '#1e3a8a' }}>BICHI</span>
                </div>
              </div>
            ) : (
              <h2 className="text-[12px] font-extrabold mt-1 text-blue-900 uppercase tracking-tight leading-tight" style={{ color: '#1e3a8a' }}>
                {renderCompanyName(companyName)}
              </h2>
            )}

            <p className="text-[9px] mt-3.5 text-gray-500 font-medium leading-relaxed max-w-[190px]">
              If found, please return immediately to the <span className="font-extrabold text-gray-800">Provost or Security Unit</span>
            </p>
        </div>
        
        {/* Middle: Signature space */}
        <div className="flex flex-col items-center w-36 flex-shrink-0 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
            <div className="w-full h-10 flex items-center justify-center">
                {provostSignature ? (
                    <img src={provostSignature} alt="Provost's Signature" className="max-h-10 object-contain mix-blend-multiply" />
                ) : (
                    <div className="w-full h-10"></div> // empty space for signature
                )}
            </div>
            <div className="w-full border-t border-gray-300 mt-1"></div>
            <p className="text-[8px] mt-1 text-gray-500 font-black uppercase tracking-widest leading-none">Provost Signature</p>
        </div>

        {/* Right Side: QR Code */}
        <div title="Scan to verify student details" className="cursor-help flex-shrink-0">
          <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-sm inline-block">
            <QRCodeCanvas value={vCardData} size={90} includeMargin={false} level="M" />
          </div>
          <p className="text-[7.5px] mt-1 text-gray-400 font-bold uppercase tracking-widest leading-none text-center">Scan To Verify</p>
        </div>

      </main>

      {/* Bottom bar with color stripes and portal url */}
      <div className="w-full h-5 bg-blue-900 flex items-center justify-center px-4 flex-shrink-0 border-t border-blue-950">
            <p className="text-white text-[9px] font-extrabold tracking-widest uppercase">BICHI, KANO STATE • P.M.B. 3473</p>
      </div>
    </div>
  );
};

export default StudentIDCardBack;