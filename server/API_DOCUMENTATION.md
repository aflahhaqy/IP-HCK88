# API Documentation - Kopi Keliling

## Base URL

```
http://localhost:3000
```

## Authentication

Semua endpoint (kecuali `/register`, `/login`, `/login/google`, dan `/`) memerlukan authentication header:

```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### POST /register

Register user baru (Customer atau Staff)

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "Customer"
}
```

**Valid Roles:** `Customer`, `Staff`, `Admin`  
**Default Role:** `Customer` (jika tidak disebutkan)

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "Customer"
  }
}
```

---

### POST /login

Login dengan email dan password

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "Customer"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /login/google

Login dengan Google OAuth

**Request Body:**

```json
{
  "id_token": "google_id_token_here"
}
```

**Response (200/201):**

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "User Name",
    "role": "Customer"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Customer Endpoints

### PUT /customer/location

Update lokasi customer

**Auth Required:** Yes (Customer role)

**Request Body:**

```json
{
  "lat": -6.2088,
  "lng": 106.8456
}
```

**Response (200):**

```json
{
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "locationLat": -6.2088,
    "locationLng": 106.8456
  }
}
```

---

### GET /seller/nearest

Mencari penjual terdekat dari lokasi customer

**Auth Required:** Yes (Customer role)

**Response (200):**

```json
{
  "message": "Nearest sellers found",
  "customerLocation": {
    "lat": -6.2088,
    "lng": 106.8456
  },
  "data": [
    {
      "staffId": 2,
      "staffName": "Staff Name",
      "staffEmail": "staff@example.com",
      "locationLat": -6.21,
      "locationLng": 106.846,
      "distance": 0.15,
      "isActive": true
    }
  ]
}
```

---

### GET /seller/:staffId/inventory

Lihat stok penjual tertentu

**Auth Required:** Yes (Customer role)

**Response (200):**

```json
{
  "message": "Seller inventory retrieved successfully",
  "seller": {
    "staffId": 2,
    "staffName": "Staff Name",
    "isActive": true,
    "location": {
      "lat": -6.21,
      "lng": 106.846
    }
  },
  "inventory": [
    {
      "productId": 1,
      "productName": "Espresso",
      "description": "Strong coffee",
      "price": 25000,
      "imageUrl": "https://example.com/espresso.jpg",
      "availableStock": 10
    }
  ]
}
```

---

### GET /products

Ambil semua daftar produk (master kopi)

**Auth Required:** Yes (Customer role)

**Response (200):**

```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Espresso",
      "description": "Strong coffee",
      "price": 25000,
      "imageUrl": "https://example.com/espresso.jpg"
    },
    {
      "id": 2,
      "name": "Cappuccino",
      "description": "Coffee with milk foam",
      "price": 35000,
      "imageUrl": "https://example.com/cappuccino.jpg"
    }
  ]
}
```

---

### GET /cart/:cartId

Ambil detail cart dengan items dan products

**Auth Required:** Yes (Customer role)

**Response (200):**

```json
{
  "message": "Cart detail retrieved successfully",
  "cart": {
    "cartId": 1,
    "customerId": 1,
    "customerName": "John Doe",
    "staffId": 2,
    "staffName": "Staff Name",
    "status": "pending",
    "items": [
      {
        "cartItemId": 1,
        "productId": 1,
        "productName": "Espresso",
        "price": 25000,
        "quantity": 2,
        "subtotal": 50000,
        "imageUrl": "https://example.com/espresso.jpg"
      }
    ],
    "totalAmount": 50000,
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-15T10:00:00.000Z"
  }
}
```

---

## 3. Staff Endpoints

### PUT /staff/status

Aktifkan/nonaktifkan status berjualan staff

**Auth Required:** Yes (Staff role)

**Request Body:**

```json
{
  "isActive": true
}
```

**Response (200):**

```json
{
  "message": "Staff status activated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "locationLat": -6.21,
    "locationLng": 106.846,
    "isActive": true
  }
}
```

---

### PUT /staff/location

Update lokasi staff saat aktif

**Auth Required:** Yes (Staff role)

**Request Body:**

```json
{
  "lat": -6.21,
  "lng": 106.846
}
```

**Response (200):**

```json
{
  "message": "Staff location updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "locationLat": -6.21,
    "locationLng": 106.846,
    "isActive": true
  }
}
```

---

### GET /staff/inventory

Lihat stok staff sendiri yang sedang login

**Auth Required:** Yes (Staff role)

**Response (200):**

```json
{
  "message": "Staff inventory retrieved successfully",
  "staffId": 2,
  "data": [
    {
      "inventoryId": 1,
      "productId": 1,
      "productName": "Espresso",
      "description": "Strong coffee",
      "price": 25000,
      "imageUrl": "https://example.com/espresso.jpg",
      "availableStock": 10
    }
  ]
}
```

---

### PUT /inventory/:productId

Update stok produk untuk staff yang sedang login

**Auth Required:** Yes (Staff role)

**Request Body:**

```json
{
  "stock": 15
}
```

**Response (200):**

```json
{
  "message": "Inventory stock updated successfully",
  "data": {
    "inventoryId": 1,
    "productId": 1,
    "productName": "Espresso",
    "availableStock": 15
  }
}
```

---

### GET /staff/carts

Daftar semua cart yang dilayani staff

**Auth Required:** Yes (Staff role)

**Query Parameters (Optional):**

- `status`: Filter by cart status (e.g., `pending`, `paid`, `completed`)

**Response (200):**

```json
{
  "message": "Staff carts retrieved successfully",
  "staffId": 2,
  "count": 1,
  "data": [
    {
      "cartId": 1,
      "customerId": 1,
      "customerName": "John Doe",
      "customerEmail": "customer@example.com",
      "status": "pending",
      "totalAmount": 50000,
      "itemCount": 1,
      "items": [
        {
          "productId": 1,
          "productName": "Espresso",
          "quantity": 2,
          "price": 25000,
          "subtotal": 50000
        }
      ],
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized. Please login first."
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden. This endpoint requires one of these roles: Customer"
}
```

### 404 Not Found

```json
{
  "error": "Staff not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error"
}
```

---

## Notes

1. **Geolocation**: Semua koordinat menggunakan format decimal degrees (DD):

   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Distance dihitung dalam kilometer menggunakan Haversine formula

2. **Role-Based Access**:

   - Customer endpoints hanya bisa diakses oleh user dengan role `Customer`
   - Staff endpoints hanya bisa diakses oleh user dengan role `Staff`

3. **Cart Status**: Nilai yang valid untuk status cart:

   - `pending`: Cart dibuat tapi belum dibayar
   - `paid`: Sudah dibayar
   - `completed`: Transaksi selesai
   - `cancelled`: Dibatalkan

4. **Inventory Management**:

   - Staff bisa update stock produk milik mereka sendiri
   - Stock tidak boleh negatif
   - Setiap staff memiliki inventory terpisah

5. **Active Sellers**:
   - Hanya staff dengan `isActive: true` yang muncul di pencarian nearest sellers
   - Staff perlu update lokasi secara berkala untuk accuracy

---

## Testing Flow

### 1. Register & Login

1. Register sebagai Customer: `POST /register` dengan `role: "Customer"`
2. Register sebagai Staff: `POST /register` dengan `role: "Staff"`
3. Login dan simpan `access_token`

### 2. Staff Setup

1. Update status staff: `PUT /staff/status` dengan `isActive: true`
2. Update lokasi staff: `PUT /staff/location`
3. Update inventory: `PUT /inventory/:productId` dengan stock

### 3. Customer Flow

1. Update lokasi customer: `PUT /customer/location`
2. Cari penjual terdekat: `GET /seller/nearest`
3. Lihat inventory penjual: `GET /seller/:staffId/inventory`
4. Lihat semua produk: `GET /products`

### 4. Transaction Flow

1. Customer membuat cart (endpoint belum dibuat)
2. Staff lihat semua cart: `GET /staff/carts`
3. Customer lihat detail cart: `GET /cart/:cartId`
