let fbRequests = [];

// listens to network calls to facebook.com and facebook.net and sends them to registerCalls
browser.webRequest.onCompleted.addListener(registerCalls, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});

// listens to the popup requesting the events upon opening
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getEvents") {
        const tabEvents = fbRequests.find((request) => {
            return request.tabId === message.tabId;
        });

        if (tabEvents) {
            sendResponse(tabEvents.events);
        } else {
            console.log("No events for this tab");
        }
    } else {
        console.error("Unrecognised message: ", message);
    }
});

function registerCalls(details) {
    if (details.statusCode !== 200) {
        return; // ignore requests that don't succeed
    }

    const eventFormatted = formatEvent(details.url);

    if (!eventFormatted) {
        return; // ignore if it's not an init or track fbq event
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
            "events": [eventFormatted]
        });
    } else {
        if (fbRequests[index].documentUrl !== details.documentUrl) {
            // if we changed the page inside the same tab, we remove the calls stored for that tab and start again
            fbRequests[index].documentUrl = details.documentUrl;
            fbRequests[index].events = [];
        }
        fbRequests[index].events.push(eventFormatted);
    }

    browser.runtime.sendMessage({type: "newEvent", events: fbRequests}); // sending new events to the popup if it's open
    console.log(fbRequests); // debugging purposes, remove
}

function formatEvent(url) {
    const queryString = require('query-string');
    const urlParsed = queryString.parseUrl(url);

    if (isInitCall(urlParsed.url)) {
        const pixelIdInUrl = urlParsed.url.match(/\d+/g)[0];
        return {
            "param0": "init",
            "param1": pixelIdInUrl
        }
    }

    if (isTrackCall(urlParsed.url)) {
        let param2 = getParam2IfExists(urlParsed.query);

        return {
            "param0": isStandardConversion(urlParsed.query.ev) ? "track" : "trackCustom",
            "param1": urlParsed.query.ev,
            ...(param2 && {param2: param2})
        }
    }

    function isInitCall(url) {
        return url.includes("https://connect.facebook.net/signals/config/");
    }

    function isTrackCall(url) {
        return url === "https://www.facebook.com/tr/" && urlParsed.query.ev;
    }

    function isStandardConversion(conversionName) {
        const standardConversions = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
            "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView",
            "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"]
        return standardConversions.includes(conversionName);
    }

    function getParam2IfExists(queries) {
        let param2 = {};

        const eventParamRegex = /cd\[.*?]/g;
        for (let key in queries) {
            if (eventParamRegex.test(key)) {
                const eventParamNameRegex = /(?<=\[).+?(?=])/g;
                param2[key.match(eventParamNameRegex)[0]] = queries[key];
            }
        }

        if (isEmpty(param2)) {
            return null;
        }

        return param2;
    }

    function isEmpty(obj) {
        // if the for loop runs, it means object is not empty
        // this is the fastest implementation for this check as per https://stackoverflow.com/a/59787784
        for (let i in obj) {
            return false;
        }
        return true;
    }
}

// TODO remove events array when a tab is reloaded