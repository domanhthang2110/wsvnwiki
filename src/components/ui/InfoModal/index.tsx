'use client';

import React, { useState, useRef } from 'react';
import { Item } from '@/types/items';
import IconFrame from '@/components/shared/IconFrame';
import Image from 'next/image';
import styles from './InfoModal.module.css';

interface InfoModalProps<T> {
  data: T;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
 width?: string;
 onPrevious?: () => void;
 onNext?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode | ((modalWidth: number) => React.ReactNode);
 title?: string;
 iconUrl?: string;
}

const InfoModal = <T extends { name?: string | null; icon_url?: string | null; description?: string | null, max_level?: number | null, items?: Item[] }>({
  data,
  isOpen,
  onClose,
  size = 'lg',
 width,
  children,
  footer,
  title,
  iconUrl,
}: InfoModalProps<T>) => {
  const [selectedRelic, setSelectedRelic] = useState<Item | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleRelicClick = (relic: Item) => {
    setSelectedRelic(relic);
  };

  const handleCloseRelicModal = () => {
    setSelectedRelic(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (selectedRelic) {
        handleCloseRelicModal();
      } else {
        onClose();
      }
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" onClick={handleOverlayClick} style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        ref={modalRef}
        className={`relative border-2 border-[color:var(--box-border-color)] bg-[color:var(--modal-background)] p-4 text-white ${width ? '' : sizeClasses[size]} max-h-[80vh] overflow-y-auto`}
        style={{ 
          width: width || '400px',
          backgroundColor: '#081822',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center">
          <div className="mr-4 flex-shrink-0">
            {(iconUrl || data.icon_url) && (
              <div className="h-12 w-12 border border-[color:var(--box-border-color)] relative">
                <Image src={iconUrl || data.icon_url!} alt={title || data.name || 'Icon'} layout="fill" objectFit="cover" draggable={false} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#ffff00' }}>{title || data.name}</h2>
        </div>

        {children}

        {data.items && data.items.length > 0 && (
          <div className="mt-4">
            <div className={styles.relicHeader}>
              <h3 className="text-lg font-semibold">Relics</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-h-80 overflow-y-auto">
              {data.items.map((item: Item) => (
                <div key={item.id} className="flex flex-col items-center text-center cursor-pointer" onClick={() => handleRelicClick(item)}>
                  <IconFrame
                    size={48}
                    contentImageUrl={item.icon_url}
                    altText={item.name ?? 'Relic Icon'}
                    styleType="yellow"
                  />
                  <span className="mt-1 w-20 break-words text-xs" style={{ color: '#9dee05' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {footer && (
        <div
          className="mt-1 flex items-center justify-center gap-2 p-0"
          style={{ width }}
        >
          {typeof footer === "function" ? footer(0) : footer}
        </div>
      )}

      {selectedRelic && (
        <div className="absolute inset-0 z-60 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); handleCloseRelicModal(); }}>
          <div
            className={`relative border-2 border-[color:var(--box-border-color)] bg-[color:var(--modal-background)] p-4 text-white ${sizeClasses[size]}`}
            style={{ 
              backgroundColor: '#081822',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                {selectedRelic.icon_url && (
                  <div className="h-12 w-12 border border-[color:var(--box-border-color)] relative">
                    <Image src={selectedRelic.icon_url} alt={selectedRelic.name ?? 'Icon'} layout="fill" objectFit="cover" draggable={false} />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#ffff00' }}>{selectedRelic.name}</h2>
            </div>
            <div className="mt-4">
              <p>{selectedRelic.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoModal;
