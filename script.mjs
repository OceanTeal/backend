import express from "express"
import router from "./routes/reportRoutes.mjs";
import connectDB from "./config/db.mjs"

const app = express()
const PORT = 3000;
connectDB()
app.use(express.json())

app.use('/',router)

app.listen(PORT, ()=>{
    console.log(`Server running in http://localhost:${PORT}`)
})