window.onload = function () {
    let originalFbq = window.wrappedJSObject.fbq;

    let newFbq = (...params) => {
        eventCatcher(...params);
        originalFbq(...params)
    }

    // replace former fbq by our newFbq
    window.wrappedJSObject.fbq = cloneInto(newFbq, window, {cloneFunctions: true});
    // wrap the original object again
    XPCNativeWrapper(window.wrappedJSObject.fbq);

    // TODO catch events fired before plugin load
}

let events = [];

browser.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        switch (message.type) {
            case "getEvents":
                sendResponse(events);
                break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);

let eventCatcher = function (...params) {
    argumentsLogger(arguments);

    let eventToStore = {};
    params.forEach((param, index) => {
        eventToStore[`param${index}`] = param;
    });
    events.push(eventToStore);
};

let argumentsLogger = function (args) {
    console.log("Call to fbq captured. Arguments:");
    console.log(...args);
}

