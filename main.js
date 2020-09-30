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
        const fbqCalls = script.match(fbqCallParametersRegex);

        fbqCalls.forEach(fbqCall => {
            // there might be objects in the params string
            const objectsInParams = getObjectsInParams(fbqCall);// so we save the objects
            const fbqCallWithoutObjects = replaceObjectsByString(fbqCall); // and replace them by a specific string
            let paramsArray = fbqCallWithoutObjects.split(","); // we parse the params into an array of strings
            paramsArray = putObjectsBackInParamsArray(paramsArray, objectsInParams); // we put back the objects where they belonged
            const eventToSend = formatParamsIntoEvent(paramsArray); // and we format the array of params into an object that we'll save

            console.log("eventToSend after modification:");
            console.log(eventToSend);

            eventsBeforeOnload.push(eventToSend);
        });
    });

    return eventsBeforeOnload;

    function getObjectsInParams(params) {
        const objectParameterRegex = /(?={).*?(?<=})/g
        return params.match(objectParameterRegex);
    }

    function replaceObjectsByString(paramsArray) {
        const objectParameterRegex = /(?={).*?(?<=})/g
        const objectParams = paramsArray.match(objectParameterRegex);

        if (objectParams) {
            objectParams.forEach(objectParam => {
                paramsArray = paramsArray.replace(objectParam, "object");
            });
        }

        return paramsArray;
    }

    function putObjectsBackInParamsArray(paramsArray, objectsInParams) {
        let i = 0;
        paramsArray.forEach((param, index) => {
            if (param === "object") {
                paramsArray[index] = objectsInParams[i];
                i++;
            }
        })
        return paramsArray;
    }

    function formatParamsIntoEvent(paramsArray) {
        let eventToSend = {};

        paramsArray.forEach((param, index) => {
            let parsedParam;

            try {
                parsedParam = JSON.parse(param);
            } catch {
                parsedParam = param;
            }

            eventToSend[`param${index}`] = parsedParam;
        });

        return eventToSend;
    }
}

// sends the registered events to the popup upon request
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getEvents") {
        sendResponse(events);
    } else {
        console.error("Unrecognised message: ", message);
    }
});