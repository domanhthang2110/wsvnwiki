export default function wsrvLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // If it's a relative path (internal image), don't proxy it
    if (!src.startsWith('http')) {
        return src;
    }

    // wsrv.nl allows us to resize and convert to webp for free
    const params = new URLSearchParams();
    params.append('url', src);
    params.append('w', width.toString());
    if (quality) {
        params.append('q', quality.toString());
    }
    params.append('output', 'webp');

    return `https://wsrv.nl/?${params.toString()}`;
}
