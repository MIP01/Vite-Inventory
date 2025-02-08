<template>
    <BCard title="Card Title" no-body>
        <BCardHeader header-tag="nav" class="home-header">
            <BNav card-header tabs class="d-flex justify-content-between">
                <!-- Tab Items lainnya di kiri -->
                <BNavItem v-for="(tab, index) in tabs.slice(0, tabs.length - 1)" :key="index"
                    :active="activeTab === index">
                    <router-link :to="tab.route" @click="setActiveTab(index)" class="no-underline"
                        :class="{ 'text-light': activeTab !== index, 'text-primary': activeTab === index }">
                        {{ tab.label }}
                    </router-link>
                </BNavItem>

                <!-- Elemen untuk mendorong tab Profile ke kanan -->
                <div class="ml-auto">
                    <!-- Profile Tab -->
                    <BNavItem :active="activeTab === tabs.length - 1">
                        <router-link :to="tabs[tabs.length - 1].route" @click="setActiveTab(tabs.length - 1)"
                            class="no-underline"
                            :class="{ 'text-light': activeTab !== tabs.length - 1, 'text-primary': activeTab === tabs.length - 1 }">
                            {{ tabs[tabs.length - 1].label }}
                        </router-link>
                    </BNavItem>
                </div>
            </BNav>
        </BCardHeader>

        <BCardBody>
            <slot>
                <!-- Konten default jika slot tidak diisi -->
                <BCardText>
                    {{ tabs[activeTab]?.content || "Default content if no slot is provided." }}
                </BCardText>
            </slot>
        </BCardBody>
    </BCard>
</template>

<script>
import { useAuthStore } from '../store/auth';
import { storeToRefs } from 'pinia';

export default {
    name: 'Nav',
    setup() {
        const authStore = useAuthStore();
        const { user } = storeToRefs(authStore);
        return { authStore, user };
    },
    data() {
        return {
            activeTab: 0,
            tabs: [],
            isAdmin: false
        };
    },
    created() {
        this.setTabsBasedOnRole(this.user?.role);
        console.log('Nav component created, user role:', this.user?.role);
    },
    mounted() {
        // Ambil tab terakhir dari localStorage
        const lastActiveTab = localStorage.getItem('lastActiveTab');
        const lastActivePath = localStorage.getItem('lastActivePath');
        
        if (lastActiveTab && lastActivePath) {
            // Jika ada data tersimpan, gunakan itu
            this.activeTab = parseInt(lastActiveTab);           
        } else {
            // Jika tidak ada data tersimpan, gunakan rute saat ini
            this.setActiveTabByRoute(this.$route.path);
        }
    },
    watch: {
        '$route.path'(newRoute) {
            this.setActiveTabByRoute(newRoute);
        },
        'user': {
            handler(newUser) {
                this.setTabsBasedOnRole(newUser?.role);
                console.log('User changed, updating tabs with role:', newUser?.role);
            },
            deep: true
        }
    },
    methods: {
        setTabsBasedOnRole(role) {
            this.isAdmin = role === 'admin';
            if (this.isAdmin) {
                this.tabs = [
                    { label: "Dashboard", route: '/dashboard', content: "Panel admin untuk mengelola items." },
                    { label: "Transaction", route: '/user-transaction', content: "Halaman User Transaction." },
                    { label: "Users", route: '/users', content: "Halaman Users." },
                    { label: "Profile", route: '/profile', content: "Halaman Profile." },

                ];
                console.log('Admin tabs set');
            } else {
                this.tabs = [
                    { label: "Items", route: '/', content: "Daftar items akan ditampilkan di sini." },
                    { label: "Chart", route: '/chart', content: "Halaman Chart." },
                    { label: "Transaction", route: '/transaction', content: "Halaman Transaction." },
                    { label: "Profile", route: '/profile', content: "Halaman Profile." },
                ];
                console.log('Regular user tabs set');
            }
        },
        setActiveTab(index) {
            this.activeTab = index;
            // Simpan state ke localStorage
            localStorage.setItem('lastActiveTab', index.toString());
            localStorage.setItem('lastActivePath', this.tabs[index].route);
        },
        setActiveTabByRoute(route) {
            const index = this.tabs.findIndex((tab) => tab.route === route);
            
            if (index !== -1) {
                // Jika rute ditemukan dalam tabs, sinkronkan tab aktif
                this.activeTab = index;
                localStorage.setItem('lastActiveTab', index.toString());
                localStorage.setItem('lastActivePath', route);
            } else if (route !== '/signup') {
                // Jika rute tidak ditemukan dalam tabs dan bukan /signup, biarkan rute berjalan tanpa mengubah tab
                console.log("Rute tidak ditemukan di tabs, tidak ada perubahan tab:", route);
            }
        },
        goToLogin() {
            // Arahkan pengguna ke halaman login
            this.$router.push("/login");
        },
    },
};
</script>

<style scoped>
.home-header {
  background-color: #7a86b1; /* Ganti dengan warna kustom Anda */
}

/* Menghilangkan underline pada router-link */
.no-underline {
    text-decoration: none;
}

/* Untuk mendorong dropdown ke kanan */
.ml-auto {
    margin-left: auto;
}

.mdi-chevron-down {
    margin-left: 0.5rem;
}

.card {
    --bs-card-inner-border-radius: 0 !important;
    --bs-card-border-width: 0 !important;
    border-width: 0 !important;
}

.card-header {
    border-bottom: 0px !important;
}

.text-primary {
    color: #007bff;
    /* Warna biru untuk tab aktif */
}
</style>
