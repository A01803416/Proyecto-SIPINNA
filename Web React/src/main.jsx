/**
 * @file Punto de entrada de la interfaz React.
 * Carga los estilos globales e inicia la aplicación dentro del elemento DOM
 * con id `root`, usando `StrictMode` durante el desarrollo.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
