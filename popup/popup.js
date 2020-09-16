let events;

browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, {type: "getEvents"}, function (eventsReceived) {
        events = eventsReceived;

        // TODO paint the events in the popup
    });
});