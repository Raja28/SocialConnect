import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";



type ProfileState = {
    profile: {
        bio: string;
        avatar_url: string | null;
        location: string | null;
        website: string | null;

    };
    loading: boolean;
    status: "idle" | "loading" | "succeeded" | "failed";
    // bio: string;
    // avatar_url: string | null;
    // location: string | null;
    // website: string | null;
}


const initialState: ProfileState = {
    profile:  {
        bio: "",
        avatar_url: null,
        location: null,
        website: null,
    },
    loading: false,
    status: "idle",
    // bio: "Write something about yourself...",
    // avatar_url: null,
    // location: null,
    // website: null,

}

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setBio: (state, action) => {
            state.profile.bio = action.payload;
        },
        setAvatarUrl: (state, action) => {
            state.profile.avatar_url = action.payload;
        },
        setLocation: (state, action) => {
            state.profile.location = action.payload;
        },
        setWebsite: (state, action) => {
            state.profile.website = action.payload;
        },
    }
})
export const { setProfile, setLoading, setStatus, setBio, setAvatarUrl, setLocation, setWebsite} = profileSlice.actions
export default profileSlice.reducer