// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Home() {
  const { products } = useAppContext();

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        <h1 className="display-5 fw-bold mb-4 text-primary text-center">Products</h1>

        {products.length === 0 ? (
          <div className="text-secondary text-center fs-5">
            No products yet. Go to the CMS to add some.
          </div>
        ) : (
          <div className="row g-4">
            {products.map((p, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4">
                <div className="card h-100 shadow-sm border-0 hover-shadow">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="card-img-top rounded-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-semibold text-dark">{p.name}</h5>
                    <Link
                      to={`/designer/${encodeURIComponent(p.name)}`}
                      className="btn btn-primary mt-auto"
                    >
                      Customize
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
