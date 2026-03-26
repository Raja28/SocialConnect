"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUser } from '../app/store/userSlice';
import { setProfile } from '../app/store/profileSlice';

export const useAuthHydration = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedProfile = localStorage.getItem("profile");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch(setUser(user));
        dispatch(setAuthenticated(true));
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
      }
    }

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        dispatch(setProfile(profile));
      } catch (error) {
        console.error("Failed to parse profile from local storage", error);
      }
    }
  }, [dispatch]);
};