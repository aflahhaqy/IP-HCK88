import Axios from "axios";

const apiClient = Axios.create({
  baseURL: "https://aflahhaqy.site",
});

// Add request interceptor to automatically include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
