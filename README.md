# Campus Royale Backend API

A complete Express.js backend for a college betting application with user authentication, betting system, and real-time leaderboard.

## 🚀 Features

- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Admin System**: Role-based access control for admin functions
- **Betting System**: Place bets, track winnings, manage tokens
- **Questions Management**: Add/manage betting questions (admin only)
- **Leaderboard**: Real-time user rankings based on tokens/winnings
- **Security**: Rate limiting, helmet, CORS, input validation
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/campusroyale
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/campusroyale` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_key_here` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (protected)
- `POST /api/create-admin` - Create admin user (admin only)

### Questions
- `POST /api/questions` - Add new question (admin only)
- `GET /api/questions` - Get all questions

### Betting
- `POST /api/place-bet` - Place a bet (protected)

### Leaderboard
- `GET /api/leaderboard` - Get user rankings

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 👑 Admin System

To create an admin user:
1. Register a regular user first
2. Manually update the user's role to 'admin' in the database
3. Use the admin account to create other admin users via `/api/create-admin`

## 🗄️ Database Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  tokens: Number (default: 1000),
  winnings: Number (default: 0),
  bets: [ObjectId],
  role: String (enum: ['user', 'admin'])
}
```

### Question
```javascript
{
  title: String,
  description: String,
  options: [{
    label: String,
    odds: Number,
    votes: Number
  }],
  isResolved: Boolean,
  correctOption: String
}
```

### Bet
```javascript
{
  userId: ObjectId,
  questionId: ObjectId,
  option: String,
  amount: Number,
  winnings: Number
}
```

## 🚀 Deployment

### Render Deployment

1. **Create Render account** and connect your GitHub repository

2. **Create a new Web Service:**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables:**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`

4. **Deploy!**

### Railway Deployment

1. **Connect Railway to your GitHub repo**
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically**

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

## 🧪 Testing

### Using Postman

1. Import the `postman_collection.json` file
2. Set the `baseUrl` variable to your API URL
3. Run the requests in order (register → login → other endpoints)

### Manual Testing

```bash
# Register user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get questions
curl http://localhost:5000/api/questions
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request body validation
- **Error Handling**: Centralized error handling

## 📝 Scripts

- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample questions
- `npm start` - Start production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information 