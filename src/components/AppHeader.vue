<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { ref } from 'vue';
import { Calendar, User, ArrowDown, List, Plus, Search, SwitchButton, Close, Menu } from '@element-plus/icons-vue';
import { useStyles } from '../composables/useStyles';

const styles = useStyles();

const router = useRouter();
const auth = useAuthStore();
const { isAuthenticated, username } = storeToRefs(auth);
const mobileMenuOpen = ref(false);

function logout() {
  auth.logout();
  mobileMenuOpen.value = false;
  router.replace({ name: 'login' });
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

const navigationItems = [
  { name: 'Tasks', path: '/tasks' },
  { name: 'Create', path: '/tasks/new' },
  { name: 'Search', path: '/tasks/search' },
];
</script>

<template>
  <el-header class="app-header">
    <div class="header-container">
      <div class="header-content">
        <!-- Left Side: Logo + Navigation -->
        <div class="left-section">
          <!-- Logo/Brand -->
          <el-link 
            :underline="false"
            @click="() => { router.push('/tasks'); closeMobileMenu(); }"
            class="logo-link "
          >
            <el-icon class="logo-icon"><Calendar /></el-icon>
            <span class="logo-text">Task Scheduler</span>
          </el-link>

          <!-- Desktop Navigation -->
          <nav v-if="isAuthenticated" class="desktop-nav">
            <el-link
              v-for="item in navigationItems"
              :key="item.name"
              :underline="false"
              @click="() => { router.push(item.path); closeMobileMenu(); }"
              :class="[
                'nav-link',
                $route.path === item.path ? 'nav-link-active' : ''
              ]"
            >
              <el-icon v-show="item.name === 'Tasks'" class="nav-icon"><List /></el-icon>
              <el-icon v-show="item.name === 'Create'" class="nav-icon"><Plus /></el-icon>
              <el-icon v-show="item.name === 'Search'" class="nav-icon"><Search /></el-icon>
              <span>{{ item.name }}</span>
            </el-link>
          </nav>
        </div>

        <!-- Center Spacer -->
        <div class="spacer"></div>

        <!-- Right Side: User Menu / Auth Section -->
        <div class="right-section">
          <!-- Desktop Auth -->
          <div class="desktop-auth">
            <el-link
              v-if="!isAuthenticated"
              :underline="false"
              @click="() => { router.push('/login'); closeMobileMenu(); }"
              class="login-link"
            >
              Login
            </el-link>
            <div v-else class="user-menu">
              <el-dropdown trigger="click" placement="bottom-end">
                <div class="user-dropdown-trigger">
                  <el-avatar :size="32" class="user-avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="username">{{ username || 'User' }}</span>
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="logout">
                      <el-icon><SwitchButton /></el-icon>
                      Logout
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <el-button
            type="text"
            @click="toggleMobileMenu"
            class="mobile-menu-button"
          >
            <el-icon class="menu-icon">
              <component :is="mobileMenuOpen ? 'Close' : 'Menu'" />
            </el-icon>
          </el-button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <el-collapse>
        <div v-show="mobileMenuOpen" class="mobile-menu">
          <!-- Mobile Navigation (only when authenticated) -->
          <nav v-if="isAuthenticated" class="mobile-nav">
            <el-link
              v-for="item in navigationItems"
              :key="item.name"
              :underline="false"
              @click="() => { router.push(item.path); closeMobileMenu(); }"
              :class="[
                'mobile-nav-link',
                $route.path === item.path ? 'mobile-nav-link-active' : ''
              ]"
            >
              <el-icon v-show="item.name === 'Tasks'" class="mobile-nav-icon"><List /></el-icon>
              <el-icon v-show="item.name === 'Create'" class="mobile-nav-icon"><Plus /></el-icon>
              <el-icon v-show="item.name === 'Search'" class="mobile-nav-icon"><Search /></el-icon>
              <span>{{ item.name }}</span>
            </el-link>
          </nav>
          
          <!-- Mobile Auth -->
          <div class="mobile-auth">
            <el-link
              v-if="!isAuthenticated"
              :underline="false"
              @click="() => { router.push('/login'); closeMobileMenu(); }"
              class="mobile-login-link"
            >
              <el-icon><User /></el-icon>
              <span>Login</span>
            </el-link>
            <div v-else class="mobile-user-section">
              <div class="mobile-user-info">
                <el-avatar :size="32" class="mobile-user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="mobile-username">{{ username || 'User' }}</span>
              </div>
              <el-button
                @click="logout"
                type="text"
                class="mobile-logout-button"
              >
                <el-icon><SwitchButton /></el-icon>
                <span>Logout</span>
              </el-button>
            </div>
          </div>
        </div>
      </el-collapse>
    </div>
  </el-header>
</template>

<style scoped>
.app-header {
  background-color: v-bind('styles.colors.white');
  box-shadow: v-bind('styles.shadows.sm');
  border-bottom: 1px solid v-bind('styles.colors.gray200');
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-container {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3rem;
  width: 100%;
  margin-bottom: 10px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  margin-bottom: 30px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: v-bind('styles.colors.primary');
  transition: color 0.2s;
  text-decoration: none;

}

.logo-link:hover {
  color: v-bind('styles.colors.primaryDark');
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  display: none;
}

@media (min-width: 640px) {
  .logo-text {
    display: block;
  }
}

.desktop-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: v-bind('styles.borderRadius.lg');
  color: v-bind('styles.colors.gray700');
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-link:hover {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.nav-link-active {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.nav-icon {
  font-size: 0.875rem;
}

.spacer {
  flex: 1;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.desktop-auth {
  display: none;
  align-items: center;
}

@media (min-width: 768px) {
  .desktop-auth {
    display: flex;
  }
}

.login-link {
  padding: 0.5rem 1rem;
  color: v-bind('styles.colors.gray700');
  font-weight: 500;
  white-space: nowrap;
  border-radius: v-bind('styles.borderRadius.lg');
  transition: all 0.2s;
  text-decoration: none;
}

.login-link:hover {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: v-bind('styles.borderRadius.lg');
  transition: background-color 0.2s;
}

.user-dropdown-trigger:hover {
  background-color: v-bind('styles.colors.gray50');
}

.user-avatar {
  background-color: v-bind('styles.colors.primary');
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('styles.colors.gray700');
  white-space: nowrap;
}

.dropdown-icon {
  color: v-bind('styles.colors.gray400');
  font-size: 0.75rem;
}

.mobile-menu-button {
  display: flex;
  padding: 0.5rem;
  color: v-bind('styles.colors.gray600');
  border-radius: v-bind('styles.borderRadius.lg');
  transition: all 0.2s;
}

.mobile-menu-button:hover {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

@media (min-width: 768px) {
  .mobile-menu-button {
    display: none;
  }
}

.menu-icon {
  font-size: 1.25rem;
}

.mobile-menu {
  display: block;
  padding: 1rem 0;
  border-top: 1px solid v-bind('styles.colors.gray200');
}

@media (min-width: 768px) {
  .mobile-menu {
    display: none;
  }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: v-bind('styles.borderRadius.lg');
  color: v-bind('styles.colors.gray700');
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.mobile-nav-link:hover {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.mobile-nav-link-active {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.mobile-nav-icon {
  font-size: 0.875rem;
}

.mobile-auth {
  padding-top: 1rem;
  border-top: 1px solid v-bind('styles.colors.gray200');
}

.mobile-login-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: v-bind('styles.borderRadius.lg');
  color: v-bind('styles.colors.gray700');
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.mobile-login-link:hover {
  color: v-bind('styles.colors.primary');
  background-color: v-bind('styles.colors.primaryLight');
}

.mobile-user-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: v-bind('styles.colors.gray700');
}

.mobile-user-avatar {
  background-color: v-bind('styles.colors.primary');
}

.mobile-username {
  font-weight: 500;
}

.mobile-logout-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: v-bind('styles.borderRadius.lg');
  color: v-bind('styles.colors.gray700');
  font-weight: 500;
  justify-content: flex-start;
  transition: all 0.2s;
}

.mobile-logout-button:hover {
  color: v-bind('styles.colors.danger');
  background-color: #fef2f2;
}
</style>

