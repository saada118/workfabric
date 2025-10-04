import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Designer from "./pages/Designer";
import CMS from "./pages/CMS";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/designer/:productId" element={<Designer />} />
      <Route path="/cms" element={<CMS />} />
    </Routes>
  );
}

export default App;
