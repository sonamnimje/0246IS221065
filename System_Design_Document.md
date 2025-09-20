# System Design Document
## URL Shortener Application

**Version:** 1.0  
**Date:** September 20, 2025  
**Author:** Sonam Nimje  
**Repository:** [0246IS220165](https://github.com/sonamnimje/0246IS220165)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack & Justifications](#technology-stack--justifications)
4. [Data Architecture & Storage Design](#data-architecture--storage-design)
5. [Authentication & Security Architecture](#authentication--security-architecture)
6. [Component Architecture](#component-architecture)
7. [State Management Design](#state-management-design)
8. [Scalability Considerations](#scalability-considerations)
9. [Performance Optimizations](#performance-optimizations)
10. [Design Patterns & Best Practices](#design-patterns--best-practices)
11. [Error Handling & Monitoring](#error-handling--monitoring)
12. [Assumptions & Constraints](#assumptions--constraints)
13. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The URL Shortener application is designed as a modern, scalable single-page application (SPA) built with React 19.1.1. The system follows a client-side architecture with comprehensive authentication, real-time analytics, and efficient state management. The design emphasizes maintainability, performance, and user experience while providing a foundation for future backend integration.

### Key Design Decisions:
- **Frontend-First Architecture**: Client-side implementation with local storage for data persistence
- **Component-Based Design**: Modular, reusable React components with clear separation of concerns
- **Authentication Integration**: Ready for external API integration with JWT token management
- **Responsive Design**: Mobile-first approach with Material-UI and Tailwind CSS
- **Performance Optimization**: Code splitting, lazy loading, and efficient state management

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                  │
├─────────────────────────────────────────────────────────────┤
│                     React Application                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐│
│  │   Components    │ │   Context API   │ │    Services      ││
│  │   (UI Layer)    │ │ (State Mgmt)    │ │  (Data Layer)    ││
│  └─────────────────┘ └─────────────────┘ └──────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   Browser APIs & Storage                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐│
│  │  Local Storage  │ │   Fetch API     │ │  Browser APIs    ││
│  └─────────────────┘ └─────────────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services (Future)                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐│
│  │  Auth Service   │ │  Analytics API  │ │   URL Database   ││
│  │(20.244.56.144)  │ │    (Future)     │ │    (Future)      ││
│  └─────────────────┘ └─────────────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

1. **Presentation Layer**: React components with Material-UI and Tailwind CSS
2. **Business Logic Layer**: Custom hooks, context providers, and service classes
3. **Data Access Layer**: Storage utilities and API service adapters
4. **Integration Layer**: External API clients and browser API wrappers

---

## Technology Stack & Justifications

### Frontend Framework
**React 19.1.1**
- **Justification**: Latest React version with improved performance, concurrent features, and modern hooks
- **Benefits**: Component reusability, virtual DOM efficiency, large ecosystem
- **Use Case**: Complex UI state management and component lifecycle handling

### UI Framework
**Material-UI (MUI) 7.3.2**
- **Justification**: Comprehensive component library with Material Design principles
- **Benefits**: Pre-built accessible components, consistent design system, theming support
- **Use Case**: Rapid UI development with professional appearance

### Styling Framework
**Tailwind CSS 3.4.17**
- **Justification**: Utility-first CSS framework for custom styling needs
- **Benefits**: Rapid prototyping, consistent spacing, responsive design utilities
- **Use Case**: Custom styling beyond Material-UI components

### Routing
**React Router DOM 7.9.1**
- **Justification**: Standard routing solution for React applications
- **Benefits**: Declarative routing, code splitting support, navigation guards
- **Use Case**: Single-page application navigation with protected routes

### Build Tools
**Create React App with CRACO**
- **Justification**: Standard React toolchain with customization capabilities
- **Benefits**: Zero-configuration setup, optimized build process, easy customization
- **Use Case**: Production-ready builds with Tailwind CSS integration

### Development Tools
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing
- **React Testing Library**: Component testing with user-centric approach
- **ESLint**: Code quality and consistency enforcement

---

## Data Architecture & Storage Design

### Local Storage Schema

```javascript
// URL Storage Schema
{
  "url_shortener_data_v1": [
    {
      "shortcode": "string (6 chars, alphanumeric)",
      "longUrl": "string (valid URL)",
      "createdAt": "number (timestamp)",
      "expiresAt": "number (timestamp)",
      "clicks": [
        {
          "ts": "number (timestamp)",
          "referrer": "string",
          "ua": "string (user agent)",
          "country": "string"
        }
      ]
    }
  ]
}

// Authentication Storage Schema
{
  "auth_token": {
    "accessToken": "string (JWT)",
    "tokenType": "string (Bearer)",
    "expiresIn": "number (seconds)",
    "expiresAt": "number (timestamp)",
    "user": {
      "email": "string",
      "name": "string",
      "rollNo": "string"
    }
  }
}

// Logging Storage Schema
{
  "url_shortener_logs": [
    {
      "eventType": "string",
      "payload": "object",
      "ts": "number (timestamp)"
    }
  ]
}
```

### Data Migration Strategy

```javascript
// Migration from old format to versioned schema
function migrateOldData() {
  const oldData = localStorage.getItem('urls');
  const newData = localStorage.getItem('url_shortener_data_v1');
  
  if (oldData && !newData) {
    // Convert and migrate data structure
    // Maintains backward compatibility
  }
}
```

### Design Decisions:
- **Versioned Storage Keys**: Enables future schema migrations
- **Immutable Operations**: All storage operations create new objects
- **Data Normalization**: Structured data with clear relationships
- **Expiration Handling**: Built-in URL expiration mechanism

---

## Authentication & Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                Authentication Architecture                   │
├─────────────────────────────────────────────────────────────┤
│  User Action  │  AuthContext  │  AuthService  │ TokenManager │
├─────────────────────────────────────────────────────────────┤
│     Login     │               │               │              │
│       │       │               │               │              │
│       ▼       │               │               │              │
│  Form Submit  ├──────────────▶│               │              │
│               │   login()     │               │              │
│               │               ├──────────────▶│              │
│               │               │ authenticate()│              │
│               │               │               │              │
│               │               │ ◀─────────────┤              │
│               │               │   JWT Token   │              │
│               │               │               │              │
│               │               │               ├─────────────▶│
│               │               │               │ setupRefresh()│
│               │ ◀─────────────┤               │              │
│               │   setUser()   │               │              │
│  ◀────────────┤               │               │              │
│   Redirect    │               │               │              │
└─────────────────────────────────────────────────────────────┘
```

### Security Features

1. **JWT Token Management**
   - Automatic token refresh 5 minutes before expiry
   - Cross-tab session synchronization
   - Secure token storage with expiration validation

2. **Input Validation & Sanitization**
   - Email format validation with regex patterns
   - Password strength assessment with scoring system
   - XSS prevention through input sanitization

3. **Session Management**
   - Automatic logout on token expiry
   - Session persistence across browser sessions
   - Multi-tab session consistency

4. **Protected Routes**
   - Route-level authentication guards
   - Automatic redirection to login page
   - State preservation for post-login navigation

### Security Implementation Highlights:

```javascript
// Token Manager - Automatic Refresh
class TokenManager {
  setupAutoRefresh() {
    const refreshTime = expiresAt - (5 * 60 * 1000); // 5 min buffer
    this.refreshTimer = setTimeout(() => {
      this.attemptRefresh();
    }, refreshTime);
  }
}

// Input Sanitization
export function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove dangerous characters
    .substring(0, 255); // Limit length
}
```

---

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Router
│   │   ├── Navigation
│   │   │   ├── UserMenu
│   │   │   └── NavigationLinks
│   │   │
│   │   ├── ShortenerPage
│   │   │   ├── UrlInputForm
│   │   │   ├── ResultsDisplay
│   │   │   └── QRCodeGenerator
│   │   │
│   │   ├── StatsPage
│   │   │   ├── AnalyticsTable
│   │   │   ├── ClickMetrics
│   │   │   └── GeographicData
│   │   │
│   │   ├── LoginPage
│   │   │   ├── AuthForm
│   │   │   ├── PasswordStrength
│   │   │   └── SocialLogin
│   │   │
│   │   └── ProtectedRoute
│   │       └── AuthenticationGuard
```

### Design Patterns Used

1. **Container-Presenter Pattern**
   - Smart containers handle state and logic
   - Presentational components focus on UI rendering
   - Clear separation of concerns

2. **Higher-Order Components**
   - ProtectedRoute wraps components with authentication logic
   - Reusable authentication and authorization patterns

3. **Custom Hooks Pattern**
   - useFormValidation: Reusable form state management
   - useAuth: Authentication state and actions
   - Encapsulated logic with clean interfaces

4. **Context Provider Pattern**
   - AuthContext: Global authentication state
   - Avoids prop drilling across component tree
   - Centralized state management

### Component Design Principles:

- **Single Responsibility**: Each component has a focused purpose
- **Composition over Inheritance**: Components built through composition
- **Props Interface Design**: Clear, typed interfaces between components
- **Error Boundaries**: Graceful error handling at component level

---

## State Management Design

### State Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     State Management                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   AuthContext   │    │  Component      │                │
│  │                 │    │  Local State    │                │
│  │ • user          │    │                 │                │
│  │ • isAuth        │    │ • form data     │                │
│  │ • isLoading     │    │ • UI state      │                │
│  │ • login()       │    │ • validation    │                │
│  │ • logout()      │    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Local Storage                              ││
│  │                                                         ││
│  │ • auth_token        • url_shortener_data_v1            ││
│  │ • session_data      • url_shortener_logs               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### State Management Strategy

1. **Global State (React Context)**
   - Authentication state and user data
   - App-wide configuration and settings
   - Cross-component shared state

2. **Local Component State**
   - Form input values and validation errors
   - UI state (loading, modals, dropdowns)
   - Component-specific temporary data

3. **Persistent Storage**
   - User authentication tokens
   - URL shortening data
   - Application logs and analytics

4. **Custom Hooks for State Logic**
   ```javascript
   // useFormValidation Hook
   const {
     values,
     errors,
     touched,
     handleChange,
     validateAll
   } = useFormValidation(initialValues, validationRules);
   ```

### State Synchronization
- **Cross-tab Synchronization**: Storage events for authentication state
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Data Consistency**: Validation and normalization before state updates

---

## Scalability Considerations

### Frontend Scalability

1. **Code Splitting**
   ```javascript
   // Lazy loading of route components
   const LazyStatsPage = lazy(() => import('./pages/StatsPage'));
   const LazyLoginPage = lazy(() => import('./pages/LoginPage'));
   ```

2. **Component Optimization**
   - React.memo for preventing unnecessary re-renders
   - useMemo and useCallback for expensive computations
   - Virtualization for large data sets

3. **Bundle Optimization**
   - Tree shaking for unused code elimination
   - Dynamic imports for on-demand loading
   - Asset optimization and compression

### Data Scalability

1. **Storage Strategy**
   - Pagination for large datasets
   - Data compression for storage efficiency
   - Cleanup routines for expired data

2. **Performance Monitoring**
   - Logging adapter for analytics collection
   - Performance metrics tracking
   - Error boundary implementation

### Future Backend Integration

```javascript
// Service Layer Architecture for API Integration
class URLService {
  async createShortUrl(data) {
    return await apiClient.post('/api/urls', data);
  }
  
  async getAnalytics(shortcode) {
    return await apiClient.get(`/api/analytics/${shortcode}`);
  }
}
```

---

## Performance Optimizations

### Implemented Optimizations

1. **React Performance**
   - Functional components with hooks
   - Memoization of expensive calculations
   - Efficient event handling with useCallback

2. **CSS Performance**
   - Tailwind CSS purging for production builds
   - Critical CSS loading strategies
   - Responsive image loading

3. **Network Performance**
   - HTTP/2 compatibility
   - Gzip compression support
   - Efficient API request patterns

4. **Storage Performance**
   - Indexed data structures for fast lookups
   - Batch operations for multiple updates
   - Lazy loading of non-critical data

### Performance Monitoring

```javascript
// Web Vitals Integration
reportWebVitals((metric) => {
  // Track Core Web Vitals
  logEvent('PERFORMANCE_METRIC', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating
  });
});
```

### Optimization Strategies:
- **Bundle Size Monitoring**: Regular analysis of bundle sizes
- **Performance Budgets**: Defined limits for key metrics
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Caching Strategies**: Browser caching and service worker implementation (future)

---

## Design Patterns & Best Practices

### Implemented Design Patterns

1. **Facade Pattern**
   ```javascript
   // authService provides simplified interface to complex auth operations
   const authService = {
     authenticateUser,
     validateToken,
     logout,
     getCurrentUser
   };
   ```

2. **Observer Pattern**
   ```javascript
   // Event-driven architecture for cross-component communication
   window.addEventListener('tokenExpired', handleTokenExpiry);
   window.dispatchEvent(new CustomEvent('tokenExpired'));
   ```

3. **Strategy Pattern**
   ```javascript
   // Different validation strategies based on context
   const validationRules = (values) => {
     return validateAuthForm(values, isSignupMode);
   };
   ```

4. **Singleton Pattern**
   ```javascript
   // TokenManager as singleton for global token management
   const tokenManager = new TokenManager();
   export default tokenManager;
   ```

### Best Practices Implemented

1. **Code Organization**
   - Feature-based folder structure
   - Clear separation of concerns
   - Consistent naming conventions

2. **Error Handling**
   - Graceful degradation
   - User-friendly error messages
   - Comprehensive error logging

3. **Accessibility**
   - ARIA labels and semantic HTML
   - Keyboard navigation support
   - Screen reader compatibility

4. **Testing Strategy**
   - Component unit tests
   - Integration test coverage
   - User interaction testing

---

## Error Handling & Monitoring

### Error Handling Architecture

```javascript
// Centralized Error Handling
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <ErrorFallback />;
  }
  
  return children;
};

// Service Level Error Handling
async function apiRequest(endpoint, options) {
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Monitoring & Logging

1. **Event Logging System**
   ```javascript
   logEvent('SHORTEN_CREATED', {
     shortcode: 'abc123',
     longUrl: 'https://example.com',
     expiresAt: timestamp
   });
   ```

2. **Performance Tracking**
   - Web Vitals monitoring
   - User interaction tracking
   - Error rate monitoring

3. **Analytics Collection**
   - Click tracking with geographic data
   - User behavior analytics
   - Conversion funnel analysis

### Error Recovery Strategies:
- **Automatic Retry**: For network failures
- **Fallback UI**: When components fail to load
- **Data Recovery**: From localStorage backups
- **User Notification**: Clear error communication

---

## Assumptions & Constraints

### Technical Assumptions

1. **Browser Support**
   - Modern browsers with ES6+ support
   - JavaScript enabled environment
   - Local storage availability

2. **Network Conditions**
   - Reliable internet connection for external API calls
   - HTTP/HTTPS protocol support
   - CORS policy compliance

3. **User Environment**
   - Desktop and mobile device support
   - Minimum screen resolution of 320px width
   - Touch and mouse input compatibility

### Business Constraints

1. **Data Storage**
   - Client-side storage limitations (5-10MB typical)
   - No server-side data persistence currently
   - Privacy compliance with local storage

2. **Authentication**
   - Single authentication provider integration
   - Token-based session management
   - No multi-factor authentication currently

3. **Scalability**
   - Frontend-only scaling initially
   - Future backend integration required for production scale
   - Limited by browser storage constraints

### Development Constraints

1. **Technology Stack**
   - React ecosystem dependencies
   - Create React App limitations
   - Material-UI design system constraints

2. **Performance**
   - Single-page application limitations
   - Client-side processing constraints
   - Browser memory limitations

---

## Future Enhancements

### Short-term Roadmap (3-6 months)

1. **Backend Integration**
   - REST API server implementation
   - Database integration (PostgreSQL/MongoDB)
   - Server-side URL analytics

2. **Enhanced Security**
   - Multi-factor authentication
   - Rate limiting implementation
   - Advanced input validation

3. **Performance Improvements**
   - Service worker implementation
   - Offline functionality
   - Progressive Web App features

### Long-term Vision (6-12 months)

1. **Advanced Analytics**
   - Real-time dashboard
   - Custom analytics reports
   - A/B testing capabilities

2. **Enterprise Features**
   - Team collaboration
   - Custom domain support
   - Advanced user management

3. **Platform Expansion**
   - Mobile application
   - Browser extension
   - API for third-party integration

### Technical Debt & Improvements

1. **Code Quality**
   - Comprehensive test coverage (>90%)
   - TypeScript migration
   - Advanced linting rules

2. **Architecture Improvements**
   - Micro-frontend architecture
   - Advanced state management (Redux Toolkit)
   - GraphQL integration

3. **DevOps Integration**
   - CI/CD pipeline implementation
   - Automated testing and deployment
   - Performance monitoring tools

---

## Conclusion

This system design document outlines a comprehensive, scalable architecture for the URL Shortener application. The design emphasizes:

- **Maintainability**: Clear code organization and separation of concerns
- **Scalability**: Prepared for future backend integration and feature expansion
- **Performance**: Optimized for user experience and efficient resource usage
- **Security**: Robust authentication and data protection measures
- **User Experience**: Responsive design with accessibility considerations

The architecture provides a solid foundation for both current functionality and future enhancements, ensuring the application can grow and adapt to changing requirements while maintaining code quality and performance standards.

---

**Document Version**: 1.0  
**Last Updated**: September 20, 2025  
**Review Date**: December 20, 2025