"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import styles from "./header.module.css";

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "About", url: "/about" },
  { id: 4, title: "Contact", url: "/contact" },
  { id: 5, title: "Reservation", url: "/reservation" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`${styles.container} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.logo}>
        <Link href="/">Foodies</Link>
      </div>
      <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
        {links.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className={styles.navLink}
            onClick={() => setMenuOpen(false)}
          >
            {item.title}
          </Link>
        ))}
        <Button url="/login" text="Login" />
      </div>
      <div className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Header;