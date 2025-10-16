import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

export default function Map({
  apiKey,
  locations = [],
  userLocation = null,
  onLocation,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Set MapTiler API key
    const keyToUse = apiKey || "";
    if (!keyToUse) {
      maptilersdk.config.apiKey = "GET_YOUR_OWN_API_KEY_AT_MAPTILER_COM";
    } else {
      maptilersdk.config.apiKey = keyToUse;
    }

    // Initialize map
    try {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS.DARK,
        center: [106.8456, -6.2088],
        zoom: 25,
      });
    } catch {
      return;
    }

    // Try to get customer's current position (works on HTTPS or localhost)
    // If userLocation is provided, use it instead
    if (userLocation) {
      const { lat, lng } = userLocation;

      // add or update user marker
      if (userMarker.current) userMarker.current.remove();
      userMarker.current = new maptilersdk.Marker({ color: "#00b894" })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // center map on user
      map.current.flyTo({ center: [lng, lat], zoom: 13 });

      // callback to parent with coords
      if (typeof onLocation === "function") {
        onLocation({ lat, lng });
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // add or update user marker
          if (userMarker.current) userMarker.current.remove();
          userMarker.current = new maptilersdk.Marker({ color: "#00b894" })
            .setLngLat([lng, lat])
            .addTo(map.current);

          // center map on user
          map.current.flyTo({ center: [lng, lat], zoom: 13 });

          // callback to parent with coords
          if (typeof onLocation === "function") {
            onLocation({ lat, lng });
          }
        },
        () => {
          // Geolocation error - fail silently
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }

    return () => {
      // cleanup map on unmount
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, [apiKey, onLocation, userLocation]);

  // Manage location markers when `locations` changes
  useEffect(() => {
    if (!map.current) return;

    // remove existing non-user markers
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch {
        // ignore marker remove errors
      }
    });
    markersRef.current = [];

    const addMarker = (lng, lat, color = "#ef4444", popupContent = null) => {
      const marker = new maptilersdk.Marker({ color }).setLngLat([lng, lat]);

      // Add popup if content provided
      if (popupContent) {
        const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
          popupContent
        );
        marker.setPopup(popup);
      }

      marker.addTo(map.current);
      markersRef.current.push(marker);
    };

    if (locations.length > 0) {
      locations.forEach((location) => {
        // Create popup content for seller
        const popupHTML = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
              ☕ ${location.name || "Penjual Kopi"}
            </h3>
            <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">
              ${location.email || ""}
            </p>
            ${
              location.distance !== undefined
                ? `
              <p style="margin: 4px 0; font-size: 14px; font-weight: 600; color: #10b981;">
                📍 ${
                  location.distance < 1
                    ? `${Math.round(location.distance * 1000)}m`
                    : `${location.distance.toFixed(1)}km`
                }
              </p>
            `
                : ""
            }
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
              Klik marker untuk info lebih lanjut
            </p>
          </div>
        `;

        addMarker(location.lng, location.lat, "#ef4444", popupHTML);
      });
    }
  }, [locations]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-3xl overflow-hidden"
      style={{ minHeight: "500px" }}
    />
  );
}
