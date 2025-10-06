// src/pages/CMS.jsx
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

const CMS = () => {
  const [activeTab, setActiveTab] = useState("products");

  const {
    products,
    setProducts,
    backgrounds,
    setBackgrounds,
    cliparts,
    setCliparts,
  } = useAppContext();

  const [newProduct, setNewProduct] = useState({
    name: "",
    image: "",
    model: "",
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.image || !newProduct.model) {
      alert("Please fill all product fields!");
      return;
    }
    const updatedProducts = [
      ...products,
      { ...newProduct, id: Date.now().toString() },
    ];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setNewProduct({ name: "", image: "", model: "" });
  };

  const handleAddBackground = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const updated = [...backgrounds, url];
      setBackgrounds(updated);
      localStorage.setItem("backgrounds", JSON.stringify(updated));
    }
  };

  const handleAddClipart = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const updated = [...cliparts, url];
      setCliparts(updated);
      localStorage.setItem("cliparts", JSON.stringify(updated));
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        <h2 className="mb-4 text-primary text-center">CMS Dashboard — Manage Assets</h2>

        {/* Tabs */}
        <ul className="nav nav-tabs justify-content-center mb-4">
          {["products", "backgrounds", "cliparts"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <form
              onSubmit={handleAddProduct}
              className="card shadow-sm p-4 mb-4 mx-auto"
              style={{ maxWidth: "600px" }}
            >
              <h5 className="card-title mb-3">Add Product</h5>

              <div className="mb-3">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="form-control"
                  placeholder="e.g. Custom Mug"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setNewProduct({ ...newProduct, image: url });
                    }
                  }}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">3D Model (.obj)</label>
                <input
                  type="file"
                  accept=".obj"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setNewProduct({ ...newProduct, model: url });
                    }
                  }}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Add Product
              </button>
            </form>

            {/* Display Products */}
            <div className="row g-3">
              {products.length === 0 ? (
                <p className="text-muted text-center">No products added yet.</p>
              ) : (
                products.map((p) => (
                  <div className="col-12 col-md-4" key={p.id}>
                    <div className="card h-100 shadow-sm">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="card-img-top"
                          style={{ height: "180px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title">{p.name}</h6>
                        <p className="text-muted small mt-auto">
                          {p.model ? "3D Model uploaded ✅" : "No model"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Backgrounds Tab */}
        {activeTab === "backgrounds" && (
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Upload Backgrounds</h5>
            <input
              type="file"
              accept="image/*"
              onChange={handleAddBackground}
              className="form-control mb-3"
            />
            <div className="row g-3">
              {backgrounds.map((bg, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <img
                    src={bg}
                    alt={`Background ${i}`}
                    className="img-fluid rounded"
                    style={{ height: "150px", objectFit: "cover", width: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cliparts Tab */}
        {activeTab === "cliparts" && (
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Upload Cliparts</h5>
            <input
              type="file"
              accept="image/*"
              onChange={handleAddClipart}
              className="form-control mb-3"
            />
            <div className="row g-3">
              {cliparts.map((clip, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <img
                    src={clip}
                    alt={`Clipart ${i}`}
                    className="img-fluid rounded"
                    style={{ height: "150px", objectFit: "contain", width: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CMS;
