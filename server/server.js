import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()
const PORT = process.env.PORT || 5000
app.listen(PORT,async () => {
  console.log(`Server is running on port ${PORT}`)
 })