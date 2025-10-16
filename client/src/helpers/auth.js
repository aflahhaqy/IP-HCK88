// Helper to decode JWT token (without verification - client side only)
export function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if user has specific role
export function hasRole(requiredRole) {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  const decoded = decodeToken(token);
  return decoded && decoded.role === requiredRole;
}

// Get current user info from token
export function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  return decodeToken(token);
}
