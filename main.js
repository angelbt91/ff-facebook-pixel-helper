let events = [];

window.onload = function () {

    const originalFbq = window.wrappedJSObject.fbq;

    const newFbq = (...params) => {
        eventCatcher(...params);
        originalFbq(...params)
    }

    // replace former fbq by our newFbq
    window.wrappedJSObject.fbq = cloneInto(newFbq, window, {cloneFunctions: true});
    // wrap the original object again
    XPCNativeWrapper(window.wrappedJSObject.fbq);

    events = getEventsBeforeOnload();
}

function getEventsBeforeOnload() {
    let eventsBeforeOnload = [];

    // retrieve an array of the code on the page that contains fbq
    let scriptsWithFbq = [...document.getElementsByTagName("script")]
        .filter(script => {
            return script.innerHTML.includes("fbq");
        }).map(script => {
            return script.innerHTML;
        });

    const fbqCallParametersRegex = /(?<=fbq\().*?(?=\);)/g

    // iterate over each fbq call on each script and return its parameters
    scriptsWithFbq.forEach(script => {
        let fbqCalls = script.match(fbqCallParametersRegex);

        fbqCalls.forEach(fbqCall => {
            const firstTwoParams = fbqCall.split(",", 2);
            const restOfTheParams = fbqCall.split(",").slice(2).join();
            const allParams = firstTwoParams.concat(restOfTheParams);

            eventsBeforeOnload.push({
                'param0': JSON.parse(allParams[0]),
                'param1': JSON.parse(allParams[1])
                // TODO what to do with the rest of the params
            })
        });
    });

    return eventsBeforeOnload;
}

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getEvents") {
        sendResponse(events);
    } else {
        console.error("Unrecognised message: ", message);
    }
});

const eventCatcher = function (...params) {
    // argumentsLogger(arguments);

    let eventToStore = {};
    params.forEach((param, index) => {
        eventToStore[`param${index}`] = param;
    });
    events.push(eventToStore);
};

const argumentsLogger = function (args) {
    console.log("Call to fbq captured. Arguments:");
    console.log(...args);
}