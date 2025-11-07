import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaign.service';
import { Campaign } from '../../types';

interface CampaignsState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CampaignsState = {
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async () => {
    return await campaignService.getAll();
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (campaign: Campaign) => {
    return await campaignService.create(campaign);
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/update',
  async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
    await campaignService.update(id, updates);
    return { id, updates };
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/delete',
  async (id: string) => {
    await campaignService.delete(id);
    return id;
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    selectCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch campaigns';
      })
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.campaigns.push(action.payload);
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.campaigns.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.campaigns[index] = { ...state.campaigns[index], ...updates };
        }
      })
      .addCase(deleteCampaign.fulfilled, (state, action: PayloadAction<string>) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
      });
  },
});

export const { selectCampaign, clearError } = campaignsSlice.actions;
export default campaignsSlice.reducer;
