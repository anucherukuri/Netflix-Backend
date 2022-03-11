import express from "express" // <-- NEW IMPORT SYNTAX (remember to add type: "module" to package.json to use it!)
import listEndpoints from "express-list-endpoints"
import mediaRouter from "./services/media/index.js"

const server = express()

const port = 3001       // Port number

server.use(express.json()) // If you don't add this configuration to our server (BEFORE the endpoints), all requests' bodies will be UNDEFINED

// ***************************************** ENDPOINTS ******************************************

server.use("/media", mediaRouter)

// *********************************** TO DISPLAY IN A TABLE *************************************

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})