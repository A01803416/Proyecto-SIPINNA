import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Componente secundario para dibujar la capa de calor de Leaflet
/**
 * Crea la capa de calor a partir de las coordenadas y la mantiene sincronizada
 * con el mapa; la elimina cuando cambian los puntos o se desmonta el componente.
 * @param {{ puntos: Array<{ latitud: number|string, longitud: number|string }> }} props
 * @returns {null} No renderiza elementos React directamente.
 */
function CapaHeatmap({ puntos }) {
    const map = useMap();

    useEffect(() => {
    if (!map || !puntos) return;

    // Convertir datos al formato [latitud, longitud, intensidad]
    const heatArray = puntos.map(p => [
        parseFloat(p.latitud),
        parseFloat(p.longitud),
        0.5 // Intensidad de 0.5 para que un punto aislado se registre en el primer color
    ]);

    // Crear capa de calor
    const heatLayer = L.heatLayer(heatArray, {
        radius: 35,        // Tamaño del punto ajustado para que el traslape sea dinámico con el zoom
        blur: 15,          // Difuminado de los bordes
        maxZoom: 14,       // Nivel de zoom donde los puntos alcanzan su máxima separación
        max: 1.0,          // Umbral máximo de suma de intensidades
        minOpacity: 0.5,   // Opacidad base para que el azul sea visible
        gradient: {        // de amarillo a rojo segun que tanto se enciman las manchas
            0.5: '#ffd000',  // amarillo: un reporte solo y las orillas de cualquier mancha
            0.75: '#ff7a00', // naranja: dos reportes cercanos con sus manchas encimadas
            1.0: '#e00000'   // rojo: unos cuatro reportes cercanos, con tres ya se ve casi rojo
        }
    }).addTo(map);

    return () => {
        map.removeLayer(heatLayer);
    };
    }, [map, puntos]);

    return null;
}

// Componente principal del Mapa
/**
 * Renderiza un mapa de OpenStreetMap con una capa de calor para los puntos
 * recibidos y permite configurar las coordenadas del centro.
 * @param {Object} props
 * @param {Array<{ latitud: number|string, longitud: number|string }>} [props.puntos=[]] Coordenadas que se representan en la capa de calor.
 * @param {[number, number]} [props.centro=[19.5583, -99.252]] Latitud y longitud iniciales del mapa.
 * @returns {import('react').JSX.Element} Mapa interactivo con la capa de calor.
 */
export default function MapaCalor({ puntos = [], centro = [19.5583, -99.252] }) {
    return (
    <MapContainer
        center={centro}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CapaHeatmap puntos={puntos} />
    </MapContainer>
    );
}