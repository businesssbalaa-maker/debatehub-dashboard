import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BsPercent,
  BsGrid1X2Fill,
  BsPeopleFill,
  BsWallet2,
  BsCashStack,
  BsArrowUpRightCircle,
  BsBag,
  BsBarChart,
  BsCreditCard,
  BsTelegram,
  
  BsPower,
  BsChevronLeft,
  BsChevronRight,
  BsGift,
  BsDice5,
  BsFileEarmarkText,
} from "react-icons/bs";

/* 🔥 MENU CONFIG */
const menuItems = [

  { path: "/", label: "StocksDB", icon: BsGrid1X2Fill },
  
  { path: "/users", label: "All Users", icon: BsPeopleFill },
  // { path: "/CreateDemousers", label: "Create Demo Users", icon: BsPeopleFill },
  // { path: "/demousers", label: "Demo Users", icon: BsPeopleFill },
  { path: "/SubordinateManager", label: "Subordinate Manager", icon: BsPeopleFill },
  { path: "/commissionSettings", label: "Commission Settings", icon: BsPercent },
  { path: "/QRCodeSubmit", label: "Add QR Code", icon: BsWallet2 },
  { path: "/recharge", label: "Deposit History", icon: BsCashStack },
  { path: "/withdraw", label: "Withdraw History", icon: BsArrowUpRightCircle },
  { path: "/WithdrawRequest", label: "Withdraw Request", icon: BsBag },
  { path: "/payment-status", label: "Deposit Request", icon: BsCreditCard },
  { path: "/UPISettings", label: "UPI Settings", icon: BsWallet2 },
  
  { path: "/socialMedia", label: "Social Media", icon: BsTelegram },
];

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("NewTradingLoggedUser"));
  const role = user?.type;

  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("NewTradingLoggedUser");
    window.location.reload();
  };

  const subordinateAllowed = [
    "/payment-status",  
    "/QRCodeSubmit",    
    "/UPISettings",
    "/recharge",
    "/",
    "/users"
   
  ];

  const filteredMenus =
    role === "subordinate"
      ? menuItems.filter((item) => subordinateAllowed.includes(item.path))
      : menuItems;

  return (
    <>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <BsChevronLeft size={30} /> : <BsChevronRight size={30} />}
      </div>

      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {isOpen && (
          <>
          

            <span
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <BsPower className="icon" />{" "}
              {role === "subordinate" ? "Subordinate Logout" : "Logout"}
            </span>

            <ul className="sidebar-menu">
              {filteredMenus.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="sidebar-item">
                    <Link to={item.path}>
                      <Icon className="icon" /> {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
