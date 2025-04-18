import React from "react";
import { Link, NavLink } from "react-router-dom";
import reactLogo from '../../assets/react.svg'
import "./Navbar.css";

// Navbar items type
interface NavItemType {
  label: string;
  href: string;
  icon?: React.ReactNode;
}


const navItems: NavItemType[] = [
  { label: "Home", href: "/" },
  { label: "Page1", href: "/" },
  { label: "Page2", href: "/" },
];

// Navbar item
const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => (
  <NavLink
    to={item.href}
    className={({ isActive }) =>
      `nav-item ${isActive ? "nav-item-active" : ""}`
    }
  >
    {item.label}
  </NavLink>
);

// Navbar 
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="left-section">
          {/* Logo */}
          <img src={reactLogo} alt="React Logo" className="logo" />
          <div className="nav-items">
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>


        <div className="right-section">
          
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <div className="auth-buttons">
            <Link to="/auth">Sign In / Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
