import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.101:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('id_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle session expiration or unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear tokens
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Simulates Firebase Sign In to get ID Token & Refresh Token
  generateToken: async (email, password) => {
    const response = await apiClient.post('/auth/generate-token', { email, password });
    return response.data;
  },
  // Submits Firebase ID Token to backend to load user metadata
  login: async (token) => {
    const response = await apiClient.post('/auth/login', { token });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  verifyOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  resetPassword: async (email, otp, new_password) => {
    const response = await apiClient.post('/auth/reset-password', { email, otp, new_password });
    return response.data;
  },
};

export const userAPI = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
  updateUserStatus: async (id, status) => {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },
};

export const clinicAPI = {
  getClinics: async () => {
    const response = await apiClient.get('/clinics');
    return response.data;
  },
  getClinicById: async (id) => {
    const response = await apiClient.get(`/clinics/${id}`);
    return response.data;
  },
  createClinic: async (clinicData) => {
    const response = await apiClient.post('/clinics', clinicData);
    return response.data;
  },
  updateClinic: async (id, clinicData) => {
    const response = await apiClient.put(`/clinics/${id}`, clinicData);
    return response.data;
  },
};

export const patientAPI = {
  getPatients: async () => {
    const response = await apiClient.get('/patients');
    return response.data;
  },
  createPatient: async (patientData) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
  },
  updatePatient: async (id, patientData) => {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },
  deletePatient: async (id) => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },
};

export const appointmentAPI = {
  getAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return response.data;
  },
  createAppointment: async (appointmentData) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },
  getDashboardStats: async (clinicId) => {
    const response = await apiClient.get(`/appointments/stats/${clinicId}`);
    return response.data;
  },
};

export const prescriptionAPI = {
  getPrescriptions: async () => {
    const response = await apiClient.get('/prescriptions');
    return response.data;
  },
  createPrescription: async (prescriptionData) => {
    const response = await apiClient.post('/prescriptions', prescriptionData);
    return response.data;
  },
};

export const medicineAPI = {
  getMedicines: async () => {
    const response = await apiClient.get('/medicines');
    return response.data;
  },
  createMedicine: async (data) => {
    const response = await apiClient.post('/medicines', data);
    return response.data;
  },
  updateMedicine: async (id, data) => {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data;
  },
  deleteMedicine: async (id) => {
    const response = await apiClient.delete(`/medicines/${id}`);
    return response.data;
  },
};

export const labAPI = {
  getLabs: async () => {
    const response = await apiClient.get('/labs');
    return response.data;
  },
  createLab: async (data) => {
    const response = await apiClient.post('/labs', data);
    return response.data;
  },
  updateLab: async (id, data) => {
    const response = await apiClient.put(`/labs/${id}`, data);
    return response.data;
  },
  deleteLab: async (id) => {
    const response = await apiClient.delete(`/labs/${id}`);
    return response.data;
  },
};

export const certificateAPI = {
  getCertificates: async () => {
    const response = await apiClient.get('/certificates');
    return response.data;
  },
  createCertificate: async (data) => {
    const response = await apiClient.post('/certificates', data);
    return response.data;
  },
  deleteCertificate: async (id) => {
    const response = await apiClient.delete(`/certificates/${id}`);
    return response.data;
  },
};

export const instructionAPI = {
  getInstructions: async () => {
    const response = await apiClient.get('/instructions');
    return response.data;
  },
  createInstruction: async (data) => {
    const response = await apiClient.post('/instructions', data);
    return response.data;
  },
  updateInstruction: async (id, data) => {
    const response = await apiClient.put(`/instructions/${id}`, data);
    return response.data;
  },
  deleteInstruction: async (id) => {
    const response = await apiClient.delete(`/instructions/${id}`);
    return response.data;
  },
};

export const consentAPI = {
  getConsents: async () => {
    const response = await apiClient.get('/consents');
    return response.data;
  },
  createConsent: async (data) => {
    const response = await apiClient.post('/consents', data);
    return response.data;
  },
  deleteConsent: async (id) => {
    const response = await apiClient.delete(`/consents/${id}`);
    return response.data;
  },
};

export const templateAPI = {
  getTemplates: async () => {
    const response = await apiClient.get('/templates');
    return response.data;
  },
  createTemplate: async (data) => {
    const response = await apiClient.post('/templates', data);
    return response.data;
  },
  updateTemplate: async (id, data) => {
    const response = await apiClient.put(`/templates/${id}`, data);
    return response.data;
  },
  deleteTemplate: async (id) => {
    const response = await apiClient.delete(`/templates/${id}`);
    return response.data;
  },
};

export const dashboardAPI = {
  getMasterData: async (params = {}) => {
    const response = await apiClient.get('/dashboard/master', { params });
    return response.data;
  },
};

export default apiClient;
