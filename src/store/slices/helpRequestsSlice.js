import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseHelpService from '../../services/supabaseHelpService';

// Async Thunks
export const loadHelpRequests = createAsyncThunk(
  'helpRequests/loadHelpRequests',
  async ({ neighborhoodId, status }, { rejectWithValue }) => {
    try {
      const requests = await supabaseHelpService.getHelpRequests(neighborhoodId, status);
      return requests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createHelpRequest = createAsyncThunk(
  'helpRequests/createHelpRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const newRequest = await supabaseHelpService.createHelpRequest(requestData);
      return newRequest;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const offerHelp = createAsyncThunk(
  'helpRequests/offerHelp',
  async (offerData, { rejectWithValue }) => {
    try {
      const offer = await supabaseHelpService.offerHelp(offerData);
      return { requestId: offerData.requestId, offer };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptOffer = createAsyncThunk(
  'helpRequests/acceptOffer',
  async ({ requestId, offerId, userId }, { rejectWithValue }) => {
    try {
      const request = await supabaseHelpService.acceptOffer(requestId, offerId, userId);
      return request;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveRequest = createAsyncThunk(
  'helpRequests/resolveRequest',
  async ({ requestId, userId }, { rejectWithValue }) => {
    try {
      const request = await supabaseHelpService.resolveRequest(requestId, userId);
      return request;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'helpRequests/cancelRequest',
  async ({ requestId, userId }, { rejectWithValue }) => {
    try {
      const request = await supabaseHelpService.cancelRequest(requestId, userId);
      return request;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'helpRequests/deleteRequest',
  async ({ requestId, userId }, { rejectWithValue }) => {
    try {
      await supabaseHelpService.deleteRequest(requestId, userId);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMyRequests = createAsyncThunk(
  'helpRequests/getMyRequests',
  async (userId, { rejectWithValue }) => {
    try {
      const requests = await supabaseHelpService.getMyRequests(userId);
      return requests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMyOffers = createAsyncThunk(
  'helpRequests/getMyOffers',
  async (userId, { rejectWithValue }) => {
    try {
      const offers = await supabaseHelpService.getMyOffers(userId);
      return offers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const helpRequestsSlice = createSlice({
  name: 'helpRequests',
  initialState: {
    helpRequests: [],
    myRequests: [],
    myOffers: [],
    loading: false,
    error: null
  },
  reducers: {
    clearHelpRequestsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHelpRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHelpRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.helpRequests = action.payload;
      })
      .addCase(loadHelpRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHelpRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(createHelpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.helpRequests.push(action.payload);
        state.myRequests.push(action.payload);
      })
      .addCase(createHelpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(offerHelp.fulfilled, (state, action) => {
        const { requestId, offer } = action.payload;
        const request = state.helpRequests.find(r => r.id === requestId);
        if (request) {
          if (!request.offers) request.offers = [];
          request.offers.push(offer);
        }
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        const requestIndex = state.helpRequests.findIndex(r => r.id === action.payload.id);
        if (requestIndex !== -1) {
          state.helpRequests[requestIndex] = action.payload;
        }
      })
      .addCase(resolveRequest.fulfilled, (state, action) => {
        const requestIndex = state.helpRequests.findIndex(r => r.id === action.payload.id);
        if (requestIndex !== -1) {
          state.helpRequests[requestIndex] = action.payload;
        }
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const requestIndex = state.helpRequests.findIndex(r => r.id === action.payload.id);
        if (requestIndex !== -1) {
          state.helpRequests[requestIndex] = action.payload;
        }
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.helpRequests = state.helpRequests.filter(r => r.id !== action.payload);
        state.myRequests = state.myRequests.filter(r => r.id !== action.payload);
      })
      .addCase(getMyRequests.fulfilled, (state, action) => {
        state.myRequests = action.payload;
      })
      .addCase(getMyOffers.fulfilled, (state, action) => {
        state.myOffers = action.payload;
      });
  }
});

export const { clearHelpRequestsError } = helpRequestsSlice.actions;
export default helpRequestsSlice.reducer;
