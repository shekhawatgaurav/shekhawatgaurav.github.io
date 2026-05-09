import { Link } from "react-router-dom";
import { Home, ShieldAlert } from "lucide-react";

function Unauthorized() {
  return (
    <div className="empty-page">
      <div className="empty-card">
        <ShieldAlert size={48} />
        <h1>Unauthorized</h1>
        <p>You do not have permission to view this page.</p>

        <Link to="/" className="primary-button">
          <Home size={18} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;