import axios from 'axios';
import { useAuthStore } from './store/auth';
import { useAlertStore } from './store/alert';
import router from './router';

// Konfigurasi dasar Axios
const apiClient = axios.create({
  // for local 
  baseURL: 'http://localhost:8080/api/v1',
  // baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menangani error token expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error === 'Token is expired'
    ) {
      console.warn('Token expired, clearing auth state and redirecting to login...');
      const authStore = useAuthStore();
      const alertStore = useAlertStore();
      
      // Clear auth state
      authStore.signOut();
      localStorage.removeItem('token');
      
      // Tampilkan pesan ke user
      alertStore.showAlert('Your session has ended. Please login again.', true);
      
      // Redirect ke halaman login dengan router
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Fungsi akses endpoint API
export const getUser = async () => {
  const authStore = useAuthStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.get(`/user`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error get chart:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;


  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.delete(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization

      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete user:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }

};

export const createUser = async (userData) => {
  const alertStore = useAlertStore();

  try {
    const response = await apiClient.post(`/user`, userData);
    console.log("User created:", response.data);
    return response.data;
  } catch (error) {
     const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error create user:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true);
    throw error;
  }
};

export const getUserById = async (id) => {
  const authStore = useAuthStore();

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

export const updateUser = async (id, data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
  
  const token = localStorage.getItem('token') || authStore.user.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.put(`/user/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    console.log('Fetched user:', response.data);
    return response.data; // Mengembalikan data pengguna
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error add detail:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }
};

export const login = async (credentials) => {
  const alertStore = useAlertStore();

  try {
    const response = await apiClient.post('/login', credentials);
    const { token } = response.data;

    // Simpan token ke localStorage
    const authStore = useAuthStore();
    authStore.login(token);

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error add chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
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
    throw error;
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
  const authStore = useAuthStore();

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
    console.error('Error get chart:', error.response?.data || error.message);
    throw error;
  }
};

export const addChart = async (data) => {
  const authStore = useAuthStore();
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
    console.error('Error add chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }
};

export const updateChartById = async (transactionId, data) => {
  const authStore = useAuthStore();
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
    throw error;
  }
};

export const deleteChart = async (transactionId) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
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
    throw error;
  }
};

export const getDetail = async () => {
  const authStore = useAuthStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.get(`/detail`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data.detail;
  } catch (error) {
    console.error('Error get detail:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteDetail = async (detailId) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
  
  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.delete(`/detail/${detailId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete detail:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }
};

export const updateDetail = async (detailId, data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.put(`/detail/${detailId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data.detail;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error update chart item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }
};

export const addDetail = async (data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.post(`/detail`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error add detail:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;
  }
};

//admin role
export const getAdmin = async (id) => {
  const authStore = useAuthStore();

  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore.user.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.get(`/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });
    console.log('Fetched admin:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};


export const updateAdmin = async (id, data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
  

  const token = localStorage.getItem('token') || authStore.user.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.put(`/admin/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },

    });
    console.log('Fetched admin:', response.data);
    return response.data; // Mengembalikan data pengguna

  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error update admin:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;

  }
};

export const addItem = async (data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();

  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    console.log('Mengirim data item:', data);
    console.log('Token yang digunakan:', token);
    
    const response = await apiClient.post(`/item`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Response dari server:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error lengkap:', error);
    console.log('Response error:', error.response);
    
    if (error.response?.data) {
      console.log('Server error message:', error.response.data);
    }
    
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    alertStore.showAlert(errorMessage, true);
    throw error;
  }
};

export const updateItemById = async (itemId, data) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();

  const token = localStorage.getItem('token') || authStore?.user?.token;

  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    console.log('Update item ID:', itemId);
    console.log('Data update:', data);
    console.log('Token yang digunakan:', token);
    
    const response = await apiClient.put(`/item/${itemId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Response dari server:', response.data);
    return response.data.item;
  } catch (error) {
    console.log('Error lengkap:', error);
    console.log('Response error:', error.response);
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    alertStore.showAlert(errorMessage, true);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();
  // Ambil token dari localStorage atau store auth
  const token = localStorage.getItem('token') || authStore?.user?.token;


  if (!token) {
    throw new Error('No token available. Please log in first.');
  }

  try {
    const response = await apiClient.delete(`/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },

    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    console.error('Error delete item:', error.response?.data || error.message);
    alertStore.showAlert(errorMessage, true); // Tampilkan pesan error
    throw error;

  }
};