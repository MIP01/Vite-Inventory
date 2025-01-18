import axios from 'axios';
import { useAuthStore } from './store/auth'; // Impor store Pinia untuk autentikasi
import { useAlertStore } from './store/alert';
import router from './router';

// Konfigurasi dasar Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menangani error token expired
apiClient.interceptors.response.use(
  (response) => response, // Jika respons berhasil, kembalikan langsung
  (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error === 'Token is expired'
    ) {
      console.warn('Token expired, clearing auth state and redirecting to login...');
      const authStore = useAuthStore(); // Reset autentikasi
      authStore.signOut();
      localStorage.removeItem('token'); // Hapus token
      router.push('/login'); // Arahkan ke halaman login
    }
    return Promise.reject(error); // Lempar error agar bisa ditangani lebih lanjut
  }
);

export default apiClient;

// Fungsi akses endpoint API
export const getUserById = async (id) => {
  const authStore = useAuthStore(); // Ambil store auth untuk mendapatkan token

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore.user.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.get(`/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    console.log('Fetched user:', response.data);
    return response.data; // Mengembalikan data pengguna
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    const { token } = response.data;

    // Simpan token ke localStorage
    const authStore = useAuthStore();
    authStore.login(token);

    return response.data;
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    throw error.response?.data || error; // Lemparkan error untuk ditangani di komponen
  }
};


export const logout = () => {
  localStorage.removeItem('token'); // Hapus token dari localStorage
  const authStore = useAuthStore();
  authStore.signOut(); // Hapus status autentikasi di Pinia
};

export const getItems = async () => {
  try {
    const response = await apiClient.get('/item');
    return response.data.item; // Mengembalikan array item
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error; // Lemparkan error untuk penanganan lebih lanjut
  }
};

export const getItemById = async (id) => {
  try {
    const response = await apiClient.get(`/item/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item with ID ${id}:`, error);
    throw error;
  }
};

export const getChart = async () => {
  const authStore = useAuthStore(); // Ambil store auth untuk mendapatkan token

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.get(`/chart`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data.transaction;
  } catch (error) {
    console.error('Error fetching chart:', error.response?.data || error.message);
    throw error;
  }
};

export const addChart = async (data) => {
  const authStore = useAuthStore(); // Ambil store auth untuk mendapatkan token
  const alertStore = useAlertStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.post(`/chart`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error; // Tetap lempar error agar bisa ditangani lebih lanjut
  }
};

export const updateChartById = async (transactionId, data) => {
  const authStore = useAuthStore(); // Ambil store auth untuk mendapatkan token
  const alertStore = useAlertStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.put(`/chart/${transactionId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data.transaction;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error; // Tetap lempar error agar bisa ditangani lebih lanjut
  }
};

export const deleteChart = async (transactionId) => {
  const authStore = useAuthStore(); // Ambil store auth untuk mendapatkan token
  const alertStore = useAlertStore(); // Akses alert store
  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.delete(`/chart/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error; // Tetap lempar error agar bisa ditangani lebih lanjut
  }
};