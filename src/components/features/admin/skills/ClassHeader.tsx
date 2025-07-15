import React from 'react';
import IconFrame from '@/components/shared/IconFrame'; // Import IconFrame

interface ClassHeaderProps {
  className: string;
  classIconUrl: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ className, classIconUrl, isExpanded, onToggle }) => {
  return (
    <div 
      className="flex items-center py-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors -mx-4 px-4"
      onClick={onToggle}
    >
      {classIconUrl && (
        <div className="mr-3"> {/* Wrapper div for margin */}
          <IconFrame
            size={32}
            contentImageUrl={classIconUrl}
            altText={`${className} icon`}
            frameType="regular"
            styleType="yellow"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-100 flex-grow">{className}</h3>
      <div className="text-gray-400">
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        )}
      </div>
    </div>
  );
};

export default ClassHeader;
