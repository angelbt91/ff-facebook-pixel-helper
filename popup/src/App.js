import React, {useState, useEffect} from 'react';
import "./App.css";
import Header from "./components/Header";
import PixelCounter from "./components/PixelCounter";
import Event from "./components/Event";

function App() {
    const [events, setEvents] = useState(null);
    const [hostname, setHostname] = useState(null);

    useEffect(() => {
        /* eslint-disable no-undef */
        // requests the events upon opening the popup
        browser.tabs.query({active: true, currentWindow: true}, tabs => {
            const sending = browser.runtime.sendMessage({type: "getEvents", tabId: tabs[0].id});
            sending.then(events => {
                setEvents(events.events || null);
                setHostname(events.hostname || null);
            }, error => {
                console.log("Couldn't retrieve data:", error);
            });
        });

        // listens for new events when popup is already open
        browser.runtime.onMessage.addListener((message) => {
            browser.tabs.query({active: true, currentWindow: true}, tabs => {
                switch (message.type) {
                    case "newEvent":
                        const thisTabEvents = message.events.find(event => {
                            return event.tabId === tabs[0].id
                        })
                        setEvents(thisTabEvents.events || null);
                        setHostname(thisTabEvents.documentUrl ? new URL(thisTabEvents.documentUrl).hostname : null);
                        break;
                    default:
                        console.error("Unrecognised message:", message);
                        break;
                }
            })
        });
        /* eslint-disable no-undef */
    }, []);

    return (
        <div className="app">
            <Header/>
            <PixelCounter events={events} hostname={hostname}/>
            {/*<div className="eventBody">
                {events ? events.map(event => {
                    return <Event event={event}/>
                }) : "Nothing to show"}
            </div>*/}
        </div>
    );
}

export default App;
