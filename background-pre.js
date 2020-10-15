let fbRequests = [];

function registerCalls(details) {
    if (details.statusCode !== 200) {
        return; // ignore requests that don't succeed
    }

    const index = fbRequests.findIndex((request) => {
        return request.tabId === details.tabId;
    })

    if (index === -1) {
        fbRequests.push({
            "tabId": details.tabId,
            "documentUrl": details.documentUrl,
            "events": [formatEvent(details.url)]
        })
    } else {
        // if we changed the page inside the same tab, we remove the calls stored for that tab and start again
        if (fbRequests[index].documentUrl !== details.documentUrl) {
            fbRequests[index].documentUrl = details.documentUrl;
            fbRequests[index].events = [];
        }
        fbRequests[index].events.push(formatEvent(details.url));
    }

    console.log(fbRequests); // debugging purposes, remove
}

function formatEvent(url) {
    const queryString = require('query-string');
    return queryString.parseUrl(url);
}

browser.webRequest.onCompleted.addListener(registerCalls, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});