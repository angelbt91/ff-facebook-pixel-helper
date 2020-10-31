import React from "react";
import "./PixelCounter.modules.css";

function PixelCounter(props) {

    const pixelCount = getPixelCount(props.events);

    function getPixelCount(events) {
        if (!events) {
            return 0;
        }

        return Object.keys(events).length;
    }

    return <p className="pixelCounter">{pixelCount} {pixelCount === 1 ? "pixel" : "pixels"} found{props.hostname && ` on ${props.hostname}`}</p>;
}

export default PixelCounter;