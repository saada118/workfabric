import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CMS from "./pages/CMS";
import Designer from "./pages/Designer";

function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cms" element={<CMS />} />
          <Route path="/designer/:id" element={<Designer />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
