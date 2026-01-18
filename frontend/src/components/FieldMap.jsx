import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';

// Fix for Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: icon,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

// Custom Draw Control Component
function DrawControl({ onCreated }) {
    const map = useMap();
    const drawControlRef = useRef(null);

    useEffect(() => {
        // Initialize FeatureGroup to store drawn items
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialize Draw Control
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
                remove: true,
                edit: false // disable editing for simplicity, can enable later
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                },
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
            },
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // Event listener for cleanup/saving
        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            drawnItems.clearLayers(); // Only allow one field at a time for this MVP
            drawnItems.addLayer(layer);

            const geoJSON = layer.toGeoJSON();
            onCreated(geoJSON);
        });

        return () => {
            map.removeControl(drawControl);
            map.off(L.Draw.Event.CREATED);
            map.removeLayer(drawnItems);
        };
    }, [map, onCreated]);

    return null;
}

export default function FieldMap({ onFieldCreated, fields = [] }) {
    return (
        <div className="h-[500px] w-full border rounded-lg overflow-hidden shadow-inner">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render existing fields safely */}
                {fields.map((field) => {
                    let boundary = field.boundary;
                    // Defensive coding: parse if string (should be object from API, but just in case)
                    if (typeof boundary === 'string') {
                        try {
                            boundary = JSON.parse(boundary);
                        } catch (e) {
                            console.error("Invalid GeoJSON for field", field.id, e);
                            return null;
                        }
                    }

                    if (!boundary || !boundary.coordinates) return null;

                    return (
                        <GeoJSON
                            key={field.id}
                            data={boundary}
                            style={{ color: 'blue', weight: 2, fillOpacity: 0.1 }}
                        />
                    );
                })}

                {/* Add the custom Draw Control */}
                <DrawControl onCreated={onFieldCreated} />

            </MapContainer>
        </div>
    );
}
