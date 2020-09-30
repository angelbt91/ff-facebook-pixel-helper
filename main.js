let events = [];

const eventCatcher = function (...params) {
    // stores the params of the function call in the events array
    let eventParams = {};
    params.forEach((param, index) => {
        eventParams[`param${index}`] = param;
    });
    events.push(eventParams);
}

window.onload = function () {
    const originalFbq = window.wrappedJSObject.fbq;

    const newFbq = (...params) => {
        eventCatcher(...params);
        originalFbq(...params)
    }

    // replace original fbq by our newFbq
    window.wrappedJSObject.fbq = cloneInto(newFbq, window, {cloneFunctions: true});
    // wrap the original object again
    XPCNativeWrapper(window.wrappedJSObject.fbq);

    // retrieves the events fired before our fbq object replacing
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

// sends the registered events to the popup upon request
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getEvents") {
        sendResponse(events);
    } else {
        console.error("Unrecognised message: ", message);
    }
});