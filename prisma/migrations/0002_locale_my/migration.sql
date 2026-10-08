-- Thêm giá trị "my" (Myanmar) vào enum Locale (EN + MY).
ALTER TYPE "Locale" ADD VALUE IF NOT EXISTS 'my';
