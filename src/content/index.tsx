import {getExtensionApi, parseUrl} from "lib/utils";

// TODO: preserve history for current tab to pass into parseUrl
// to support that open .1 in current tab.

const res = parseUrl(location.href);
if (res?.redirectUrl) {
  location.href = res.redirectUrl;
}