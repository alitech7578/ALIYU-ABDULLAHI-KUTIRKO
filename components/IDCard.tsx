import React from 'react';
import { DataRecord, IDCardLayout } from '../types';

interface IDCardProps {
  record: DataRecord;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  companyAddress: string;
  layoutSettings: IDCardLayout;
}

const IDCard: React.FC<IDCardProps> = ({ record, companyName, companyLogo, companyWebsite, companyAddress, layoutSettings }) => {
  const { visibleFields } = layoutSettings;

  const renderCompanyName = (name: string) => {
    const parts = name.split(/(\(TECHNICAL\))/i);
    if (parts.length > 1) {
      return (
        <>
          <span className="block">{parts[0].trim().toUpperCase()}</span>
          <span className="block">
            <span className="text-amber-500 font-bold">(TECHNICAL)</span>
            {parts.slice(2).join('').toUpperCase()}
          </span>
        </>
      );
    }
    return <>{name.toUpperCase()}</>;
  };

  const fullName = [record.name, record.middleName, record.surname].filter(Boolean).join(' ');

  return (
    <div className="w-[54mm] h-[85.6mm] bg-white rounded-[6px] shadow-xl overflow-hidden relative flex flex-col items-center font-sans text-slate-900 print:shadow-none box-border leading-normal">
       {/* Background Dot Pattern */}
       <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-60"></div>
       
       {/* Watermark Logo Pattern (20 Logos in 4x5 Grid) */}
       {companyLogo && (
        <div className="absolute inset-0 z-0 grid grid-cols-4 grid-rows-5 items-center justify-items-center p-2 pointer-events-none opacity-[0.10] overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <img key={i} src={companyLogo} alt="" className="w-10 -rotate-12 sepia saturate-[6] hue-rotate-15 brightness-[0.85] contrast-[1.2]" />
            ))}
        </div>
       )}

       {/* Top Section */}
       <div className="relative z-10 w-full pt-4 px-2 flex flex-col items-center text-center">
            {companyLogo && (
                <div className="w-8 h-8 mb-1.5">
                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
            )}
            
            <h1 className="text-[6.5px] font-bold leading-tight tracking-wide text-slate-800 px-1">
                {renderCompanyName(companyName)}
            </h1>
            <p className="text-[5.5px] text-slate-500 mt-0.5 font-medium">{companyAddress}</p>
       </div>

       {/* Photo Section */}
       <div className="relative z-10 mt-2 mb-1">
            <div className="w-[90px] h-[100px] bg-gray-200 rounded-md shadow-sm overflow-hidden border border-gray-200">
                <img src={record.photo} alt={fullName} className="w-full h-full object-cover" />
            </div>
       </div>

       {/* Details Section */}
       <div className="relative z-10 flex-1 w-full px-2 flex flex-col items-center text-center gap-1">
            {visibleFields.includes('fullName') && (
                <h2 className="text-[10px] font-extrabold text-slate-900 uppercase tracking-tight leading-tight">
                    {fullName}
                </h2>
            )}
            
            {visibleFields.includes('rank') && (
                 <p className="text-[9px] font-bold text-slate-700 uppercase leading-none">
                    {record.rank}
                 </p>
            )}

            <div className="flex flex-col gap-0.5 mt-0.5">
                {visibleFields.includes('department') && (
                    <p className="text-[7.5px] font-semibold text-slate-800 leading-none">
                        Dept.: {record.department}
                    </p>
                )}
                {visibleFields.includes('bloodGroup') && (
                    <p className="text-[7.5px] font-semibold text-slate-800 leading-none">
                        Blood Group: {record.bloodGroup}
                    </p>
                )}
            </div>
       </div>

       {/* Footer Section - Matches Screenshot */}
       <div className="relative z-10 w-full mt-auto">
            {/* Dark Bar with SP Number and Yellow Lines */}
            <div className="bg-slate-800 w-full h-[22px] flex items-center justify-between px-3">
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
                
                {visibleFields.includes('spNumber') && (
                    <span className="text-white font-bold text-[9px] mx-2 uppercase tracking-wider">
                        {record.spNumber}
                    </span>
                )}
                
                <div className="h-[2px] flex-1 bg-amber-400 rounded-full"></div>
            </div>
            
            {/* Website Link */}
            <div className="bg-white w-full py-1 text-center border-t border-slate-100">
                <p className="text-[5.5px] text-slate-800 font-bold tracking-wide">{companyWebsite}</p>
            </div>
       </div>
    </div>
  );
};

export default IDCard;