let events = [];

const eventCatcher = (...params) => {
    // stores the params of the function call in the events array
    let eventParams = {};
    params.forEach((param, index) => {
        eventParams[`param${index}`] = param;
    });
    events.push(eventParams);
}

window.onload = () => {
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

const getEventsBeforeOnload = () => {
    let eventsBeforeOnload = [];

    // retrieve an array of the code on the page that contains fbq
    let scriptsWithFbq = [...document.getElementsByTagName("script")]
        .filter(script => {
            return script.innerHTML.includes("fbq");
        }).map(script => {
            return script.innerHTML;
        });

    const fbqCallParametersRegex = /(?<=fbq\().*?(?=\);)/g
    const objectParameterRegex = /(?={).*?(?<=})/g
    const OBJECT_REPLACER = "OBJECT_REPLACED";

    // iterate over each fbq call on each script and return its parameters formatted as an object
    scriptsWithFbq.forEach(script => {
        const fbqCalls = script.match(fbqCallParametersRegex);

        fbqCalls.forEach(fbqCall => {
            /*
             * we'll split the parameters string into an array using comma as the delimiter
             * but there might be objects in the params string with commas in the middle
             * so we have to temporarily remove the objects from the params string in order to not split them
             */
            const objectsInParams = fbqCall.match(objectParameterRegex); // we save the objects for later
            const fbqCallWithoutObjects = replaceObjectsByString(fbqCall); // and replace them by a dummy string
            let paramsArray = fbqCallWithoutObjects.split(","); // we parse the params string into an array
            paramsArray = putObjectsBackInParamsArray(paramsArray, objectsInParams); // we put back the objects
            const eventToSend = formatParamsIntoEvent(paramsArray); // and we format the array of params into an object

            console.log("eventToSend:");
            console.log(eventToSend);

            eventsBeforeOnload.push(eventToSend);
        });
    });

    return eventsBeforeOnload;

    function replaceObjectsByString(paramsArray) {
        const objectParams = paramsArray.match(objectParameterRegex);

        if (objectParams) {
            objectParams.forEach(objectParam => {
                paramsArray = paramsArray.replace(objectParam, OBJECT_REPLACER);
            });
        }

        return paramsArray;
    }

    function putObjectsBackInParamsArray(paramsArray, objectsInParams) {
        let i = 0; // in case there are more than 1 object to put back in place, we keep the track of the index
        paramsArray.forEach((param, index) => {
            if (param === OBJECT_REPLACER) {
                paramsArray[index] = objectsInParams[i];
                i++;
            }
        })
        return paramsArray;
    }

    function formatParamsIntoEvent(paramsArray) {
        let event = {};

        paramsArray.forEach((param, index) => {
            let parsedParam;

            try {
                parsedParam = JSON.parse(param);
            } catch {
                parsedParam = param;
            }

            event[`param${index}`] = parsedParam;
        });

        return event;
    }
}

// sends the registered events to the popup upon request
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getEvents") {
        sendResponse(events);
    } else {
        console.error("Unrecognised message: ", message);
    }
});