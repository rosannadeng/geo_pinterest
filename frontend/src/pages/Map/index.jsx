import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Layout, Spin } from 'antd';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import api from '../../services/api';
import ArtworkCard from '../../common/ArtworkCard';
import AppSider from '../../common/AppSider';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';

const { Content } = Layout;

const containerStyle = {
    width: '100%',
    height: '90vh',
};

// Center of the USA
const defaultCenter = {
    lat: 39.8283,
    lng: -98.5795,
};

const toRadians = (deg) => deg * (Math.PI / 180);

const toDegrees = (rad) => rad * (180 / Math.PI);

const latLngToXYZ = (lat, lng) => {
    const latRad = toRadians(lat);
    const lngRad = toRadians(lng);
    return {
        x: Math.cos(latRad) * Math.cos(lngRad),
        y: Math.cos(latRad) * Math.sin(lngRad),
        z: Math.sin(latRad),
    };
};

const xyzToLatLng = ({ x, y, z }) => {
    const hyp = Math.sqrt(x * x + y * y);
    const lat = toDegrees(Math.atan2(z, hyp));
    const lng = toDegrees(Math.atan2(y, x));
    return { lat, lng };
};

const averageLatLng = (points) => {
    const xyzPoints = points.map(({ lat, lng }) => latLngToXYZ(lat, lng));
    const avgX = xyzPoints.reduce((sum, { x }) => sum + x, 0) / points.length;
    const avgY = xyzPoints.reduce((sum, { y }) => sum + y, 0) / points.length;
    const avgZ = xyzPoints.reduce((sum, { z }) => sum + z, 0) / points.length;

    return xyzToLatLng({ x: avgX, y: avgY, z: avgZ });
}

const ArtworkMap = ({ center, artworks }) => {
    const [openInfoWindows, setOpenInfoWindows] = useState({});

    const { isLoaded } = useGoogleMaps();

    const handleMarkerClick = (artworkId) => {
        setOpenInfoWindows(prev => ({ ...prev, [artworkId]: true }));
    };

    const handleCloseClick = (artworkId) => {
        setOpenInfoWindows(prev => ({ ...prev, [artworkId]: false }));
    };

    const onMapClick = useCallback(() => {
        setOpenInfoWindows({});
    }, []);

    if (!isLoaded) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }} />;
    }

    return (
        <div className="map-container">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={4}
                onClick={onMapClick}
            >
                {artworks.map((artwork) => (
                    <React.Fragment key={artwork.id}>
                        <Marker
                            position={{ lat: artwork.latitude, lng: artwork.longitude }}
                            onClick={() => handleMarkerClick(artwork.id)}
                        />
                        {openInfoWindows[artwork.id] && (
                            <InfoWindow
                                position={{ lat: artwork.latitude, lng: artwork.longitude }}
                                onCloseClick={() => handleCloseClick(artwork.id)}
                            >
                                <div style={{ maxWidth: 250 }}>
                                    <ArtworkCard artwork={artwork} />
                                </div>
                            </InfoWindow>
                        )}
                    </React.Fragment>
                ))}
            </GoogleMap>
        </div>
    );
};

const MapPage = () => {
    const [center, setCenter] = useState(defaultCenter);
    const [artworks, setArtworks] = useState([]);
    const inputRef = useRef(null);
    const { isLoaded } = useGoogleMaps();

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await api.get('/artwork');
                const validArtworks = response.data.filter(a => a.latitude && a.longitude);
                setArtworks(validArtworks);
                console.log('Valid Artworks:', validArtworks);
                // compute average center
                if (validArtworks.length > 0) {
                    const latLngPoints = validArtworks.map(a => ({
                        lat: a.latitude,
                        lng: a.longitude,
                    }));
                    const avgCenter = averageLatLng(latLngPoints);
                    setCenter(avgCenter);
                }
            } catch (error) {
                console.error('Error fetching artworks:', error);
            }
        };

        fetchArtworks();
    }, []);

    useEffect(() => {
        if (isLoaded && inputRef.current) {
            const searchBox = new window.google.maps.places.SearchBox(inputRef.current);
            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();
                if (places.length === 0) return;
                const place = places[0];
                if (!place.geometry?.location) return;

                setCenter({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            });

            return () => {
                window.google.maps.event.clearInstanceListeners(searchBox);
            };
        }
    }, [isLoaded]);

    return (
        <Layout>
            <AppSider 
                artworks={artworks} 
                setMapCenter={setCenter} 
                center={center}
            />
            <Content>
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    margin: '10px auto',
                    width: '600px'
                }}>
                    <input
                        ref={inputRef}
                        placeholder="Where to explore?"
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                </div>
                <ArtworkMap center={center} artworks={artworks} />
            </Content>
        </Layout>
    );
};

export default MapPage;