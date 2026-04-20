const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export const API_BASE = isLocalhost 
  ? "http://localhost:5000" 
  : "https://advance-morse-backend-4hjq.vercel.app";

export const SOCKET_URL = isLocalhost
  ? "http://localhost:5000"
  : "https://advance-morse-backend-4hjq.vercel.app";
