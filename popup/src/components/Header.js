import React from "react";
import "./Header.modules.css";
import Icon from "./icon-32x32.png";
import {AiOutlineQuestionCircle} from "react-icons/ai";

function Header() {
    return (
        <div className="header">
            <div className="headerLogoAndTitle">
                <img src={Icon} className="headerLogo" alt="Firefox Facebook Helper"/>
                <p className="headerTitle">FF Facebook Pixel Helper</p>
            </div>
            <a href="https://github.com/angelbt91/ff-pixel-helper" target="_blank" rel="noopener noreferrer" className="moreInfoIcon">
                <AiOutlineQuestionCircle/>
            </a>
        </div>
    )
}

export default Header;