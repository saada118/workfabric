// src/pages/Designer.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fabric } from "fabric";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useAppContext } from "../context/AppContext";

const Designer = () => {
  const { id } = useParams();
  const { products, backgrounds, cliparts } = useAppContext();

  const product =
    products.find((p) => p.id === id) || products.find((p) => p.name === id);

  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Initialize Fabric canvas
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      height: 400,
      width: 600,
      preserveObjectStacking: true,
    });
    setCanvas(c);

    return () => {
      try {
        c.dispose();
      } catch {}
    };
  }, []);

  // ------------------ Canvas Toolbar Actions ------------------
  
  // Add multiple images
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || !canvas) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        fabric.Image.fromURL(ev.target.result, (img) => {
          img.scaleToWidth(300);
          img.set({
            left: canvas.getWidth() / 2 - img.getScaledWidth() / 2,
            top: 80,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Add text
  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Edit me", {
      left: 100,
      top: 100,
      fontSize: 26,
      fill: "#000000",
      selectable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    text.enterEditing && text.enterEditing();
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    } else {
      alert("No object selected!");
    }
  };

  // Set background
  const handleSetBackground = (bgUrl) => {
    if (!canvas) return;
    fabric.Image.fromURL(
      bgUrl,
      (img) => {
        const canvasW = canvas.getWidth();
        const canvasH = canvas.getHeight();
        const scale = Math.max(canvasW / img.width, canvasH / img.height);
        img.scale(scale);
        img.set({
          left: (canvasW - img.getScaledWidth()) / 2,
          top: (canvasH - img.getScaledHeight()) / 2,
          selectable: false,
          evented: false,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      },
      { crossOrigin: "anonymous" }
    );
  };

  // Add clipart
  const handleAddClipart = (clipUrl) => {
    if (!canvas) return;
    fabric.Image.fromURL(
      clipUrl,
      (img) => {
        img.scaleToWidth(140);
        img.set({ left: 120, top: 120 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  // Open/close 3D preview
  const handlePreview = () => {
    if (!product?.model && !product?.modelUrl) {
      alert("No 3D model found for this product.");
      return;
    }
    setPreviewOpen(true);
  };
  const handleClosePreview = () => setPreviewOpen(false);

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        <h2 className="mb-4 text-center">{`Designing: ${product ? product.name : "Unknown Product"}`}</h2>

        {/* Toolbar */}
        <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="form-control form-control-sm"
            style={{ maxWidth: "200px" }}
          />
          <button className="btn btn-primary" onClick={handleAddText}>
            Add Text
          </button>
          <button className="btn btn-danger" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          <button className="btn btn-success" onClick={handlePreview}>
            Preview 3D
          </button>
        </div>

        {/* Layout: Sidebar left, Canvas right */}
        <div className="d-flex flex-wrap gap-4">
          {/* Sidebar */}
          <div style={{ minWidth: 260, maxHeight: 400, overflowY: "auto" }}>
            {/* Backgrounds */}
            <div className="mb-4 card shadow-sm p-3">
              <h5 className="mb-2">Backgrounds</h5>
              <div className="row row-cols-2 g-2">
                {backgrounds.length === 0 ? (
                  <div className="text-muted small">No backgrounds</div>
                ) : (
                  backgrounds.map((b, i) => (
                    <div key={i} className="col">
                      <img
                        src={b}
                        alt={`bg-${i}`}
                        className="img-fluid rounded border cursor-pointer"
                        style={{ height: "80px", objectFit: "cover", width: "100%" }}
                        onClick={() => handleSetBackground(b)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cliparts */}
            <div className="card shadow-sm p-3">
              <h5 className="mb-2">Cliparts</h5>
              <div className="row row-cols-2 g-2">
                {cliparts.length === 0 ? (
                  <div className="text-muted small">No cliparts</div>
                ) : (
                  cliparts.map((c, i) => (
                    <div key={i} className="col">
                      <img
                        src={c}
                        alt={`clip-${i}`}
                        className="img-fluid rounded border cursor-pointer"
                        style={{ height: "80px", objectFit: "contain", width: "100%" }}
                        onClick={() => handleAddClipart(c)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="bg-white border rounded shadow p-2 flex-grow-1" style={{ maxWidth: "620px" }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* 3D Preview Modal */}
        {previewOpen && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "600px" }}>
              <div className="modal-content position-relative">
                <div className="modal-header">
                  <h5 className="modal-title">3D Preview</h5>
                  <button type="button" className="btn-close" onClick={handleClosePreview} />
                </div>
                <div
                  className="modal-body p-0"
                  style={{ height: "300px", overflow: "hidden", width: "100%" }}
                >
                  <ThreeDPreview modelUrl={product?.model || product?.modelUrl} canvas={canvas} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------- ThreeDPreview with Live Canvas Texture -------------------
const ThreeDPreview = ({ modelUrl, canvas }) => {
  const mountRef = useRef();
  const controlsRef = useRef(null);
  const frameIdRef = useRef(null);
  const textureRef = useRef(null);
  const objectRef = useRef(null);

  useEffect(() => {
    if (!modelUrl || !mountRef.current || !canvas) return;

    const init = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      if (width === 0 || height === 0) {
        setTimeout(init, 50);
        return;
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf7f7f7);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 10, 7.5);
      scene.add(dir);

      textureRef.current = new THREE.CanvasTexture(canvas.getElement());

      const loader = new OBJLoader();
      const objectRoot = new THREE.Group();
      scene.add(objectRoot);
      objectRef.current = objectRoot;

      loader.load(
        modelUrl,
        (obj) => {
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: textureRef.current,
                transparent: true,
              });
              child.material.needsUpdate = true;
            }
          });

          objectRoot.add(obj);

          const box = new THREE.Box3().setFromObject(objectRoot);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const center = box.getCenter(new THREE.Vector3());
          objectRoot.position.x -= center.x;
          objectRoot.position.y -= center.y;
          objectRoot.position.z -= center.z;

          // Fit model fully in view
          const fov = camera.fov * (Math.PI / 180);
          const desiredDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.1;
          camera.position.set(0, 0, desiredDistance);
          camera.lookAt(0, 0, 0);

          // Controls
          import("three/examples/jsm/controls/OrbitControls").then(({ OrbitControls }) => {
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = desiredDistance * 0.8;
            controls.maxDistance = desiredDistance * 1.5;
            controlsRef.current = controls;
          });
        },
        undefined,
        (err) => console.error("OBJ load error:", err)
      );

      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        if (objectRoot) objectRoot.rotation.y += 0.005;
        if (controlsRef.current) controlsRef.current.update();
        if (textureRef.current) textureRef.current.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        if (controlsRef.current) controlsRef.current.dispose();
        renderer.dispose();
        if (mountRef.current && mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      };
    };

    init();
  }, [modelUrl, canvas]);

  return <div ref={mountRef} className="w-100 h-100" />;
};

export default Designer;
