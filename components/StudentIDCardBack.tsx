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
        <div className="h-5 bg-blue-900 flex items-center justify-center px-4">
          <span className="text-white font-black font-mono lowercase text-[11px] tracking-widest" style={{ color: '#ffffff', fontWeight: 900 }}>{companyWebsite}</span>
        </div>
        <div className="h-[2px] bg-orange-500"></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-between px-6 py-2 w-full gap-2.5">
        {/* Top: Company Logo & College Header details */}
        <div className="flex flex-col items-center text-center">
          {companyLogo && (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-[48px] w-[48px] object-contain mb-1"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          )}
          
          <h2 className="text-[12px] font-black text-blue-900 uppercase tracking-tight leading-none" style={{ color: '#1e3a8a' }}>
            FEDERAL COLLEGE OF EDUCATION
          </h2>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-wider leading-none mt-1">
            (TECHNICAL) BICHI
          </p>
        </div>

        {/* Middle: Card Instructions */}
        <div className="w-full max-w-[450px] bg-slate-50/60 p-3 rounded-xl border border-slate-200/40 text-left">
          <ul className="space-y-1.5 text-[10px] text-black font-black leading-normal">
            <li className="flex items-start gap-1">
              <span className="text-orange-500 font-black">•</span>
              <span>This card is the official property of the College and must be worn at all times on campus.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-orange-500 font-black">•</span>
              <span>It is non-transferable and must be surrendered upon graduation or suspension/withdrawal.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-orange-500 font-black">•</span>
              <span>If found, please return immediately to the <strong className="text-black font-black">Provost or Security Unit</strong>.</span>
            </li>
          </ul>
        </div>
        
        {/* Bottom: Proposer Signature */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="w-36 h-7 flex items-center justify-center">
            {provostSignature ? (
              <img src={provostSignature} alt="Provost's Signature" className="max-h-7 object-contain mix-blend-multiply" />
            ) : (
              <div className="w-full h-7"></div>
            )}
          </div>
          <div className="w-36 border-t border-gray-300 mt-0.5"></div>
          <p className="text-[7px] mt-1 text-black font-black uppercase tracking-widest leading-none" style={{ color: '#000000' }}>Provost Signature</p>
        </div>
      </main>

      {/* Bottom bar with color stripes and portal url */}
      <div className="w-full h-3 bg-blue-900 flex items-center justify-center px-4 flex-shrink-0 border-t border-blue-950">
      </div>
    </div>
  );
};

export default StudentIDCardBack;