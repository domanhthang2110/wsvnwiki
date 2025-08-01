import { useState } from 'react'; // Import useState
import { EventItem } from '@/types/events';
import LongButton from '@/components/ui/LongButton'; // Import LongButton
interface EventModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [showOriginal, setShowOriginal] = useState(false); // State for language toggle

  if (!isOpen) return null;

  const formattedDate = new Date(event.pubDate).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayedDescription = showOriginal ? event.originalDescription : event.description;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // Explicit rgba for translucency
      onClick={onClose} // Close on outside click
    >
      <div 
        className="bg-gray-800 border-2 border-gray-600 max-w-3xl w-full max-h-[90vh] relative flex flex-col" // Reverted background to gray-800
        style={{ borderStyle: 'double', borderWidth: '4px', borderColor: '#4a5568' }} // Simulating double border
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Buttons are absolute relative to this parent div */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50"> 
          <LongButton
            width={40}
            onClick={onClose}
            className="!p-0 !w-[40px] !h-[40px] flex items-center justify-center"
            style={{ minWidth: '40px' }}
          >
            {/* Removed text-gray-400 and hover:text-white */}
            <span className="text-2xl leading-none">&times;</span> 
          </LongButton>
          {event.originalDescription && (
            <LongButton
              width={40}
              onClick={() => setShowOriginal(prev => !prev)}
              style={{ minWidth: '40px' }}
            >
              <span className=" text-white text-xs leading-none">
                {showOriginal ? 'EN' : 'VI'}
              </span>
            </LongButton>
          )}
        </div>
        
        {/* This inner div will now be scrollable */}
        <div className="p-8 pr-16 text-white flex-grow overflow-y-auto"> 
          <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
          <p className="text-sm mb-6">
            {formattedDate} {event.author && `by ${event.author}`}
          </p>
          <div 
            key={showOriginal ? 'original' : 'translated'}
            className="leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: displayedDescription ?? '' }}
          />
          <a 
            href={event.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-6 inline-block text-blue-400 hover:underline"
          >
            Đọc bài viết gốc
          </a>
        </div>
      </div>
    </div>
  );
}
