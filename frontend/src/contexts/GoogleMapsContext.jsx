import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GoogleMapsContext = createContext(null);

export const GoogleMapsProvider = ({ children }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        // read api key from config.ini
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        libraries: ['places', 'maps'],
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
