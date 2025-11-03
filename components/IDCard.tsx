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
    // This function specifically looks for "(TECHNICAL)" to style it red.
    const parts = name.split(/(\(TECHNICAL\))/i);
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === '(technical)') {
            return (
              <span key={index} className="text-red-500">{part}</span>
            );
          }
          return part;
        })}
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

  return (
    <div
      className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg font-sans text-gray-800 flex flex-col p-3"
      style={backgroundPatternStyle}
    >
        {/* Header */}
        <header className="flex flex-col items-center text-center flex-shrink-0">
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-10 w-10 object-contain" />
          )}
          <h1 className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-tight px-2 mt-1">
            {renderCompanyName(companyName)}
          </h1>
          <p className="text-[10px] text-gray-500 leading-tight">{companyAddress}</p>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col mt-4">
          <div className="flex gap-3 items-start">
            {/* Photo */}
            <img
              src={record.photo}
              alt={fullName}
              className="w-[100px] h-[120px] rounded-md object-cover border-2 border-gray-300 flex-shrink-0"
            />
            
            {/* Details Right of Photo */}
            <div className="flex-1 flex justify-between min-w-0">
              <div className="flex-1 flex flex-col min-w-0">
                {visibleFields.includes('fullName') && (
                  <h2 className="text-xl font-extrabold uppercase tracking-tighter leading-tight break-words">
                    {record.name}
                    <span className="block">
                      {[record.middleName, record.surname].filter(Boolean).join(' ')}
                    </span>
                  </h2>
                )}
                {visibleFields.includes('department') && (
                  <p className="text-gray-600 uppercase leading-tight text-xs font-semibold mt-1 break-words">{record.department}</p>
                )}
              </div>
              
              {visibleFields.includes('qrCode') && (
                <div title="Scan to save contact details (vCard)" className="cursor-help flex-shrink-0 ml-2">
                  <div className="p-1 bg-white border rounded-md shadow-sm">
                    <QRCodeCanvas value={vCardData} size={56} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Details below photo and name */}
          <div className="mt-4 space-y-1.5 text-left">
            {visibleFields.includes('rank') && 
              <div>
                <p className="text-gray-500 uppercase leading-tight text-[10px] font-semibold">Position</p>
                <p className="text-gray-800 uppercase leading-tight text-sm font-bold">{record.rank}</p>
              </div>
            }
            {visibleFields.includes('bloodGroup') && 
              <div>
                <p className="text-gray-500 uppercase leading-tight text-[10px] font-semibold">Blood Group</p>
                <p className="text-gray-800 leading-tight text-sm font-bold">{record.bloodGroup}</p>
              </div>
            }
          </div>
          
          <div className="flex-grow" />
          
          {/* SP Number / Registration Number at the bottom */}
          {visibleFields.includes('spNumber') && (
            <div className="text-left mt-2">
                <p className="text-gray-500 uppercase leading-tight text-[10px] font-semibold">REGISTRATION NO.</p>
                <p className="text-gray-800 uppercase leading-tight text-base font-bold tracking-wider">{record.spNumber}</p>
            </div>
          )}
        </main>
    </div>
  );
};

export default IDCard;
