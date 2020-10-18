let fbRequests = [];

function registerCalls(details) {
    if (details.statusCode !== 200) {
        return; // ignore requests that don't succeed
    }

    // find the events in the array that corresponds to this tab
    const index = fbRequests.findIndex((request) => {
        return request.tabId === details.tabId;
    });

    const eventFormatted = formatEvent(details.url);

    if (index === -1) {
        // if there's no match,then we push a new element to the array
        if (eventFormatted) {
            fbRequests.push({
                "tabId": details.tabId,
                "documentUrl": details.documentUrl,
                "events": [eventFormatted]
            });
        }
    } else {
        // if we changed the page inside the same tab, we remove the calls stored for that tab and start again
        if (fbRequests[index].documentUrl !== details.documentUrl) {
            fbRequests[index].documentUrl = details.documentUrl;
            fbRequests[index].events = [];
        }
        if (eventFormatted) {
            fbRequests[index].events.push(eventFormatted);
        }
    }

    browser.runtime.sendMessage({type: "newEvent", events: fbRequests}); // sending new events to the popup if it's open
    console.log(fbRequests); // debugging purposes, remove
}

function formatEvent(url) {
    const queryString = require('query-string');
    const urlParsed = queryString.parseUrl(url);

    // CASE 1: IS A INIT CALL
    if (urlParsed.url.includes("https://connect.facebook.net/signals/config/")) {
        const pixelIdInUrl = urlParsed.url.match(/\d+/g)[0];
        return {
            "param0": "init",
            "param1": pixelIdInUrl
        }
    }

    // CASE 2: IS AS TRACK CALL
    if (urlParsed.url === "https://www.facebook.com/tr/" && urlParsed.query.ev) {
        let event = {
            "param0": isStandardConversion(urlParsed.query.ev) ? "track" : "trackCustom",
            "param1": urlParsed.query.ev
        }

        const eventParamRegex = /cd\[.*?]/g
        let param2 = {};
        for (let key in urlParsed.query) {
            if (eventParamRegex.test(key)) {
                const eventParamNameRegex = /(?<=\[).+?(?=])/g;
                param2[key.match(eventParamNameRegex)[0]] = urlParsed.query[key];
            }
        }

        if (!isEmpty(param2)) {
            event = {
                ...event,
                param2: param2
            }
        }

        return event;
    }
}

function isEmpty(obj) {
    for(var i in obj) return false;
    return true;
}

function isStandardConversion(conversionName) {
    const standardConversions = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
        "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView",
        "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"]
    return standardConversions.includes(conversionName);
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
            sendResponse(tabEvents.events);
        }
    } else {
        console.error("Unrecognised message: ", message);
    }
});

// TODO remove events array when a tab is reloaded