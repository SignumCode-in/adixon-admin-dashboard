import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { clinicAPI } from '../services/api';

const ClinicContext = createContext(null);

export const ClinicProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedClinicId, setSelectedClinicId] = useState('all');
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  // Fetch list of clinics if user is Master Admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchClinics();
    } else if (user?.clinic_id) {
      const cid = user.clinic_id._id || user.clinic_id;
      setSelectedClinicId(cid);
    }
  }, [user]);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await clinicAPI.getClinics({ limit: 100 });
      setClinics(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch clinics for clinic context selector:', err);
    } finally {
      setLoadingClinics(false);
    }
  };

  const currentClinic = clinics.find((c) => c._id === selectedClinicId) || null;

  return (
    <ClinicContext.Provider
      value={{
        selectedClinicId,
        setSelectedClinicId,
        clinics,
        currentClinic,
        loadingClinics,
        refetchClinics: fetchClinics,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
