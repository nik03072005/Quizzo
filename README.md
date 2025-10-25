# 🎯 Quizzo - Interactive Quiz Application

A modern, full-stack quiz application built with React Native (Expo) frontend and Node.js backend.

## ✨ Features

### 🔐 Authentication & Security
- Phone number-based registration with SMS OTP verification
- Email verification support
- JWT-based secure authentication
- Rate limiting and input validation
- School ID upload verification

### 🎮 Quiz Management
- Multiple quiz categories (Science, History, Technology, etc.)
- Difficulty levels (Easy, Medium, Hard)
- Timed quizzes with customizable duration
- Real-time progress tracking
- Performance analytics and scoring

### 📱 Mobile-First Design
- React Native with Expo for cross-platform support
- Responsive UI with dark/light theme support
- Toast notifications for better UX
- Offline capability (upcoming)

### 🛡️ Backend Features
- RESTful API with comprehensive validation
- File upload to Cloudflare R2 storage
- Performance monitoring and metrics
- Automated testing with Jest
- MongoDB with Mongoose ODM

## 🏗️ Architecture

```
├── frontend/          # React Native (Expo) app
│   ├── app/          # App router pages
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts (Auth, etc.)
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API services
│   └── utils/        # Utility functions
│
└── backend/          # Node.js Express API
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── middleware/   # Custom middleware
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   └── utils/        # Helper functions
    └── tests/        # Test suites
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Expo CLI
- Cloudflare R2 storage
- Twilio account (for SMS)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with API keys
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set your backend API URL
npm start
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests (coming soon)
cd frontend
npm test
```

## 📚 Documentation

- [Backend API Documentation](./backend/API_DOCS.md)
- [Frontend Components Guide](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🔧 Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build toolchain
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **React Native Toast** - User notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Joi** - Input validation
- **Multer** - File upload handling
- **Jest** - Testing framework

### Services
- **Cloudflare R2** - Object storage
- **Twilio** - SMS messaging
- **ZeptoMail** - Email service
- **MongoDB Atlas** - Cloud database

## 🛠️ Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement with tests
   - Update documentation
   - Submit PR with proper validation

2. **Quality Assurance**
   - Automated testing (Jest)
   - Type checking (TypeScript)
   - Code linting (ESLint)
   - Performance monitoring

3. **Deployment**
   - Backend: Node.js server deployment
   - Frontend: Expo build for iOS/Android
   - Database: MongoDB Atlas
   - Storage: Cloudflare R2

## 📊 Performance & Monitoring

- **Built-in Metrics**: Response time, error rates, memory usage
- **Rate Limiting**: Configurable limits for different endpoints
- **Health Checks**: Comprehensive system status monitoring
- **Error Tracking**: Structured error logging and reporting

## 🔒 Security Features

- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Protection against abuse and DDoS
- **JWT Security**: Secure token-based authentication
- **File Upload Safety**: Magic byte validation for images
- **CORS Protection**: Configurable cross-origin policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nikhil Chandra** - Initial work - [@nik03072005](https://github.com/nik03072005)

## 🙏 Acknowledgments

- Expo team for the excellent React Native framework
- MongoDB for the robust database solution
- Cloudflare for reliable storage services
- Open source community for various libraries and tools
