<template>
    <div class="login-container">
        <h1>Login</h1>
        <BForm @submit.prevent="handleLogin">
            <BFormFloatingLabel label="Email address" for="email" label-for="floatingEmail" class="my-2">
                <BFormInput v-model="credentials.email" id="email" type="email" placeholder="Email address" class="text-dark" />
            </BFormFloatingLabel>
            <BFormFloatingLabel label="Password" for="password" label-for="floatingPassword" class="my-2">
                <BFormInput v-model="credentials.password" id="password" type="password" placeholder="Password" class="text-dark" />
            </BFormFloatingLabel>
            <b-button variant="primary" type="submit" :disabled="isLoading">Login</b-button>
        </BForm>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { ref } from 'vue';
import { login } from '../api'; // API untuk login
import { useAuthStore } from '../store/auth'; // Pinia Store
import { useRouter } from 'vue-router';
import { useAlertStore } from '../store/alert';

export default {
    name: 'Login',
    setup() {
        const alertStore = useAlertStore();
        const credentials = ref({ email: '', password: '' });
        const isLoading = ref(false);
        const errorMessage = ref(null);

        const authStore = useAuthStore(); // Mendapatkan Pinia store
        const router = useRouter();

        const handleLogin = async () => {
            isLoading.value = true;
            errorMessage.value = null;

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
            errorMessage,
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
