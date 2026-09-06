import React from "react";
import { Link as RouterLink } from "react-router-dom";
import "./shell.css";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Stays", "/stay"],
      ["Flights", "/flight"],
      ["Popular Attractions", "/ThingsToDo"],
    ],
  },
  {
    title: "Company",
    links: [["About Prelude", "/"]],
  },
  {
    title: "Support",
    links: [["Help center", "/"], ["Terms and conditions", "/"]],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <RouterLink className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">✦</span>
            <span>Prelude</span>
          </RouterLink>
          <p>Team 1 (CPRE/SE 3290 - Dr. Gaffar): Connor Link, Connor Moroney, Alec Moore, Chris Lopez</p>
          <small>&copy; 2026 Prelude. All rights reserved.</small>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <RouterLink key={label} to={href}>{label}</RouterLink>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
