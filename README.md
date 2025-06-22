# Habits Tracker Backend

A robust NestJS backend for tracking daily habits with authentication, streak tracking, and flexible storage options. Perfect for personal habit tracking applications.

### GitHub Repository
[https://github.com/sherify88/sherify88-public_habits_tracker_backend](https://github.com/sherify88/sherify88-public_habits_tracker_backend)

### Production API
[https://api.habits.awesome-posts.com/](https://api.habits.awesome-posts.com/)

## 🚀 Features

- **Habit Management**: Create, read, update, and delete habits
- **Daily Toggle**: Mark habits as completed for any day
- **Streak Tracking**: Automatic calculation of current and longest streaks
- **Authentication**: JWT-based authentication system
- **Flexible Storage**: Support for in-memory, file-based, and S3 storage
- **Docker Ready**: Easy deployment with Docker and Docker Compose
- **AWS Lambda Ready**: Serverless deployment with SAM
- **Comprehensive Testing**: Unit and end-to-end tests

## 📚 API Documentation

### Postman Collection
We provide a complete Postman collection with all API endpoints, authentication, and examples:

**File**: `Habits Tracker API.postman_collection.json`

#### How to Import:
1. Download the `Habits Tracker API.postman_collection.json` file
2. Open Postman
3. Click **Import** → **Upload Files**
4. Select the collection file
5. The collection will be imported with all endpoints and environment variables

#### Features:
- ✅ **Auto-authentication**: JWT token automatically set after login
- ✅ **Environment variables**: Easy switching between local and production
- ✅ **Complete examples**: All endpoints with sample requests and responses
- ✅ **Pre-configured**: Ready to use with default credentials

#### Environment Setup:
The collection includes these variables:
- `base_url_local`: `http://localhost:3000`
- `base_url_production`: `https://api.habits.awesome-posts.com`
- `username`: `testuser`
- `password`: `password123`
- `token`: Auto-populated after login

## 🛠️ Quick Start

### Option 1: Docker (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/sherify88/sherify88-public_habits_tracker_backend
cd habits_tracker_backend

# Start with Docker Compose
docker-compose up
```

That's it! The app will be running at `http://localhost:3000`

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run start:dev
```

### Option 3: Local AWS Lambda Testing

```bash
# Test Lambda function locally with SAM
npm run sam:local
```

## 🔐 Authentication

**Default User Credentials:**
- Username: `testuser`
- Password: `password123`

### Get JWT Token
```bash
# Local development
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Production
curl -X POST https://api.habits.awesome-posts.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token

### Habits
- `GET /habits` - Get all habits
- `POST /habits` - Create a new habit
- `GET /habits/:id` - Get a specific habit
- `DELETE /habits/:id` - Delete a habit
- `PATCH /habits/:id/toggle` - Toggle habit completion

### Version
- `GET /version/api` - Get API version
- `GET /version/web` - Get web version

## 📝 API Examples

### Create a Habit
```bash
# Local development
curl -X POST http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Exercise",
    "description": "30 minutes of physical activity"
  }'

# Production
curl -X POST https://api.habits.awesome-posts.com/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Exercise",
    "description": "30 minutes of physical activity"
  }'
```

### Toggle Habit Completion
```bash
# Local development
curl -X PATCH http://localhost:3000/habits/1/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Production
curl -X PATCH https://api.habits.awesome-posts.com/habits/1/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Get All Habits
```bash
# Local development
curl -X GET http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Production
curl -X GET https://api.habits.awesome-posts.com/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `USE_FILE_STORAGE` | Use file-based storage | `false` | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRATION_TIME` | JWT token expiration (seconds) | `3600` | Yes |
| `WEB_VERSION` | Web application version | `1.0.0` | No |

### Storage Options

1. **In-Memory** (Default): Fast, data lost on restart
2. **File Storage**: Data saved to `habits.json`
3. **S3 Storage**: Cloud storage for production

## 🐳 Docker Commands

```bash
# Development
docker-compose up

# Production build
docker build --target production -t habits-tracker:prod .

# Run production container
docker run -p 3000:3000 habits-tracker:prod
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Data Structure

### Habit Object
```json
{
  "id": 1,
  "name": "Daily Exercise",
  "description": "30 minutes of physical activity",
  "currentStreak": 5,
  "longestStreak": 10,
  "totalCompletions": 25,
  "isCompletedToday": true,
  "lastCompletedAt": "2024-01-15T10:30:00.000Z",
  "createdDate": "2024-01-01T00:00:00.000Z",
  "updatedDate": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment

### Production Deployment (AWS Lambda)
```bash
# Deploy to production
npm run deploy:prod
```

### Development Deployment
```bash
# Deploy to development environment
npm run deploy:dev

# Deploy to staging environment
npm run deploy:stage
```

### Local Lambda Testing
```bash
# Test Lambda function locally
npm run sam:local
```

### Docker Compose
```bash
docker-compose up -d
```

### Manual Deployment
```bash
npm run build
npm run start:prod
```

## 📝 A Note on Future Improvements

> [!NOTE]
> Given more time, I would have implemented a scheduled Lambda triggered by EventBridge to automatically reset streaks and update the daily completion state for each user, taking time zone differences into account.

## 🔍 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
    ```bash
    # Change port in docker-compose.yml
    ports:
      - "3001:3000"
    ```

2. **JWT token expired**
    - Re-login to get a new token

3. **Data not persisting**
    - Check if `USE_FILE_STORAGE=true` is set
    - Ensure `habits.json` file exists and is writable

4. **SAM local not working**
    - Ensure AWS SAM CLI is installed
    - Check AWS credentials are configured

### Logs
```bash
# Docker logs
docker-compose logs -f

# Application logs
npm run start:dev

# SAM local logs
npm run sam:local
```

**Happy Habit Tracking! 🎯**