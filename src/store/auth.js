import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: !!localStorage.getItem('token'), // Check if token exists in local storage
        user: null, // User data (user_id, role, etc.)
    }),

    actions: {
        login(token) {
            localStorage.setItem('token', token); // Simpan token ke localStorage
            this.setUserFromToken(); // Perbarui state dengan token yang baru
        },

        setUserFromToken() {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    this.user = {
                        user_id: decoded.user_id,
                        role: decoded.role,
                    };
                    this.isAuthenticated = true;
                } catch (error) {
                    console.error('Invalid token:', error);
                    this.signOut(); // Token tidak valid, hapus
                }
            } else {
                this.signOut(); // Jika token tidak ada, set user ke null
            }
        },

        signOut() {
            this.isAuthenticated = false;
            this.user = null;
            localStorage.removeItem('token');
            
            // Bersihkan state lain yang mungkin bergantung pada autentikasi
            // Misalnya cache data user, dll
            localStorage.removeItem('redirectRoute');
        },

        loadToken() {
            this.setUserFromToken(); // Muat user dari token
        },
    },
});