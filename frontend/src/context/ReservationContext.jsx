import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from '../services/api.js';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    flat: 'All',
    search: ''
  });

  const fetchReservations = useCallback(async (customFilters = filters) => {
    if (!isAuthenticated || !token) {
      setReservations([]);
      setStats(null);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getReservations(customFilters, token);
      setReservations(data || []);
      const statsData = await api.getStats(token);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, token]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const submitReservation = async (payload) => {
    setLoading(true);
    try {
      const res = await api.createReservation(payload);
      if (isAuthenticated) {
        await fetchReservations();
      }
      return res.reservation;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    const res = await api.updateReservationStatus(id, status, notes, token);
    await fetchReservations();
    return res.reservation;
  };

  const getReservationById = async (idOrPassId) => {
    return api.getReservation(idOrPassId);
  };

  return (
    <ReservationContext.Provider value={{
      reservations,
      stats,
      loading,
      filters,
      setFilters,
      fetchReservations,
      submitReservation,
      updateStatus,
      getReservationById
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}
