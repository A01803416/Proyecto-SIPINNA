import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Reporte } from './pages/Reporte';
import { QuienesSomos } from './pages/QuienesSomos';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import './App.css';

// Componente que junta la vista de Inicio
function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/login-admin" element={<Login role="admin" />} />
          <Route path="/login-procurador" element={<Login role="procurador" />} />
          <Route path="/admin" element={<Dashboard role="admin" />} />
          <Route path="/procurador" element={<Dashboard role="procurador" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;