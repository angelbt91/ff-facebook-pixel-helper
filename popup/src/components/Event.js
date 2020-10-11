import React from "react";
import "./Event.modules.css";
import {MdInfo} from "react-icons/md";
import {AiFillRightCircle, AiFillRightSquare} from "react-icons/ai";

function Event(props) {
    let event = props.event;

    return (
        <>
            <div className="event">
                <div className="eventUpperBlock">
                    <MdInfo className="eventIcon"/>
                    <p className="eventTitle">Pixel 123456780 initiated</p>
                </div>
            </div>

            <div className="event">
                <div className="eventUpperBlock">
                    <MdInfo className="eventIcon"/>
                    <p className="eventTitle">Pixel 0123456789 initiated</p>
                </div>
            </div>

            <div className="event">
                <div className="eventUpperBlock">
                    <AiFillRightCircle className="eventIcon"/>
                    <p className="eventTitle">PageView</p>
                </div>
            </div>

            <div className="event">
                <div className="eventUpperBlock">
                    <AiFillRightCircle className="eventIcon"/>
                    <p className="eventTitle">ViewContent</p>
                </div>
                <div className="eventLowerBlock">
                    <div className="parameter">
                        <p className="parameterTitle">content_ids:</p>
                        <p className="parameterValue">["123", "456"]</p>
                    </div>
                    <div className="parameter">
                        <p className="parameterTitle">contents:</p>
                        <p className="parameterValue">["123", "456"]</p>
                    </div>
                </div>
            </div>

            <div className="event">
                <div className="eventUpperBlock">
                    <AiFillRightSquare className="eventIcon"/>
                    <p className="eventTitle">CustomConversion</p>
                </div>
                <div className="eventLowerBlock">
                    <div className="parameter">
                        <p className="parameterTitle">content_ids:</p>
                        <p className="parameterValue">["123", "456"]</p>
                    </div>
                    <div className="parameter">
                        <p className="parameterTitle">contents:</p>
                        <p className="parameterValue">["123", "456"]</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Event;