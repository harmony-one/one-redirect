declare var browser: typeof chrome;

import { detect } from "detect-browser";
const bw = detect();

export function getExtensionApi() {
  return bw.name === 'chrome' ? chrome : browser;
}

// Url open in new tab -> 1
// New tab and then type the url -> 2
function isNewSession() {
  return history.length <= 2;
}

function isSearchEngineHost(urlStr: string) {
  const url = new URL(urlStr);
  return ["www.bing.com", "www.google.com", "duckduckgo.com"]
  .includes(url.hostname);
}

function getSearchQueryParam(urlStr: string) {
  const url = new URL(urlStr);
  return url.searchParams.get('q') ?? '';
}

function isOneDomainSearchPage(urlStr: string) {
  return isSearchEngineHost(urlStr) && /^((http(s)?:\/\/)?[\S.]+)\.1$/.test(getSearchQueryParam(urlStr));
}

function hasDifferentDomain(urlOne: string, urlTwo: string) {
  try {
    return new URL(urlOne).hostname !== new URL(urlTwo).hostname;
  } catch (e) {}
  return false;
}

/**
 * Has intention to open .1, we consider user has intention to open .1 when any of following are true:
 * 1. Click a link to .1 (`http://all.1`) from any page
 * 2. Type a .1 link (`http://all.1`) to the address bar
 */
function hasOneIntention(url: string, historyUrls?: string[]) {
  console.log("check one intention, isNewSession: ", isNewSession(), " isOneDomainSearchPage: ", isOneDomainSearchPage(url));
  if (isNewSession() && isOneDomainSearchPage(url)) return true;

  // TODO: may improve this with webNavigation api and webRequest history of the tab.
  // For now, we just treat it as one intention if a one domain search page appears after a different domain.
  return isOneDomainSearchPage(url) && hasDifferentDomain(url, historyUrls[historyUrls.length - 1]);
}

export function parseUrl(url: string, historyUrls?: string[]) {
  if (!hasOneIntention(url, historyUrls)) return;
  const query = getSearchQueryParam(url);
  return {
    redirectUrl: query.startsWith('http://') || query.startsWith('https://') ? `${query}.country` : `http://${query}.country`,
  }
}