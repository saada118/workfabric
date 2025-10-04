// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/designer/${p.id}`}
            style={{
              display: "block",
              width: 180,
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <img
              src={p.thumbnail}
              alt={p.name}
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6 }}
            />
            <h3 style={{ margin: "8px 0 0" }}>{p.name}</h3>
            <p style={{ margin: "6px 0 0", color: "#666" }}>Customize</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
