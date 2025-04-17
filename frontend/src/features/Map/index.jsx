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

// calculate distance between two points, using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius of the earth (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

    // save map instance reference
    const onLoad = useCallback((map) => {
        setMap(map);
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
                        onZoomChanged(map.getZoom());
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

    const handleSetCenter = (newCenter) => {
        setCenter(newCenter);
        setZoom(10);
        setUserZoom(null); // reset user zoom state
    };

    const handleZoomChanged = (newZoom) => {
        setUserZoom(newZoom);
    };

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await api.get('/artwork');
                const validArtworks = response.data.filter(a => a.latitude && a.longitude);
                
                // if navigated from artwork detail page, sort artworks by distance to center artwork
                if (location.state?.from === 'artwork_detail') {
                    const centerArtwork = validArtworks.find(
                        a => a.latitude === location.state.artwork.latitude && 
                            a.longitude === location.state.artwork.longitude
                    );

                    const otherArtworks = validArtworks
                        .filter(a => a.id !== centerArtwork?.id)
                        .sort((a, b) => {
                            const distanceA = calculateDistance(
                                centerArtwork.latitude,
                                centerArtwork.longitude,
                                a.latitude,
                                a.longitude
                            );
                            const distanceB = calculateDistance(
                                centerArtwork.latitude,
                                centerArtwork.longitude,
                                b.latitude,
                                b.longitude
                            );
                            return distanceA - distanceB;
                        });

                    setSortedArtworks([centerArtwork, ...otherArtworks]);
                    setCenter({
                        lat: centerArtwork.latitude,
                        lng: centerArtwork.longitude
                    });
                    setZoom(10);
                } else {
                    // if not navigated from artwork detail page, sort artworks by upload date to show the newest artworks first
                    setSortedArtworks(
                        [...validArtworks].sort((a, b) => 
                            new Date(b.upload_date) - new Date(a.upload_date)
                        )
                    );
                    if (validArtworks.length > 0) {
                        const latLngPoints = validArtworks.map(a => ({
                            lat: a.latitude,
                            lng: a.longitude,
                        }));
                        setCenter(averageLatLng(latLngPoints));
                    }
                    setZoom(4);
                }
                
                setArtworks(validArtworks);
            } catch (error) {
                console.error('Error fetching artworks:', error);
            }
        };

        fetchArtworks();
    }, [location]);

    return (
        <Layout>
            <AppSider 
                artworks={sortedArtworks} 
                setMapCenter={handleSetCenter}
                center={center}
            />
            <Content>
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