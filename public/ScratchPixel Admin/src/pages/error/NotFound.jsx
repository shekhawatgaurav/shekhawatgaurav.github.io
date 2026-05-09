import { Link } from "react-router-dom";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <div className="empty-page">
      <div className="empty-card">
        <h1>404</h1>
        <p>Page not found. The page may have been moved or deleted.</p>

        <Link to="/" className="primary-button">
          <Home size={18} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;