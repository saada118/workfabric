// src/pages/CMS.jsx
import React, { useState, useEffect } from "react";

const CMS = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [cliparts, setCliparts] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);

  // Load existing data from localStorage
  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("cms_products")) || []);
    setCliparts(JSON.parse(localStorage.getItem("cms_cliparts")) || []);
    setBackgrounds(JSON.parse(localStorage.getItem("cms_backgrounds")) || []);
  }, []);

  const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    if (type === "cliparts") {
      const updated = [...cliparts, ...newItems];
      setCliparts(updated);
      saveData("cms_cliparts", updated);
    } else if (type === "backgrounds") {
      const updated = [...backgrounds, ...newItems];
      setBackgrounds(updated);
      saveData("cms_backgrounds", updated);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const model = e.target.model.value;
    const thumbnail = e.target.thumbnail.files[0];

    if (!name || !model || !thumbnail) return alert("All fields required");

    const newProduct = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      model,
      thumbnail: URL.createObjectURL(thumbnail),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveData("cms_products", updated);
    e.target.reset();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">CMS Dashboard</h1>

      <div className="flex gap-4 mb-6">
        {["products", "cliparts", "backgrounds"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div>
          <form
            onSubmit={handleAddProduct}
            className="bg-white p-4 rounded shadow mb-6"
          >
            <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="model"
                placeholder="Model File Path (e.g. /models/tshirt.obj)"
                className="border p-2 rounded"
              />
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                className="border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Product
            </button>
          </form>

          <div className="grid grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={i} className="bg-white p-2 rounded shadow text-center">
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  className="h-24 w-full object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.model}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "cliparts" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Upload Cliparts</h2>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "cliparts")}
            className="mb-4"
          />
          <div className="grid grid-cols-6 gap-2">
            {cliparts.map((a, i) => (
              <img
                key={i}
                src={a.url}
                alt={a.name}
                className="h-20 w-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "backgrounds" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Upload Backgrounds</h2>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "backgrounds")}
            className="mb-4"
          />
          <div className="grid grid-cols-6 gap-2">
            {backgrounds.map((a, i) => (
              <img
                key={i}
                src={a.url}
                alt={a.name}
                className="h-20 w-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CMS;

