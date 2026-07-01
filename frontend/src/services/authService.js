import api from "./api";

/**
 * Register User
 */
export const registerUser = async (userData) => {
  try {
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