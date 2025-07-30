'use client';

import React, { useState, useEffect } from 'react';
import Clock from '@/components/ui/Clock/Clock';
import { getPosts } from '@/lib/data/posts';
import { PostItem } from '@/types/posts';
import { EventItem } from '@/types/events';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomePage.module.css';
import EventModal from '../events/EventModal';

const LatestNews = ({ onOpenModal }: { onOpenModal: (event: EventItem) => void }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            id: event.id,
            title: event.title || 'Untitled',
            description: event.description || '',
            originalDescription: event.description || '',
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
        <h2 className={styles.sectionTitle}>Latest News</h2>
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
      <h2 className={styles.sectionTitle}>Latest News</h2>
      <div className={styles.newsCarousel}>
        <div className={styles.newsTrack}>
          {events.map((event) => (
            <div 
              key={event.id} 
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
    </div>
  );
};

const QuickLinks = () => {
  const links = [
    { 
      href: '/classes', 
      label: 'Classes', 
      description: 'Explore all character classes',
      image: '/image/menu/classes.webp'
    },
    { 
      href: '/guides', 
      label: 'Guides', 
      description: 'Learn strategies and tips',
      image: '/image/menu/guides.webp'
    },
    { 
      href: '/events', 
      label: 'Events', 
      description: 'Current and upcoming events',
      image: '/image/menu/events.webp'
    },
    { 
      href: '/calculator', 
      label: 'Calculator', 
      description: 'Plan your character build',
      image: '/image/menu/calculator.webp'
    },
  ];

  return (
    <div className={styles.quickLinks}>
      <h2 className={styles.sectionTitle}>Quick Links</h2>
      <div className={styles.linksGrid}>
        {links.map(link => (
          <Link href={link.href} key={link.href} className={styles.quickLink}>
            <div className={styles.linkImageContainer}>
              <Image src={link.image} alt={link.label} width={60} height={60} className={styles.linkImage} />
            </div>
            <div className={styles.linkContent}>
              <h3 className={styles.linkTitle}>{link.label}</h3>
              <p className={styles.linkDescription}>{link.description}</p>
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
          <h1>BIG LOGO</h1>
        </div>
        <div className={styles.clockContainer}>
          <Clock timeZone="Europe/Berlin" label="Ingame Time" />
          <Clock timeZone="Asia/Ho_Chi_Minh" label="Real Time" />
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
