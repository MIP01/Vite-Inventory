<template>
    <b-container class="profile-container">
        <h1 class="text-center mb-4">Profile Management</h1>
        <b-row v-if="isLoading" class="loading">Loading...</b-row>
        <b-row v-else>
            <b-col md="12">
                <b-container>
                    <b-row>
                        <!-- Bagian Kiri - Form Update Profil -->
                        <b-col md="6" class="update-profile-section">
                            <b-container class="section-container">
                                <h3>Update Profile</h3>
                                <b-form @submit.prevent="updateProfile">
                                    <b-form-group label="Name">
                                        <b-form-input
                                            v-model="formData.name"
                                            type="text"
                                            :placeholder="user.name"
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group label="Email">
                                        <b-form-input
                                            v-model="formData.email"
                                            type="email"
                                            :placeholder="user.email"
                                        ></b-form-input>
                                    </b-form-group>

                                    <b-form-group label="Password">
                                        <div class="password-input-group">
                                            <b-form-input
                                                v-model="formData.password"
                                                :type="showPassword ? 'text' : 'password'"
                                                :placeholder="user.password"
                                            ></b-form-input>
                                            <b-button 
                                                @click="togglePassword"
                                                variant="outline-secondary"
                                                class="password-toggle-btn"
                                            >
                                                <i :class="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></i>
                                            </b-button>
                                        </div>
                                    </b-form-group>

                                    <b-button type="submit" variant="primary" class="w-100 mt-3">
                                        Update Profile
                                    </b-button>
                                </b-form>
                            </b-container>
                        </b-col>

                        <!-- Bagian Kanan - Informasi Profil -->
                        <b-col md="6" class="profile-details-section">
                            <b-container class="section-container">
                                <h3>Profile Details</h3>
                                <div class="profile-details p-3">
                                    <p><strong>Name:</strong> {{ user.name }}</p>
                                    <p><strong>Email:</strong> {{ user.email }}</p>
                                    <p><strong>User ID:</strong> {{ user.user_id }}</p>
                                    <p v-if="authStore.user.role === 'admin'"><strong>Role:</strong> Admin</p>
                                </div>

                                <b-button variant="danger" class="mt-3 w-100" @click="signOut">
                                    Sign Out
                                </b-button>
                            </b-container>
                        </b-col>
                    </b-row>
                </b-container>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import { useAuthStore } from '../store/auth';
import { useAlertStore } from '../store/alert';
import { getUserById, updateUser, getAdmin, updateAdmin } from '../api';

export default {
    name: 'Profile',
    data() {
        return {
            user: null,
            isLoading: true,
            showPassword: false,
            formData: {
                name: '',
                email: '',
                password: '',
            },
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

                if (authStore.user.role === 'admin') {
                    const response = await getAdmin(authStore.user.user_id);
                    this.user = {
                        name: response.name,
                        email: response.email,
                        user_id: response.admin_id,
                        created_at: response.created_at,
                        updated_at: response.updated_at
                    };
                } else {
                    const response = await getUserById(authStore.user.user_id);
                    this.user = response;
                }
            } catch (error) {
                const alertStore = useAlertStore();
                // Penanganan error, termasuk redirect jika token kedaluwarsa
                if (error.response?.data?.error === 'Token is expired') {
                    this.errorMessage = 'Your session has expired. Redirecting to login...';
                    alertStore.showAlert(this.errorMessage, true);
                } else {
                    this.errorMessage = 'Failed to load user details. Please try again later.';
                    alertStore.showAlert(this.errorMessage, true);
                }
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
        signOut() {
            const authStore = useAuthStore();
            const alertStore = useAlertStore();
            authStore.signOut();
            alertStore.showAlert('You have been logged out successfully', false);
            this.$router.push('/login');
        },
        async updateProfile() {
            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                
                let response;
                if (authStore.user.role === 'admin') {
                    response = await updateAdmin(authStore.user.user_id, this.formData);
                } else {
                    response = await updateUser(authStore.user.user_id, this.formData);
                }
                
                this.user = {
                    ...this.user,
                    name: this.formData.name || this.user.name,
                    email: this.formData.email || this.user.email
                };
                
                // Reset form
                this.formData = {
                    name: '',
                    email: '',
                    password: ''
                };

                alertStore.showAlert(response.message || 'Profile updated successfully!', false);
            } catch (error) {
                const alertStore = useAlertStore();
                alertStore.showAlert(error.response?.data?.error || 'Failed to update profile. Please try again.', true);
                console.error(error);
            }
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.section-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 20px;
    height: 100%;
}

.update-profile-section,
.profile-details-section {
    padding: 20px;
}

.profile-details {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.profile-details p {
    margin: 8px 0;
}

.loading {
    text-align: center;
    color: #999;
}

.error {
    color: red;
    margin-top: 10px;
}

@media (max-width: 768px) {
    .update-profile-section,
    .profile-details-section {
        margin-bottom: 20px;
    }
}

.password-input-group {
    position: relative;
    display: flex;
    align-items: center;
}

.password-toggle-btn {
    position: absolute;
    right: 0;
    height: 100%;
    border: none;
    background: transparent;
}

.password-toggle-btn:hover {
    background: transparent;
    color: #666;
}
</style>