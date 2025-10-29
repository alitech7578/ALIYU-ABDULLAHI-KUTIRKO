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
  
  // Generate a vCard string with all the record's details
  const generateVCard = (rec: DataRecord): string => {
    const base64Photo = rec.photo.split(',')[1] || '';
    
    const vCard = `BEGIN:VCARD
VERSION:3.0
N:${rec.surname};${rec.name};${rec.middleName};;
FN:${fullName}
ORG:${companyName}
TITLE:${rec.rank}
EMAIL:${rec.email}
TEL;TYPE=WORK,VOICE:${rec.phoneNumber}
PHOTO;ENCODING=b64;TYPE=JPEG:${base64Photo}
X-DEPARTMENT:${rec.department}
X-SP-NUMBER:${rec.spNumber}
X-BLOOD-GROUP:${rec.bloodGroup}
NOTE:State: ${rec.state}\\nLG: ${rec.lg}\\nMarital Status: ${rec.marriedStatus}
END:VCARD`;
    return vCard;
  };

  const vCardData = generateVCard(record);

  const mainContentFields = ['department', 'bloodGroup'];
  const visibleMainContentFields = visibleFields.filter(f => mainContentFields.includes(f));

  return (
    <div
      className="w-[320px] h-[512px] bg-white rounded-xl shadow-lg font-sans text-gray-800 flex flex-col p-4"
      style={backgroundPatternStyle}
    >
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-10 w-10 object-contain" />
          )}
          <h1 className="mt-1 text-base font-bold text-gray-600 uppercase tracking-wide px-2">
            {renderCompanyName(companyName)}
          </h1>
          <p className="text-xs text-gray-500 mt-1">{companyAddress}</p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center text-center flex-grow py-2">
          <div className="flex flex-col items-center">
            <img
              src={record.photo}
              alt={fullName}
              className="w-28 h-36 rounded-md object-cover border-2 border-gray-300 mx-auto"
            />
            {visibleFields.includes('fullName') && <h2 className="mt-1 text-base font-bold uppercase tracking-tight">{fullName}</h2>}
            {visibleFields.includes('rank') && <p className="text-sm text-gray-500 uppercase mt-1">{record.rank}</p>}
          </div>
          
          {visibleMainContentFields.length > 0 && (
            <div className="flex flex-col gap-1 text-sm text-center mt-2 mb-4">
              {visibleMainContentFields.map(fieldId => {
                if (fieldId === 'department') {
                  return <p key={fieldId}><span className="font-semibold">Dept.:</span> {record.department}</p>;
                }
                if (fieldId === 'bloodGroup') {
                  return <p key={fieldId}><span className="font-semibold">Blood Group:</span> {record.bloodGroup}</p>;
                }
                return null;
              })}
            </div>
          )}
          
          {visibleFields.includes('qrCode') && (
            <div title="Scan to import contact details" className="cursor-help mt-auto">
              <div className="p-1 bg-white border rounded-md shadow-sm">
                  <QRCodeCanvas value={vCardData} size={80} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full">
          {visibleFields.includes('spNumber') && (
            <div className="relative h-8 bg-gray-800 mx-[-1rem] flex items-center justify-center">
                <div 
                    className="absolute top-1/2 left-0 w-full h-0.5 bg-yellow-400"
                    style={{transform: 'translateY(-50%)'}}
                ></div>
                <div className="relative bg-gray-800 px-6 z-10">
                    <span className="text-white font-bold text-lg">{record.spNumber}</span>
                </div>
            </div>
          )}
          <p className="text-center text-gray-600 mt-2 text-sm">{companyWebsite}</p>
        </footer>
    </div>
  );
};

export default IDCard;