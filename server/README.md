# Kopi Keliling - Mobile Coffee Shop System

Sistem untuk menghubungkan penjual kopi keliling dengan customer melalui geolocation dan real-time inventory tracking.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Development Roadmap](#development-roadmap)
- [Next Steps](#next-steps)

---

## 🎯 Overview

**Kopi Keliling** adalah aplikasi yang memungkinkan:

- **Staff (Penjual)**: Berjualan kopi keliling dengan update lokasi real-time dan inventory management
- **Customer**: Mencari penjual terdekat, melihat stok kopi yang tersedia, dan melakukan pembelian

### Key Features

✅ **Geolocation Tracking** - Tracking lokasi staff dan customer  
✅ **Nearest Seller Search** - Mencari penjual terdekat menggunakan Haversine formula  
✅ **Real-time Inventory** - Staff dapat update stok kopi secara real-time  
✅ **Role-Based Access** - Authorization berdasarkan role (Customer/Staff)  
✅ **Cart System** - Customer dapat melakukan multiple purchases  
🔄 **QRIS Payment** (Coming soon) - Generate pembayaran dengan Interactive QRIS

---

## 🛠 Tech Stack

### Backend (Current)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Sequelize
- **Authentication**: JWT + Google OAuth
- **API**: RESTful API

### Frontend (Planned)

- **Framework**: React
- **Build Tool**: Vite
- **Maps**: Google Maps API / Google Geolocation API
- **HTTP Client**: Axios

### Deployment (Planned)

- **Backend**: AWS (EC2 / Elastic Beanstalk / Lambda)
- **Frontend**: Vercel / Netlify
- **Database**: Supabase (PostgreSQL)

---

## ✨ Features

### Implemented ✅

#### Authentication

- [x] Register dengan email/password (Customer/Staff)
- [x] Login dengan email/password
- [x] Google OAuth login
- [x] JWT token authentication
- [x] Role-based authorization

#### Customer Features

- [x] Update lokasi customer
- [x] Cari penjual terdekat berdasarkan geolocation
- [x] Lihat inventory penjual tertentu
- [x] Lihat semua produk (master kopi)
- [x] Lihat detail cart

#### Staff Features

- [x] Aktifkan/nonaktifkan status berjualan
- [x] Update lokasi staff
- [x] Lihat inventory sendiri
- [x] Update stok produk
- [x] Lihat semua cart yang dilayani

### In Progress 🔄

- [ ] Create cart dan add items
- [ ] Update cart items (quantity)
- [ ] Delete cart items
- [ ] Generate QRIS payment
- [ ] Process payment webhook
- [ ] Transaction history

### Planned 📝

- [ ] Frontend React app
- [ ] Real-time location updates (WebSocket)
- [ ] Push notifications
- [ ] Rating & review system
- [ ] Analytics dashboard untuk staff
- [ ] Admin panel

---

## 📁 Project Structure

```
IP-HCK88/
├── server/
│   ├── config/
│   │   └── config.json          # Database configuration
│   ├── controllers/
│   │   ├── userController.js    # Auth & user management
│   │   ├── customerController.js # Customer endpoints
│   │   └── staffController.js   # Staff endpoints
│   ├── helpers/
│   │   ├── bcrypt.js            # Password hashing
│   │   ├── jwt.js               # JWT token utilities
│   │   ├── geolocation.js       # Geolocation calculations
│   │   └── openai.lib.js        # AI recommendations
│   ├── middleware/
│   │   ├── authentication.js    # JWT authentication
│   │   └── authorization.js     # Role-based access control
│   ├── migrations/              # Database migrations
│   ├── models/                  # Sequelize models
│   │   ├── user.js
│   │   ├── customerprofile.js
│   │   ├── staffprofile.js
│   │   ├── product.js
│   │   ├── inventory.js
│   │   ├── cart.js
│   │   └── cartitem.js
│   ├── routes/
│   │   ├── customer.js          # Customer routes
│   │   └── staff.js             # Staff routes
│   ├── seeders/                 # Database seeders
│   ├── app.js                   # Express app
│   ├── package.json
│   └── API_DOCUMENTATION.md     # API docs
└── client/                      # Frontend (planned)
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL database (local or Supabase)
- Google OAuth credentials (for Google login)

### Installation Steps

1. **Clone repository**

```bash
cd IP-HCK88/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Create .env file
touch .env
```

```env
# .env
SECRET_KEY=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
```

4. **Configure database** (`config/config.json`)

```json
{
  "development": {
    "username": "your_db_username",
    "password": "your_db_password",
    "database": "kopi_keliling_db",
    "host": "your_supabase_host",
    "dialect": "postgres"
  }
}
```

5. **Run migrations**

```bash
npx sequelize-cli db:migrate
```

6. **Run seeders** (optional)

```bash
npx sequelize-cli db:seed:all
```

7. **Start development server**

```bash
npm start
# or
node app.js
```

Server akan berjalan di `http://localhost:3000`

---

## 📖 API Documentation

Lihat dokumentasi lengkap di [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Links

- **Auth**: `/register`, `/login`, `/login/google`
- **Customer**: `/customer/*`, `/seller/*`, `/products`, `/cart/:cartId`
- **Staff**: `/staff/*`, `/inventory/:productId`

---

## 🗺 Development Roadmap

### Phase 1: Backend API ✅ (Current)

- [x] Setup project structure
- [x] Database models & migrations
- [x] Authentication & authorization
- [x] Customer endpoints
- [x] Staff endpoints
- [x] Geolocation utilities
- [x] API documentation

### Phase 2: Cart & Payment 🔄 (Next)

- [ ] Create cart endpoints
  - `POST /cart` - Create new cart
  - `POST /cart/:cartId/items` - Add items to cart
  - `PUT /cart/:cartId/items/:itemId` - Update cart item
  - `DELETE /cart/:cartId/items/:itemId` - Remove cart item
- [ ] QRIS payment integration
  - `POST /payment/qris/generate` - Generate QRIS
  - `POST /payment/webhook` - Payment webhook
  - `GET /payment/:transactionId` - Check payment status
- [ ] Transaction model & endpoints

### Phase 3: Frontend React App 📝

- [ ] Setup Vite + React project
- [ ] Setup routing (React Router)
- [ ] Authentication pages (Login/Register)
- [ ] Customer pages:
  - [ ] Dashboard / Home
  - [ ] Map view dengan nearest sellers
  - [ ] Seller detail & inventory
  - [ ] Cart page
  - [ ] Payment page
  - [ ] Order history
- [ ] Staff pages:
  - [ ] Dashboard
  - [ ] Inventory management
  - [ ] Order management
  - [ ] Location toggle
- [ ] Google Maps integration
- [ ] State management (Zustand/Context)

### Phase 4: Deployment & DevOps 📝

- [ ] Backend deployment ke AWS
  - [ ] Setup EC2 instance / Elastic Beanstalk
  - [ ] Configure security groups
  - [ ] Setup environment variables
  - [ ] SSL certificate
- [ ] Frontend deployment
  - [ ] Build production
  - [ ] Deploy to Vercel/Netlify
  - [ ] Environment configuration
- [ ] Database migration to production
- [ ] CI/CD pipeline (GitHub Actions)

### Phase 5: Advanced Features 📝

- [ ] Real-time updates (Socket.io)
- [ ] Push notifications
- [ ] Rating & review system
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Multi-language support
- [ ] Dark mode

---

## 🎯 Next Steps (Immediate)

### Backend Tasks

1. **Cart Management Endpoints**

   - Create cart
   - Add/update/remove cart items
   - Validate stock availability

2. **QRIS Payment Integration**

   - Research QRIS payment gateway (e.g., Xendit, Midtrans, Flip)
   - Implement payment generation
   - Setup webhook handler
   - Handle payment confirmation

3. **Transaction Management**

   - Create transaction model
   - Link cart → transaction
   - Update inventory after successful payment
   - Generate transaction receipt

4. **Testing**
   - Write unit tests (Jest)
   - Write integration tests
   - API testing (Postman/Thunder Client)

### Frontend Tasks

1. **Project Setup**

   ```bash
   npm create vite@latest client -- --template react
   cd client
   npm install axios react-router-dom @googlemaps/react-wrapper
   ```

2. **Core Features**

   - Authentication flow
   - Protected routes
   - API integration
   - Google Maps integration

3. **UI/UX**
   - Design mockups
   - Component library (Tailwind CSS / Material-UI)
   - Responsive design
   - Loading states & error handling

---

## 🔐 Security Considerations

- [x] Password hashing dengan bcrypt
- [x] JWT token untuk authentication
- [x] Role-based authorization
- [ ] Rate limiting untuk API
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (Sequelize ORM)
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Environment variables untuk secrets
- [ ] HTTPS untuk production

---

## 📊 Database Schema

### Users

- id, name, email, password, role

### CustomerProfiles

- id, userId, locationLat, locationLng

### StaffProfiles

- id, userId, locationLat, locationLng, isActive

### Products

- id, name, description, price, imageUrl

### Inventories

- id, staffId, productId, Stock

### Carts

- id, customerId, staffId, status

### CartItems

- id, cartId, productId, quantity

### Transactions (planned)

- id, cartId, totalAmount, paymentMethod, paymentStatus, qrisCode

---

## 🤝 Contributing

Saat ini project masih dalam tahap development. Untuk kontribusi:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📝 Notes

### Important Reminders

1. **Jangan commit secrets** ke repository (gunakan .env)
2. **Test endpoint** sebelum merge ke main
3. **Update API documentation** setiap ada perubahan endpoint
4. **Validate input** di setiap endpoint
5. **Handle errors** dengan proper status code

### Known Issues

- [ ] Inventory association perlu fix (staffId vs userId)
- [ ] Cart validation untuk stock availability
- [ ] Timezone handling untuk transaction timestamps

### Resources

- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [Express.js Docs](https://expressjs.com/)
- [Google Maps API](https://developers.google.com/maps)
- [JWT Best Practices](https://jwt.io/introduction)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

## 📧 Contact

Untuk pertanyaan atau diskusi, silakan buat issue di repository ini.

---

**Happy Coding! ☕️**
