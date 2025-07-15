import Clock from '@/components/ui/Clock/Clock';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';

export default function Home() {
  return (
    <div id="home-content-wrapper" className={`${classContentStyles.pixelBackground} flex flex-col flex-grow w-full`}>
      <div className="flex items-center justify-center flex-grow">
        <Clock timeZone="Europe/Berlin" label="Ingame time" />
        <div style={{ width: '2px', height: '200px', backgroundColor: '#e6ce63' }}></div>
        <Clock timeZone="Asia/Ho_Chi_Minh" label="Real time" />
      </div>
    </div>
  );
}
