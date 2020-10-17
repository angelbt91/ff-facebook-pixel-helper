const getEvents = () => {
    // retrieve an array of the code on the page that contains fbq
    let scriptsWithFbq = [...document.getElementsByTagName("script")]
        .filter(script => {
            return script.innerHTML.includes("fbq");
        }).map(script => {
            return script.innerHTML;
        });

    if (scriptsWithFbq.length === 0) {
        return [];
    }

    const fbqCallParametersRegex = /(?<=fbq\().*?(?=\);)/g
    const objectParameterRegex = /(?={).*?(?<=})/g
    const OBJECT_REPLACER = "OBJECT_REPLACED";

    let events = [];

    // iterate over each fbq call on each script and return its parameters formatted as an object
    scriptsWithFbq.forEach(script => {
        const fbqCalls = script.match(fbqCallParametersRegex);

        if (!fbqCalls) {
            return;
        }

        fbqCalls.forEach(fbqCall => {
            /*
             * we'll split the parameters string into an array using comma as the delimiter
             * but there might be objects in the params string with commas in the middle
             * so we have to temporarily remove the objects from the params string in order to not split them
             * but first, we'll replace the call to google_tag_manager vars by the actual values
             */
            fbqCall = replaceGtmVarsByValues(fbqCall); // replace the call to gtm variables to the actual values
            const objectsInParams = fbqCall.match(objectParameterRegex); // we store the objects for later
            const fbqCallWithoutObjects = replaceObjectsByString(fbqCall); // and replace them by a dummy string
            let paramsArray = fbqCallWithoutObjects.split(","); // we parse the params string into an array
            paramsArray = putObjectsBackInParamsArray(paramsArray, objectsInParams); // we put back the objects
            const eventToSend = formatParamsIntoEvent(paramsArray); // and we format the array of params into an object

            events.push(eventToSend);
        });
    });

    return events;

    function replaceGtmVarsByValues(fbqCall) {
        const gtmVarRegex = /(google_tag_manager(.*?)\))/g;
        const matches = fbqCall.match(gtmVarRegex);

        if (!matches) {
            return fbqCall;
        }

        matches.forEach(match => {
            const value = window.eval(match); // yes, I know...
            fbqCall = fbqCall.replace(match, JSON.stringify(value));
        });

        return fbqCall;
    }

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
                // we use dirty-json module to parse the JSON
                // as JSON.parse() won't work when the property is not quoted
                // we load this module with browserify
                const dJSON = require('dirty-json');
                objectsInParams[i] = dJSON.parse(objectsInParams[i]);
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

// TODO delete after switching system to background script
// sends the registered events to the popup upon request
// browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === "getEvents") {
//         sendResponse(getEvents());
//     } else {
//         console.error("Unrecognised message: ", message);
//     }
// });