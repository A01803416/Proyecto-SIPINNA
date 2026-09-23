export default function Navbar()
{
return (
    <header className="navbar">
    <div className="nav-left">
        <span className="logo">RIETI</span>
    </div>
    <nav className="nav-links">
        <button className="btn-animated">Iniciar Reporte</button>
        <button className="btn-animated">¿Quiénes Somos?</button>
        <button className="btn-animated">Iniciar Sesión</button>
    </nav>
    </header>
);
}