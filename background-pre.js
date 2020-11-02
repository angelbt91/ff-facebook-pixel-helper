let tabsEvents = [];

browser.browserAction.setBadgeBackgroundColor({color: "#75b640"});
browser.browserAction.setBadgeTextColor({color: "#FFF"});
// listens to network calls to facebook.com/.net and sends them to registerRequest to store the relevant events
browser.webRequest.onCompleted.addListener(registerRequests, {urls: ["*://*.facebook.com/*", "*://*.facebook.net/*"]});
// remove events for the current tab if user navigates to another document
browser.webNavigation.onCommitted.addListener(removeEventsOnNavigation);
// listens to the popup message that requests the events upon opening
browser.runtime.onMessage.addListener(sendEventsToPopup);

function registerRequests(request) {
    if (request.statusCode !== 200) {
        return;
    }

    const event = formatRequestIntoEvent(request.url);

    if (!event) {
        return; // stops if it's not a valid event
    }

    // finds the index in tabsEvents that corresponds to the tab of the current event
    let currentTabEventsIndex = tabsEvents.findIndex(tabEvents => {
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
        tabsEvents[currentTabEventsIndex].documentUrl = request.documentUrl;

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
}

function removeEventsOnNavigation(details) {
    if (details.transitionType !== "auto_subframe" && details.transitionType !== "manual_subframe") {
        const navigationTabEvents = tabsEvents.find((tabEvents) => {
            return tabEvents.tabId === details.tabId;
        });

        if (navigationTabEvents) {
            navigationTabEvents.events = [];
            navigationTabEvents.documentUrl = null;
            if (isPopupOpen()) {
                browser.runtime.sendMessage({type: "newEvent", events: tabsEvents}); // refresh events on the popup
            }
        }
    }
}

function sendEventsToPopup(message, sender, sendResponse) {
    switch (message.type) {
        case "getEvents":
            const requestedTabEvents = tabsEvents.find((tabEvents) => {
                return tabEvents.tabId === message.tabId;
            });

            if (requestedTabEvents) {
                sendResponse({
                    events: requestedTabEvents.events,
                    hostname: requestedTabEvents.documentUrl ? new URL(requestedTabEvents.documentUrl).hostname : null
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
        let param3 = getParam3IfExists(urlParsed.query);

        return {
            "param0": urlParsed.query.id,
            "param1": getParam1(urlParsed.query.ev),
            "param2": urlParsed.query.ev,
            ...(param3 && {param3: param3})
        }
    } else {
        return null;
    }

    function isTrackEvent(urlParsed) {
        return urlParsed.url === "https://www.facebook.com/tr/" && urlParsed.query.ev;
    }

    function getParam1(evQuery) {
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