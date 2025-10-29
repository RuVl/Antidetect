import axios from "axios";

const API_PORT = import.meta.env.VITE_API_PORT;

// Same host and protocol
const API_URL = `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;

export const api = axios.create({ baseURL: API_URL });