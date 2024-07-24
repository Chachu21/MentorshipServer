export const backend_url =
  process.env.NODE_ENV === "production"
    ? "https://mentorshipserver-backend.onrender.com"
    : "http://localhost:5000";

export const frontend_url =
  process.env.NODE_ENV === "production"
    ? "https://mentorship-sooty.vercel.app/"
    : "http://localhost:3000";