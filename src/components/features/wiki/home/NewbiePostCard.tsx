'use client';

import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import { LoadingLink } from '@/components/shared/LoadingLink';

interface NewbiePostCardProps {
  postLink: string;
  icon: string;
}

const NewbiePostCard: React.FC<NewbiePostCardProps> = ({ postLink, icon }) => {
  const [postTitle, setPostTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostTitle = async () => {
      if (!postLink) return;

      try {
        const { supabase } = await import('@/lib/supabase/client');
        const slug = postLink.split('/').pop();
        
        const { data, error } = await supabase
          .from('posts')
          .select('title')
          .eq('slug', slug)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setPostTitle(data.title);
        }
      } catch (error) {
        console.error('Error fetching post title:', error);
        setPostTitle('Bài viết không tồn tại');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostTitle();
  }, [postLink]);

  if (isLoading) {
    return (
      <div className={`${styles.newbieLink} animate-pulse`}>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <LoadingLink href={postLink} className={styles.newbieLink}>
      <span>{icon}</span>
      <span>{postTitle}</span>
    </LoadingLink>
  );
};

export default NewbiePostCard;
