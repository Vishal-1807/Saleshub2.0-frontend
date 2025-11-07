import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leadService } from '../../services/lead.service';
import { Lead } from '../../types';

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  filterStatus: string;
  filterCampaign: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  filterStatus: 'all',
  filterCampaign: 'all',
  isLoading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchAll',
  async () => {
    return await leadService.getAll();
  }
);

export const createLead = createAsyncThunk(
  'leads/create',
  async (lead: Lead) => {
    return await leadService.create(lead);
  }
);

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
    await leadService.update(id, updates);
    return { id, updates };
  }
);

export const deleteLead = createAsyncThunk(
  'leads/delete',
  async (id: string) => {
    await leadService.delete(id);
    return id;
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    selectLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    setFilterCampaign: (state, action: PayloadAction<string>) => {
      state.filterCampaign = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action: PayloadAction<Lead[]>) => {
        state.isLoading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(createLead.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.leads.push(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.leads.findIndex((l) => l.id === id);
        if (index !== -1) {
          state.leads[index] = { ...state.leads[index], ...updates };
        }
      })
      .addCase(deleteLead.fulfilled, (state, action: PayloadAction<string>) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
      });
  },
});

export const { selectLead, setFilterStatus, setFilterCampaign, clearError } = leadsSlice.actions;
export default leadsSlice.reducer;
