import React from 'react';
import { Student } from '../types';

interface StudentIDCardBackProps {
  student: Student;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string;
  provostSignature: string | null;
}

const StudentIDCardBack: React.FC<StudentIDCardBackProps> = ({ student, companyName, companyLogo, companyWebsite, provostSignature }) => {
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

  return (
    <div className="w-[512px] h-[320px] bg-white rounded-xl shadow-lg p-0 overflow-hidden flex flex-col items-center justify-between font-sans text-gray-700">
      {/* Top decorative element */}
      <div className="w-full h-8 bg-gray-700 relative flex items-center justify-between px-4">
          <div className="h-1 w-24 bg-yellow-400"></div>
          <div className="h-1 w-24 bg-yellow-400"></div>
      </div>

      <main className="flex-grow flex flex-col items-center text-center px-4 py-2 w-full justify-around">
        <div>
            {companyLogo && (
              <img src={companyLogo} alt="Company Logo" className="h-12 w-12 object-contain mb-2 mx-auto" />
            )}
            <p className="text-xs text-gray-500">This card is the property of</p>
            <h2 className="text-lg font-bold mt-1 text-gray-800">
              {renderCompanyName(companyName)}
            </h2>

            <p className="text-xs mt-3 text-gray-600">
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
      </main>

      {/* Bottom decorative element */}
      <div className="w-full h-8 bg-gray-700 relative flex items-center justify-between px-4">
            <div className="h-1 w-24 bg-yellow-400"></div>
            <div className="h-1 w-24 bg-yellow-400"></div>
      </div>
    </div>
  );
};

export default StudentIDCardBack;