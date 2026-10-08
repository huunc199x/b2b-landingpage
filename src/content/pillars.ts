/**
 * 5 nhóm giải pháp (pillars) hiển thị ở quạt ảnh trang chủ + trang chi tiết /solutions/[slug].
 * Song ngữ EN + Myanmar (my). Tên dịch vụ giữ tiếng Anh (thuật ngữ sản phẩm); mô tả có bản Myanmar.
 * Icon = Material Symbols. Ảnh = /assets/hero-*.{png,webp} (tự-lành nếu thiếu).
 */
export type PillarSolution = {
  icon: string;
  name: string;
  desc: string;
  descMy: string;
};

export type Pillar = {
  slug: string;
  icon: string;
  image: string;
  name: string;
  nameMy: string;
  tagline: string;
  taglineMy: string;
  intro: string;
  introMy: string;
  solutions: PillarSolution[];
};

export const PILLARS: Pillar[] = [
  {
    slug: 'connectivity',
    icon: 'cell_tower',
    image: '/assets/hero-1.png',
    name: 'Connectivity',
    nameMy: 'ချိတ်ဆက်မှု',
    tagline: 'Enterprise-grade connectivity across Myanmar and beyond.',
    taglineMy: 'မြန်မာနှင့် ပြည်ပအထိ လုပ်ငန်းအဆင့် ချိတ်ဆက်မှု။',
    intro:
      'Dedicated, private and international connectivity engineered for performance, reliability and security — the foundation every digital business runs on.',
    introMy:
      'စွမ်းဆောင်ရည်၊ ယုံကြည်စိတ်ချရမှုနှင့် လုံခြုံရေးအတွက် ဒီဇိုင်းထုတ်ထားသော သီးသန့်၊ ပုဂ္ဂလိကနှင့် နိုင်ငံတကာ ချိတ်ဆက်မှု — ဒစ်ဂျစ်တယ်လုပ်ငန်းတိုင်း၏ အခြေခံ။',
    solutions: [
      { icon: 'cell_tower', name: 'Dedicated Internet Access (DIA)', desc: 'Symmetric, dedicated internet with committed bandwidth and SLA.', descMy: 'လိုင်းအတိအကျ သတ်မှတ်သော အင်တာနက်၊ ဘန်းဝိဒ်အာမခံချက်နှင့် SLA ပါဝင်။' },
      { icon: 'lan', name: 'Domestic Leased Line (DPLC)', desc: 'Private point-to-point links between your sites nationwide.', descMy: 'တစ်နိုင်ငံလုံးရှိ သင့်ဆိုက်များကြား ပုဂ္ဂလိက point-to-point လိုင်း။' },
      { icon: 'public', name: 'International Leased Line (IPLC)', desc: 'Private international circuits to regional and global hubs.', descMy: 'ဒေသတွင်းနှင့် ကမ္ဘာ့ hub များသို့ ပုဂ္ဂလိက နိုင်ငံတကာလိုင်း။' },
      { icon: 'hub', name: 'IP VPN (MPLS)', desc: 'Any-to-any secure WAN connecting all your locations.', descMy: 'သင့်တည်နေရာအားလုံးကို ချိတ်ဆက်သော any-to-any လုံခြုံသည့် WAN။' },
      { icon: 'router', name: 'IP Transit', desc: 'High-capacity upstream to the global internet.', descMy: 'ကမ္ဘာ့အင်တာနက်သို့ ဘန်းဝိဒ်မြင့် ချိတ်ဆက်မှု။' },
      { icon: 'settings_ethernet', name: 'Dark Fiber', desc: 'Your own fiber pairs for unlimited, future-proof capacity.', descMy: 'အကန့်အသတ်မဲ့ ဘန်းဝိဒ်အတွက် သင်ပိုင် fiber။' },
      { icon: 'wifi', name: 'Wifi Marketing', desc: 'Managed guest Wi-Fi with branding and customer insights.', descMy: 'အမှတ်တံဆိပ်နှင့် ဖောက်သည်ခွဲခြမ်းစိတ်ဖြာမှုပါသော ဧည့်သည် Wi-Fi။' },
    ],
  },
  {
    slug: 'cloud-data-center',
    icon: 'cloud',
    image: '/assets/hero-2.webp',
    name: 'Cloud & Data Center',
    nameMy: 'Cloud နှင့် Data Center',
    tagline: 'A reliable, secure and flexible infrastructure platform for businesses in Myanmar.',
    taglineMy: 'မြန်မာ့လုပ်ငန်းများအတွက် ယုံကြည်စိတ်ချရ၊ လုံခြုံ၊ လိုက်လျောညီထွေသော အခြေခံအဆောက်အအုံ။',
    intro:
      'Modern cloud and Tier-standard data center services that scale with your business — from virtual machines to full colocation, backed by 99.99% availability and expert 24/7 support.',
    introMy:
      'သင့်လုပ်ငန်းနှင့်အတူ ချဲ့ထွင်နိုင်သော ခေတ်မီ cloud နှင့် Tier-standard data center ဝန်ဆောင်မှုများ — virtual machine မှ colocation အထိ၊ 99.99% ရရှိနိုင်မှုနှင့် 24/7 ကျွမ်းကျင်ပံ့ပိုးမှုဖြင့်။',
    solutions: [
      { icon: 'cloud', name: 'Cloud Service', desc: 'IaaS, PaaS, Kubernetes, VM, Storage and Backup on demand.', descMy: 'IaaS၊ PaaS၊ Kubernetes၊ VM၊ Storage နှင့် Backup ကို လိုအပ်သလို။' },
      { icon: 'dns', name: 'Colocation', desc: 'Rack, cage and private suite in international-standard facilities.', descMy: 'နိုင်ငံတကာအဆင့် အဆောက်အအုံတွင် Rack၊ cage နှင့် private suite။' },
      { icon: 'storage', name: 'Hosting', desc: 'Managed hosting for your applications and websites.', descMy: 'သင့်အက်ပလီကေးရှင်းနှင့် ဝဘ်ဆိုက်များအတွက် managed hosting။' },
      { icon: 'backup', name: 'Backup & Disaster Recovery', desc: 'Automated backup and DR to keep your business always on.', descMy: 'လုပ်ငန်း မရပ်တန့်စေရန် အလိုအလျောက် backup နှင့် DR။' },
    ],
  },
  {
    slug: 'cyber-security',
    icon: 'shield',
    image: '/assets/hero-3.webp',
    name: 'Cyber Security',
    nameMy: 'ဆိုက်ဘာ လုံခြုံရေး',
    tagline: 'Protect what keeps your business moving.',
    taglineMy: 'သင့်လုပ်ငန်းကို ရှေ့ဆက်စေသည့်အရာကို ကာကွယ်ပါ။',
    intro:
      'End-to-end security — from the network edge to endpoints and the SOC — with 24/7 monitoring, threat protection and compliance with international standards.',
    introMy:
      'ကွန်ရက်အစွန်မှ endpoint နှင့် SOC အထိ အစအဆုံး လုံခြုံရေး — 24/7 စောင့်ကြည့်မှု၊ ခြိမ်းခြောက်မှုကာကွယ်ရေးနှင့် နိုင်ငံတကာစံ လိုက်နာမှုဖြင့်။',
    solutions: [
      { icon: 'shield', name: 'Network Security', desc: 'Firewall, segmentation and secure access for your network.', descMy: 'သင့်ကွန်ရက်အတွက် firewall၊ segmentation နှင့် လုံခြုံသော access။' },
      { icon: 'security', name: 'Endpoint Security', desc: 'Protect devices against malware, ransomware and threats.', descMy: 'malware၊ ransomware နှင့် ခြိမ်းခြောက်မှုများမှ ကိရိယာများ ကာကွယ်ခြင်း။' },
      { icon: 'monitoring', name: 'SOC & Monitoring', desc: '24/7 security operations center for monitoring and response.', descMy: '24/7 လုံခြုံရေး operations center ဖြင့် စောင့်ကြည့်တုံ့ပြန်ခြင်း။' },
      { icon: 'gpp_good', name: 'DDoS Protection', desc: 'Absorb and mitigate volumetric attacks before they hit you.', descMy: 'တိုက်ခိုက်မှုများ မထိခိုက်မီ စုပ်ယူ၍ လျှော့ချခြင်း။' },
      { icon: 'bug_report', name: 'Penetration Testing', desc: 'Find and fix vulnerabilities before attackers do.', descMy: 'တိုက်ခိုက်သူများ မတိုင်မီ အားနည်းချက်များ ရှာဖွေပြုပြင်ခြင်း။' },
      { icon: 'videocam', name: 'Smart AI CCTV', desc: 'AI-powered surveillance with real-time alerts.', descMy: 'အချိန်နှင့်တစ်ပြေးညီ သတိပေးချက်ပါသော AI စောင့်ကြည့်မှု။' },
      { icon: 'verified', name: 'Security Consulting', desc: 'Advisory and compliance support for your security posture.', descMy: 'သင့်လုံခြုံရေးအတွက် အကြံပေးနှင့် လိုက်နာမှု ပံ့ပိုးခြင်း။' },
    ],
  },
  {
    slug: 'iot-smart-city',
    icon: 'sensors',
    image: '/assets/hero-4.png',
    name: 'IoT & Smart City',
    nameMy: 'IoT နှင့် Smart City',
    tagline: 'Turn connected devices into business intelligence.',
    taglineMy: 'ချိတ်ဆက်ထားသော ကိရိယာများကို လုပ်ငန်းဉာဏ်ရည်အဖြစ် ပြောင်းလဲပါ။',
    intro:
      'Massive IoT connectivity, smart-city platforms and intelligent monitoring to digitise operations across cities, industries and fleets.',
    introMy:
      'မြို့ပြ၊ စက်မှုနှင့် ယာဉ်အုပ်စုများတွင် လုပ်ငန်းများကို ဒစ်ဂျစ်တယ်ပြောင်းလဲရန် ကြီးမားသော IoT ချိတ်ဆက်မှု၊ smart-city platform နှင့် ဉာဏ်ရည်မြင့် စောင့်ကြည့်မှု။',
    solutions: [
      { icon: 'hub', name: 'M2M / IoT Connectivity', desc: 'Nationwide SIM and network for connected devices at scale.', descMy: 'ချိတ်ဆက်ကိရိယာများအတွက် တစ်နိုင်ငံလုံး SIM နှင့် ကွန်ရက်။' },
      { icon: 'location_city', name: 'Smart City', desc: 'Smart lighting, traffic and environment platforms for cities.', descMy: 'မြို့များအတွက် smart မီး၊ ယာဉ်ကြောနှင့် ပတ်ဝန်းကျင် platform။' },
      { icon: 'dashboard', name: 'IOC System', desc: 'Intelligent Operations Center for city-wide monitoring.', descMy: 'မြို့တစ်ခုလုံး စောင့်ကြည့်ရန် Intelligent Operations Center။' },
      { icon: 'videocam', name: 'AI Camera', desc: 'Computer-vision analytics for safety and operations.', descMy: 'ဘေးကင်းရေးနှင့် လုပ်ငန်းအတွက် computer-vision ခွဲခြမ်းစိတ်ဖြာမှု။' },
      { icon: 'route', name: 'Fleet & Asset Tracking', desc: 'Real-time location and status of vehicles and assets.', descMy: 'ယာဉ်နှင့် ပိုင်ဆိုင်မှုများ၏ အချိန်နှင့်တစ်ပြေးညီ တည်နေရာနှင့် အခြေအနေ။' },
      { icon: 'precision_manufacturing', name: 'Industrial IoT', desc: 'Sensors and monitoring for smart factories and sites.', descMy: 'smart စက်ရုံများအတွက် sensor နှင့် စောင့်ကြည့်မှု။' },
    ],
  },
  {
    slug: 'digital-services',
    icon: 'apps',
    image: '/assets/hero-5.webp',
    name: 'Digital Services',
    nameMy: 'ဒစ်ဂျစ်တယ် ဝန်ဆောင်မှုများ',
    tagline: 'Connect your customers. Grow your business.',
    taglineMy: 'ဖောက်သည်များ ချိတ်ဆက်ပါ။ လုပ်ငန်း တိုးတက်ပါ။',
    intro:
      'A suite of digital platforms — identity, communication and industry applications — to engage customers and digitise your core operations.',
    introMy:
      'ဖောက်သည်များနှင့် ထိတွေ့၍ အဓိကလုပ်ငန်းများ ဒစ်ဂျစ်တယ်ပြောင်းလဲရန် ဒစ်ဂျစ်တယ် platform အစုံ — identity၊ ဆက်သွယ်ရေးနှင့် ကဏ္ဍအလိုက် အက်ပလီကေးရှင်းများ။',
    solutions: [
      { icon: 'fingerprint', name: 'eKYC', desc: 'Digital identity verification for fast, secure onboarding.', descMy: 'မြန်ဆန်လုံခြုံသော အကောင့်ဖွင့်ခြင်းအတွက် ဒစ်ဂျစ်တယ် identity စိစစ်ခြင်း။' },
      { icon: 'support_agent', name: 'VBOT — Cloud Call Center', desc: 'Cloud contact center and voicebot for customer service.', descMy: 'ဖောက်သည်ဝန်ဆောင်မှုအတွက် cloud contact center နှင့် voicebot။' },
      { icon: 'sms', name: 'Bulk SMS', desc: 'Reliable mass messaging for notifications and campaigns.', descMy: 'အကြောင်းကြားချက်နှင့် campaign များအတွက် ယုံကြည်စိတ်ချရသော mass messaging။' },
      { icon: 'description', name: 'E-Office', desc: 'Paperless workflows, approvals and document management.', descMy: 'စက္ကူမဲ့ workflow၊ အတည်ပြုချက်နှင့် စာရွက်စာတမ်းစီမံခန့်ခွဲမှု။' },
      { icon: 'folder_open', name: 'DMS System', desc: 'Centralised document management and collaboration.', descMy: 'ဗဟိုချုပ်ကိုင် စာရွက်စာတမ်းစီမံခန့်ခွဲမှုနှင့် ပူးပေါင်းဆောင်ရွက်မှု။' },
      { icon: 'apps', name: 'Industry Applications', desc: 'Vertical solutions for healthcare, education and government.', descMy: 'ကျန်းမာရေး၊ ပညာရေးနှင့် အစိုးရအတွက် ကဏ္ဍအလိုက် ဖြေရှင်းချက်များ။' },
    ],
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
