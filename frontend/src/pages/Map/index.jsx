import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Spin } from 'antd';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import api from '../../services/api';
import ArtworkCard from '../../common/ArtworkCard';
import AppSider from '../../common/AppSider';

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

const ArtworkMap = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState(defaultCenter);
    const [openInfoWindows, setOpenInfoWindows] = useState({});

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyBdMx5mw7syNkmrDG_2lTfkLyZP_Dqdvr4',
    });

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await api.get('/artwork');
                const validArtworks = response.data.filter(a => a.latitude && a.longitude);
                setArtworks(validArtworks);
                // compute average center
                if (validArtworks.length > 0) {
                    const latSum = validArtworks.reduce((sum, artwork) => sum + artwork.latitude, 0);
                    const lngSum = validArtworks.reduce((sum, artwork) => sum + artwork.longitude, 0);
                    const latAvg = latSum / validArtworks.length;
                    const lngAvg = lngSum / validArtworks.length;
                    setCenter({
                        lat: latAvg,
                        lng: lngAvg,
                    });
                }
            } catch (error) {
                console.error('Error fetching artworks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtworks();
    }, []);

    const handleMarkerClick = (artworkId) => {
        setOpenInfoWindows(prev => ({ ...prev, [artworkId]: true }));
    };

    const handleCloseClick = (artworkId) => {
        setOpenInfoWindows(prev => ({ ...prev, [artworkId]: false }));
    };

    const onMapClick = useCallback(() => {
        setOpenInfoWindows({});
    }, []);

    if (loading || !isLoaded) {
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
    return (
        <Layout>
            <AppSider />
            <Content>
                <ArtworkMap />
            </Content>
        </Layout>
    );
};

export default MapPage;