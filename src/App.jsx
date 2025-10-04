import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import * as THREE from "three";
import { OBJLoader } from "three-stdlib";

export default function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeText, setActiveText] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [modelURL, setModelURL] = useState(null); // store uploaded .obj
  const threeContainerRef = useRef(null);
  const threeSceneRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeMeshRef = useRef(null);

  // Initialize Fabric Canvas
  useEffect(() => {
    const c = new fabric.Canvas("canvas", {
      width: 800,
      height: 600,
      backgroundColor: "white",
    });
    setCanvas(c);

    c.on("selection:created", updateActiveObject);
    c.on("selection:updated", updateActiveObject);
    c.on("selection:cleared", () => setActiveText(null));

    return () => c.dispose();
  }, []);

  const updateActiveObject = (e) => {
    const obj = e.selected[0];
    if (obj && obj.type === "textbox") {
      setActiveText(obj);
    } else {
      setActiveText(null);
    }
  };

  // Upload Image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
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
        });

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
      };
    };
    reader.readAsDataURL(file);
  };

  // Upload 3D model (.obj)
  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setModelURL(url);
    console.log("3D model uploaded:", url);
  };

  // Add Text
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox("Enter text", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "black",
      fontFamily: "Arial",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveText(text);
    canvas.renderAll();
  };

  // Delete
  const deleteSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      setActiveText(null);
      canvas.renderAll();
    }
  };

  // Export
  const exportImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    link.click();
  };

  // Text controls
  const changeTextColor = (e) => {
    if (activeText) {
      activeText.set("fill", e.target.value);
      canvas.renderAll();
    }
  };
  const changeFontSize = (e) => {
    if (activeText) {
      activeText.set("fontSize", parseInt(e.target.value, 10));
      canvas.renderAll();
    }
  };
  const changeFontFamily = (e) => {
    if (activeText) {
      activeText.set("fontFamily", e.target.value);
      canvas.renderAll();
    }
  };

  // === 3D Preview ===
  const handlePreview = () => {
    if (!canvas) return;
    const textureURL = canvas.toDataURL({ format: "png" });
    setShowPreview(true);
    setTimeout(() => initThree(textureURL), 100);
  };

 const initThree = (textureURL) => {
  if (threeSceneRef.current) return;

  const width = 600;
  const height = 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  threeContainerRef.current.appendChild(renderer.domElement);

  const texture = new THREE.TextureLoader().load(textureURL);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 2, 5);
  scene.add(directionalLight);

  // Function to center and scale the object
  const centerAndScale = (obj) => {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;
    obj.scale.setScalar(scale);

    box.setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center); // center object
  };

  if (modelURL) {
    const loader = new OBJLoader();
    loader.load(
      modelURL,
      (obj) => {
        console.log("✅ OBJ loaded successfully!", obj);

        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              map: texture,
              metalness: 0.1,
              roughness: 0.9,
            });
          }
        });

        centerAndScale(obj);
        scene.add(obj);
        threeMeshRef.current = obj;
      },
      (xhr) => {
        console.log(`Loading OBJ: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error("❌ Failed to load OBJ:", error);
        // fallback cube if error
        const geometry = new THREE.BoxGeometry(1.5, 1, 0.2);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        threeMeshRef.current = mesh;
      }
    );
  } else {
    // fallback cube if no model
    const geometry = new THREE.BoxGeometry(1.5, 1, 0.2);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    threeMeshRef.current = mesh;
  }

  // Animation loop
  const animate = () => {
    if (threeMeshRef.current) {
      threeMeshRef.current.rotation.y += 0.01;
    }
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
      threeRendererRef.current.dispose();
      threeRendererRef.current.forceContextLoss();
      threeRendererRef.current.domElement.remove();
      threeSceneRef.current = null;
      threeRendererRef.current = null;
      threeMeshRef.current = null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          padding: "10px",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <input type="file" accept=".obj" onChange={handleModelUpload} />
        <button onClick={addText}>Add Text</button>
        <button onClick={deleteSelected}>Delete Selected</button>
        <button onClick={exportImage}>Export PNG</button>
        <button onClick={handlePreview}>Preview 3D</button>

        {activeText && (
          <div style={{ marginTop: "20px" }}>
            <h4>Text Controls</h4>
            <label>
  Color:{" "}
  <input
    type="color"
    onChange={changeTextColor}
    value={
      activeText.fill.startsWith("#")
        ? activeText.fill
        : "#000000" // default if not hex
    }
  />
</label>

            <br />
            <label>
              Size:{" "}
              <input
                type="number"
                min="8"
                max="100"
                defaultValue={activeText.fontSize}
                onChange={changeFontSize}
              />
            </label>
            <br />
            <label>
              Font:{" "}
              <select onChange={changeFontFamily} defaultValue={activeText.fontFamily}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <canvas id="canvas" ref={canvasRef} />
      </div>

      {/* 3D Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <button
              onClick={closePreview}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div ref={threeContainerRef}></div>
          </div>
        </div>
      )}
    </div>
  );
}
