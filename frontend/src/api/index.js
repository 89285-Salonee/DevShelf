import axios from "axios"

export const TOKEN_KEY = "devshelfToken"

const BASE = "http://localhost:5000/api"

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
})

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => api.post("/auth/register", data).then((r) => r.data)
export const login = (data) => api.post("/auth/login", data).then((r) => r.data)
export const getMe = () => api.get("/auth/me").then((r) => r.data)
export const logoutServer = () => api.post("/auth/logout").then((r) => r.data)

// Admin users
export const getUsers = () => api.get("/users").then((r) => r.data)
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data)
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data)

// Collections
export const getCollections = () => api.get("/collections").then((r) => r.data)
export const createCollection = (data) => api.post("/collections", data).then((r) => r.data)
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data).then((r) => r.data)
export const deleteCollection = (id) => api.delete(`/collections/${id}`).then((r) => r.data)
export const getCollectionEndpoints = (id) =>
  api.get(`/collections/${id}/endpoints`).then((r) => r.data)

// Endpoints
export const createEndpoint = (data) => api.post("/endpoints", data).then((r) => r.data)
export const updateEndpoint = (id, data) => api.put(`/endpoints/${id}`, data).then((r) => r.data)
export const deleteEndpoint = (id) => api.delete(`/endpoints/${id}`).then((r) => r.data)

// Proxy
export const sendProxyRequest = (payload) => api.post("/proxy", payload).then((r) => r.data)
