'use client';

import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { EventItem } from '@/types/events';export default function EventsContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Should match server-side

  const handleOpenModal = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const fetchEvents = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching events from API for page ${page}...`);
      const response = await fetch(`/api/events?page=${page}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || `HTTP ${response.status}`);
      }
      
      setEvents(data.items || []);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setItemsPerPage(data.itemsPerPage);
      // setDebugInfo(data.debug);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]); // Refetch when page changes

  const handleRefresh = () => {
    fetchEvents(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const pixelBackgroundStyle = {
    backgroundImage: 'url("/background.png")',
    backgroundRepeat: 'repeat',
    backgroundSize: '70px 40px',
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col p-4 border-[3px] border-double border-[#e6ce63] shadow-lg text-white" style={pixelBackgroundStyle}>
        <div className="mb-8 text-center">
          <p className="text-gray-400">Đang tải sự kiện...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col p-4 border-[3px] border-double border-[#e6ce63] shadow-lg text-white" style={pixelBackgroundStyle}>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Lỗi: {error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>Kiểm tra console để xem chi tiết lỗi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col p-4 border-[3px] border-double border-[#e6ce63] shadow-lg text-white" style={pixelBackgroundStyle}>
        {/* {debugInfo && (
          <div className="bg-gray-800 border border-yellow-400 p-4 mb-6 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">Debug Info</h3>
            <pre className="text-sm text-white whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )} */}
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Không có sự kiện nào được tìm thấy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <EventCard 
                key={event.guid || event.link || index} 
                event={event} 
                onOpenModal={handleOpenModal}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                } text-white transition-colors`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {isModalOpen && selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          isOpen={isModalOpen}
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}
