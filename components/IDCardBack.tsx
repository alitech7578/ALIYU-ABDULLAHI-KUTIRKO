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

const IDCardBack: React.FC<IDCardBackProps> = ({ record, companyName, companyLogo, companyWebsite, provostSignature }) => {
    
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
    `NOTE:SP Number: ${record.spNumber}\\nDepartment: ${record.department}`,
    'END:VCARD'
  ].join('\n');

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    if (parts.length > 1) {
      return (
        <>
          <span className="block font-extrabold">{parts[0].trim().toUpperCase()}</span>
          <span className="block">
            <span className="text-amber-500 font-extrabold">(TECHNICAL)</span>
            <span className="font-extrabold">{parts.slice(2).join('').toUpperCase()}</span>
          </span>
        </>
      );
    }
    return <span className="font-extrabold">{name.toUpperCase()}</span>;
  };

  return (
    <div className="w-[54mm] h-[85.6mm] bg-white rounded-[6px] shadow-xl overflow-hidden relative flex flex-col font-sans print:shadow-none text-slate-900 leading-normal">
       {/* Background Dot Pattern */}
       <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-60"></div>
       
       {/* Top Bar */}
       <div className="relative z-10 bg-slate-800 w-full h-[18px] flex items-center justify-between px-4 mt-2">
            <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
            <div className="w-4"></div> {/* Spacer */}
            <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
       </div>

       <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 text-center -mt-2">
            {companyLogo && (
                 <img src={companyLogo} alt="Logo" className="w-8 h-8 object-contain mb-1.5" />
            )}
            
            <p className="text-[5.5px] text-slate-700 mb-0.5">This card is the property of</p>
            <h3 className="text-[6.5px] font-extrabold text-slate-900 leading-tight mb-3 px-1">
                {renderCompanyName(companyName)}
            </h3>

            <p className="text-[6px] text-slate-600 leading-relaxed mb-2 max-w-[250px]">
                If found, please return to the<br/>
                <br/>
                Provost/Security Unit
            </p>

            {/* Signature Area */}
             <div className="flex flex-col items-center justify-center mb-3 w-full">
                {provostSignature ? (
                    <img src={provostSignature} alt="Signature" className="h-6 object-contain mb-0.5" />
                ) : (
                     <div className="h-6 w-20 border-b border-dashed border-slate-300"></div>
                )}
                <div className="w-24 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[5px] text-slate-500 mt-0.5">Provost Signature</p>
            </div>

            <div className="bg-white p-0.5 rounded-sm shadow-sm">
                <QRCodeCanvas 
                    value={vCardData} 
                    size={556} 
                    style={{ width: '65px', height: '65px' }}
                    level="M"
                />
            </div>
       </div>

       {/* Bottom Footer Section */}
       <div className="relative z-10 w-full mt-auto">
             {/* Dark Bar with Yellow Lines */}
            <div className="bg-slate-800 w-full h-[18px] flex items-center justify-between px-4 mb-0">
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
                <div className="w-4"></div> {/* Spacer */}
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
            </div>
             {/* Website Link */}
            <div className="bg-white w-full py-1 text-center border-t border-slate-100 mb-1">
                <p className="text-[5.5px] text-slate-800 font-bold tracking-wide">{companyWebsite}</p>
            </div>
       </div>
    </div>
  );
};

export default IDCardBack;