import React, {useState, useEffect} from 'react';
import './App.css';
import Header from "./components/Header";
import Event from "./components/Event";

function App() {
    let [events, setEvents] = useState(["Nothing to show"]);

    useEffect(() => {
        /* eslint-disable no-undef */
        browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {type: "getEvents"}, function (eventsReceived) {
                if (eventsReceived.length > 0) {
                    setEvents(eventsReceived);
                }
            });
        });
        /* eslint-disable no-undef */
    }, [])

    return (
        <div className="bodyClass">
            <Header />
            <div className="eventBody">
                <Event />
            </div>
        </div>
    );
}

export default App;
