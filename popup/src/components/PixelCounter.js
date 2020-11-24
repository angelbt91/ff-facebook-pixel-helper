import React, {useState} from "react";
import "./PixelCounter.modules.css";
import {AiOutlineDown, AiOutlineRight} from "react-icons/ai";

function PixelCounter(props) {
    const pixelCount = getPixelCount(props.events);
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    function getPixelCount(events) {
        if (!events) {
            return 0;
        }

        return Object.keys(events).length;
    }

    return <>
        <p className="pixelCounter">
            {pixelCount} {pixelCount === 1 ? "pixel" : "pixels"} found{props.hostname && ` on ${props.hostname}`}.
            {pixelCount === 0 && <span className="clickable" onClick={() => setShowMoreInfo(!showMoreInfo)}>
                Why? {showMoreInfo ?
                <AiOutlineDown className="showMoreInfoIcon"/> :
                <AiOutlineRight className="showMoreInfoIcon"/>}
            </span>}
        </p>
        {(showMoreInfo && pixelCount === 0) && <div className="noPixelsFiredDetail">
            <p className="pixelCounter">If you expected some Facebook events to fire, check that:</p>
            <ul className="pixelCounter">
                <li>Firefox's <a
                    href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                    target="_blank" rel="noopener noreferrer">Enhanced Tracking Prevention</a> is not blocking the
                    Facebook pixel on this page.
                </li>
                <li>You don't have any Firefox add-on installed that blocks the Facebook pixel. Some common add-ons that prevent
                    the Facebook pixel from firing are Facebook Container, uBlock, AdBlock and Disconnect.
                </li>
                <li>Your events are not set up via Facebook's <a
                    href="https://www.facebook.com/business/help/2142172942565580?id=1205376682832142" target="_blank"
                    rel="noopener noreferrer">Event Setup Tool</a>. This add-on can't detect pixels configured via
                    Event Setup Tool because of technical limitations.
                </li>
            </ul>
            <p className="pixelCounter">Still having problems? Please <a
                href="https://github.com/angelbt91/ff-facebook-pixel-helper/issues/new" target="_blank"
                rel="noopener noreferrer">submit an issue on GitHub</a> in order to get assistance.
            </p>
        </div>}
    </>;
}

export default PixelCounter;