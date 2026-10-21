import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { isAuth } from "./middlewares/isAuth.js"       // your paths may differ
import { proxyWithHeader } from "./middlewares/proxy.js"

const app = express()

// 1. These go right after creating app, before any routes
app.set("trust proxy", 1)
app.use(cors({
  origin: "http://localhost:5173",   // your frontend URL
  credentials: true,
}))
app.use(cookieParser())

// 2. Routes come after, in this order
app.use("/api/auth/login", proxyWithHeader(AUTH_URL))        // public
app.use("/api/me", isAuth, proxyWithHeader(AUTH_URL))
app.use("/api/resume", isAuth, proxyWithHeader(RESUME_URL))
// ...your other routes

const PORT = process.env.PORT || 4000
app.listen(PORT, "0.0.0.0", () => console.log("Gateway on", PORT))