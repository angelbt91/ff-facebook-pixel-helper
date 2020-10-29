let tabsEvents = [];

browser.browserAction.setBadgeBackgroundColor({
    color: "#75b640"
});

browser.browserAction.setBadgeTextColor({
    color: "#FFF"
});

// listens to network calls to facebook.com/.net and sends them to registerRequest to store the relevant events
browser.webRequest.onCompleted.addListener(registerRequests, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});

function registerRequests(request) {
    if (request.statusCode !== 200) {
        return;
    }

    const event = formatRequestIntoEvent(request.url);

    if (!event) {
        return; // stops if it's not a valid event
    }

    // finds the index in tabsEvents that corresponds to the tab of the current event
    let currentTabEventsIndex = tabsEvents.findIndex((tabEvents) => {
        return tabEvents.tabId === request.tabId;
    });

    if (currentTabEventsIndex === -1) {
        // if there's no events already stored for the current tab, pushes a new tab to the array
        tabsEvents.push({
            "tabId": request.tabId,
            "documentUrl": request.documentUrl,
            "events": {
                [event.param0]: [event]
            }
        });
        currentTabEventsIndex = tabsEvents.length - 1; // the index is now the last element
    } else {
        // if user navigated to another page inside the same tab, removes the former events stored for such tab
        if (tabsEvents[currentTabEventsIndex].documentUrl !== request.documentUrl) {
            tabsEvents[currentTabEventsIndex].documentUrl = request.documentUrl;
            tabsEvents[currentTabEventsIndex].events = {};
        }

        if (tabsEvents[currentTabEventsIndex].events.hasOwnProperty(event.param0)) {
            // if events for the current event's pixel ID have already been registered, adds this event to that group
            tabsEvents[currentTabEventsIndex].events[event.param0].push(event);
        } else {
            // if this is the first event with such pixel ID, creates a new property inside events with such event
            tabsEvents[currentTabEventsIndex].events[event.param0] = [event];
        }
    }

    browser.browserAction.setBadgeText({
        text: getEventsCount(tabsEvents[currentTabEventsIndex].events),
        tabId: request.tabId
    });

    if (isPopupOpen()) {
        browser.runtime.sendMessage({type: "newEvent", events: tabsEvents}); // sends events to popup as they occur
    }

    function isPopupOpen() {
        const popupView = browser.extension.getViews({type: "popup"});
        return popupView.length > 0;
    }

    function getEventsCount(currentTabEvents) {
        let count = 0;
        for (const events in currentTabEvents) {
            if (currentTabEvents.hasOwnProperty(events)) {
                count += currentTabEvents[events].length;
            }
        }
        return count.toString();
    }
}

function formatRequestIntoEvent(url) {
    const queryString = require('query-string');
    const urlParsed = queryString.parseUrl(url);

    if (isInitEvent(urlParsed.url)) {
        const pixelIdInUrl = urlParsed.url.match(/\d+/g)[0];
        return {
            "param0": pixelIdInUrl,
            "param1": "init"
        }
    } else if (isTrackEvent(urlParsed.url)) {
        let param3 = getParam3IfExists(urlParsed.query);

        return {
            "param0": urlParsed.query.id,
            "param1": isMicrodataEvent(urlParsed.url) ? "microdata" : isStandardConversion(urlParsed.query.ev) ? "track" : "trackCustom",
            "param2": urlParsed.query.ev,
            ...(param3 && {param3: param3})
        }
    } else {
        return null;
    }

    function isInitEvent(url) {
        return url.includes("https://connect.facebook.net/signals/config/");
    }

    function isTrackEvent(url) {
        return url === "https://www.facebook.com/tr/" && urlParsed.query.ev;
    }

    function isMicrodataEvent(url) {
        return url === "https://www.facebook.com/tr/" && urlParsed.query.ev && urlParsed.query.ev === "Microdata";
    }

    function isStandardConversion(conversionName) {
        const standardConversions = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
            "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView",
            "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"]
        return standardConversions.includes(conversionName);
    }

    function getParam3IfExists(queries) {
        let param3 = {};

        const eventParamRegex = /cd\[.*?]/;
        Object.keys(queries).forEach(key => {
            if (eventParamRegex.test(key)) {
                // queries' keys are formatted as "cd[xxxxxx]" (i.e., "cd[content_category]")
                const eventParamNameRegex = /(?<=\[).+?(?=])/;
                // puts the string inside square brackets as the object's key
                param3[key.match(eventParamNameRegex)[0]] = queries[key];
            }
        });

        if (isEmpty(param3)) {
            return null;
        }

        return param3;
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

// empty events from current tab if user reloads it
browser.webNavigation.onCommitted.addListener(function (details) {
    if (details.transitionType === "reload") {
        const reloadedTabEvents = tabsEvents.find((tabEvents) => {
            return tabEvents.tabId === details.tabId;
        });

        if (reloadedTabEvents) {
            reloadedTabEvents.events = [];
        }
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "getEvents":
            // listens to the popup message that requests the events upon opening
            const requestedTabEvents = tabsEvents.find((tabEvents) => {
                return tabEvents.tabId === message.tabId;
            });

            if (requestedTabEvents) {
                sendResponse(requestedTabEvents.events);
            } else {
                console.log("No events for this tab");
            }
            break;
        default:
            console.error("Unrecognised message: ", message);
            break;
    }
});