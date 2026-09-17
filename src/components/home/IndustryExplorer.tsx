'use client';

import { useState } from 'react';
import { MIcon } from '@/components/ui';
import styles from './industry.module.css';

/**
 * IndustryExplorer — chọn ngành → đổi panel (SCR-01 Industries v3, tương tác client).
 * Song ngữ: tên/tiêu đề/mô tả theo locale; nhãn giải pháp giữ thuật ngữ kỹ thuật (EN).
 */
type Sol = { name: string; icon: string };
type Ind = {
  key: string;
  name: string;
  nameVi: string;
  icon: string;
  headline: string;
  headlineVi: string;
  desc: string;
  descVi: string;
  solutions: Sol[];
};

const INDUSTRIES: Ind[] = [
  {
    key: 'banking', name: 'Banking', nameVi: 'Ngân hàng', icon: 'account_balance',
    headline: 'Secure. Reliable. Always On.', headlineVi: 'Bảo mật. Tin cậy. Luôn sẵn sàng.',
    desc: 'Empowering financial institutions with secure connectivity, cloud and digital solutions.',
    descVi: 'Trao sức mạnh cho tổ chức tài chính bằng kết nối bảo mật, đám mây và giải pháp số.',
    solutions: [
      { name: 'Secure Connectivity', icon: 'vpn_lock' }, { name: 'Cybersecurity', icon: 'shield' },
      { name: 'Cloud & Data Center', icon: 'cloud' }, { name: 'Digital Channels', icon: 'smartphone' },
      { name: 'Compliance Support', icon: 'verified' },
    ],
  },
  {
    key: 'government', name: 'Government', nameVi: 'Chính phủ', icon: 'account_balance_wallet',
    headline: 'Digital services for every citizen.', headlineVi: 'Dịch vụ số cho mọi người dân.',
    desc: 'Secure national infrastructure, e-government platforms and connectivity across all provinces.',
    descVi: 'Hạ tầng quốc gia bảo mật, nền tảng chính phủ điện tử và kết nối tới mọi tỉnh thành.',
    solutions: [
      { name: 'Nationwide Connectivity', icon: 'cell_tower' }, { name: 'Sovereign Cloud', icon: 'cloud' },
      { name: 'Cybersecurity & SOC', icon: 'shield' }, { name: 'Smart City', icon: 'location_city' },
      { name: 'Managed Services', icon: 'settings' },
    ],
  },
  {
    key: 'enterprise', name: 'Enterprise', nameVi: 'Doanh nghiệp', icon: 'apartment',
    headline: 'Infrastructure that scales with you.', headlineVi: 'Hạ tầng mở rộng cùng bạn.',
    desc: 'Connectivity, cloud and managed services for multi-site organisations.',
    descVi: 'Kết nối, đám mây và dịch vụ quản trị cho tổ chức nhiều chi nhánh.',
    solutions: [
      { name: 'Enterprise Connectivity', icon: 'lan' }, { name: 'Cloud & Hosting', icon: 'cloud' },
      { name: 'Cybersecurity', icon: 'shield' }, { name: 'Enterprise Applications', icon: 'apps' },
      { name: 'Communication Solutions', icon: 'forum' },
    ],
  },
  {
    key: 'sme', name: 'SME', nameVi: 'SME', icon: 'storefront',
    headline: 'Big capabilities. Right-sized.', headlineVi: 'Năng lực lớn, quy mô vừa vặn.',
    desc: 'Affordable packages that get small businesses online, secure and productive fast.',
    descVi: 'Gói giá hợp lý giúp doanh nghiệp nhỏ lên mạng, bảo mật và hiệu quả nhanh chóng.',
    solutions: [
      { name: 'FTTH & Internet', icon: 'wifi' }, { name: 'Mobile Plans', icon: 'sim_card' },
      { name: 'Cloud Apps', icon: 'cloud' }, { name: 'Endpoint Security', icon: 'security' },
      { name: 'Bulk SMS', icon: 'sms' },
    ],
  },
  {
    key: 'logistics', name: 'Logistics', nameVi: 'Logistics', icon: 'local_shipping',
    headline: 'Every asset, tracked in real time.', headlineVi: 'Mọi tài sản, giám sát thời gian thực.',
    desc: 'IoT, fleet tracking and connectivity to keep goods moving across Myanmar.',
    descVi: 'IoT, giám sát đội xe và kết nối để hàng hóa luôn lưu thông khắp Myanmar.',
    solutions: [
      { name: 'Fleet Tracking', icon: 'route' }, { name: 'IoT Sensors', icon: 'sensors' },
      { name: 'M2M Connectivity', icon: 'hub' }, { name: 'Data Analytics', icon: 'analytics' },
      { name: 'Mobile Workforce', icon: 'smartphone' },
    ],
  },
  {
    key: 'retail', name: 'Retail', nameVi: 'Bán lẻ', icon: 'shopping_bag',
    headline: 'Connected stores. Smarter selling.', headlineVi: 'Cửa hàng kết nối. Bán hàng thông minh.',
    desc: 'Reliable in-store connectivity, digital payments and customer analytics.',
    descVi: 'Kết nối trong cửa hàng ổn định, thanh toán số và phân tích khách hàng.',
    solutions: [
      { name: 'Store Connectivity', icon: 'wifi' }, { name: 'Digital Payments', icon: 'payments' },
      { name: 'AI Camera', icon: 'videocam' }, { name: 'Customer Analytics', icon: 'analytics' },
      { name: 'Bulk SMS', icon: 'sms' },
    ],
  },
  {
    key: 'manufacturing', name: 'Manufacturing', nameVi: 'Sản xuất', icon: 'factory',
    headline: 'Smart factories, zero downtime.', headlineVi: 'Nhà máy thông minh, không gián đoạn.',
    desc: 'Industrial IoT, private connectivity and monitoring for production sites.',
    descVi: 'IoT công nghiệp, kết nối riêng và giám sát cho khu sản xuất.',
    solutions: [
      { name: 'Private Connectivity', icon: 'lan' }, { name: 'Smart Monitoring', icon: 'monitoring' },
      { name: 'Industrial IoT', icon: 'precision_manufacturing' }, { name: 'Cybersecurity', icon: 'shield' },
      { name: 'Automation', icon: 'smart_toy' },
    ],
  },
  {
    key: 'education', name: 'Education', nameVi: 'Giáo dục', icon: 'school',
    headline: 'Learning without limits.', headlineVi: 'Học tập không giới hạn.',
    desc: 'Campus connectivity, cloud platforms and secure access for students and staff.',
    descVi: 'Kết nối khuôn viên, nền tảng đám mây và truy cập bảo mật cho học sinh và giáo viên.',
    solutions: [
      { name: 'Campus Wi-Fi', icon: 'wifi' }, { name: 'Cloud Platforms', icon: 'cloud' },
      { name: 'E-Learning', icon: 'cast_for_education' }, { name: 'Secure Access', icon: 'lock' },
      { name: 'Communication', icon: 'forum' },
    ],
  },
];

export function IndustryExplorer({ locale, ctaLabel }: { locale: 'en' | 'vi'; ctaLabel: string }) {
  const [active, setActive] = useState(0);
  const a = INDUSTRIES[active];
  const vi = locale === 'vi';

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Industries">
        {INDUSTRIES.map((ind, i) => (
          <button
            key={ind.key}
            role="tab"
            aria-selected={i === active}
            className={`${styles.tab}${i === active ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setActive(i)}
          >
            <MIcon name={ind.icon} />
            {vi ? ind.nameVi : ind.name}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.photo}>
          <MIcon name={a.icon} />
          <span className={styles.photoScrim} />
        </div>
        <div className={styles.text}>
          <h3 className={styles.headline}>{vi ? a.headlineVi : a.headline}</h3>
          <p className={styles.desc}>{vi ? a.descVi : a.desc}</p>
          <a href="#dang-ky" className={styles.cta}>
            {ctaLabel} <span aria-hidden>→</span>
          </a>
        </div>
        <div className={styles.sols}>
          {a.solutions.map((s) => (
            <div key={s.name} className={styles.sol}>
              <span className={styles.solIcon}>
                <MIcon name={s.icon} />
              </span>
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
