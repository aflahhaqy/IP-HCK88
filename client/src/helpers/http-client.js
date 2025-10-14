import Axios from "axios";

const apiClient = Axios.create({
  baseURL: "http://localhost:3000",
});

export default apiClient;
