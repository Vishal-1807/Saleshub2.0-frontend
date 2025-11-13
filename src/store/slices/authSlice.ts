import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    console.log('🔄 Redux: loginUser thunk executing');
    const user = await authService.login(email, password);
    if (!user) {
      return rejectWithValue('Invalid email or password');
    }
    await authService.setCurrentUser(user);
    console.log('✅ Redux: loginUser successful', user);
    return user;
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    console.log('🔄 Redux: checkAuth thunk executing');
    const user = await authService.getCurrentUser();
    console.log('✅ Redux: checkAuth result', user);
    return user;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    console.log('🔄 Redux: logoutUser thunk executing');
    await authService.logout();
    console.log('✅ Redux: logoutUser completed');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      console.log('🔄 Redux: clearError action');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('🔄 Redux: loginUser.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        console.log('✅ Redux: loginUser.fulfilled', action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
