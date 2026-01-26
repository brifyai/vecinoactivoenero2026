import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loadServices = createAsyncThunk('services/load', async () => {
  const savedServices = JSON.parse(localStorage.getItem('services') || '[]');
  
  // Si no hay servicios, crear algunos de ejemplo
  if (savedServices.length === 0) {
    const defaultServices = [
      {
        id: 1,
        name: 'Carlos Muñoz',
        category: 'plomero',
        avatar: 'https://i.pravatar.cc/100?img=11',
        rating: 4.9,
        reviews: 28,
        verified: true,
        verifiedBy: 18,
        yearsInNeighborhood: 5,
        priceRange: '$',
        availability: 'Lun-Sáb 8am-6pm',
        phone: '+56 9 1234 5678',
        email: 'carlos@plomeria.cl',
        description: 'Plomero profesional con más de 10 años de experiencia',
        neighborhoodId: null
      },
      {
        id: 2,
        name: 'Ana Silva',
        category: 'electricista',
        avatar: 'https://i.pravatar.cc/100?img=5',
        rating: 4.7,
        reviews: 15,
        verified: true,
        verifiedBy: 12,
        yearsInNeighborhood: 3,
        priceRange: '$',
        availability: 'Lun-Vie 9am-7pm',
        phone: '+56 9 8765 4321',
        email: 'ana@electricidad.cl',
        description: 'Electricista certificada, trabajos residenciales y comerciales',
        neighborhoodId: null
      }
    ];
    
    localStorage.setItem('services', JSON.stringify(defaultServices));
    return defaultServices;
  }
  
  return savedServices;
});

export const addService = createAsyncThunk('services/add', async (serviceData) => {
  const newService = {
    id: Date.now(),
    rating: 0,
    reviews: 0,
    verified: false,
    verifiedBy: 0,
    ...serviceData
  };

  const stored = JSON.parse(localStorage.getItem('services') || '[]');
  const updated = [...stored, newService];
  localStorage.setItem('services', JSON.stringify(updated));
  return newService;
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: { 
    services: [], 
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load services
      .addCase(loadServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadServices.fulfilled, (state, action) => {
        state.services = action.payload;
        state.loading = false;
      })
      .addCase(loadServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add service
      .addCase(addService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      });
  }
});

export const { clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
