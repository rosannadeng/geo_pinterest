import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import api from '../../../services/api';
import dayjs from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const { TextArea } = Input;
const { Option } = Select;

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Center of the USA
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const CreateArtworkPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageInfo, setImageInfo] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const searchInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBdMx5mw7syNkmrDG_2lTfkLyZP_Dqdvr4',
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded && searchInputRef.current) {
      const autoComplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current.input
      );

      autoComplete.addListener('place_changed', () => {
        const place = autoComplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          message.error('No details available for this place');
          return;
        }

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setMarkerPosition(location);
        form.setFieldsValue({
          latitude: location.lat,
          longitude: location.lng,
          location_name: place.name,
        });

        if (mapInstance) {
          mapInstance.panTo(location);
          mapInstance.setZoom(15);
        }
      });
    }
  }, [isLoaded, mapInstance, form]);

  const fetchLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBdMx5mw7syNkmrDG_2lTfkLyZP_Dqdvr4`
      );
      const data = await response.json();
      return data.results[0]?.formatted_address || '';
    } catch (error) {
      console.error('Error fetching location name:', error);
      return '';
    }
  };

  const handleImageUploaded = async (info) => {
    setImageInfo(info);
    const lat = info.latitude || '';
    const lng = info.longitude || '';
    let locationName = info.location_name;

    if (lat && lng) {
      setMarkerPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
      if (!locationName) {
        locationName = await fetchLocationName(lat, lng);
      }
    }

    form.setFieldsValue({
      medium: info.medium,
      creation_date: info.creation_date ? dayjs(info.creation_date) : null,
      location_name: locationName,
    });
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const locationName = await fetchLocationName(lat, lng);

    setMarkerPosition({ lat, lng });
    form.setFieldsValue({
      latitude: lat,
      longitude: lng,
      location_name: locationName,
    });
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('image', imageInfo.file);
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('medium', values.medium);
      formData.append('creation_date', values.creation_date.format('YYYY-MM-DD'));
      formData.append('location_name', values.location_name);

      if (markerPosition) {
        formData.append('latitude', markerPosition.lat);
        formData.append('longitude', markerPosition.lng);
      }

      const response = await api.post('/artwork/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        withCredentials: true,
      });

      if (response.data) {
        message.success('Artwork created successfully');
        navigate('/gallery');
      }
    } catch (error) {
      message.error('Failed to create artwork');
      console.error('Error:', error);
    }
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <h1>Create New Artwork</h1>
      <ImageUploader onImageUploaded={handleImageUploaded} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={!imageInfo}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="medium"
          label="Medium"
          rules={[{ required: true, message: 'Please select the medium!' }]}
        >
          <Select>
            <Option value="OIL">Oil Paint</Option>
            <Option value="ACR">Acrylic</Option>
            <Option value="WAT">Watercolor</Option>
            <Option value="DIG">Digital</Option>
            <Option value="MIX">Mixed Media</Option>
            <Option value="OTH">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="creation_date"
          label="Creation Date"
          rules={[{ required: true, message: 'Please select the creation date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="location_name"
          label="Location"
          rules={[{ required: true, message: 'Please input the location!' }]}
        >
          <Input
            ref={searchInputRef}
            placeholder="Search for a location"
          />
        </Form.Item>

        <Form.Item name="latitude" style={{ display: 'none' }}>
          <Input type="number" step="any" />
        </Form.Item>

        <Form.Item name="longitude" style={{ display: 'none' }}>
          <Input type="number" step="any" />
        </Form.Item>

        {isLoaded && (
          <div style={{ marginBottom: '24px' }}>
            <label><strong>Pick location on map:</strong></label>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPosition || defaultCenter}
              zoom={markerPosition ? 12 : 4}
              onClick={handleMapClick}
              onLoad={map => setMapInstance(map)}
            >
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Artwork
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateArtworkPage;