import config from './config';

export function getServerUrlPathPrefix(): string {
  const prefix = new URL(config.get('client.serverBaseUrl')).pathname;
  return prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
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
