import HomePage from '@/components/features/wiki/home/HomePage';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';

export default function Home() {
  return (
    <div id="home-content-wrapper" className={`${classContentStyles.pixelBackground} flex flex-col flex-grow w-full`}>
      <HomePage />
    </div>
  );
}
