import { legalizeUrl, ready, ONE_LINK_REGEX, getExtensionApi, parseUrl } from "lib/utils";

// TODO: preserve history for current tab to pass into parseUrl
// to support that open .1 in current tab.

console.log("Content script: ", location.href);
const res = parseUrl(location.href);
if (res?.redirectUrl) {
  location.href = res.redirectUrl;
}

// Hijack link clicks so we can handle `.1` links correctly, otherwise as browser may
// think its illegal and just open `about:blank#blocked`
ready(() => {
  function getClosestLink(node, root) {
    if (!node || node === root) return;
    if ('a' !== node.nodeName.toLowerCase() || !node.href) {
      return getClosestLink(node.parentNode, root);
    }
    return node;
  }

  const root = document.documentElement;
  root.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.button && e.button !== 0) return;

    if (e.altKey) {
      return;
    }

    var link = getClosestLink(e.target, root);
    if (!link) return;

    try {
      const url = link.href;
      // If its a one link, then replace with the targetted legal url before passing it to the default handler.
      if (ONE_LINK_REGEX.test(url)) {
        link.setAttribute('href', legalizeUrl(link.href));
        // if it's open in new tab, reset the link afterwards.
        if (link.target === "_blank" || e.ctrlKey || e.metaKey) {
          setTimeout(() => {
            link.setAttribute('href', url);
          });
        }
      }
    } catch (e) { }
    return true;
  });
});