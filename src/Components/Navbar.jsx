import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BsGlobe2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { IoIosNotifications } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { logout_user } from "../Redux/Authantication/auth.action";
import "./shell.css";

const travelLinks = [
  { label: "Stays", href: "/stay" },
  { label: "Flights", href: "/flight" },
  { label: "Popular Attractions", href: "/ThingsToDo" },
  { label: "Packages", href: "/packages" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [travelsOpen, setTravelsOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch();
  const isAuth = useSelector((store) => store.LoginReducer.isAuth);

  const handleLogout = () => {
    dispatch(logout_user);
    setIsOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <RouterLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>Prelude</span>
        </RouterLink>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        <nav className={`site-nav ${isOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <div className="nav-dropdown">
            <button
              className="nav-link nav-dropdown-trigger"
              type="button"
              onClick={() => setTravelsOpen((open) => !open)}
              aria-expanded={travelsOpen}
            >
              More travels <HiOutlineChevronDown />
            </button>
            {travelsOpen && (
              <div className="nav-dropdown-menu">
                {travelLinks.map((link) => (
                  <RouterLink key={link.href} to={link.href} onClick={() => setIsOpen(false)}>
                    {link.label}
                  </RouterLink>
                ))}
              </div>
            )}
          </div>
          <RouterLink className="nav-link" to="/ThingsToDo" onClick={() => setIsOpen(false)}>
            Explore
          </RouterLink>
          <RouterLink className="nav-link" to="/checkout" onClick={() => setIsOpen(false)}>
            Cart
          </RouterLink>
        </nav>

        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Language">
            <BsGlobe2 /> <span>English</span>
          </button>
          <button className="icon-button notification-button" type="button" aria-label="Notifications">
            <IoIosNotifications />
          </button>
          {isAuth ? (
            <button className="account-button" type="button" onClick={handleLogout}>
              <FiUser aria-hidden="true" /> Log out
            </button>
          ) : (
            <RouterLink className="account-button" to="/login" onClick={() => setIsOpen(false)}>
              Sign in
            </RouterLink>
          )}
          <button className="theme-button" type="button" onClick={toggleColorMode} aria-label="Toggle color mode">
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
