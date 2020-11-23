let eventsPerTab = {};

browser.browserAction.setBadgeBackgroundColor({color: "#75b640"});
browser.browserAction.setBadgeTextColor({color: "#FFF"});

browser.webRequest.onCompleted.addListener(registerRequests, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});
browser.webNavigation.onCommitted.addListener(removeEventsOnNavigation);
browser.runtime.onMessage.addListener(sendEventsToPopupWhenOpens);

function registerRequests(request) {
    if (request.statusCode !== 200) {
        return;
    }

    const event = formatRequestIntoEvent(request.url);

    if (!event) {
        return; // stops if it's not a valid event
    }

    if (eventsPerTab[request.tabId]) {
        if (eventsPerTab[request.tabId].events[event.pixelId]) {
            eventsPerTab[request.tabId].events[event.pixelId].push(event);
        } else {
            eventsPerTab[request.tabId].events[event.pixelId] = [event];
        }
    } else {
        eventsPerTab[request.tabId] = {
            events: {
                [event.pixelId]: [event]
            }
        }
    }
    eventsPerTab[request.tabId].documentUrl = request.documentUrl;

    browser.browserAction.setBadgeText({
        text: getEventsCount(eventsPerTab[request.tabId].events),
        tabId: request.tabId
    });

    if (isPopupOpen()) {
        browser.runtime.sendMessage({type: "newEvent", events: eventsPerTab}); // sends events to popup as they occur
    }
}

function removeEventsOnNavigation(details) {
    if (details.transitionType !== "auto_subframe" && details.transitionType !== "manual_subframe") {
        if (eventsPerTab[details.tabId]) {
            eventsPerTab[details.tabId].events = {};
            eventsPerTab[details.tabId].documentUrl = null;

            if (isPopupOpen()) {
                browser.runtime.sendMessage({type: "newEvent", events: eventsPerTab}); // refresh events on the popup
            }
        }
    }
}

function sendEventsToPopupWhenOpens(message, sender, sendResponse) {
    switch (message.type) {
        case "getEvents":
            if (eventsPerTab[message.tabId]) {
                sendResponse({
                    events: eventsPerTab[message.tabId].events,
                    hostname: eventsPerTab[message.tabId].documentUrl ? new URL(eventsPerTab[message.tabId].documentUrl).hostname : null
                });
            } else {
                sendResponse({
                    events: null,
                    hostname: null
                })
            }
            break;
        default:
            console.error("Unrecognised message: ", message);
            break;
    }
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

function formatRequestIntoEvent(url) {
    const queryString = require('query-string');
    const urlParsed = queryString.parseUrl(url);

    if (isTrackEvent(urlParsed)) {
        let eventParams = getEventParamsIfAvailable(urlParsed.query);

        return {
            "pixelId": urlParsed.query.id,
            "eventType": getEventType(urlParsed.query.ev),
            "eventName": urlParsed.query.ev,
            ...(eventParams && {"eventParams": eventParams})
        }
    } else {
        return null;
    }

    function isTrackEvent(urlParsed) {
        return urlParsed.url === "https://www.facebook.com/tr/" && urlParsed.query.ev;
    }

    function getEventType(evQuery) {
        const standardConversions = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
            "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView",
            "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"]

        if (evQuery === "Microdata") {
            return "microdata";
        } else if (evQuery === "SubscribedButtonClick") {
            return "btnclick";
        } else if (standardConversions.includes(evQuery)) {
            return "track";
        } else {
            return "trackCustom";
        }
    }

    function getEventParamsIfAvailable(queries) {
        let eventParams = {};

        const eventParamRegex = /cd\[.*?]/;
        Object.keys(queries).forEach(key => {
            if (eventParamRegex.test(key)) {
                // queries' keys are formatted as "cd[xxxxxx]" (i.e., "cd[content_category]")
                const eventParamNameRegex = /(?<=\[).+?(?=])/;
                // puts the string inside square brackets as the object's key
                eventParams[key.match(eventParamNameRegex)[0]] = queries[key];
            }
        });

        if (isEmpty(eventParams)) {
            return null;
        }

        return eventParams;
    }
}

function isEmpty(obj) {
    // if the for loop runs, it means object is not empty
    // this is the fastest implementation for this check as per https://stackoverflow.com/a/59787784
    // noinspection LoopStatementThatDoesntLoopJS
    for (let i in obj) {
        return false;
    }
    return true;
}

function isPopupOpen() {
    const popupView = browser.extension.getViews({type: "popup"});
    return popupView.length > 0;
}