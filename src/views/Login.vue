<template>
    <b-container class="login-container">
        <h1>Login</h1>
        <BForm @submit.prevent="handleLogin">
            <BFormFloatingLabel label="Email address" for="email" label-for="floatingEmail" class="my-2">
                <BFormInput v-model="credentials.email" id="email" type="email" placeholder="Email address" class="text-dark" />
            </BFormFloatingLabel>
            <BFormFloatingLabel label="Password" for="password" label-for="floatingPassword" class="my-2">
                <BFormInput v-model="credentials.password" id="password" type="password" placeholder="Password" class="text-dark" />
            </BFormFloatingLabel>
            <b-row class="mt-2">
                <b-col cols="12" class="text-center">
                    <b-link href="/signup" class="text-decoration-none">
                        Create Account
                    </b-link>
                </b-col>
            </b-row>
            <b-button variant="primary" type="submit" :disabled="isLoading" class="mt-3 w-100">Login</b-button>
        </BForm>
    </b-container>
</template>

<script>
import { ref } from 'vue';
import { login } from '../api';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { useAlertStore } from '../store/alert';

export default {
    name: 'Login',
    setup() {
        const alertStore = useAlertStore();
        const credentials = ref({ email: '', password: '' });
        const isLoading = ref(false);

        const authStore = useAuthStore(); // Mendapatkan Pinia store
        const router = useRouter();

        const handleLogin = async () => {
            isLoading.value = true;

            try {
                const response = await login(credentials.value); // Panggil API login
                const { token } = response; // Ambil token dari response

                // Simpan token di Pinia store
                authStore.login(token); // Panggil authStore.login untuk memperbarui state

                // Navigasi ke halaman tujuan setelah login
                const redirectRoute = localStorage.getItem('redirectRoute') || '/';
                localStorage.removeItem('redirectRoute');
                router.push(redirectRoute);

                alertStore.showAlert(response.message || 'Login successful!', false);
            } catch (error) {
                alertStore.showAlert(error.response?.data?.error || 'Login failed. Please try again.', true);
                console.error(error);
            } finally {
                isLoading.value = false;
            }
        };

        return {
            credentials,
            isLoading,
            handleLogin,
        };
    },
};
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>
