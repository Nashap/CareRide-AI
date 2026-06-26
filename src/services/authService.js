import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post(
    "/register/",
    userData
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/login/",
    credentials
  );

  localStorage.setItem(
    "user",
    JSON.stringify(response.data)
  );

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};