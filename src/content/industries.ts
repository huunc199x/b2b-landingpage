/**
 * Danh mục giải pháp theo NGÀNH (5 hạng mục) — hiển thị ở section "Solutions" trang chủ.
 * Song ngữ EN + Myanmar (tên + mô tả); nhãn dịch vụ giữ tên sản phẩm (tiếng Anh).
 */
export type IndustrySolution = { name: string; icon: string };

export type Industry = {
  key: string;
  name: string;
  nameMy: string;
  icon: string;
  desc: string;
  descMy: string;
  solutions: IndustrySolution[];
};

export const INDUSTRIES: Industry[] = [
  {
    key: 'bank',
    name: 'Banking & Finance',
    nameMy: 'ဘဏ်နှင့် ဘဏ္ဍာရေး',
    icon: 'account_balance',
    desc: 'Secure, compliant connectivity and digital infrastructure for banks and financial institutions. From eKYC and cloud to cybersecurity and smart surveillance — serve customers safely and grow with confidence.',
    descMy: 'ဘဏ်နှင့် ဘဏ္ဍာရေးအဖွဲ့အစည်းများအတွက် လုံခြုံ၍ စည်းမျဉ်းလိုက်နာသော ချိတ်ဆက်မှုနှင့် ဒစ်ဂျစ်တယ်အခြေခံ။ eKYC၊ cloud မှ ဆိုက်ဘာလုံခြုံရေးနှင့် smart စောင့်ကြည့်မှုအထိ — ဖောက်သည်များကို လုံခြုံစွာ ဝန်ဆောင်ပြီး ယုံကြည်မှုဖြင့် တိုးတက်ပါ။',
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
    key: 'government',
    name: 'Government',
    nameMy: 'အစိုးရ',
    icon: 'account_balance_wallet',
    desc: 'Sovereign infrastructure and digital platforms for a connected public sector. E-office, IOC, smart city and citizen data services delivered on nationwide, secure connectivity.',
    descMy: 'ချိတ်ဆက်ထားသော ပြည်သူ့ကဏ္ဍအတွက် အခြေခံအဆောက်အအုံနှင့် ဒစ်ဂျစ်တယ် platform များ။ E-Office၊ IOC၊ smart city နှင့် နိုင်ငံသားဒေတာဝန်ဆောင်မှုများကို တစ်နိုင်ငံလုံး လုံခြုံသော ချိတ်ဆက်မှုဖြင့်။',
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
    key: 'enterprise',
    name: 'Enterprise',
    nameMy: 'လုပ်ငန်းကြီးများ',
    icon: 'apartment',
    desc: 'Scalable connectivity, cloud and digital tools for multi-site organisations. Keep every branch connected, protected and productive — from security to collaboration and document management.',
    descMy: 'ဘဏ်ခွဲများစွာရှိ အဖွဲ့အစည်းများအတွက် ချဲ့ထွင်နိုင်သော ချိတ်ဆက်မှု၊ cloud နှင့် ဒစ်ဂျစ်တယ် ကိရိယာများ။ ဌာနခွဲတိုင်းကို ချိတ်ဆက်၊ ကာကွယ်၍ ထိရောက်စေသည် — လုံခြုံရေးမှ ပူးပေါင်းဆောင်ရွက်မှုနှင့် စာရွက်စာတမ်းစီမံခန့်ခွဲမှုအထိ။',
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
    key: 'healthcare',
    name: 'Medical & Health',
    nameMy: 'ဆေးဘက်နှင့် ကျန်းမာရေး',
    icon: 'health_and_safety',
    desc: 'Connected, data-driven healthcare on secure infrastructure. HIS, LIS, RIS/PACS and medical records integrated with reliable connectivity and cloud for better patient care.',
    descMy: 'လုံခြုံသော အခြေခံအပေါ် ချိတ်ဆက်ထား၍ ဒေတာကို အခြေခံသော ကျန်းမာရေးစောင့်ရှောက်မှု။ HIS၊ LIS၊ RIS/PACS နှင့် ဆေးဘက်မှတ်တမ်းများကို ယုံကြည်စိတ်ချရသော ချိတ်ဆက်မှုနှင့် cloud ဖြင့် ပေါင်းစပ်ကာ လူနာစောင့်ရှောက်မှု ပိုမိုကောင်းမွန်စေသည်။',
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
    key: 'education',
    name: 'Education',
    nameMy: 'ပညာရေး',
    icon: 'school',
    desc: 'E-learning, e-books and school management on reliable connectivity.',
    descMy: 'ယုံကြည်စိတ်ချရသော ချိတ်ဆက်မှုပေါ်တွင် e-learning၊ e-book နှင့် ကျောင်းစီမံခန့်ခွဲမှု။',
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
