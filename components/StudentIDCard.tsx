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
  const rawVisibleFields = layoutSettings?.visibleFields || [];
  const visibleFields = rawVisibleFields.includes('expiryDate') || !rawVisibleFields.includes('registrationNumber')
    ? rawVisibleFields
    : [...rawVisibleFields, 'expiryDate'];

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
  
  const otherNames = [student.firstName, student.middleName].filter(Boolean).join(' ');
  const fullName = [student.firstName, student.middleName, student.surname].filter(Boolean).join(' ');
  
  const qrCodeText = [
    'FEDERAL COLLEGE OF EDUCATION',
    '(TECHNICAL)',
    'BICHI',
    ' Surname',
    student.surname || '—',
    'Other Names',
    otherNames || '—',
    'Department',
    student.department || '—',
    'REGISTRATION NO.',
    student.registrationNumber || '—',
    'EXPIRY DATE',
    student.expiryDate || '—'
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
        <header className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white relative">
          {companyLogo && (
            <div className="flex-shrink-0 bg-white p-0.5 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="h-[48px] w-[48px] object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          )}
          <div className="text-center flex-grow flex flex-col items-center justify-center">
            <h1 className="text-[12px] font-extrabold text-blue-900 uppercase tracking-tight leading-none" style={{ color: '#1e3a8a' }}>
              FEDERAL COLLEGE OF EDUCATION
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-[3px]">
              <span className="text-[11px] font-black text-red-600 uppercase tracking-wide leading-none">
                (TECHNICAL)
              </span>
              <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide leading-none" style={{ color: '#1e3a8a' }}>
                BICHI
              </span>
            </div>
            <p className="text-[8.5px] text-black font-black uppercase tracking-wider mt-1" style={{ color: '#000000' }}>
              P.M.B. 3473, Kano
            </p>
          </div>
          {companyLogo && (
            <div className="w-[49px] h-[49px] flex-shrink-0 invisible"></div>
          )}
        </header>

        {/* Dual Accent Colored Bar separating Header & Body */}
        <div className="w-full flex flex-col">
          <div className="h-1 bg-blue-900"></div>
          <div className="h-[2px] bg-orange-500"></div>
        </div>

        {/* Main Content */}
        <main className="flex-grow flex items-start p-3 pt-[18px] gap-5 relative bg-white/40">
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
          <div className="flex-grow flex flex-col justify-start gap-1 min-w-0 pr-2 pt-[5px]">
            {visibleFields.includes('fullName') && (
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <span className="text-[8px] text-black font-black uppercase tracking-widest leading-none" style={{ color: '#000000' }}>Surname</span>
                  <span className="text-[16px] font-black text-black uppercase tracking-tight truncate leading-tight" style={{ color: '#000000' }}>
                    {student.surname || '—'}
                  </span>
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[8px] text-black font-black uppercase tracking-widest leading-none" style={{ color: '#000000' }}>Other Names</span>
                  <span className="text-[14px] font-extrabold text-black uppercase tracking-tight truncate leading-tight" style={{ color: '#000000' }}>
                    {[student.firstName, student.middleName].filter(Boolean).join(' ') || '—'}
                  </span>
                </div>
              </div>
            )}
            
            {visibleFields.includes('department') && (
              <div className="flex flex-col">
                <span className="text-[8px] text-black font-black uppercase tracking-widest leading-none" style={{ color: '#000000' }}>Department</span>
                <span className="text-[11px] font-black text-black uppercase tracking-wide truncate mt-0.5" style={{ color: '#000000' }}>
                  {student.department || '—'}
                </span>
              </div>
            )}

            {visibleFields.includes('registrationNumber') && (
              <div className="flex flex-col mt-0.5">
                <span className="text-[8px] text-orange-600 font-black uppercase tracking-widest leading-none mb-0.5">REGISTRATION NO.</span>
                <div className="bg-blue-900 border border-blue-950 text-white rounded px-2.5 py-0.5 inline-block self-start font-mono text-xs font-bold tracking-widest shadow-sm">
                  {student.registrationNumber || '—'}
                </div>
              </div>
            )}
            
            {visibleFields.includes('expiryDate') && (
              <div className="flex flex-col items-center justify-center mt-5">
                <span className="text-[7.5px] text-black font-black uppercase tracking-widest leading-none" style={{ color: '#000000' }}>Expires</span>
                <span className="text-[9.5px] font-black text-red-600 uppercase tracking-widest mt-0.5 leading-none">
                  {student.expiryDate || '—'}
                </span>
              </div>
            )}
          </div>

          {/* Right: Verification QR Code */}
          <div title="Scan to verify student details" className="flex-shrink-0 flex flex-col items-center justify-center p-2 bg-slate-50/80 border border-slate-200/50 rounded-xl shadow-xs mr-1 self-center">
            <div className="p-0.5 bg-white border border-gray-100 rounded shadow-inner flex items-center justify-center">
              <QRCodeCanvas value={qrCodeText} size={82} includeMargin={false} level="L" />
            </div>
            <span className="text-[7px] mt-1.5 text-blue-900 font-black tracking-widest uppercase text-center leading-none">Scan to Verify</span>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full mt-auto">
          <div className="h-7 bg-blue-900 flex items-center justify-center px-4 text-white uppercase">
            <span className="text-white font-black font-mono lowercase text-[12px] tracking-widest" style={{ color: '#ffffff', fontWeight: 900 }}>{companyWebsite}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentIDCard;