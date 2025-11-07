# TaskMate Frontend

Vue.js 3 frontend for TaskMate - an AI-enhanced task management application.

## Visual Design Study
![Typography Study](./readme_assets/typography.jpg)
![Color Study](./readme_assets/colors.jpg)

## User Journey
A user starts by logging in or creating an account with their credentials to access their personalized dashboard.

On their dashboard, they can create their first task by clicking the "Create Task" button, entering a task name, description, and due date. Subsequent tasks can be viewed/edited/modified in the Tasks tab. An LLM automatically evaluates importance, difficulty, and effort to calculate a priority score for the task(s).

The user navigates to "To-do Lists" to create custom lists for organizing tasks, or let the system automatically add tasks to Daily, Weekly, or Monthly lists based on their due dates. The tasks in these lists are all ranked by priority.

They then connect their Canvas account through the "Sync" tab by entering their Canvas API token, then sync assignments to automatically import them as AI-prioritized tasks. They return to the Dashboard or Tasks page to view their tasks ranked by AI-calculated priority scores, with overdue items highlighted and top priorities surfaced first.

As the user finishes tasks, they click the "Complete" button to check them off, which automatically clears them from their active lists while maintaining a record of their accomplishments.

Watch the user journey video [here](https://www.youtube.com/watch?v=WrQa9oOvqN4).

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
- TaskMate backend server running on `http://localhost:8000` (from separate backend repository)

### Installation

```bash
# Clone this repository
git clone <your-frontend-repo-url>
cd TaskMate-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Running the Application

**Step 1: Start the Backend Server**

In your TaskMate backend repository:
```bash
deno run --allow-all src/concept_server.ts
```

The backend will start on `http://localhost:8000`

**Step 2: Start the Frontend Development Server**

In this repository:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` and will proxy API requests to the backend.

**Step 3: Open in Browser**

Navigate to `http://localhost:5173` to view the application.

## Project Structure

```
TaskMate-frontend/
├── src/
│   ├── api/              # API service layer
│   │   ├── client.js     # Axios configuration with interceptors
│   │   ├── auth.js       # Authentication API
│   │   ├── tasks.js      # Tasks API
│   │   ├── lists.js      # Lists API
│   │   └── sync.js       # External sync API
│   ├── assets/
│   │   └── styles/       # Custom design system
│   │       ├── variables.css  # CSS variables & design tokens
│   │       └── global.css     # Global styles & utilities
│   ├── components/       # Reusable Vue components
│   │   ├── NavBar.vue           # Navigation bar
│   │   └── tasks/
│   │       └── TaskCard.vue     # Task display card
│   ├── stores/           # Pinia state management
│   │   ├── auth.js       # Authentication state
│   │   ├── tasks.js      # Tasks state
│   │   ├── lists.js      # Lists state
│   │   └── sync.js       # Sync state
│   ├── views/            # Page components (routes)
│   │   ├── Login.vue     # Login page
│   │   ├── Register.vue  # Registration page
│   │   ├── Dashboard.vue # Dashboard with stats
│   │   ├── Tasks.vue     # Task management page
│   │   ├── Lists.vue     # List management page
│   │   └── Sync.vue      # External sync page
│   ├── router/           # Vue Router configuration
│   │   └── index.js      # Routes & navigation guards
│   ├── App.vue           # Root component
│   └── main.js           # Application entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite config with API proxy
├── package.json          # Dependencies
└── README.md             # This file
```

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