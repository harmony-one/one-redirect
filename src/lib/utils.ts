declare var browser: typeof chrome;

import { detect } from "detect-browser";
const bw = detect();

export const ONE_LINK_REGEX = /^((http(s)?:\/\/)?[\S.]+)\.1(\/)?$/;

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
  return isSearchEngineHost(urlStr) && ONE_LINK_REGEX.test(getSearchQueryParam(urlStr));
}

function hasDifferentDomain(urlOne: string, urlTwo: string) {
  try {
    return new URL(urlOne).hostname !== new URL(urlTwo).hostname;
  } catch (e) { }
  return false;
}

/**
 * Has intention to open .1, we consider user has intention to open .1 when any of following are true:
 * 1. Click a link to .1 (`http://all.1`) from any page
 * 2. Type a .1 link (`http://all.1`) to the address bar
 */
function hasOneIntention(url: string, historyUrls?: string[]) {
  console.log("check one intention, isNewSession: ", isNewSession(), " isOneDomainSearchPage: ", isOneDomainSearchPage(url), " historyUrls: ", historyUrls);
  if (isNewSession() && isOneDomainSearchPage(url)) return true;

  // TODO: may improve this with webNavigation api and webRequest history of the tab.
  // For now, we just treat it as one intention if a one domain search page appears after a different domain.
  // Here we use second last, as the last url in history will be the current url.
  // The edge case is:
  // 1. If user is on one of the default search result page, and then type the .1 url to the address bar.
  return isOneDomainSearchPage(url) && hasDifferentDomain(url, historyUrls[historyUrls.length - 2]);
}

export function legalizeUrl(url: string) {
  if (!url.startsWith('http')) url = `http://${url}`;
  return ONE_LINK_REGEX.test(url) ? url.replace('.1', '.1.country') : url;
}

export function parseUrl(url: string, historyUrls?: string[]) {
  if (!hasOneIntention(url, historyUrls)) return;
  const query = getSearchQueryParam(url);
  return {
    redirectUrl: legalizeUrl(query)
  }
}

export function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export function getTabBasedCacheKey(windowId: number, tabId: number) {
  return `_one_direct_${windowId}_${tabId}`;
}