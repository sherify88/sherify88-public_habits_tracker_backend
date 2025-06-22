<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Habits Tracker Backend

A NestJS-based REST API for tracking daily habits with streak counting and completion history.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete habits
- ✅ **Daily Completion Tracking**: Mark habits as completed for the current date only
- ✅ **Streak Counter**: Track consecutive days of habit completion
- ✅ **Repository Pattern**: Clean separation of data access from business logic
- ✅ **Multiple Storage Options**: In-memory storage or file-based JSON storage
- ✅ **RESTful API**: Clean, RESTful endpoints following best practices
- ✅ **Validation**: Input validation using class-validator
- ✅ **Error Handling**: Proper HTTP status codes and error messages
- ✅ **Statistics**: Get habit statistics and completion metrics

## API Endpoints

### Habits Management
- `GET /habits` - Get all habits
- `POST /habits` - Create a new habit
- `GET /habits/:id` - Get a specific habit
- `PATCH /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit

### Habit Completion
- `PATCH /habits/:id/toggle` - Toggle habit completion for today

### Statistics & Analytics
- `GET /habits/stats` - Get habit statistics
- `GET /habits/streaks` - Get habits with current streaks

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional, only if using database storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habits_tracker_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Storage Configuration (Choose one)
   USE_FILE_STORAGE=false  # Set to 'true' for file-based storage
   USE_DATABASE=false      # Set to 'true' if you want to use PostgreSQL

   # Database Configuration (Only needed if USE_DATABASE=true)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PWD=your_password
   DB_NAME=habits_tracker

   # Server Configuration
   NODE_ENV=dev
   SERVER_TYPE=dev
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## Storage Options

### In-Memory Storage (Default)
- Data is stored in memory during runtime
- Data is lost when the application restarts
- Perfect for development and testing
- Set `USE_FILE_STORAGE=false` and `USE_DATABASE=false` in `.env`

### File-Based Storage
- Data is persisted to `habits.json` file
- Data survives application restarts
- Good for simple deployments
- Set `USE_FILE_STORAGE=true` and `USE_DATABASE=false` in `.env`

### Database Storage (Optional)
- Uses PostgreSQL for persistent storage
- Requires database setup and configuration
- Set `USE_DATABASE=true` and configure database connection in `.env`

## API Examples

### Create a Habit
```bash
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Exercise",
    "description": "30 minutes of cardio"
  }'
```

### Get All Habits
```bash
curl http://localhost:3000/habits
```

### Toggle Habit Completion
```bash
curl -X PATCH http://localhost:3000/habits/1/toggle
```

### Get Habit Statistics
```bash
curl http://localhost:3000/habits/stats
```

## Architecture

### Repository Pattern
The application uses the Repository pattern to separate data access from business logic:

- **IHabitRepository Interface**: Defines the contract for data operations
- **InMemoryHabitRepository**: In-memory implementation for development
- **FileHabitRepository**: File-based implementation for persistence

### Dependency Injection
The appropriate repository is injected based on the `USE_FILE_STORAGE` environment variable, allowing easy switching between storage strategies.

### Module Structure
```
src/habits/
├── entities/
│   └── habit.entity.ts
├── dto/
│   ├── create-habit.dto.ts
│   └── update-habit.dto.ts
├── interfaces/
│   └── habit-repository.interface.ts
├── repositories/
│   ├── in-memory-habit.repository.ts
│   └── file-habit.repository.ts
├── habits.controller.ts
├── habits.service.ts
└── habits.module.ts
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

### Local Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Choose storage strategy: `USE_FILE_STORAGE=true` for file persistence
- Optionally set `USE_DATABASE=true` for PostgreSQL

## What Was Completed

✅ **Core Requirements**
- REST API endpoints (GET, POST, PATCH, DELETE)
- Async/await implementation
- Clean controller/service structure
- Daily completion tracking
- Repository pattern with dependency injection
- In-memory and file-based storage options

✅ **Bonus Features**
- Streak counter implementation
- Habit completion history
- Statistics endpoint
- Comprehensive error handling
- Input validation
- Clean architecture following NestJS best practices

## What Was Skipped

❌ **Authentication**: Mock authentication was not implemented as the existing auth system is already in place
❌ **CI/CD**: GitHub Actions workflow was not added
❌ **Deployment**: Live deployment link was not created

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)
