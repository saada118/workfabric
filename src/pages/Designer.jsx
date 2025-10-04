// src/pages/Designer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useParams } from "react-router-dom";
import { products } from "../data/products";

export default function Designer() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === productId) || null;

  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeText, setActiveText] = useState(null);

  // 3D preview refs/state
  const [showPreview, setShowPreview] = useState(false);
  const [modelURL, setModelURL] = useState(product ? product.model : null); // default to product model
  const threeContainerRef = useRef(null);
  const threeSceneRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeMeshRef = useRef(null);

  useEffect(() => {
    // init fabric on the actual canvas DOM element
    const c = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "white",
      preserveObjectStacking: true,
    });
    setCanvas(c);

    const updateActiveObject = (e) => {
      const obj = c.getActiveObject();
      if (obj && obj.type === "textbox") setActiveText(obj);
      else setActiveText(null);
    };

    c.on("selection:created", updateActiveObject);
    c.on("selection:updated", updateActiveObject);
    c.on("selection:cleared", () => setActiveText(null));

    return () => {
      c.dispose();
    };
  }, []);

  // allow overriding the product model by upload
  const handleModelUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setModelURL(url);
    console.log("Model override uploaded:", url);
  };

  // image upload (works with Fabric v6 via native img)
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const imgEl = new Image();
      imgEl.src = dataUrl;
      imgEl.onload = () => {
        const fabricImg = new fabric.Image(imgEl, {
          left: 50,
          top: 50,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
        });
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.requestRenderAll();
      };
      imgEl.onerror = () => console.error("Native image load failed");
    };
    reader.readAsDataURL(file);
  };

  // add text
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox("Enter text", {
      left: 120,
      top: 120,
      fontSize: 36,
      fill: "#000000",
      fontFamily: "Arial",
      width: 400,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    text.enterEditing();
    text.selectAll();
  };

  // delete
  const deleteSelected = () => {
    if (!canvas) return;
    const actives = canvas.getActiveObjects();
    if (!actives.length) return;
    actives.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject().requestRenderAll();
    setActiveText(null);
  };

  // text controls
  const changeTextColor = (e) => {
    if (activeText) {
      activeText.set("fill", e.target.value);
      canvas.requestRenderAll();
    }
  };
  const changeFontSize = (e) => {
    if (activeText) {
      activeText.set("fontSize", parseInt(e.target.value || 12, 10));
      canvas.requestRenderAll();
    }
  };
  const changeFontFamily = (e) => {
    if (activeText) {
      activeText.set("fontFamily", e.target.value);
      canvas.requestRenderAll();
    }
  };

  // export image
  const exportImage = () => {
    if (!canvas) return;
    const data = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.href = data;
    link.download = `design-${productId || "custom"}.png`;
    link.click();
  };

  // -------------------------------------------------------------------
  // 3D preview: create scene and load model (with canvas texture)
  // -------------------------------------------------------------------
  const handlePreview = () => {
    if (!canvas) return;
    const textureURL = canvas.toDataURL({ format: "png" });
    setShowPreview(true);
    // init Three after modal is rendered
    setTimeout(() => initThree(textureURL), 50);
  };

  const initThree = (textureURL) => {
    if (!threeContainerRef.current) return;
    if (threeSceneRef.current) return; // already initialized

    const width = 800;
    const height = 500;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 2, 5);
    scene.add(dir);

    const texture = new THREE.TextureLoader().load(textureURL);

    // helper to center + scale
    const centerAndScale = (obj) => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const s = maxDim > 0 ? 1.5 / maxDim : 1;
      obj.scale.setScalar(s);
      // re-calc center and move to origin
      const box2 = new THREE.Box3().setFromObject(obj);
      const center = box2.getCenter(new THREE.Vector3());
      obj.position.sub(center);
    };

    // load model if available
    if (modelURL) {
      const loader = new OBJLoader();
      loader.load(
        modelURL,
        (obj) => {
          console.log("OBJ loaded", obj);
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: texture,
                metalness: 0.1,
                roughness: 0.9,
              });
              child.material.needsUpdate = true;
            }
          });
          centerAndScale(obj);
          scene.add(obj);
          threeMeshRef.current = obj;
        },
        (xhr) => {
          // optional progress
          // console.log("OBJ progress", (xhr.loaded / xhr.total) * 100);
        },
        (err) => {
          console.error("OBJ load error", err);
          // fallback cube
          const geom = new THREE.BoxGeometry(1.5, 1, 0.2);
          const mat = new THREE.MeshBasicMaterial({ map: texture });
          const mesh = new THREE.Mesh(geom, mat);
          scene.add(mesh);
          threeMeshRef.current = mesh;
        }
      );
    } else {
      const geom = new THREE.BoxGeometry(1.5, 1, 0.2);
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      const mesh = new THREE.Mesh(geom, mat);
      scene.add(mesh);
      threeMeshRef.current = mesh;
    }

    // animate
    const clock = new THREE.Clock();
    const animate = () => {
      if (threeMeshRef.current) threeMeshRef.current.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    threeSceneRef.current = scene;
    threeRendererRef.current = renderer;
  };

  const closePreview = () => {
    setShowPreview(false);
    if (threeRendererRef.current) {
      try {
        threeRendererRef.current.forceContextLoss();
      } catch (e) {}
      threeRendererRef.current.domElement.remove();
      threeSceneRef.current = null;
      threeRendererRef.current = null;
      threeMeshRef.current = null;
    }
  };

  // cleanup three when product changes/unmount
  useEffect(() => {
    return () => {
      if (threeRendererRef.current) {
        try { threeRendererRef.current.forceContextLoss(); } catch (e) {}
      }
    };
  }, [productId]);

  return (
    <div style={{ display: "flex", gap: 12, padding: 12 }}>
      <aside style={{ width: 280, padding: 12, borderRight: "1px solid #eee" }}>
        <h2>{product ? product.name : "Designer"}</h2>

        <div style={{ marginBottom: 12 }}>
          <label>
            Upload Image:
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Upload .obj (override product model):
            <input type="file" accept=".obj" onChange={handleModelUpload} />
          </label>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Current model: {modelURL ? modelURL : "none"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={addText}>Add Text</button>
          <button onClick={deleteSelected}>Delete</button>
          <button onClick={exportImage}>Export PNG</button>
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={handlePreview}>Preview 3D</button>
        </div>

        {activeText && (
          <div style={{ marginTop: 18 }}>
            <h4>Text controls</h4>
            <div>
              <label>
                Color:{" "}
                <input
                  type="color"
                  onChange={changeTextColor}
                  value={typeof activeText.fill === "string" && activeText.fill.startsWith("#") ? activeText.fill : "#000000"}
                />
              </label>
            </div>
            <div>
              <label>
                Size:{" "}
                <input type="number" defaultValue={activeText.fontSize} onChange={changeFontSize} />
              </label>
            </div>
            <div>
              <label>
                Font:{" "}
                <select defaultValue={activeText.fontFamily} onChange={changeFontFamily}>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Verdana</option>
                  <option>Georgia</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <canvas ref={canvasRef} />
      </main>

      {showPreview && (
        <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999
          }}>
          <div style={{ width: 820, background: "#fff", padding: 12, borderRadius: 8, position: "relative" }}>
            <button onClick={closePreview} style={{ position: "absolute", top: 8, right: 8 }}>✕</button>
            <div ref={threeContainerRef} />
          </div>
        </div>
      )}
    </div>
  );
}
