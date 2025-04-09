import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Spin } from 'antd';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import api from '../../services/api';
import ArtworkCard from '../../common/ArtworkCard';

const { Content } = Layout;

const containerStyle = {
    width: '100%',
    height: '90vh',
};

// Center of the USA
var center = {
    lat: 39.8283,
    lng: -98.5795,
};

const ArtworkMap = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
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
                    const avgLat = latSum / validArtworks.length;
                    const avgLng = lngSum / validArtworks.length;
                    center.lat = avgLat;
                    center.lng = avgLng;
                }
            } catch (error) {
                console.error('Error fetching artworks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtworks();
    }, []);

    const onMapClick = useCallback(() => {
        setSelectedArtwork(null);
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
                    <Marker
                        key={artwork.id}
                        position={{ lat: artwork.latitude, lng: artwork.longitude }}
                        onClick={() => setSelectedArtwork(artwork)}
                    />
                ))}

                {selectedArtwork && (
                    <InfoWindow
                        position={{ lat: selectedArtwork.latitude, lng: selectedArtwork.longitude }}
                        onCloseClick={() => setSelectedArtwork(null)}
                    >
                        <div style={{ maxWidth: 250 }}>
                            <ArtworkCard artwork={selectedArtwork} />
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

const MapPage = () => {
    return (
        <Layout>
            <Content>
                <ArtworkMap />
            </Content>
        </Layout>
    );
};

export default MapPage;