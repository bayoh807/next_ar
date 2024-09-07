"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker as GoogleMapMarker } from '@react-google-maps/api'

const containerStyle = {
  width: "100vw",
  height: "100vh"
};

const defaultCenter = {
  lat: 25.0330,
  lng: 121.5654
};

const libraries: ("places")[] = ["places"];

interface ParkingSpot {
  parkId: string;
  parkName: string;
  servicetime: string;
  address: string | null;
  tel: string | null;
  payex: string; //$
  carTicketPrice: string | null;
  lon: number;
  lat: number;
  carTotalNum: number;
  carRemainderNum: number;
  motorTotalNum: number;
  motorRemainderNum: number;

  busTotalNum: number;
  busRemainderNum: number;
  largeMotorTotalNum: number;
  bikeTotalNum: number;
  pregnancy_First: number;
  handicap_First: number;
  chargeStationTotalNum: number;
  chargeStation: number;

  fullRateLevel: number;

  entrance: null;
  industryId: null;
  infoType: number;
  pointMapInfo: string;

  remark: string;
  wkt: string;
  dataType: null;
  cellShareTotalNum: number;
  cellSegAvail: number;
}

function MapClient({ apiKey }: { apiKey: string }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  })

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car'>('car');
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastFetchedLocation, setLastFetchedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchParkingData = useCallback(async (location: google.maps.LatLngLiteral) => {
    // 检查是否需要获取新数据
    if (!lastFetchedLocation || 
        location.lat !== lastFetchedLocation.lat || 
        location.lng !== lastFetchedLocation.lng) {
      try {
        const response = await fetch('/api/parkingData', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lon: location.lng,
            lat: location.lat,
          }),
        });

        // console.log('Fetch response status:', response.status);
        const data = await response.json();
        // console.log('Received parking data:', data);
        setParkingSpots(data);
        setLastFetchedLocation(location);
      } catch (error) {
        console.error("Error fetching parking data:", error);
      }
    }
  }, [lastFetchedLocation]);

  const handlePlaceSelect = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        console.log('Selected location:', place.name, newCenter);

        setCurrentLocation(newCenter);
        setLastFetchedLocation(newCenter);
        
        if (map) {
          map.setCenter(newCenter);
          map.setZoom(15);
        }

        fetchParkingData(newCenter);
      } else {
        console.error('Place has no geometry');
        alert('無法獲取該地點的位置資訊，請嘗試其他搜尋關鍵字。');
      }
    }
  }, [autocomplete, map, fetchParkingData]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(defaultCenter);
    map.fitBounds(bounds);
    setMap(map);

    if (inputRef.current) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode']
      });
      setAutocomplete(autocompleteInstance);

      autocompleteInstance.addListener('place_changed', handlePlaceSelect);
    }
  }, [handlePlaceSelect]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);


  const handleLocationError = useCallback((browserHasGeolocation: boolean) => {
    console.warn(browserHasGeolocation ?
                  "Error: The Geolocation service failed." :
                  "Error: Your browser doesn't support geolocation.");
    fetchParkingData(defaultCenter);
  }, [fetchParkingData]);
  

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(pos);
          if (map) {
            map.setCenter(pos);
            map.setZoom(15);
          }
          fetchParkingData(pos);
        },
        () => {
          handleLocationError(true);
        }
      );
    } else {
      handleLocationError(false);
    }
  }, [fetchParkingData, handleLocationError, map]);
  

  const handleSearch = useCallback(() => {
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      if (autocomplete) {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          handlePlaceSelect();
        } else {
          // 如果使用者直接使用搜尋
          const service = new google.maps.places.PlacesService(map!);
          service.textSearch({
            query: inputRef.current.value,
            location: map?.getCenter(),
            radius: 50000 // 搜尋半徑，單位為公尺
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
              const location = results[0].geometry?.location;
              if (location) {
                const newCenter = { lat: location.lat(), lng: location.lng() };
                console.log('Search result:', results[0].name, newCenter);

                setCurrentLocation(newCenter);
                setLastFetchedLocation(newCenter);
                
                if (map) {
                  map.setCenter(newCenter);
                  map.setZoom(15);
                }

                fetchParkingData(newCenter);
              }
            } else {
              console.error('Place search was not successful');
              alert('找不到該地點，請嘗試其他搜尋關鍵字。');
            }
          });
        }
      }
    } else {
      alert('請輸入搜尋關鍵字。');
    }
  }, [autocomplete, map, fetchParkingData, handlePlaceSelect]);

  useEffect(() => {
    if (isInitialLoad) {
      getCurrentLocation();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, getCurrentLocation]);

useEffect(() => {
  if (map && currentLocation) {
    map.setCenter(currentLocation);
    map.setZoom(15);
  }
}, [map, currentLocation]);

  interface CustomMarkerProps {
    spot: ParkingSpot;
    vehicleType: 'car' | 'motorcycle';
    onMarkerClick: (spot: ParkingSpot) => void;
  }
  
  const CustomMarker: React.FC<CustomMarkerProps> = ({ spot, vehicleType, onMarkerClick }) => {
    const remainderNum = vehicleType === 'car' ? spot.carRemainderNum : spot.motorRemainderNum;
    
    // console.log(`${spot.parkName} 的標記:`, { vehicleType, remainderNum, spot });
  
    // 只在有可用車位時渲染標記
    if (remainderNum > 0) {
      return (
        <GoogleMapMarker
          position={{ lat: spot.lat, lng: spot.lon }}
          onClick={() => onMarkerClick(spot)}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#5AB4C5" />
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12">${remainderNum}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }}
        />
      );
    }
  
    return null;
  };

  const InfoPanel = ({ spot }: { spot: ParkingSpot | null }) => {
    if (!spot) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white text-black p-4 shadow-md transition-all duration-300 transform translate-y-0">
        <h2 className="text-lg font-bold">{spot.parkName}</h2>
        <p className="text-sm">開放時間: {spot.servicetime}</p>
        <div className="flex justify-between mt-2">
          <p>尚有車位: {vehicleType === 'car' ? spot.carRemainderNum : spot.motorRemainderNum}</p>
          <p>收費標準: {spot.payex}</p>
        </div>
      </div>
    );
  };

  const uniqueParkingSpots = useMemo(() => {
    const uniqueSpots = new Map();
    parkingSpots.forEach(spot => {
      if (!uniqueSpots.has(spot.parkId)) {
        uniqueSpots.set(spot.parkId, spot);
      }
    });
    return Array.from(uniqueSpots.values());
  }, [parkingSpots]);

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="relative w-screen h-screen">
      {/* 標題欄 */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 flex justify-between items-center z-10 shadow-md">
        <div className="w-10"></div>
        <h1 className="text-lg  text-black">猿來有車位</h1>
        <button 
          className="w-7 h-7 bg-black rounded-sm flex items-center justify-center transition-transform duration-300 active:bg-white active:text-black"
          aria-label="關閉"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <line strokeWidth={1} x1="18" y1="6" x2="6" y2="18"></line>
            <line strokeWidth={1}  x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 搜尋框 */}
      <div className="absolute top-[80px] left-4 right-4 z-10">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="請輸入地點"
            className="w-full p-3 pr-12 rounded-xl border text-black bg-white shadow-md"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="absolute right-0 top-0 bottom-0 bg-[#5AB4C5] hover:bg-[#4A9FB0] text-white px-[13px] rounded-lg transition-colors duration-200"
            aria-label="搜尋"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 車輛類型切換按鈕 */}
      <div className="absolute right-4 top-[150px] z-10">
        <div className="bg-white rounded-2xl shadow-md p-1 flex flex-col">
          <button
            className={`p-2 w-10 h-10 rounded-full transition-colors duration-300 ${
              vehicleType === 'motorcycle' ? 'bg-[#5AB4C5] text-white' : 'text-[#5AB4C5]'
            }`}
            onClick={() => setVehicleType('motorcycle')}
            aria-label="摩托車模式"
          >
            {icon_motor}
          </button>
          <button
            className={`p-2 w-10 h-10 rounded-full transition-colors duration-300 ${
              vehicleType === 'car' ? 'bg-[#5AB4C5] text-white' : 'text-[#5AB4C5]'
            }`}
            onClick={() => setVehicleType('car')}
            aria-label="汽車模式"
          >
            {icon_car}
          </button>
        </div>
      </div>

      {/* 定位按鈕 */}
      <div className="absolute left-4 top-[140px] z-10">
        <button
          onClick={getCurrentLocation}
          className="bg-white p-2 rounded-full shadow-md text-[#5AB4C5]"
          aria-label="獲取當前位置"
        >
          {icon_earth}
        </button>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {uniqueParkingSpots.map((spot) => (
          <CustomMarker
            key={spot.parkId}
            spot={spot}
            vehicleType={vehicleType}
            onMarkerClick={setSelectedSpot}
          />
        ))}
        {currentLocation && (
          <GoogleMapMarker
            position={currentLocation}
            icon={{
              url: '/Motorbike.svg',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        )}
      </GoogleMap>

      <InfoPanel spot={selectedSpot} />
    </div>
  )
}

export default MapClient

const icon_motor =(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" fill="currentColor" className="w-full h-full">
    <path d="M8.3384 0C8.69911 0 9.05999 0 9.4207 0C9.74568 0.037092 10.0715 0.0680586 10.3955 0.112467C12.6346 0.419582 14.5768 1.35369 16.2121 2.90883C18.1086 4.71255 19.22 6.94351 19.7323 9.49044C19.7688 9.67232 19.8115 9.86085 19.8005 10.0431C19.7765 10.4339 19.4573 10.7284 19.0801 10.7456C18.6753 10.7642 18.3437 10.5031 18.2734 10.0939C18.0461 8.77072 17.634 7.51248 16.9747 6.33864C16.9197 6.24098 16.8667 6.185 16.7406 6.18534C14.6212 6.18976 12.5017 6.18126 10.3824 6.19146C9.21074 6.19708 8.20772 7.13595 8.11006 8.28495C8.00661 9.50167 8.79762 10.5676 9.99171 10.7825C11.4163 11.0389 12.8451 11.2729 14.2723 11.5159C15.9276 11.7978 17.5837 12.0767 19.2383 12.3625C19.6882 12.4403 19.9528 12.8071 19.8849 13.2611C19.8071 13.7824 19.7295 14.3052 19.6172 14.8198C19.1221 17.0909 16.9386 18.3905 14.7012 17.7585C10.7904 16.6539 6.87633 15.5614 2.96993 14.4415C1.4837 14.0155 0.562016 13.0132 0.209813 11.5031C0.154856 11.2674 0.138692 11.0229 0.104492 10.7825C0.104492 10.2285 0.104492 9.67471 0.104492 9.12071C0.116232 9.03887 0.133757 8.95754 0.138692 8.87536C0.20641 7.7335 0.389488 6.6119 0.766022 5.52976C1.85581 2.4006 4.02739 0.572543 7.32466 0.112297C7.66121 0.0653363 8.00048 0.0369218 8.3384 0ZM18.2455 13.7655C18.1725 13.7485 18.123 13.7341 18.0727 13.7256C17.3494 13.6041 16.6257 13.485 15.9028 13.3625C13.8666 13.0174 11.831 12.6691 9.79451 12.3259C7.50144 11.9395 6.06422 9.65633 6.71213 7.42316C7.1865 5.78805 8.69468 4.65011 10.4128 4.64398C12.1197 4.63786 13.8268 4.64262 15.5339 4.64262C15.5992 4.64262 15.6647 4.64262 15.7301 4.64262C15.7461 4.61455 15.7619 4.58647 15.7779 4.5584C15.6263 4.42875 15.474 4.29994 15.3233 4.1691C15.0366 3.92018 14.7647 3.65169 14.4625 3.42335C12.3816 1.85154 10.0341 1.30315 7.46895 1.65621C4.8412 2.01777 3.10945 3.4863 2.24562 5.97946C1.69979 7.55451 1.58307 9.18724 1.68039 10.8387C1.74164 11.8762 2.37697 12.6557 3.37233 12.9507C3.89008 13.1042 4.41107 13.2468 4.93087 13.3936C8.34027 14.3563 11.7492 15.321 15.1596 16.2798C16.0387 16.5268 16.8168 16.3237 17.4734 15.6909C18.0128 15.1713 18.1407 14.481 18.2454 13.7655H18.2455Z" />
    <path d="M10.4229 9.27861C9.99239 9.2798 9.65141 8.94121 9.65039 8.51176C9.64937 8.08452 9.99324 7.73657 10.4179 7.73487C10.8387 7.73317 11.1933 8.08554 11.1948 8.50665C11.1962 8.93202 10.8509 9.27759 10.423 9.27861H10.4229Z" fill="#5AB4C5"/>
  </svg>
)

const icon_car = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
)

const icon_earth = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 01-1.384-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.279-2.132z" clipRule="evenodd" />
</svg>
)