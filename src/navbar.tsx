 import React from "react";

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: "#1e293b",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
      }}
    >
      <h2>MonSite</h2>

      <ul
        style={{
          display: "flex",
          listStyle: "none",
          gap: "20px",
          margin: 0,
          padding: 0,
        }}
      >
        <li>
          <a
            href="#"
            style={{ color: "white", textDecoration: "none" }}
          >
            Accueil
          </a>
        </li>

        <li>
          <a
            href="#"
            style={{ color: "white", textDecoration: "none" }}
          >
            À propos
          </a>
        </li>

        <li>
          <a
            href="#"
            style={{ color: "white", textDecoration: "none" }}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;