# Hospital Management System

An Angular 17 application for hospital management with authentication and role-based access.

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

### Test Credentials

For testing purposes, use these credentials:
- **Username:** admin
- **Password:** admin

### Features

- User authentication with login attempts tracking
- Role-based dashboard routing
- Material Design UI components
- Responsive design
- Form validation
- Security features (copy/paste prevention)

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Authentication/
│   │   │   └── auth.service.ts
│   │   ├── Confirm Dialog/
│   │   │   └── confirm-dialog.component.ts
│   │   └── Login/
│   │       ├── login.component.html
│   │       ├── login.component.scss
│   │       └── login.component.ts
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
├── index.html
├── main.ts
└── styles.scss
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes

### Next Steps

1. Replace mock authentication with real API integration
2. Add more dashboard components for different user roles
3. Implement additional hospital management features
4. Add unit tests
5. Configure production deployment