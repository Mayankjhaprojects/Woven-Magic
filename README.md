# Woven Magic - Flower Crochet E-Commerce

A complete full-stack e-commerce application for handmade flower crochet products, built with React + Vite + Tailwind CSS on the frontend and Node.js + Express + MongoDB Atlas on the backend.

## Features

- 🔐 **User Authentication**: JWT-based auth with refresh tokens in HTTP-only cookies
- 🛒 **Shopping Cart**: Persistent cart with quantity management
- ❤️ **Favorites/Wishlist**: Save favorite products
- 📱 **WhatsApp Checkout**: Direct checkout via WhatsApp
- 🎨 **Beautiful UI**: Pink theme with Quicksand font
- 🔄 **Auto Token Refresh**: Seamless token refresh on API calls
- 💾 **Guest Support**: localStorage fallback for guests with automatic merge on login
- 🖼️ **Product Preview**: Auto-scrolling image carousel
- 👤 **User Dashboard**: Personalized dashboard with cart and favorites summary
- 📦 **Product Management**: Full CRUD operations for products

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Quicksand Font

### Backend
- Node.js
- Express
- MongoDB Atlas (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- express-validator

## Project Structure

```
woven-magic/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models (User, Product, Cart, Favorite)
│   │   ├── routes/          # API routes (auth, products, cart, favorites, users)
│   │   ├── middleware/      # Auth middleware, error handling
│   │   ├── utils/           # Database connection, token generation
│   │   ├── scripts/         # Seed script for products
│   │   └── server.js        # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Header, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── pages/          # Login, Register, Dashboard, HomePage, Cart, ProductPreview, Profile
│   │   ├── utils/          # API client, image helper
│   │   ├── images/         # Product images
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGO_URI=your_mongodb_atlas_connection_string
MONGO_DB_NAME=woven_magic
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_min_32_chars
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

5. Seed the database with products:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart or merge guest cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add product to favorites or merge guest favorites
- `DELETE /api/favorites/:productId` - Remove product from favorites

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Usage

1. **Register/Login**: Create an account or login to access the dashboard
2. **Browse Products**: View all available crochet products on the home page
3. **Add to Cart**: Click "Add to cart" on any product
4. **View Cart**: Click the cart icon in the header to view and manage your cart
5. **Favorites**: Click the heart icon on products to add them to favorites
6. **Product Preview**: Click "Preview" to see detailed product information with image carousel
7. **Checkout**: Use the WhatsApp checkout button to place orders
8. **Dashboard**: After login, view your personalized dashboard with cart and favorites summary
9. **Profile**: Edit your profile information

## Guest Mode

- Guests can browse products, add items to cart, and save favorites
- All guest data is stored in localStorage
- When a guest registers/logs in, their cart and favorites are automatically merged with their account

## Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB Atlas connection string
- `MONGO_DB_NAME` - Database name (default: woven_magic)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (min 32 characters)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with products

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Testing

Run the seed script to populate the database with sample products:
```bash
cd backend
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `CLIENT_URL` to your production frontend URL
3. Build the frontend: `cd frontend && npm run build`
4. Serve the frontend build using a static file server or hosting service
5. Deploy the backend to a Node.js hosting service (Heroku, Railway, etc.)

## License

This project is created for educational purposes.

## Contact

For custom orders, contact via WhatsApp or Instagram @wovenmagic_by_poorva

---

Made with ❤️ and loops 🧶

