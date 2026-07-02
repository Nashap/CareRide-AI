import api from "./api";

/**
 * Helper to check if a JWT token is expired
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (e) {
    return true; // Treat invalid tokens as expired
  }
};

/**
 * Register User
 */
export const registerUser = async (userData) => {
  try {
    // Clear expired token if it exists in localStorage
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    const response = await api.post(
      "/register/",
      userData
    );

    return response.data;

  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

/**
 * Login User
 */
export const loginUser = async (credentials) => {
  try {

    const response = await api.post(
      "/login/",
      credentials
    );

    /*
      Expected backend response

      {
        "id":1,
        "user_id":"supabase-uuid",
        "name":"Nasha",
        "email":"nasha@gmail.com",
        "role":"rider",
        "token":"optional"
      }

    */

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );

    if (response.data.token) {
      localStorage.setItem(
        "token",
        response.data.token
      );
    }

    return response.data;

  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

/**
 * Logout
 */
export const logoutUser = () => {

  localStorage.removeItem("user");
  localStorage.removeItem("token");

};

/**
 * Logged in user
 */
export const getCurrentUser = () => {

  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;

};

/**
 * Is logged in?
 */
export const isAuthenticated = () => {

  return !!localStorage.getItem("user");

};