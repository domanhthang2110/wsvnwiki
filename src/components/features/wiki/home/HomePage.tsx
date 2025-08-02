'use client';

import React, { useState, useEffect, useRef } from 'react';
import Clock from '@/components/ui/Clock/Clock';
import { EventItem } from '@/types/events';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomePage.module.css';
import EventModal from '../events/EventModal';
import IconFrame from '@/components/shared/IconFrame';

const LatestNews = ({ onOpenModal }: { onOpenModal: (event: EventItem) => void }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const newsTrackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (newsTrackRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      newsTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (newsTrackRef.current) {
        e.preventDefault();
        newsTrackRef.current.scrollLeft += e.deltaY;
      }
    };

    const newsTrackElement = newsTrackRef.current;
    if (newsTrackElement) {
      newsTrackElement.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (newsTrackElement) {
        newsTrackElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        
        const { data } = await supabase
          .from('events')
          .select('*')
          .order('pub_date', { ascending: false })
          .limit(4);
        
        if (data) {
          // Convert to EventItem format
          const eventItems: EventItem[] = data.map(event => ({
            title: event.title || 'Untitled',
            description: event.description || '',
            originalDescription: event.original_desc || '', // Correctly map original_desc
            author: event.author || '',
            pubDate: event.pub_date || event.created_at,
            link: event.link || '',
            guid: event.guid,
            imageUrl: event.image_url || ''
          }));
          setEvents(eventItems);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.latestNews}>
        <h2 className={styles.sectionTitle}>Tin tức mới nhất</h2>
        <div className={styles.newsCarousel}>
          <div className={styles.newsTrack}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${styles.newsCard} animate-pulse`}>
                <div className={styles.newsImageContainer}>
                  <div className="w-full h-full bg-gray-700"></div>
                </div>
                <div className={styles.newsContent}>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.latestNews}>
      <h2 className={styles.sectionTitle}>Tin tức mới nhất</h2>
      <div className={styles.newsCarousel}>
        <div className={styles.newsTrack} ref={newsTrackRef}>
          {events.map((event) => (
            <div
              key={event.guid}
              className={styles.newsCard}
              onClick={() => onOpenModal(event)}
            >
              {event.imageUrl && (
                <div className={styles.newsImageContainer}>
                  <Image src={event.imageUrl} alt={event.title} width={300} height={200} className={styles.newsImage} />
                </div>
              )}
              <div className={styles.newsContent}>
                <h3 className={styles.newsTitle}>{event.title}</h3>
                <div className={styles.newsDate}>
                  {new Date(event.pubDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className={`${styles.carouselButton} ${styles.carouselButtonLeft}`} onClick={() => scroll('left')}>
        &#8249;
      </button>
      <button className={`${styles.carouselButton} ${styles.carouselButtonRight}`} onClick={() => scroll('right')}>
        &#8250;
      </button>
    </div>
  );
};

const QuickLinks = () => {
  const links = [
    { 
      href: '/classes', 
      label: 'Lớp nhân vật', 
      image: '/image/quicklinks/classes.webp'
    },
    { 
      href: '/guides', 
      label: 'Hướng dẫn', 
      image: '/image/quicklinks/guides.webp'
    },
    { 
      href: '/events', 
      label: 'Sự kiện', 
      image: '/image/quicklinks/events.webp'
    },
    { 
      href: '/lore', 
      label: 'Biên niên sử', 
      image: '/image/quicklinks/lore.webp'
    },
  ];

  return (
    <div className={styles.quickLinks}>
      <h2 className={styles.sectionTitle}>Truy cập nhanh</h2>
      <div className={styles.linksGrid}>
        {links.map(link => (
          <Link href={link.href} key={link.href} className={styles.quickLink}>
            <div className={styles.linkImageContainer}>
              <Image src={link.image} alt={link.label} width={300} height={300} className={styles.linkImage} />
            </div>
            <div className={styles.linkContent}>
              <h3 className={styles.linkTitle}>{link.label}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className={styles.homePage}>
        <div className={styles.logoPlaceholder}>
          <Image 
            src="/image/ui/big_logo.webp" 
            alt="Warspear Online Wiki Vietnam Logo" 
            width={400} 
            height={200} 
            priority 
            className={styles.bigLogoImage}
          />
        </div>
        <div className={styles.introductionSection}>
          <p className={styles.introduction}>
            Chào mừng bạn đến với <strong>Warspear Online Wiki Việt Nam</strong>.
            Một wiki không chính thức được phát triển và duy trì bởi <a href=""><strong><u>Yukami</u></strong></a>.
          </p>
          <p className={styles.introduction}>Gia nhập cộng đồng:</p>
          <div className={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <IconFrame 
                contentImageUrl="/image/ui/social/fb.webp" 
                altText="Facebook"
                size={50}
              />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <IconFrame 
                contentImageUrl="/image/ui/social/discord.webp" 
                altText="Discord"
                size={50}
              />
            </a>
            <a href="https://messenger.com" target="_blank" rel="noopener noreferrer">
              <IconFrame 
                contentImageUrl="/image/ui/social/messenger.webp" 
                altText="Messenger"
                size={50}
              />
            </a>
          </div>
        </div>
        <div className={styles.clockAndNewbieSection}>
          <div className={styles.clockSection}>
            <Clock 
              primaryTimeZone="Europe/Berlin" 
              primaryLabel="Ingame Time"
              secondaryTimeZone="Asia/Ho_Chi_Minh" 
              secondaryLabel="Real Time"
            />
          </div>
          <div className={styles.newbieSection}>
            <h2 className={styles.newbieSectionTitle}>Dành cho người mới</h2>
            <div className={styles.newbieLinks}>
              <a href="#" className={styles.newbieLink}>
                <span>📚</span>
                <span>Hướng dẫn cơ bản</span>
              </a>
              <a href="#" className={styles.newbieLink}>
                <span>⚔️</span>
                <span>Chọn lớp nhân vật</span>
              </a>
              <a href="#" className={styles.newbieLink}>
                <span>🎯</span>
                <span>Mẹo cho người mới</span>
              </a>
              <a href="#" className={styles.newbieLink}>
                <span>🏆</span>
                <span>Nhiệm vụ đầu tiên</span>
              </a>
            </div>
          </div>
        </div>
        <QuickLinks />
        <LatestNews onOpenModal={handleOpenModal} />
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
};

export default HomePage;
