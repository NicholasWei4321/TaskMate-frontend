# TaskMate Frontend

Vue.js 3 frontend for TaskMate - an AI-enhanced task management application.

## Features

### Core Functionality
- **User Authentication**: Register and login with secure session management
- **AI Prioritized Tasks**: Create and manage tasks with AI-powered priority calculation
- **Todo Lists**: Organize tasks into time-scoped collections with recurring support
- **External Sync**: Import assignments from Canvas, GitHub, and other platforms

### Technical Stack
- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Pinia** for state management
- **Vue Router** for navigation
- **Axios** for API communication
- **Custom Design System** with modern, accessible UI

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Backend server running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

The frontend expects the backend API to be available at `http://localhost:8000/api`.

Make sure your backend is running before starting the frontend:
```bash
# In the TaskMate root directory
deno run --allow-all src/concept_server.ts
```

## Project Structure

```
client/
├── src/
│   ├── api/              # API service layer
│   │   ├── client.js     # Axios configuration
│   │   ├── auth.js       # Authentication API
│   │   ├── tasks.js      # Tasks API
│   │   ├── lists.js      # Lists API
│   │   └── sync.js       # Sync API
│   ├── assets/
│   │   └── styles/       # Design system
│   │       ├── variables.css  # CSS variables
│   │       └── global.css     # Global styles
│   ├── components/       # Vue components
│   │   ├── NavBar.vue
│   │   └── tasks/
│   │       └── TaskCard.vue
│   ├── stores/           # Pinia stores
│   │   ├── auth.js       # Auth state
│   │   ├── tasks.js      # Tasks state
│   │   ├── lists.js      # Lists state
│   │   └── sync.js       # Sync state
│   ├── views/            # Page components
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Dashboard.vue
│   │   ├── Tasks.vue
│   │   ├── Lists.vue
│   │   └── Sync.vue
│   ├── router/           # Vue Router config
│   │   └── index.js
│   ├── App.vue           # Root component
│   └── main.js           # App entry point
├── public/               # Static assets
├── index.html
├── vite.config.js        # Vite configuration
└── package.json
```

## Design System

The application uses a custom design system with:
- **Color Palette**: Professional blues and purples with semantic colors
- **Typography**: Inter font family with 8 size scales
- **Spacing**: Consistent spacing scale (4px to 64px)
- **Components**: Reusable button, card, badge, and form styles
- **Accessibility**: High contrast ratios and keyboard navigation

## API Integration

The frontend communicates with the backend through four main API services:

### Authentication (`/api/UserAuthentication`)
- Register, login, logout
- Store and retrieve external credentials

### Tasks (`/api/AIPrioritizedTask`)
- CRUD operations for AI-prioritized tasks
- Automatic priority calculation using LLM
- Task completion and snoozing

### Lists (`/api/TodoList`)
- Create time-scoped lists
- Add/remove tasks from lists
- Recurring lists support

### Sync (`/api/ExternalAssignmentSync`)
- Connect external sources (Canvas, GitHub, etc.)
- Sync assignments automatically
- Map external assignments to internal tasks

## Development

### Code Style
- Vue 3 Composition API with `<script setup>`
- Scoped styles for component isolation
- Reactive state management with Pinia

### State Management
Each store handles:
- Loading states
- Error handling
- API calls
- Data transformation

### Routing
- Protected routes require authentication
- Guest routes redirect authenticated users
- Lazy loading for better performance

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Assignment 4b Compliance

This frontend implementation fulfills all Assignment 4b requirements:

✅ **Vue.js 3** with reactive components
✅ **Axios** for API communication
✅ **State management** with Pinia
✅ **Visual design** with custom design system
✅ **Full functionality** without page refreshes
✅ **Component architecture** with proper separation of concerns
✅ **Backend integration** with all 4 concepts

## Screenshots

(Add screenshots here for your submission)

## License

MIT
