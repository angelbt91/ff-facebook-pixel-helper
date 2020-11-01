import React from "react";
import Event from "./Event";
import "./EventGroup.modules.css";

function EventGroup(props) {
    const {pixelID, events} = props;

    return (
        <div className="eventBody">
            <p className="pixelID">Pixel {pixelID}</p>
            {events ? events.map(event => {
                return <Event event={event}/>
            }) : "Nothing to show"}
        </div>
    );
}

export default EventGroup;