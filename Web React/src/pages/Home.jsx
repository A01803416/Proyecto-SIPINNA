import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

/**
 * Compone la página de inicio con la navegación, el contenido principal y el pie.
 * @returns {import('react').JSX.Element} Estructura completa de la página inicial.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}
