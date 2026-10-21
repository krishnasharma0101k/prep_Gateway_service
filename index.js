import dotenv from "dotenv"
dotenv.config()
import express from "express"

import proxy from "express-http-proxy"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import { isAuth } from "./middleware/isAuth.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"

const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_SERVICE_URL, 
    credentials: true   
}))

app.use(morgan("dev"))
app.use(cookieParser())



const port = process.env.PORT || 5000

app.get("/", (req, res) => {
    res.send("hello from gateway")
})

app.use("/api/auth", proxy(process.env.AUTH_SEVRICE_URL))
app.use("/api/resume",isAuth, proxyWithHeader(process.env.RESUME_SEVRICE_URL))
app.use("/api/interview",isAuth, proxyWithHeader(process.env.INTERVIEW_SEVRICE_URL))
app.get("/api/me", isAuth, getCurrentUser)


app.listen(port, () => {
    console.log(`Gateway started on ${port}`);
    
})
