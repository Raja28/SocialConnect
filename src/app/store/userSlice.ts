import axios from "axios";
import {  createSlice } from "@reduxjs/toolkit";

type UserState = {
    userData: {
        id?: number;
        email?: string;
        first_name?: string;
        last_name?: string;
        username?: string;
        avatar_url?: string;
        location?: string;
        bio?: string;
        website?: string;
    };
    loading: boolean;
    status: "idle" | "loading" | "success" | "failed";
    isAuthenticated: boolean;
}


const initialState: UserState = {
    userData: {
        id: 0,
        email: "",
        first_name: "",
        last_name: "",
        username: "",
        avatar_url: "",
        location: "",
        bio: "",
        website: "",
    },
    loading: false,
    status: "idle",
    isAuthenticated: false,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, {payload}) => {
            state.userData = payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.userData = {};
            state.isAuthenticated = false;
        },
        setStatus: (state, {payload}) => {
            state.status = payload
        },
        setAuthenticated: (state, {payload}) => {
            state.isAuthenticated = payload
        }
    },
    extraReducers: (builder) => {
        // builder.addCase(fetchUser.pending:, (state) => {
        //     state.status = "loading";
        // });
        // builder.addCase(fetchUser.fulfilled, (state, action) => {
        //     state.status = "succeeded";
        //     state.userData = action.payload;
        // });
        // builder.addCase(fetchUser.rejected, (state) => {
        //     state.status = "failed";
        // });
    }
});

export const { setUser, logout, setStatus, setAuthenticated } = userSlice.actions;
export default userSlice.reducer;