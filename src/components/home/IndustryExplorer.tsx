'use client';

import { useState } from 'react';
import { MIcon } from '@/components/ui';
import styles from './industry.module.css';

/**
 * IndustryExplorer — chọn ngành → đổi panel (SCR-01 Industries, tương tác client).
 * 5 ngành thật + danh mục dịch vụ theo yêu cầu anh Bryan; icon vector Material Symbols.
 * Song ngữ: tên/tiêu đề/mô tả theo locale; nhãn dịch vụ giữ tên sản phẩm (thuật ngữ).
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
    key: 'bank', name: 'Banking', nameVi: 'Ngân hàng', icon: 'account_balance',
    headline: 'Secure, compliant banking infrastructure.',
    headlineVi: 'Hạ tầng ngân hàng bảo mật, tuân thủ.',
    desc: 'Connectivity, eKYC, cloud and security built for financial institutions.',
    descVi: 'Kết nối, eKYC, đám mây và bảo mật cho tổ chức tài chính.',
    solutions: [
      { name: 'Connectivity Service', icon: 'cell_tower' },
      { name: 'eKYC', icon: 'fingerprint' },
      { name: 'Cloud - Data Center', icon: 'cloud' },
      { name: 'Cyber Security', icon: 'shield' },
      { name: 'Wifi Marketing', icon: 'wifi' },
      { name: 'Smart AI CCTV', icon: 'videocam' },
      { name: 'VBOT', icon: 'smart_toy' },
      { name: 'SMS Bulk', icon: 'sms' },
    ],
  },
  {
    key: 'government', name: 'Government', nameVi: 'Chính phủ', icon: 'account_balance_wallet',
    headline: 'Digital government for every citizen.',
    headlineVi: 'Chính phủ số cho mọi người dân.',
    desc: 'E-office, smart city and citizen services on sovereign infrastructure.',
    descVi: 'E-Office, đô thị thông minh và dịch vụ công trên hạ tầng chủ quyền.',
    solutions: [
      { name: 'E-Office', icon: 'description' },
      { name: 'IOC System', icon: 'dashboard' },
      { name: 'Smart City', icon: 'location_city' },
      { name: 'Cloud - Data Center', icon: 'cloud' },
      { name: 'Connectivity Service', icon: 'cell_tower' },
      { name: 'Cyber Security', icon: 'shield' },
      { name: 'Citizen Data', icon: 'badge' },
      { name: 'SMS Bulk', icon: 'sms' },
    ],
  },
  {
    key: 'enterprise', name: 'Enterprise', nameVi: 'Doanh nghiệp', icon: 'apartment',
    headline: 'Infrastructure that scales with you.',
    headlineVi: 'Hạ tầng mở rộng cùng doanh nghiệp.',
    desc: 'Connectivity, cloud, security and digital tools for multi-site business.',
    descVi: 'Kết nối, đám mây, bảo mật và công cụ số cho doanh nghiệp đa chi nhánh.',
    solutions: [
      { name: 'Connectivity Service', icon: 'cell_tower' },
      { name: 'Cloud - Data Center', icon: 'cloud' },
      { name: 'Cyber Security', icon: 'shield' },
      { name: 'Wifi Marketing', icon: 'wifi' },
      { name: 'SMS Bulk', icon: 'sms' },
      { name: 'VBOT', icon: 'smart_toy' },
      { name: 'E-Office', icon: 'description' },
      { name: 'DMS System', icon: 'folder_open' },
    ],
  },
  {
    key: 'healthcare', name: 'Healthcare', nameVi: 'Y tế', icon: 'health_and_safety',
    headline: 'Connected, data-driven healthcare.',
    headlineVi: 'Y tế kết nối, dựa trên dữ liệu.',
    desc: 'HIS, LIS, RIS/PACS and medical records on secure connectivity and cloud.',
    descVi: 'HIS, LIS, RIS/PACS và hồ sơ bệnh án trên kết nối bảo mật và đám mây.',
    solutions: [
      { name: 'Hospital Management System (HIS)', icon: 'local_hospital' },
      { name: 'Laboratory Information System', icon: 'biotech' },
      { name: 'Radiology Information System', icon: 'radiology' },
      { name: 'PACS - Image Storage & Transfer', icon: 'photo_library' },
      { name: 'ERM - Electronic Medical Record', icon: 'medical_information' },
      { name: 'Query Management System', icon: 'quiz' },
      { name: 'Connectivity Service', icon: 'cell_tower' },
      { name: 'Cloud - Data Center', icon: 'cloud' },
    ],
  },
  {
    key: 'education', name: 'Education', nameVi: 'Giáo dục', icon: 'school',
    headline: 'Learning without limits.',
    headlineVi: 'Học tập không giới hạn.',
    desc: 'E-learning, e-books and school management on reliable connectivity.',
    descVi: 'E-learning, e-book và quản lý trường học trên kết nối ổn định.',
    solutions: [
      { name: 'E-learning, AI learning', icon: 'cast_for_education' },
      { name: 'Ebooks', icon: 'menu_book' },
      { name: 'Education Management System', icon: 'school' },
      { name: 'Connectivity Service', icon: 'cell_tower' },
      { name: 'Cloud - Data Center', icon: 'cloud' },
      { name: 'SMS Bulk', icon: 'sms' },
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
