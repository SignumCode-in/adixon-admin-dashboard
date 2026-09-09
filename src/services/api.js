import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.100:3000/api/v1';

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
      // Clear token if unauthenticated
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/generate-token');
      if (!isAuthRoute) {
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        const isAdminPath = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  generateToken: async (email, password) => {
    const response = await apiClient.post('/auth/generate-token', { email, password });
    return response.data;
  },
  login: async (token) => {
    const response = await apiClient.post('/auth/login', { token });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  refreshToken: async (refresh_token) => {
    const response = await apiClient.post('/auth/refresh-token', { refresh_token });
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
  getClinics: async (params = {}) => {
    const response = await apiClient.get('/clinics', { params });
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
  getPatients: async (params = {}) => {
    const response = await apiClient.get('/patients', { params });
    return response.data;
  },
  getPatientById: async (id) => {
    const response = await apiClient.get(`/patients/${id}`);
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
  getAppointments: async (params = {}) => {
    const response = await apiClient.get('/appointments', { params });
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
  getPrescriptions: async (params = {}) => {
    const response = await apiClient.get('/prescriptions', { params });
    return response.data;
  },
  createPrescription: async (prescriptionData) => {
    const response = await apiClient.post('/prescriptions', prescriptionData);
    return response.data;
  },
};

export const medicineAPI = {
  getMedicines: async (params = {}) => {
    const response = await apiClient.get('/medicines', { params });
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
  getMedicineOptions: async () => {
    const response = await apiClient.get('/medicines/options');
    return response.data;
  },
  addMedicineOption: async (data) => {
    const response = await apiClient.post('/medicines/options', data);
    return response.data;
  },
  deleteMedicineOption: async (data) => {
    const response = await apiClient.delete('/medicines/options', { data });
    return response.data;
  },
  bulkUploadMedicines: async (formData) => {
    const response = await apiClient.post('/medicines/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const labAPI = {
  getLabs: async (params = {}) => {
    const response = await apiClient.get('/labs', { params });
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
  getCertificates: async (params = {}) => {
    const response = await apiClient.get('/certificates', { params });
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
  getInstructions: async (params = {}) => {
    const response = await apiClient.get('/instructions', { params });
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
  getConsents: async (params = {}) => {
    const response = await apiClient.get('/consents', { params });
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
  getTemplates: async (params = {}) => {
    const response = await apiClient.get('/templates', { params });
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
