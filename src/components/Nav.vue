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
export default {
    name: 'Nav',
    data() {
        return {
            activeTab: 0, // Tab aktif (default adalah tab pertama)
            tabs: [
                { label: "Items", route: '/', content: "Daftar items akan ditampilkan di sini." },
                { label: "Chart", route: '/chart', content: "Halaman About." },
                { label: "Transaction", route: '/transaction', content: "Halaman Contact." },
                { label: "Profile", route: '/profile', content: "Halaman Profile." },
            ],
        };
    },
    mounted() {
        // Sinkronkan activeTab dengan rute saat ini
        this.setActiveTabByRoute(this.$route.path);
    },
    watch: {
        // Sinkronkan activeTab saat rute berubah
        '$route.path'(newRoute) {
            this.setActiveTabByRoute(newRoute);
        },
    },
    methods: {
        setActiveTab(index) {
            // Mengatur tab aktif
            this.activeTab = index;
            // Simpan tab yang terakhir diakses ke localStorage
            localStorage.setItem('lastActiveTab', index);
        },
        setActiveTabByRoute(route) {
            // Tentukan tab aktif berdasarkan rute saat ini
            const index = this.tabs.findIndex((tab) => tab.route === route);
            this.activeTab = index !== -1 ? index : 0; // Default ke tab pertama jika rute tidak ditemukan
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
