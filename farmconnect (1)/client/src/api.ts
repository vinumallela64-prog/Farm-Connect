const API_URL = import.meta.env.VITE_API_URL || "/api";

const getToken = () => localStorage.getItem("farmconnect_token");

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Network error — is the server running?");
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw new Error(`Server error (${res.status})`);
    return {};
  }

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  signup: (body: { name: string; email: string; phone: string; password: string; location: string; role: string }) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => request("/auth/me"),

  // Products
  getProducts: () => request("/products"),
  getProduct: (id: string) => request(`/products/${id}`),
  createProduct: (body: Record<string, unknown>) =>
    request("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Record<string, unknown>) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: string) =>
    request(`/products/${id}`, { method: "DELETE" }),
  getMyProducts: () => request("/products/farmer/me"),

  // Orders
  placeOrder: (body: { productId: string; quantity: number }) =>
    request("/orders", { method: "POST", body: JSON.stringify(body) }),
  getMyOrders: () => request("/orders/my"),
  updateOrderStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  getOrderStats: () => request("/orders/stats"),

  // Ratings
  addRating: (body: { farmerId: string; score: number; review: string }) =>
    request("/ratings", { method: "POST", body: JSON.stringify(body) }),
  getFarmerRatings: (farmerId: string) => request(`/ratings/farmer/${farmerId}`),
};
