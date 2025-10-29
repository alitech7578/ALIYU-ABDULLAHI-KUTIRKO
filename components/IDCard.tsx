import React from 'react';
import { DataRecord } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { IDCardLayout } from '../types';

interface IDCardProps {
  record: DataRecord;
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

const IDCard: React.FC<IDCardProps> = ({ record, companyName, companyLogo, companyWebsite, companyAddress, layoutSettings }) => {
  const { visibleFields } = layoutSettings;

  const renderCompanyName = (name: string) => {
    // This function specifically looks for "(TECHNICAL)" to style it red, as per the sample image.
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
  
  const fullName = [record.name, record.middleName, record.surname].filter(Boolean).join(' ');
  
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${record.surname};${record.name};${record.middleName};;`,
    `FN:${fullName}`,
    `ORG:${companyName.replace(/,/g, '\\,')}`,
    `TITLE:${record.rank}`,
    `EMAIL;TYPE=INTERNET:${record.email}`,
    `TEL;TYPE=CELL:${record.phoneNumber}`,
    `ADR;TYPE=WORK:;;${companyAddress.replace(/,/g, '\\,')};;;;`,
    `NOTE:SP Number: ${record.spNumber}\\nDepartment: ${record.department}\\nBlood Group: ${record.bloodGroup}\\nMarital Status: ${record.marriedStatus}\\nState of Origin: ${record.state} / ${record.lg}`,
    'END:VCARD'
  ].join('\n');

  const textDetailFields = ['rank', 'department', 'bloodGroup'];
  const visibleTextDetailFields = visibleFields.filter(f => textDetailFields.includes(f));

  return (
    <div
      className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg font-sans text-gray-800 flex flex-col p-2"
      style={backgroundPatternStyle}
    >
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-10 w-10 object-contain" />
          )}
          <h1 className="text-sm font-bold text-gray-600 uppercase tracking-wide px-2">
            {renderCompanyName(companyName)}
          </h1>
          <p className="text-xs text-gray-500 leading-tight">{companyAddress}</p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center text-center flex-grow">
          <div className="flex flex-col items-center mt-0.5">
            <img
              src={record.photo}
              alt={fullName}
              className="w-24 h-32 rounded-md object-cover border-2 border-gray-300 mx-auto"
            />
            {visibleFields.includes('fullName') && <h2 className="mt-0.5 text-[15px] font-bold uppercase tracking-tighter leading-tight px-1">{fullName}</h2>}
          </div>
          
          {visibleTextDetailFields.length > 0 && (
            <div className="flex flex-col gap-0 text-xs text-center leading-tight">
              {visibleFields.includes('rank') && <p className="text-gray-500 uppercase">{record.rank}</p>}
              {visibleFields.includes('department') && <p><span className="font-semibold">Dept.:</span> {record.department}</p>}
              {visibleFields.includes('bloodGroup') && <p><span className="font-semibold">Blood Group:</span> {record.bloodGroup}</p>}
            </div>
          )}
          
          {visibleFields.includes('qrCode') && (
            <div title="Scan to save contact details (vCard)" className="cursor-help mt-auto mb-0">
              <div className="p-1.5 bg-white border rounded-md shadow-sm">
                  <QRCodeCanvas value={vCardData} size={160} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full">
          {visibleFields.includes('spNumber') && (
            <div className="relative h-7 bg-gray-800 mx-[-0.5rem] flex items-center justify-center">
                <div 
                    className="absolute top-1/2 left-0 w-full h-0.5 bg-yellow-400"
                    style={{transform: 'translateY(-50%)'}}
                ></div>
                <div className="relative bg-gray-800 px-6 z-10">
                    <span className="text-white font-bold text-lg">{record.spNumber}</span>
                </div>
            </div>
          )}
          <p className="text-center text-gray-600 mt-0.5 text-sm">{companyWebsite}</p>
        </footer>
    </div>
  );
};

export default IDCard;
