import { Link } from "react-router-dom";
import "./NavigationBar.css";

export function NavigationBar() {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">🍲 Receta Gatimi</Link>
            <Link to="/recipes" className="navbar-link">Recipes</Link>
            <Link to="/categories" className="navbar-link">Categories</Link>
            
            <div className="navbar-actions">
                {isAuthenticated ? (
                    <Link to="/profile" className="navbar-link">My Profile</Link>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link">Log in</Link>
                        <Link to="/signup" className="navbar-link">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}