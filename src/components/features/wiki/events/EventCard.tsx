import { EventItem } from '@/types/events';
import SafeImage from '@/components/shared/SafeImage';

interface EventCardProps {
  event: EventItem;
  onOpenModal: (event: EventItem) => void;
}

export default function EventCard({ event, onOpenModal }: EventCardProps) {

  return (
    <div
      className="relative bg-gray-800 border-2 border-gray-600 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[300px]" /* Added flex-col and min-h */
      onClick={() => onOpenModal(event)}
      style={{ borderStyle: 'double', borderWidth: '4px', borderColor: '#4a5568' }} // Simulating double border
    >
      <div className="w-full h-48 relative">
        <SafeImage
          src={event.imageUrl}
          fill
          alt={event.title}
          className="object-cover flex-shrink-0"
          draggable={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6 text-white flex flex-col flex-grow"> {/* Ensure all text inside is white, added flex-grow */}
        <h2 className="text-xl font-bold line-clamp-none">{event.title}</h2>
        {event.author && <p className="text-xs text-gray-300 mb-2">by {event.author}</p>} {/* Added mb-2 for spacing */}
        {/* Removed content preview */}
        <button
          onClick={() => onOpenModal(event)}
          className="mt-auto pt-4 text-blue-400 hover:underline text-sm self-start"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
