import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadSecurityReports = createAsyncThunk('security/loadReports', async () => {
  const savedReports = JSON.parse(localStorage.getItem('securityReports') || '[]');
  
  // Si no hay reportes, crear algunos de ejemplo
  if (savedReports.length === 0) {
    const exampleReports = [
      {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        userAvatar: 'https://i.pravatar.cc/100?img=11',
        type: 'robo',
        title: 'Intento de robo a vehículo',
        description: 'Rompieron vidrio de auto estacionado. Carabineros ya vino. Ojo con dejar cosas a la vista.',
        lat: -33.4489,
        lng: -70.6693,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
        neighborhoodId: null
      },
      {
        id: 2,
        userId: 2,
        userName: 'María González',
        userAvatar: 'https://i.pravatar.cc/100?img=5',
        type: 'sospechoso',
        title: 'Persona sospechosa merodeando',
        description: 'Persona merodeando hace 20 min, probando manillas de autos. Vestía ropa oscura.',
        lat: -33.4495,
        lng: -70.6700,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 min
        neighborhoodId: null
      },
      {
        id: 3,
        userId: 3,
        userName: 'Carlos Muñoz',
        userAvatar: 'https://i.pravatar.cc/100?img=12',
        type: 'vehiculo',
        title: 'Auto sospechoso',
        description: 'Auto sin patente dando vueltas por la cuadra. Ya pasó 3 veces.',
        lat: -33.4480,
        lng: -70.6685,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Hace 5 horas
        neighborhoodId: null
      }
    ];
    
    localStorage.setItem('securityReports', JSON.stringify(exampleReports));
    return exampleReports;
  }
  
  return savedReports;
});

export const createSecurityReport = createAsyncThunk('security/createReport', async ({ reportData, user }) => {
  const newReport = {
    id: Date.now(),
    userId: user?.id,
    userName: user?.name,
    userAvatar: user?.avatar,
    timestamp: new Date().toISOString(),
    ...reportData
  };

  const stored = JSON.parse(localStorage.getItem('securityReports') || '[]');
  const updated = [newReport, ...stored];
  localStorage.setItem('securityReports', JSON.stringify(updated));
  return newReport;
});

const securitySlice = createSlice({
  name: 'security',
  initialState: { 
    reports: [], 
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
      // Load reports
      .addCase(loadSecurityReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSecurityReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.loading = false;
      })
      .addCase(loadSecurityReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create report
      .addCase(createSecurityReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
      });
  }
});

export const { clearError } = securitySlice.actions;
export default securitySlice.reducer;
