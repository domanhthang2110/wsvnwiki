import { Item } from '@/types/items';
import IconFrame from '@/components/shared/IconFrame';

interface CompactItemCardProps {
  item: Item;
  isSelected: boolean;
}

export default function CompactItemCard({ item, isSelected }: CompactItemCardProps) {
  return (
    <div className={`
      p-2 border rounded-lg shadow-sm transition-all duration-200 
      flex flex-col items-center text-center
      ${isSelected ? 'bg-blue-900 border-blue-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}
    `}>
      {item.icon_url && (
        <IconFrame 
          contentImageUrl={item.icon_url} 
          altText={item.name ?? ""} 
          size={48} 
          style={{ objectFit: 'contain', borderRadius: '0.375rem', border: '1px solid #4b5563', marginBottom: '0.5rem' }}
        />
      )}
      <h3 className="text-sm font-bold text-gray-100 line-clamp-2">{item.name}</h3>
    </div>
  );
}
