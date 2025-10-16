import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../helpers/http-client";

const initialState = {
  userLocation: null,
  isUpdating: false,
  error: null,
};

// Async thunk to update user location
export const updateUserLocation = createAsyncThunk(
  "location/updateUserLocation",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/customer/location", {
        lat,
        lng,
      });
      return { lat, lng };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update location");
    }
  }
);

// Async thunk to get current geolocation
export const getCurrentLocation = createAsyncThunk(
  "location/getCurrentLocation",
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(rejectWithValue("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timeout";
              break;
          }
          reject(rejectWithValue(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
);

// Async thunk to get current location and update to server
export const updateCurrentLocation = createAsyncThunk(
  "location/updateCurrentLocation",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Get current location
      const location = await dispatch(getCurrentLocation()).unwrap();

      // Update to server
      await dispatch(updateUserLocation(location)).unwrap();

      return location;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // updateUserLocation
      .addCase(updateUserLocation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserLocation.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.userLocation = action.payload;
        state.error = null;
      })
      .addCase(updateUserLocation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // getCurrentLocation
      .addCase(getCurrentLocation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.userLocation = action.payload;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // updateCurrentLocation
      .addCase(updateCurrentLocation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCurrentLocation.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.userLocation = action.payload;
        state.error = null;
      })
      .addCase(updateCurrentLocation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { setUserLocation, clearLocationError } = locationSlice.actions;

// Selectors
export const selectUserLocation = (state) => state.location.userLocation;
export const selectIsUpdatingLocation = (state) => state.location.isUpdating;
export const selectLocationError = (state) => state.location.error;

export default locationSlice.reducer;
