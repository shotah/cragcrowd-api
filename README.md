# CragCrowd API - Backend Service

TypeScript/Express backend service for the CragCrowd crag traffic monitoring system.

## 🏗️ Architecture

RESTful API service with:
- **Express.js** framework with TypeScript
- **MongoDB** for data persistence
- **Zod** for request validation
- **Winston** for structured logging
- **Docker** for containerization

## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or Docker)
- [Docker](https://www.docker.com/) (optional)

### Development Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server with hot reload
npm run dev

# Or use Make commands
make setup
make dev
```

### Docker Setup
```bash
# Development with hot reload
make docker-build
make docker-run

# Or use docker-compose from root
cd ..
make dev-start
```

## 📊 API Endpoints

### Health Check
```bash
GET /api/health
```
Returns service health status and database connectivity.

### Sensor Data Management
```bash
# Submit sensor reading (from gateway)
POST /api/sensor-data
Content-Type: application/json
{
  "wall_id": "lower_town_wall",
  "device_count": 8,
  "timestamp": 1704067200000,
  "gateway_id": "AA:BB:CC:DD:EE:FF",
  "rssi": -85,
  "snr": 7.5
}

# Query sensor readings
GET /api/sensor-data?wall_id=lower_town_wall&limit=50

# Get walls with recent activity
GET /api/sensor-data/walls
```

### Query Parameters
- **wall_id**: Filter by specific wall
- **start_time**: ISO datetime string (e.g., "2024-01-01T00:00:00Z")
- **end_time**: ISO datetime string
- **limit**: Maximum records (1-1000, default 100)

## 🗄️ Data Models

### Sensor Reading
```typescript
interface SensorReading {
  _id: string;                    // MongoDB ObjectId
  wall_id: string;                // Wall identifier
  device_count: number;           // Number of devices detected
  timestamp: number;              // Original sensor timestamp (Unix)
  gateway_id?: string;            // Gateway MAC address
  rssi?: number;                  // LoRa signal strength
  snr?: number;                   // LoRa signal-to-noise ratio
  received_at?: number;           // Gateway received timestamp
  server_timestamp: string;       // Server processing time (ISO)
  created_at: string;             // Database insertion time (ISO)
}
```

### Wall Summary
```typescript
interface Wall {
  wall_id: string;                // Wall identifier
  latest_reading: string;         // Most recent reading timestamp
  device_count: number;           // Current device count
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=cragcrowd

# Security
API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

### Database Indexes
The API automatically creates these indexes for optimal performance:
- `wall_id` (ascending)
- `server_timestamp` (descending) 
- `wall_id + server_timestamp` (compound)
- `created_at` (descending)

## 🛠️ Development

### Project Structure
```
src/
├── index.ts                    # Application entry point
├── database/
│   └── connection.ts           # MongoDB connection logic
├── middleware/
│   ├── errorHandler.ts         # Global error handling
│   └── validation.ts           # Request validation
├── routes/
│   ├── health.ts              # Health check endpoints
│   └── sensorData.ts          # Sensor data CRUD operations
└── utils/
    └── logger.ts              # Winston logging configuration
```

### Key Scripts
```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server

# Testing & Quality
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript type checking

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run container
```

### Adding New Routes
1. Create route file in `src/routes/`
2. Define validation schemas with Zod
3. Add route handlers with proper error handling
4. Register routes in `src/index.ts`
5. Add tests for new endpoints

Example:
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const myRouter = Router();

const mySchema = z.object({
  field: z.string().min(1)
});

myRouter.post('/', validateRequest(mySchema), async (req, res) => {
  try {
    // Handle request
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 📈 Performance

### Optimization Features
- **Request validation**: Early rejection of invalid data
- **Database indexing**: Optimized queries for common patterns
- **Structured logging**: Efficient log aggregation
- **Connection pooling**: MongoDB connection reuse
- **Error boundaries**: Graceful error handling

### Monitoring
```bash
# Health check
curl http://localhost:3000/api/health

# Database status
curl http://localhost:3000/api/health | jq '.database'

# View logs
tail -f logs/combined.log
```

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage

# Using Make
make test
```

### Test Structure
```
tests/
├── integration/       # Full API integration tests
├── unit/             # Individual function tests
└── fixtures/         # Test data and utilities
```

### Example Test
```typescript
describe('POST /api/sensor-data', () => {
  it('should accept valid sensor data', async () => {
    const sensorData = {
      wall_id: 'test_wall',
      device_count: 5,
      timestamp: Date.now()
    };

    const response = await request(app)
      .post('/api/sensor-data')
      .send(sensorData)
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## 🔐 Security

### Features
- **Input validation**: Zod schema validation
- **Error sanitization**: No sensitive data in error responses
- **CORS configuration**: Controlled cross-origin access
- **Helmet middleware**: Security headers
- **Rate limiting**: (TODO) Request rate limiting
- **Authentication**: (TODO) API key authentication

### Security Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: false, // Configure as needed
  crossOriginEmbedderPolicy: false
}));
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MongoDB status
docker ps | grep mongo

# Test connection manually
mongosh mongodb://localhost:27017/cragcrowd

# Check environment variables
echo $MONGODB_URI
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### TypeScript Compilation Errors
```bash
# Clean build
rm -rf dist/
npm run build

# Check types only
npm run typecheck
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Or in .env file
LOG_LEVEL=debug
```

## 📊 Data Analytics

### Query Examples
```bash
# Recent activity for specific wall
curl "http://localhost:3000/api/sensor-data?wall_id=lower_town_wall&limit=10"

# Activity in time range
curl "http://localhost:3000/api/sensor-data?start_time=2024-01-01T00:00:00Z&end_time=2024-01-02T00:00:00Z"

# All walls with recent data
curl "http://localhost:3000/api/sensor-data/walls"
```

### MongoDB Aggregation
```javascript
// Average devices per wall
db.sensor_readings.aggregate([
  { $group: { _id: "$wall_id", avgDevices: { $avg: "$device_count" } } }
]);

// Activity by hour
db.sensor_readings.aggregate([
  { $group: { 
    _id: { $hour: "$server_timestamp" }, 
    count: { $sum: 1 },
    avgDevices: { $avg: "$device_count" }
  }}
]);
```

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Health check endpoints working

### Docker Production
```bash
# Build production image
docker build -t cragcrowd-api .

# Run with environment file
docker run -d --name cragcrowd-api --env-file .env -p 3000:3000 cragcrowd-api
```

### Environment-Specific Configs
```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug

# Production
NODE_ENV=production
LOG_LEVEL=info
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🔗 Related Projects

- **Sensor**: [cragcrowd-firmware](../cragcrowd-firmware/)
- **Gateway**: [cragcrowd-gateway](../cragcrowd-gateway/)
- **Web UI**: [cragcrowd-web-ui](../cragcrowd-web-ui/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Lint code: `npm run lint:fix`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push branch: `git push origin feature/amazing-feature`
8. Open Pull Request

## 📧 Support

- **Database issues**: Check MongoDB connection and indexes
- **API errors**: Review application logs and error responses
- **Performance**: Monitor database queries and add indexes as needed