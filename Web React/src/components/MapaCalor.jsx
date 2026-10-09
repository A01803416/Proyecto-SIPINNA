import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Componente secundario para dibujar la capa de calor de Leaflet
function CapaHeatmap({ puntos }) {
    const map = useMap();

    useEffect(() => {
    if (!map || !puntos) return;

    // Convertir datos al formato [latitud, longitud, intensidad]
    const heatArray = puntos.map(p => [
        parseFloat(p.latitud),
        parseFloat(p.longitud),
        1.0 // Subimos la intensidad de cada punto a 1.0 (máximo)
    ]);

    // Crear capa de calor
    const heatLayer = L.heatLayer(heatArray, {
        radius: 35,       
        blur: 10,         
        maxZoom: 13,      
        max: 1.0,         
        minOpacity: 0.4   
    }).addTo(map);

    return () => {
        map.removeLayer(heatLayer);
    };
    }, [map, puntos]);

    return null;
}

// Componente principal del Mapa
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