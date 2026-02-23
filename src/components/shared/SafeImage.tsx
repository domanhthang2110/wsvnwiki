'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import wsrvLoader from '@/utils/imageLoader';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError' | 'loader'> {
    src: string | null | undefined;
    fallbackSrc?: string;
    useLoader?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({
    src,
    fallbackSrc = '/image/ui/news_placeholder.webp',
    useLoader = true,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    // If the src prop changes from parent, reset state
    React.useEffect(() => {
        setImgSrc(src || fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    return (
        <Image
            {...props}
            src={imgSrc}
            loader={useLoader && imgSrc.startsWith('http') ? wsrvLoader : undefined}
            onError={() => {
                if (!hasError) {
                    setImgSrc(fallbackSrc);
                    setHasError(true);
                }
            }}
        />
    );
};

export default SafeImage;
