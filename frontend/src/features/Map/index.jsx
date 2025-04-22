import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Layout, Spin } from 'antd';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import api from '../../services/api';
import ArtworkCard from '../../common/ArtworkCard';
import AppSider from '../../common/AppSider';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';
import { useLocation } from 'react-router-dom';

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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius of the earth (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ArtworkMap = ({ center, artworks, zoom, onZoomChanged }) => {
    const [map, setMap] = useState(null);
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

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    // listen to zoom prop changes
    useEffect(() => {
        if (map) {
            map.setZoom(zoom);
        }
    }, [zoom, map]);

    if (!isLoaded) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }} />;
    }

    return (
        <div className="map-container">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onClick={onMapClick}
                onLoad={onLoad}
                onZoomChanged={() => {
                    if (map && onZoomChanged) {
                        const bounds = map.getBounds();
                        const zoom = map.getZoom();
                        onZoomChanged(zoom, bounds);
                    }
                }}
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
    const [sortedArtworks, setSortedArtworks] = useState([]);
    const [zoom, setZoom] = useState(4);
    const [userZoom, setUserZoom] = useState(null);
    const location = useLocation();
    const inputRef = useRef(null);
    const { isLoaded } = useGoogleMaps();

    const handleSetCenter = (newCenter, zoomLevel) => {
        setCenter(newCenter);
        setUserZoom(zoomLevel);
    };

    const handleZoomChanged = (newZoom, bounds) => {
        setUserZoom(newZoom);

        if (bounds && artworks.length > 0) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            const filtered = artworks.filter(art => (
                art.latitude >= sw.lat() &&
                art.latitude <= ne.lat() &&
                art.longitude >= sw.lng() &&
                art.longitude <= ne.lng()
            ));

            const sorted = [...filtered].sort((a, b) =>
                new Date(b.upload_date) - new Date(a.upload_date)
            );

            setSortedArtworks(sorted);
        }
    };

    useEffect(() => {
        if (isLoaded && inputRef.current) {
            const searchBox = new window.google.maps.places.SearchBox(inputRef.current);
            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();
                if (places.length === 0) return;
    
                const place = places[0];
                if (!place.geometry?.location) return;
    
                const placeLat = place.geometry.location.lat();
                const placeLng = place.geometry.location.lng();
    
                handleSetCenter({ lat: placeLat, lng: placeLng }, 8);
    
                // Create artificial bounds with a padding distance (e.g., 50km radius)
                const paddingKm = 50;
                const degreePadding = paddingKm / 111; // approx conversion
    
                const sw = {
                    lat: placeLat - degreePadding,
                    lng: placeLng - degreePadding
                };
                const ne = {
                    lat: placeLat + degreePadding,
                    lng: placeLng + degreePadding
                };
    
                // Filter artworks within bounds
                const filtered = artworks.filter(art => (
                    art.latitude >= sw.lat &&
                    art.latitude <= ne.lat &&
                    art.longitude >= sw.lng &&
                    art.longitude <= ne.lng
                ));
    
                const sorted = [...filtered].sort((a, b) =>
                    new Date(b.upload_date) - new Date(a.upload_date)
                );
    
                setSortedArtworks(sorted);
            });
    
            return () => {
                window.google.maps.event.clearInstanceListeners(searchBox);
            };
        }
    }, [isLoaded, artworks]); 

    useEffect(() => {
        if (isLoaded && inputRef.current) {
            const searchBox = new window.google.maps.places.SearchBox(inputRef.current);
            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();
                if (places.length === 0) return;
                const place = places[0];
                if (!place.geometry?.location) return;

                const placeLat = place.geometry.location.lat();
                const placeLng = place.geometry.location.lng();

                handleSetCenter({ lat: placeLat, lng: placeLng }, 8);

                const updated = artworks.map(art => ({
                    ...art,
                    distance: calculateDistance(placeLat, placeLng, art.latitude, art.longitude)
                }));

                const sorted = updated.sort((a, b) => a.distance - b.distance);
                setSortedArtworks(sorted);
            });

            return () => {
                window.google.maps.event.clearInstanceListeners(searchBox);
            };
        }
    }, [isLoaded]);


    return (
        <Layout>
            <AppSider
                artworks={sortedArtworks}
                setMapCenter={handleSetCenter}
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
                <ArtworkMap
                    center={center}
                    artworks={artworks}
                    zoom={userZoom || zoom}
                    onZoomChanged={handleZoomChanged}
                />
            </Content>
        </Layout>
    );
};

export default MapPage;
