# Map Art Community

A full-stack map-based art-sharing platform built with **React**, **Django**, and **MySQL**, allowing users to upload geotagged artworks, interact through likes and comments, and view content on a global map.

---

## 👩‍💼 Project Overview
This platform enables users to:
- Upload and display their artworks with GPS metadata
- Like and comment on others' artworks
- Navigate artwork locations via an interactive map
- Authenticate via sessions or Google OAuth2

---

## 🚀 Tech Stack

### Frontend
- **React.js**
- **Ant Design**
- **React Router**
- **Axios** (with CSRF handling)
- **Context API**

### Backend
- **Django** with **Django REST Framework**
- **MySQL** (for production)
- **AWS S3** (for image storage)
- **Redis + Channels** *(future support for real-time notifications)*

### Deployment
- **Gunicorn + Nginx**
- Static file delivery via AWS or CDN
- Config handled through `config.ini`

---

## 🔐 Authentication
- **Session-based authentication** (not JWT)
- **Google OAuth2** via `social-auth-app-django`
- CSRF and CORS protected
- Routes:
  - `/login`, `/logout`, `/register`
  - `/auth/complete/` for OAuth callbacks

---

## 📆 Key Features

### 📸 Artwork Management
- Uploads include:
  - Title, description
  - GPS coordinates (from EXIF)
  - Creation/upload dates
- Image metadata extracted in backend via PIL

### ❤️ Like System
- Like/unlike toggle with state sync
- Auto-adds to "Featured Artworks"
- `/artwork/{id}/like`, `/check_if_liked`

### 💬 Comment System
- Add/read comments
- Includes avatars and usernames
- Real-time frontend update

### 📅 Profile Page
- Displays artworks and liked items
- Allows profile picture and bio update
- Permission-controlled editing and deletion

### 🗺️ Map Interface
- Artworks shown as pins on map
- Detail on hover/click
- Location centering logic built-in

---

## 📊 Data Flow Examples

### Login
```text
1. User logs in → POST /login
2. Django creates session and returns profile
3. CSRF token sent via cookies
```

### Upload Artwork
```text
1. POST image → /upload-image
2. Extract metadata
3. POST form → /artwork/create
```

### Like Artwork
```text
1. POST /artwork/{id}/like
2. Update likes, featured list
3. Return updated count
```

### Add Comment
```text
1. POST /artwork/{id}/comments/add
2. Backend validates & saves
3. Return new comment data
```

---

## 🔗 Frontend API Wrapper (`api.js`)
- Reusable wrapper for all API calls
- Handles:
  - `CSRF token` via `js-cookie`
  - `Axios` global setup
  - `Global error interceptor`

```js
const csrfToken = Cookies.get('csrftoken');
config.headers['X-CSRFToken'] = csrfToken;
```

### Modules:
- `auth`: login, logout, register, OAuth
- `artwork`: upload, update, like, comment
- `profile`: fetch and update profile info

---

## ✨ Interesting Implementations

### 1. **EXIF Metadata Extraction**
Extracts latitude, longitude, and creation date from image uploads using PIL:
```python
gps_info = exif_data.get(34853)
meta["lat"] = _lat(gps_info[1], gps_info[2])
```

### 2. **Google OAuth Handling with Fallback**
Ensures one Google email is linked to one account:
```python
existing_user = User.objects.filter(email=email).exclude(id=user.id).first()
if existing_user:
    ... # Merge accounts
```

### 3. **Dynamic Artwork Filename Renaming**
On upload, images are renamed using upload time and artwork ID:
```python
filename = f"{artwork.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.name}"
```

---

## 🌐 TODO / Roadmap
- [ ] WebSocket-based real-time notifications
- [ ] Admin dashboard
- [ ] User following and feed
- [ ] Artwork analytics & trends

---

## 📊 Example Usage
```js
import { artwork } from '../services/api';

useEffect(() => {
  artwork.getAll().then(res => setArtworks(res.data));
}, []);
```

---

## 📅 Maintainers
- Developed by CMU Webapps Team 4
- Contact: yuxinden@andrew.cmu.edu

