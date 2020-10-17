let fbRequests = [];

function registerCalls(details) {
    if (details.statusCode !== 200) {
        return; // ignore requests that don't succeed
    }

    // find the events in the array that corresponds to this tab
    const index = fbRequests.findIndex((request) => {
        return request.tabId === details.tabId;
    });

    if (index === -1) {
        // if there's no match,then we push a new element to the array
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

    browser.runtime.sendMessage({type: "newEvent", events: fbRequests}); // sending new events to the popup if it's open
    console.log(fbRequests); // debugging purposes, remove
}

function formatEvent(url) {
    const queryString = require('query-string');
    return queryString.parseUrl(url);
    // TODO apply proper format
}

// listens to network calls to facebook.com and facebook.net and sends them to registerCalls
browser.webRequest.onCompleted.addListener(registerCalls, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});

// listens to the popup requesting the events upon opening
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getEvents") {
        const tabEvents = fbRequests.find((request) => {
            return request.tabId === message.tabId;
        });

        if (typeof (tabEvents) === undefined) {
            console.log("No events for this tab");
        } else {
            sendResponse([{
                // TODO dummy data, should be replaced by fbRequests filtered by tabId === message.tabId
                "param0": "trackCustom",
                "param1": "PageView"
            }]);
        }
    } else {
        console.error("Unrecognised message: ", message);
    }
});

// TODO remove events array when a tab is reloaded