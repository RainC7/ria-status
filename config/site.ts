'use client';

import { env } from './env';

const baseConfig = {
  name: 'Kuma Mieru',
  description: 'A beautiful and modern uptime monitoring dashboard',
  icon: '/icon.svg',
} as const;

interface NavItem {
  label: string;
  href: string;
  external: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'page.main',
    href: '/',
    external: false,
  },
  {
    label: 'page.edit',
    href: `${env.config.baseUrl}/manage-status-page`,
    external: true,
  },
];

const resolveIconUrl = (iconPath?: string): string => {
  if (!iconPath) return baseConfig.icon;

  return iconPath.startsWith('http')
    ? iconPath
    : `${env.config.baseUrl}/${iconPath.replace(/^\//, '')}`;
};

const getVisibleNavItems = (items: NavItem[]): NavItem[] => {
  return items.filter((item) => (item.label !== 'page.edit' ? true : env.config.isEditThisPage));
};

export const siteConfig = {
  name: env.config.siteMeta.title || baseConfig.name,
  description: env.config.siteMeta.description || baseConfig.description,
  icon: resolveIconUrl(env.config.siteMeta.icon),
  navItems: getVisibleNavItems(navItems),
  navMenuItems: getVisibleNavItems(navItems),
  links: {
    github: 'https://github.com/Alice39s/kuma-mieru',
    docs: 'https://github.com/Alice39s/kuma-mieru/blob/main/README.md',
  },
} as const;

export type SiteConfig = typeof siteConfig;
