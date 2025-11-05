import React from 'react';
import { DataRecord } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface IDCardBackProps {
  record: DataRecord;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  provostSignature: string | null;
}

const backgroundPatternStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)',
  backgroundSize: '15px 15px',
};

const IDCardBack: React.FC<IDCardBackProps> = ({ record, companyName, companyLogo, companyWebsite, provostSignature }) => {
  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === '(technical)' ? (
            <span key={index} className="text-orange-500 font-semibold">
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
    `NOTE:SP Number: ${record.spNumber}\\nDepartment: ${record.department}\\nBlood Group: ${record.bloodGroup}\\nMarital Status: ${record.marriedStatus}\\nState of Origin: ${record.state} / ${record.lg}`,
    'END:VCARD'
  ].join('\n');


  return (
    <div
      className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-between font-sans text-gray-700"
      style={backgroundPatternStyle}
    >
      {/* Top decorative element */}
      <div className="w-full">
        <div className="h-8 bg-gray-700 mx-[-1rem] relative flex items-center justify-between px-4">
          <div className="h-1 w-16 bg-yellow-400"></div>
          <div className="h-1 w-16 bg-yellow-400"></div>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center text-center px-4 py-4 w-full justify-around">
        <div>
            {companyLogo && (
              <img src={companyLogo} alt="Company Logo" className="h-14 w-14 object-contain mb-3 mx-auto" />
            )}
            <p className="text-xs text-gray-500">This card is the property of</p>
            <h2 className="text-lg font-bold mt-1 text-gray-800">
              {renderCompanyName(companyName)}
            </h2>

            <p className="text-xs mt-4 text-gray-600">
              If found, please return to the <br /> Provost/Security Unit
            </p>
        </div>
        
        <div className="flex flex-col items-center w-full">
            <div className="w-48 h-12 flex items-center justify-center">
                {provostSignature ? (
                    <img src={provostSignature} alt="Provost's Signature" className="max-h-12 object-contain" />
                ) : (
                    <div className="w-full h-12"></div> // empty space for signature
                )}
            </div>
            <div className="w-48 border-t border-gray-600 mt-1"></div>
            <p className="text-xs mt-1 text-gray-600">Provost Signature</p>
        </div>

        {/* QR Code */}
        <div title="Scan to save contact details (vCard)" className="cursor-help">
          <div className="p-1 bg-white border rounded-md shadow-sm">
            <QRCodeCanvas value={vCardData} size={100} />
          </div>
        </div>
      </main>

      {/* Bottom decorative element */}
      <div className="w-full">
         <div className="h-8 bg-gray-700 mx-[-1rem] relative flex items-center justify-between px-4 mt-4">
            <div className="h-1 w-16 bg-yellow-400"></div>
            <div className="h-1 w-16 bg-yellow-400"></div>
        </div>
        <p className="text-center text-gray-600 text-sm font-semibold mt-2">{companyWebsite}</p>
      </div>
    </div>
  );
};

export default IDCardBack;