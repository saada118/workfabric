import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const linkClasses = (path) =>
    `nav-link ${location.pathname === path ? "active" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          🧩 WorkFabric
        </Link>
        <div className="collapse navbar-collapse">
          <div className="navbar-nav ms-auto">
            <Link to="/" className={linkClasses("/")}>
              Home
            </Link>
            <Link to="/cms" className={linkClasses("/cms")}>
              CMS
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
