import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseBusinessService from '../../services/supabaseBusinessService';

export const loadBusinesses = createAsyncThunk(
  'localBusiness/loadBusinesses',
  async ({ neighborhoodId, category }, { rejectWithValue }) => {
    try {
      const businesses = await supabaseBusinessService.getBusinesses(neighborhoodId, category);
      return businesses;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerBusiness = createAsyncThunk(
  'localBusiness/registerBusiness',
  async (businessData, { rejectWithValue }) => {
    try {
      const newBusiness = await supabaseBusinessService.registerBusiness(businessData);
      return newBusiness;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addReview = createAsyncThunk(
  'localBusiness/addReview',
  async ({ businessId, reviewData }, { rejectWithValue }) => {
    try {
      const review = await supabaseBusinessService.addReview(businessId, reviewData);
      return { businessId, review };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOffer = createAsyncThunk(
  'localBusiness/createOffer',
  async ({ businessId, offerData, userId }, { rejectWithValue }) => {
    try {
      const offer = await supabaseBusinessService.createOffer(businessId, offerData, userId);
      return { businessId, offer };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBusiness = createAsyncThunk(
  'localBusiness/updateBusiness',
  async ({ businessId, updates, userId }, { rejectWithValue }) => {
    try {
      const updatedBusiness = await supabaseBusinessService.updateBusiness(businessId, updates, userId);
      return updatedBusiness;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchBusinesses = createAsyncThunk(
  'localBusiness/searchBusinesses',
  async ({ searchTerm, filters }, { rejectWithValue }) => {
    try {
      const businesses = await supabaseBusinessService.searchBusinesses(searchTerm, filters);
      return businesses;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const localBusinessSlice = createSlice({
  name: 'localBusiness',
  initialState: { 
    businesses: [], 
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
      .addCase(loadBusinesses.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(loadBusinesses.fulfilled, (state, action) => { 
        state.businesses = action.payload; 
        state.loading = false; 
      })
      .addCase(loadBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerBusiness.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerBusiness.fulfilled, (state, action) => { 
        state.businesses.push(action.payload); 
        state.loading = false;
      })
      .addCase(registerBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        const business = state.businesses.find(b => b.id === action.payload.businessId);
        if (business) {
          if (!business.reviews) business.reviews = [];
          business.reviews.push(action.payload.review);
          business.total_reviews = (business.total_reviews || 0) + 1;
        }
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        const business = state.businesses.find(b => b.id === action.payload.businessId);
        if (business) {
          if (!business.offers) business.offers = [];
          business.offers.push(action.payload.offer);
        }
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        const businessIndex = state.businesses.findIndex(b => b.id === action.payload.id);
        if (businessIndex !== -1) {
          state.businesses[businessIndex] = action.payload;
        }
      })
      .addCase(searchBusinesses.fulfilled, (state, action) => {
        state.businesses = action.payload;
      });
  }
});

export const { clearError } = localBusinessSlice.actions;
export default localBusinessSlice.reducer;
