import { createSlice } from "@reduxjs/toolkit";
import { changePassword, login, register, validateUser } from "redux/action/auth/authAction";
import { IAuthSlice } from "types/store/auth/authSliceTypes";

const initialState: IAuthSlice = {
  result: {
    email: "",
    fullName: "",
    password: "",
    __v: 0,
    _id: "",
  },
  token: '',
  tokenStatus: 'not set',
  status: {
    loading: false,
    error: {
      message: ''
    },
    success: false,
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: () => {
      return initialState;
    },
    resetLogin: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.token = action.payload.token;
      state.tokenStatus = 'valid';
      state.status.success = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.loading = false;
      if (action.payload) {
        state.status.error.message = action.payload.message;
      }
      state.status.success = false;
    });


    builder.addCase(register.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(register.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.token = action.payload.token;
      state.tokenStatus = 'valid';
      state.status.success = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.status.loading = false;
      // state.status.error.message = action.error.message;
    });

    builder.addCase(validateUser.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(validateUser.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.status.success = true;
    });
    builder.addCase(validateUser.rejected, (state, action) => {
      state.status.loading = false;
      if (action.payload) {
        state.status.error.message = action.payload.message;
      }
      state.status.success = false;
    });

    builder.addCase(changePassword.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.status.success = true;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.status.loading = false;
      if (action.payload) {
        state.status.error.message = action.payload.message;
      }
      state.status.success = false;
    });
  }
})

export const { signOut, resetLogin } = authSlice.actions;

export const authSelector = (state: { auth: IAuthSlice }) => state.auth;