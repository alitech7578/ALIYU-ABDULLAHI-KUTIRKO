import React from 'react';
import { DataRecord } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface IDCardProps {
  record: DataRecord;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
}

const IDCard: React.FC<IDCardProps> = ({ record, companyName, companyLogo, companyWebsite }) => {
  
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
  
  // Construct a unique, scannable URL for verification
  const baseUrl = window.location.href.split('#')[0];
  const verificationUrl = `${baseUrl}#/id/${record.id}`;
  const fullName = [record.name, record.middleName, record.surname].filter(Boolean).join(' ');

  return (
    <div className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg p-4 flex flex-col font-sans text-gray-800">
      
      {/* Header */}
      <header className="flex flex-col items-center text-center">
        {companyLogo && (
          <img src={companyLogo} alt="Company Logo" className="h-14 w-14 object-contain" />
        )}
        <h1 className="mt-2 text-base font-bold text-gray-600 uppercase tracking-wide px-2">
          {renderCompanyName(companyName)}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center mt-4 flex-grow">
        <img
          src={record.photo}
          alt={fullName}
          className="w-36 h-36 rounded-md object-cover border-2 border-gray-300"
        />
        <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight">
          {fullName}
        </h2>
        <p className="text-sm text-gray-500 uppercase">{record.rank}</p>
        
        <div className="w-full mt-auto pt-4 flex justify-between items-end px-2">
            <div className="text-md text-left space-y-1">
                <p><span className="font-semibold">Dept.:</span> {record.department}</p>
                <p><span className="font-semibold">Blood group:</span> {record.bloodGroup}</p>
            </div>
            <div className="p-1 bg-white border rounded-md shadow-sm">
                <QRCodeCanvas value={verificationUrl} size={64} />
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-4">
        <div className="relative h-8 bg-gray-800 mx-[-1rem] flex items-center justify-center">
            <div 
                className="absolute top-1/2 left-0 w-full h-0.5 bg-yellow-400"
                style={{transform: 'translateY(-50%)'}}
            ></div>
            <div className="relative bg-gray-800 px-6 z-10">
                <span className="text-white font-bold text-lg">{record.spNumber}</span>
            </div>
        </div>
        <p className="text-center text-gray-600 mt-2 text-sm">{companyWebsite}</p>
      </footer>
    </div>
  );
};

export default IDCard;