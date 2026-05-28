import React from "react";
import { BsBell, BsEnvelope, BsSearch, BsPersonCircle } from "react-icons/bs";

function Header() {
  return (
    <header className="header">
      
      {/* Left side: search bar */}
      <div className="header-left">
        <BsSearch className="icon" />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
      </div>

      {/* Right side: icons + user */}
      <div className="header-right">
        <div className="icon-box">
          <BsBell className="icon"/>5
        </div>
        <div className="icon-box">
          <BsEnvelope className="icon" />
        </div>
        <div className="user-box">
          <BsPersonCircle className="icon user-icon" />
          <span className="username">Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
