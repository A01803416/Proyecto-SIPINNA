import './Navbar.css';

export const Navbar = () => {
    return (
    <header className="navbar">
      {/* Grupo izquierdo: Logo y ¿Quiénes Somos? */}
        <div className="nav-left">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo">RIETI</span>
        </a>
        <a href="/quienes-somos" className="btn-nav">
            ¿Quiénes Somos?
        </a>
        </div>

      {/* Grupo derecho: Procurador y Admin */}
        <div className="nav-right">
        <a href="/login-procurador" className="btn-login">
            Procurador
        </a>
        <a href="/login-admin" className="btn-login">
            Admin
        </a>
        </div>
    </header>
    );
};