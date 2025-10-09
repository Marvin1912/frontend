# Frontend Application

A comprehensive Angular 20 application with two main modules for financial management and plant care tracking.

## 🏦 Banking Module

The banking module helps you understand where your money goes each month. It reads your bank statements (CAMT files) and organizes all your transactions into clear categories so you can see your spending patterns and identify unusual expenses.

**📖 [Full Documentation →](./BANKING_MODULE.md)**

### Key Features:
- Upload and analyze CAMT bank statement files
- Automatic categorization of transactions (General Bookings, Daily Costs, Income)
- Monthly financial health analysis with visual alerts
- Cost outlier detection to identify unusual expenses
- Data backup functionality for historical tracking

## 🌿 Plant Management System

A complete CRUD application for managing your plant collection with images and watering schedules. Track your plants' locations, care requirements, and monitor their health over time.

**📖 [Full Documentation →](./PLANTS_MODULE.md)**

### Key Features:
- Add, edit, and delete plant records
- Upload and manage plant images
- Track plant locations and watering schedules
- Monitor plant health and care history
- Search and filter plant collection

## 🚀 Getting Started

### Prerequisites
- Node.js (see package.json for required version)
- Angular CLI
- Backend API running on `http://localhost:9001`

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🏗️ Architecture

- **Angular 20** with standalone components
- **Angular Material 20** with Azure Blue theme
- **Bootstrap 5.3.6** + SASS for styling
- **TypeScript** strict mode
- **Docker** + Nginx for deployment

## 📁 Project Structure

```
src/app/
├── backend/          # Banking/accounting module
├── plants/          # Plant management system
└── home/            # Home component
```

## 🔗 API Integration

- **Development API**: `http://localhost:9001`
- **Banking endpoints**: `/camt-entries`, `/export/costs`
- **Plant endpoints**: `/plants`, `/images`

---

For detailed module-specific documentation, please refer to the individual module documentation files linked above.
