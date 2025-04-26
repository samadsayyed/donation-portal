import api from "./axios";

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/login", {
      user_email: credentials.email,
      user_password: credentials.password,
      session_id: credentials.session_id,
    });

    // Check if login was successful
    if (response.data.success) {
      // Store the user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.donor));

      // Set the user ID in the API headers for subsequent requests
      api.defaults.headers.common["user_id"] = response.data.donor.user_id;
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/signup", {
      user_email: userData.user_email,
      user_password: userData.user_password,
      first_name: userData.first_name,
      last_name: userData.last_name,
    });

    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.donor));
      api.defaults.headers.common["user_id"] = response.data.donor.user_id;
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const logoutUser = async () => {
  try {
    // Call logout endpoint if your API has one
    await api.post("/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage and reset axios header
    localStorage.removeItem("user");
    delete api.defaults.headers.common["user_id"];
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  return !!user;
};

// Initialize auth header if user exists
const user = localStorage.getItem("user");
if (user) {
  const userData = JSON.parse(user);
  api.defaults.headers.common["user_id"] = userData.user_id;
}
