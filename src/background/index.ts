import {getExtensionApi, parseUrl} from "lib/utils";

getExtensionApi().webRequest.onBeforeRequest.addListener((data) => {
    const result = parseUrl(data.url)
    if(result?.redirectUrl) {
        return {
            'redirectUrl': result.redirectUrl
        }
    }
}, {urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"])