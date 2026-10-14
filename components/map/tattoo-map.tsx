"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const tattooStudio = {
	lat: 13.825794709472175,
	lng: 100.53729420951697,
};

const markerIcon = L.icon({
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

export function TattooMap() {
	return (
		<MapContainer
			center={[tattooStudio.lat, tattooStudio.lng]}
			zoom={15}
			scrollWheelZoom={false}
			className="h-[100%] w-full rounded-2xl"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			<Marker position={[tattooStudio.lat, tattooStudio.lng]} icon={markerIcon}>
				<Popup>
					<strong>Praew Tattoo Studio</strong>
					<br />
					Bangkok, Thailand
				</Popup>
			</Marker>
		</MapContainer>
	);
}
