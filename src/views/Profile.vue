<template>
    <div class="profile-container">
        <h1>Profile</h1>
        <div v-if="isLoading" class="loading">Loading...</div>
        <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-else class="profile-details">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>User ID:</strong> {{ user.user_id }}</p>

            <!-- Menampilkan role untuk admin -->
            <p v-if="authStore.user.role === 'admin'"><strong>Role:</strong> Admin</p>

            <button @click="signOut" class="signout-button">Sign Out</button>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '../store/auth';
import { getUserById } from '../api';

export default {
    name: 'Profile',
    data() {
        return {
            user: null,
            isLoading: true,
            errorMessage: null,
        };
    },
    methods: {
        async fetchUserDetails() {
            try {
                this.isLoading = true;
                const authStore = useAuthStore();

                // Pastikan user_id dan role ada di store sebelum melanjutkan
                if (!authStore.user || !authStore.user.user_id) {
                    throw new Error('User ID not found in store');
                }

                // Pastikan user memiliki role yang valid
                if (!authStore.user.role) {
                    throw new Error('User role not found in store');
                }

                // Panggil API untuk mendapatkan data user berdasarkan user_id
                const response = await getUserById(authStore.user.user_id);
                this.user = response; // Simpan data user yang diterima dari API
            } catch (error) {
                // Penanganan error, termasuk redirect jika token kedaluwarsa
                if (error.response?.data?.error === 'Token is expired') {
                    this.errorMessage = 'Your session has expired. Redirecting to login...';
                } else {
                    this.errorMessage = 'Failed to load user details. Please try again later.';
                }
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
        signOut() {
            const authStore = useAuthStore();
            authStore.signOut(); // Clear authentication state
            this.$router.push('/login'); // Redirect to login
        },
    },
    computed: {
        authStore() {
            return useAuthStore();
        },
    },
    mounted() {
        if (!this.authStore.isAuthenticated) {
            this.$router.push('/login'); // Redirect to login if not authenticated
        } else if (this.authStore.user.role !== 'admin' && this.authStore.user.role !== 'user') {
            // Jika role tidak valid atau tidak sesuai, redirect ke halaman lain
            this.$router.push('/access-denied');
        } else {
            // Pastikan data user di store sudah tersedia sebelum memuat detail
            this.fetchUserDetails(); // Ambil detail pengguna dengan user_id
        }
    },
};
</script>

<style scoped>
.profile-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.loading {
    text-align: center;
    color: #999;
}

.error {
    color: red;
    margin-top: 10px;
}

.profile-details p {
    margin: 8px 0;
}

.signout-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #ff4d4f;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.signout-button:hover {
    background-color: #e63946;
}
</style>