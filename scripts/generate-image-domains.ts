import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

interface ImageDomainsConfig {
  timestamp: string;
  domains: string[];
}

const getHostnameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
};

const isAbsoluteUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    return new URL(url).protocol.startsWith('http');
  } catch (e) {
    return false;
  }
};

const generateImageDomains = (): void => {
  const baseUrl = process.env.UPTIME_KUMA_BASE_URL || '';
  const baseUrlHostname = getHostnameFromUrl(baseUrl);

  const customIconUrl = process.env.FEATURE_ICON || '';
  const isCustomIconExternal = isAbsoluteUrl(customIconUrl);
  const customIconHostname = isCustomIconExternal ? getHostnameFromUrl(customIconUrl) : null;

  const allDomains = [baseUrlHostname, customIconHostname].filter(Boolean) as string[];

  const uniqueDomains = [...new Set(allDomains)].length > 0 ? [...new Set(allDomains)] : ['*'];

  const domainsConfig: ImageDomainsConfig = {
    timestamp: new Date().toISOString(),
    domains: uniqueDomains,
  };

  const outputPath = join(process.cwd(), 'config', 'generated-image-domains.json');

  mkdirSync(dirname(outputPath), { recursive: true });

  writeFileSync(outputPath, JSON.stringify(domainsConfig, null, 2));

  console.log('✨ Generated image domains configuration:', domainsConfig);
};

generateImageDomains();
