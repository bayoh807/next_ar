"use client"

import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker as GoogleMapMarker } from '@react-google-maps/api'

const containerStyle = {
  width: "100%",
  height: "400px"
};

const center = {
  lat: 25.0330,
  lng: 121.5654
};

const libraries: ("places")[] = ["places"];

interface Marker {
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  name: string;
}

function MapClient({ apiKey }: { apiKey: string }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  })

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleSearch = () => {
    if (map && inputRef.current) {
      const service = new google.maps.places.PlacesService(map);
      const request = {
        query: inputRef.current.value,
        fields: ['name', 'geometry'],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setMarkers(results.filter(place => place.geometry && place.geometry.location).map(place => ({
            position: place.geometry!.location!,
            name: place.name || 'Unknown Place',
          })));
          
          if (results[0]?.geometry?.location) {
            map.setCenter(results[0].geometry.location);
          }
        }
      });
    }
  }

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div>
      <div>
        <input ref={inputRef} type="text" placeholder="搜索地點" />
        <button onClick={handleSearch}>搜索</button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center as google.maps.LatLngLiteral}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {markers.map((marker, index) => (
          <GoogleMapMarker
            key={index}
            position={marker.position}
            title={marker.name}
            icon={{
              url: '/custom-marker.gif',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        ))}
      </GoogleMap>
    </div>
  )
}

export default MapClient