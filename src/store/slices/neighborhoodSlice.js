import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadNeighborhoods = createAsyncThunk('neighborhood/loadNeighborhoods', async () => {
  const response = await fetch('/data/geo/unidades_vecinales_simple.geojson');
  const data = await response.json();
  return data.features.map(feature => ({
    id: feature.properties.t_id_uv_ca,
    codigo: feature.properties.uv_carto,
    nombre: feature.properties.t_uv_nom,
    comuna: feature.properties.t_com_nom,
    region: feature.properties.t_reg_nom,
    personas: feature.properties.PERSONAS || 0,
    hogares: feature.properties.HOGARES || 0,
    geometry: feature.geometry,
    properties: feature.properties
  }));
});

const neighborhoodSlice = createSlice({
  name: 'neighborhood',
  initialState: { neighborhoods: [], selectedNeighborhood: null, loading: false, error: null },
  reducers: {
    setSelectedNeighborhood: (state, action) => { state.selectedNeighborhood = action.payload; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNeighborhoods.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadNeighborhoods.fulfilled, (state, action) => { state.neighborhoods = action.payload; state.loading = false; })
      .addCase(loadNeighborhoods.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  }
});

export const { setSelectedNeighborhood, clearError } = neighborhoodSlice.actions;
export default neighborhoodSlice.reducer;
