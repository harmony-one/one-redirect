import {parseUrl} from "lib/utils";

const res = parseUrl(location.href);
if (res?.redirectUrl) {
  location.href = res.redirectUrl;
}