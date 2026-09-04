import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * API điều hướng nhận biết locale (Link, redirect, usePathname, useRouter).
 * Component/màn hình dùng các API này thay cho next/link để giữ tiền tố locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
