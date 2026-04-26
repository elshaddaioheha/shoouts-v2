export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (!path || path === '/' || path === 'shoouts://' || path === 'shoouts:///') {
      return '/';
    }

    if (path.startsWith('shoouts://')) {
      const url = new URL(path);
      const host = url.hostname;
      const pathname = url.pathname;

      if (!host && (!pathname || pathname === '/')) return '/';
      if (host && pathname) return `/${host}${pathname}`;
      if (host) return `/${host}`;

      return pathname || '/';
    }

    return path;
  } catch {
    return '/';
  }
}
