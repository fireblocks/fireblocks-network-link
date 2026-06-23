import config from './config';

export function getServerUrlPathPrefix(): string {
  const prefix = new URL(config.get('client.serverBaseUrl')).pathname;
  return removeTrailingSlash(prefix);
}

export function removeServerPathPrefixFromRelativeUrl(relativeUrl: string): string {
  const prefix = getServerUrlPathPrefix();
  return relativeUrl.slice(prefix.length);
}

export function getRelativeUrlWithoutPathPrefix(absoluteUrl: string): string {
  const parsedUrl = new URL(absoluteUrl);
  const relativeUrl = parsedUrl.pathname + parsedUrl.search;
  return removeServerPathPrefixFromRelativeUrl(relativeUrl);
}

export function removeTrailingSlash(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}
