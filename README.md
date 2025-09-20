# URL Shortener Application

A modern, full-featured URL shortener built with React, featuring user authentication, link analytics, and QR code generation.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **User Authentication**: Secure login and registration system
- **Link Analytics**: Track clicks, view statistics, and monitor link performance
- **QR Code Generation**: Generate QR codes for shortened URLs
- **Responsive Design**: Modern UI built with Material-UI and Tailwind CSS
- **Protected Routes**: Secure access to user-specific features
- **Link Management**: View, edit, and delete your shortened links

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **React Router DOM** - Client-side routing
- **Material-UI (MUI)** - Component library and icons
- **Tailwind CSS** - Utility-first CSS framework
- **QRCode.js** - QR code generation
- **React Testing Library** - Testing utilities

### Build Tools
- **Create React App** - React application scaffolding
- **CRACO** - Create React App Configuration Override
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
frontend/
└── url-shortener/
    ├── public/
    │   ├── index.html
    │   ├── favicon.ico
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── Navigation.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── hooks/
    │   │   └── useFormValidation.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── Redirector.jsx
    │   │   ├── ShortnerPage.jsx
    │   │   └── StatsPage.jsx
    │   ├── services/
    │   │   └── authService.js
    │   ├── utils/
    │   │   ├── authHelpers.js
    │   │   ├── helpers.js
    │   │   ├── loggingAdapter.js
    │   │   ├── storage.js
    │   │   └── tokenManager.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── craco.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sonamnimje/0246IS220165.git
   cd URL
   ```

2. **Navigate to the frontend directory**
   ```bash
   cd frontend/url-shortener
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode. The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. The build is minified and optimized for best performance.

### `npm run eject`
**Note: This is a one-way operation!** Removes the single build dependency and copies all configuration files.

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

### CRACO
Custom configuration overrides are managed through `craco.config.js` for enhanced build customization.

## 🧩 Key Components

### Authentication System
- **AuthContext**: Manages global authentication state
- **AuthService**: Handles API calls for authentication
- **TokenManager**: Manages JWT tokens and session storage
- **ProtectedRoute**: Route protection for authenticated users

### Core Features
- **ShortnerPage**: Main URL shortening interface
- **StatsPage**: Analytics and statistics dashboard
- **Redirector**: Handles URL redirection logic
- **Navigation**: Application navigation component

### Utilities
- **FormValidation**: Custom hooks for form validation
- **Storage**: Local storage management utilities
- **Helpers**: Common utility functions
- **LoggingAdapter**: Centralized logging system

## 🔐 Authentication

The application implements a comprehensive authentication system with:
- User registration and login
- JWT token management
- Protected routes
- Session persistence
- Secure logout functionality

## 📊 Analytics Features

Track your shortened URLs with:
- Click count monitoring
- Geographic analytics
- Referrer tracking
- Time-based statistics
- Link performance metrics

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Material Design**: Clean, modern interface with Material-UI
- **Dark/Light Theme**: Support for different theme preferences
- **Accessibility**: Built with accessibility best practices
- **Loading States**: Smooth loading indicators and transitions

## 🧪 Testing

The project includes comprehensive testing setup with:
- React Testing Library
- Jest test runner
- Component testing utilities
- User event simulation

Run tests with:
```bash
npm test
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build folder will contain optimized production files ready for deployment.

### Deployment Options
- **Netlify**: Direct deployment from Git repository
- **Vercel**: Zero-configuration deployment
- **GitHub Pages**: Static site hosting
- **Firebase Hosting**: Google's hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sonam Nimje**
- GitHub: [@sonamnimje](https://github.com/sonamnimje)
- Repository: [0246IS220165](https://github.com/sonamnimje/0246IS220165)

## 🙏 Acknowledgments

- Create React App team for the excellent starter template
- Material-UI team for the comprehensive component library
- Tailwind CSS team for the utility-first CSS framework
- React Router team for the routing solution

## 📞 Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

**Made with ❤️ by Sonam Nimje**