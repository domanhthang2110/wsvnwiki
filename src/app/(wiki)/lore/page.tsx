'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';
import wsrvLoader from '@/utils/imageLoader';

// ─── Data ────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  faction?: 'Sentinel' | 'Legion' | 'Neutral';
  image?: string;
  type: 'major' | 'battle' | 'discovery' | 'founding';
  content: string;
  isMain: true;
}

interface LorePost {
  id: string;
  title: string;
  summary: string;
  href: string;
  tag?: string;
}

const mainTimeline: TimelineEvent[] = [
  {
    id: '1',
    year: 'Kỷ nguyên Sáng tạo',
    title: 'Thế Giới Thức Tỉnh',
    description: 'Các vị thần tối thượng tạo ra Arinar, thổi hồn vào những chủng tộc đầu tiên.',
    faction: 'Neutral',
    image: '/image/ui/big_logo.webp',
    type: 'major',
    content: 'Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối. Trong bóng tối nguyên thủy, các vị thần tối thượng tập hợp thần lực để tạo ra Arinar. Những người Firstborn xuất hiện từ những khu rừng thiêng liêng, được ban tặng trí tuệ vĩnh cửu và sự kết nối với thiên nhiên. Chosen được ban ân sủng thần thánh, trở thành người bảo vệ ánh sáng thiêng liêng. Từ những đỉnh núi cao, Mountain Clan hùng mạnh bước ra. Và từ bóng tối, Forsaken nổi lên, bậc thầy về nghệ thuật đen tối.',
    isMain: true,
  },
  {
    id: '2',
    year: 'Kỷ nguyên 1',
    title: 'Cuộc Đại Chia Ly',
    description: 'Sự khác biệt về tư tưởng chia tách các chủng tộc thành hai phe đối lập: Sentinel và Legion.',
    faction: 'Neutral',
    image: '/image/ui/big_logo.webp',
    type: 'major',
    content: 'Khi các chủng tộc phát triển mạnh mẽ, những bất đồng cơ bản về tương lai Arinar nổi lên. Chosen và Firstborn, tin vào trật tự và công lý, hình thành liên minh Sentinel. Trong khi đó, Mountain Clan và Forsaken, đề cao sức mạnh và tự do, đoàn kết dưới ngọn cờ Legion. Sự chia rẽ này định hình số phận Arinar hàng nghìn năm.',
    isMain: true,
  },
  {
    id: '3',
    year: 'Kỷ nguyên 2',
    title: 'Trận Chiến Cánh Đồng Đỏ',
    description: 'Cuộc xung đột lớn đầu tiên giữa Sentinel và Legion cướp đi hàng nghìn sinh mạng.',
    faction: 'Neutral',
    image: '/image/factions/elf_badge.webp',
    type: 'battle',
    content: 'Những đồng bằng màu mỡ sau này được gọi là Cánh Đồng Đỏ đã chứng kiến trận chiến quy mô lớn đầu tiên giữa hai phe. Lực lượng Sentinel, dẫn đầu bởi Paladin Chosen và Ranger Firstborn, đụng độ với quân đoàn Legion gồm Barbarian Mountain Clan và Death Knight Forsaken. Trận chiến kéo dài bảy ngày bảy đêm, nhuộm đỏ những cánh đồng xanh.',
    isMain: true,
  },
  {
    id: '4',
    year: 'Kỷ nguyên 3',
    title: 'Khám Phá Cổ Vật',
    description: 'Những hiện vật quyền năng từ Kỷ nguyên Sáng tạo được khai quật, thay đổi cán cân quyền lực.',
    faction: 'Neutral',
    image: '/image/talents/key_talent.webp',
    type: 'discovery',
    content: 'Sâu trong những tàn tích bị lãng quên, các nhà thám hiểm từ cả hai phe phát hiện ra những cổ vật cổ xưa ẩn chứa phép thuật nguyên thủy. Những hiện vật này ban tặng sức mạnh phi thường cho ai có thể làm chủ chúng, dẫn đến sự phát triển của các kỹ thuật chiến đấu và khả năng ma thuật tiên tiến.',
    isMain: true,
  },
  {
    id: '5',
    year: 'Kỷ nguyên 4',
    title: 'Xây Dựng Đại Thành Phố',
    description: 'Các khu định cư lớn được thành lập, trở thành trung tâm quyền lực và văn hóa của mỗi phe.',
    faction: 'Neutral',
    image: '/image/ui/cloud/cloud.webp',
    type: 'founding',
    content: 'Khi các phe củng cố lãnh thổ, những thành phố vĩ đại mọc lên từ hoang dã. Sentinel xây dựng những thành trì ánh sáng huy hoàng với tháp cao và đền thờ thiêng liêng. Legion dựng nên những pháo đài kiên cố chạm khắc từ đá núi và bao phủ trong bóng tối. Những thành phố này trở thành không chỉ là căn cứ quân sự mà còn là trung tâm học thuật và văn hóa.',
    isMain: true,
  },
  {
    id: '6',
    year: 'Kỷ nguyên 5',
    title: 'Cuộc Chiến Vĩnh Cửu',
    description: 'Tuyên chiến chính thức khi cả hai phe đều tuyên bố quyền thống trị hợp pháp với Arinar.',
    faction: 'Neutral',
    image: '/image/factions/mc_badge.webp',
    type: 'major',
    content: 'Sau nhiều thế kỷ xung đột lẻ tẻ và những hiệp định tạm bợ, cả hai phe chính thức tuyên bố ý định chinh phục toàn bộ Arinar. Sentinel tuyên bố sứ mệnh thần thánh mang lại trật tự và công lý. Legion khẳng định quyền tự do và sức mạnh. Cuộc Chiến Vĩnh Cửu bắt đầu — không phải một cuộc xung đột đơn lẻ, mà là cuộc đấu tranh bất tận vẫn tiếp diễn đến ngày nay.',
    isMain: true,
  },
];

const supplementalPosts: LorePost[] = [
  { id: 's1', title: 'Huyền Thoại Về Bóng Tối Nguyên Thủy', summary: 'Câu chuyện về những gì tồn tại trước khi Arinar được tạo ra.', href: '#', tag: 'Thần Thoại' },
  { id: 's2', title: 'Lịch Sử Tộc Người Firstborn', summary: 'Biên niên sử chi tiết về tộc người cổ đại nhất Arinar.', href: '#', tag: 'Chủng Tộc' },
  { id: 's3', title: 'Bí Mật Của Forsaken', summary: 'Màn bí mật che giấu nguồn gốc thực sự của tộc người Quỷ.', href: '#', tag: 'Bí Ẩn' },
  { id: 's4', title: 'Truyền Thuyết Về Vũ Khí Cổ Đại', summary: 'Những cây vũ khí huyền thoại từng thay đổi cục diện chiến tranh.', href: '#', tag: 'Vật Phẩm' },
  { id: 's5', title: 'Anh Hùng Của Thời Đại Vàng', summary: 'Chân dung những chiến binh xuất sắc nhất lịch sử Arinar.', href: '#', tag: 'Nhân Vật' },
  { id: 's6', title: 'Địa Lý Huyền Bí Của Arinar', summary: 'Khám phá các vùng đất và địa điểm đặc biệt trên thế giới.', href: '#', tag: 'Thế Giới' },
];

const typeIcon: Record<string, string> = {
  major: '⭐',
  battle: '⚔️',
  discovery: '🔍',
  founding: '🏰',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LorePage() {
  const [activeId, setActiveId] = useState(mainTimeline[0].id);
  const active = mainTimeline.find(e => e.id === activeId)!;

  return (
    <div className={`${classContentStyles.pixelBackground} flex flex-col`} style={{ minHeight: '100vh' }}>

      {/* ── Header + timeline rail ── */}
      <div className="bg-[#05070a] border-b border-[#e6ce63]/10">
        {/* Header */}
        <div className="text-center pt-5 pb-2">
          <h1
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e6ce63] to-[#a18a2d] tracking-[.15em]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            BIÊN NIÊN SỬ
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1 italic">The Chronicles of Arinar</p>
        </div>

        {/* Horizontal Timeline Rail */}
        <div className="relative flex-shrink-0 px-6 py-4">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-[#e6ce63]/20 -translate-y-1/2" />

          <div className="relative flex justify-between items-center">
            {mainTimeline.map((event, i) => {
              const isActive = event.id === activeId;
              return (
                <button
                  key={event.id}
                  onClick={() => setActiveId(event.id)}
                  className="flex flex-col items-center gap-1 group flex-1"
                  aria-label={event.title}
                >
                  {/* Dot */}
                  <div
                    className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10
                      ${isActive
                        ? 'border-[#e6ce63] bg-[#e6ce63]/20 shadow-[0_0_16px_rgba(230,206,99,0.5)] scale-110'
                        : 'border-[#e6ce63]/30 bg-[#0b0f16] group-hover:border-[#e6ce63]/70 group-hover:scale-105'
                      }`}
                  >
                    <span className="text-sm">{typeIcon[event.type]}</span>
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#e6ce63]" />
                    )}
                  </div>
                  {/* Year label */}
                  <span
                    className={`text-[10px] text-center leading-tight transition-colors duration-300 max-w-[70px]
                      ${isActive ? 'text-[#e6ce63]' : 'text-gray-500 group-hover:text-gray-300'}`}
                  >
                    {event.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>



      </div> {/* end sticky rail */}


      {/* ── Detail Panel — grows naturally, page scrolls ── */}
      <div className="mx-6 mt-4 mb-8 border border-[#e6ce63]/30 bg-[#0b0f16]/80">
        <div key={active.id} className="flex min-h-[300px] animate-fade-in">
          {/* Image side */}
          {active.image && (
            <div className="relative w-64 flex-shrink-0 hidden md:block">
              <Image
                loader={wsrvLoader}
                src={active.image}
                alt={active.title}
                fill
                className="object-cover opacity-60"
                sizes="256px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b0f16]" />
            </div>
          )}

          {/* Text side */}
          <div className="flex-1 p-6">
            <span className="text-[#e6ce63]/60 text-xs tracking-widest uppercase mb-2 block">{active.year}</span>
            <h2
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {active.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{active.description}</p>
            <div className="h-px w-16 bg-[#e6ce63]/30 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed italic">
              &ldquo;{active.content}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ── Below the fold: supplemental posts ── */}
      <div className="px-6 pb-16 pt-8 border-t border-[#e6ce63]/10">
        <h2
          className="text-xl font-bold text-[#e6ce63]/70 tracking-widest uppercase mb-6 text-center"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Tài Liệu Khác
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {supplementalPosts.map(post => (
            <Link
              key={post.id}
              href={post.href}
              className="group block bg-[#0b0f16] border border-[#e6ce63]/15 hover:border-[#e6ce63]/50 p-4 transition-all duration-300 hover:bg-[#11171f]"
            >
              {post.tag && (
                <span className="inline-block text-[10px] uppercase tracking-widest text-[#e6ce63]/50 border border-[#e6ce63]/20 px-2 py-0.5 mb-2">
                  {post.tag}
                </span>
              )}
              <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-[#e6ce63] transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{post.summary}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Cinzel font */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />

      <style global jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s ease both;
        }
      `}</style>
    </div>
  );
}
