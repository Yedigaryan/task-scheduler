<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useAuthStore, login } from "../stores/auth";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { useStyles } from '../composables/useStyles';

const styles = useStyles();


const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(false);

const schema = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

const { handleSubmit } = useForm<{ username: string; password: string }>({
  validationSchema: schema,
  initialValues: { username: "", password: "" },
});

const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit(async (vals) => {
  try {
    loading.value = true;
    const result = (await login(vals.username, vals.password)) as { access_token: string };
    auth.setToken(result.access_token);
    await router.replace((route.query.redirect as string) || "/tasks");
  } catch (error: any) {
    console.error('Login error:', error);
    // You could add error message display here
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <el-container class="login-container">
    <el-main class="login-main">
      <div class="login-card-wrapper">
        <el-card class="login-card" shadow="hover">
          <template #header>
            <div class="login-header">
              <h2 class="login-title">Welcome Back</h2>
              <p class="login-subtitle">Sign in to your account</p>
            </div>
          </template>
          
          <el-form @submit.prevent="onSubmit" label-position="top" class="login-form">
            <el-form-item label="Username" :error="usernameError" class="form-item">
              <el-input
                v-model="username"
                placeholder="Enter your username"
                :class="{ 'is-error': usernameError }"
                clearable
                size="large"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Password" :error="passwordError" class="form-item">
              <el-input
                v-model="password"
                type="password"
                placeholder="Enter your password"
                :class="{ 'is-error': passwordError }"
                clearable
                size="large"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button 
                :disabled="passwordError || usernameError"
                type="primary" 
                native-type="submit" 
                size="large" 
                :loading="loading"
                class="login-button"
              >
                {{ loading ? 'Signing in...' : 'Sign In' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="demo-credentials">
            <p class="demo-text">Demo credentials:</p>
            <p class="demo-details">
              <strong class="demo-label">Username:</strong> admin | 
              <strong class="demo-label">Password:</strong> admin1234$
            </p>
          </div>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: v-bind('styles.gradients.primaryPurple');
}

.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.login-card-wrapper {
  width: 100%;
  max-width: 28rem;
  padding: 1.25rem;
}

.login-card {
  border-radius: v-bind('styles.borderRadius.xxl');
  overflow: hidden;
  box-shadow: v-bind('styles.shadows.xxl');
}

.login-header {
  text-align: center;
  padding: 1.25rem 0;
}

.login-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: v-bind('styles.colors.primary');
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: v-bind('styles.colors.gray600');
}

.login-form {
  padding: 1.25rem 0;
}

.form-item {
  margin-bottom: 1.5rem;
}

.login-button {
  width: 100%;
  height: 3rem;
  background: v-bind('styles.gradients.primaryPurple');
  border: none;
  border-radius: v-bind('styles.borderRadius.lg');
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-0.125rem);
  box-shadow: v-bind('styles.shadows.lg');
}

.demo-credentials {
  text-align: center;
  padding: 1.25rem 0;
  border-top: 1px solid v-bind('styles.colors.gray200');
  margin-top: 1.25rem;
}

.demo-text {
  color: v-bind('styles.colors.gray600');
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.demo-details {
  font-size: 0.875rem;
}

.demo-label {
  color: v-bind('styles.colors.primary');
}
</style>
