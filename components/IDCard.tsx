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
    // This function specifically looks for "(TECHNICAL)" to style it.
    const parts = name.split(/(\(TECHNICAL\))/i);
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === '(technical)') {
            return (
              <span key={index} className="text-orange-500 font-semibold">{part}</span>
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
      className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg font-sans text-gray-800 flex flex-col overflow-hidden"
      style={backgroundPatternStyle}
    >
        {/* Header */}
        <header className="flex flex-col items-center text-center flex-shrink-0 pt-4 px-4">
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-12 w-12 object-contain" />
          )}
          <h1 className="text-sm font-bold text-gray-600 uppercase tracking-wide leading-tight px-2 mt-2">
            {renderCompanyName(companyName)}
          </h1>
          <p className="text-[10px] text-gray-500 leading-tight">{companyAddress}</p>
        </header>

        {/* Main Content - Centered with gaps */}
        <main className="flex-1 flex flex-col items-center text-center px-4 justify-around py-2">
          {/* Photo */}
          <img
            src={record.photo}
            alt={fullName}
            className="w-[120px] h-[140px] rounded-md object-cover border-2 border-gray-200"
          />
          
          {/* Details Section */}
          <div>
            {visibleFields.includes('fullName') && (
              <h2 className="text-base font-extrabold uppercase tracking-tight leading-snug px-2 break-words">
                {fullName}
              </h2>
            )}
             {visibleFields.includes('rank') && (
              <p className="text-sm uppercase font-semibold mt-1 break-words">{record.rank}</p>
             )}
            <div className="text-xs space-y-0.5 mt-1 font-bold">
                {visibleFields.includes('department') &&
                    <p className="break-words">
                        <span className="font-semibold">Dept.:</span> {record.department}
                    </p>
                }
                {visibleFields.includes('bloodGroup') && 
                    <p>
                        <span className="font-semibold">Blood Group:</span> {record.bloodGroup}
                    </p>
                }
            </div>
          </div>
          
           {/* QR Code */}
           {visibleFields.includes('qrCode') && (
            <div title="Scan to save contact details (vCard)" className="cursor-help">
              <div className="p-1 bg-white border rounded-md shadow-sm">
                <QRCodeCanvas value={vCardData} size={72} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full mt-auto flex-shrink-0">
            {visibleFields.includes('spNumber') && (
                <div className="bg-gray-800 text-white text-center py-1.5 flex items-center justify-center gap-4">
                  <div className="h-0.5 w-16 bg-yellow-400"></div>
                    <p className="font-bold text-lg tracking-wider">{record.spNumber}</p>
                  <div className="h-0.5 w-16 bg-yellow-400"></div>
                </div>
            )}
             <div className="bg-white py-1">
                <p className="text-center text-sm text-gray-600 font-medium">{companyWebsite}</p>
            </div>
        </footer>
    </div>
  );
};

export default IDCard;