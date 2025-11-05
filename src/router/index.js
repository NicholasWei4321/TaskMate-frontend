// Vue Router configuration
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy load views for better performance
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Tasks = () => import('../views/Tasks.vue');
const Lists = () => import('../views/Lists.vue');
const ListDetail = () => import('../views/ListDetail.vue');
const Sync = () => import('../views/Sync.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true },
  },
  {
    path: '/lists',
    name: 'Lists',
    component: Lists,
    meta: { requiresAuth: true },
  },
  {
    path: '/lists/:id',
    name: 'ListDetail',
    component: ListDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/sync',
    name: 'Sync',
    component: Sync,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
