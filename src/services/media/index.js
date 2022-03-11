// ************************************* MEDIA ENDPOINTS ************************************************

/* ************************************* MEDIA CRUD *****************************************************
1. CREATE --> POST http://localhost:3001/media/ (+ body)
2. READ --> GET http://localhost:3001/media/ (+ optional query parameters)
3. READ (single media) --> GET http://localhost:3001/media/:mediaId
4. UPDATE (single media) --> PUT http://localhost:3001/media/:mediaId (+ body)
5. DELETE (single media) --> DELETE http://localhost:3001/media/:mediaId
*/

import express from "express" // 3RD PARTY MODULE (needs to be installed with npm i express)
import fs from "fs" // CORE MODULE (no need to be installed)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE

// HOW TO GET media.json PATH ON DISK --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 10-BenchMark/My Homework/Netflix-Backend/src/services/media/media.json

console.log("CURRENT FILE URL: ", import.meta.url)
const currentFilePath = fileURLToPath(import.meta.url)
console.log("CURRENT FILE PATH: ", currentFilePath)

// 2. From currentFilePath I can get the parent's folder path --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 10-BenchMark/My Homework/Netflix-Backend/src/services/media
const parentFolderPath = dirname(currentFilePath)
console.log("PARENT FOLDER PATH ", parentFolderPath)
const parentofParentFolderPath = dirname(parentFolderPath)
console.log("PARENT OF PARENT FOLDER PATH ", parentofParentFolderPath)

// 3. Concatenate parentFolderPath with the name of the file --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 10-BenchMark/My Homework/Netflix-Backend/src/services/media/media.json
// Normally you would concatenate strings with "+", please don't do that when dealing with paths --> use JOIN instead
const mediaJSONPath = join(parentFolderPath, "media.json")
console.log("MEDIA JSON FILE PATH: ", mediaJSONPath)


const mediaRouter = express.Router() // all the endpoints attached to the router will have http://localhost:3001/media as PREFIX


// ******************************************** [POST media] ********************************************

// 1. CREATE --> POST http://localhost:3001/media/ (+ body) 
mediaRouter.post("/", (request, response) => {
    // 1. Read request body obtaining new media data
    console.log("BODY: ", request.body) // DO NOT FORGET server.use(express.json()) in server.js
  
    // 2. Add some server generated informations (unique id, creation Date, ...)
    const newMedia = { ...request.body, createdAt: new Date(), id: uniqid() } // uniqid is a 3rd party module that generates unique identifiers
    console.log(newMedia)
  
    // 3. Read media.json --> obtaining an array
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))
  
    // 4. Add new media to the array
    mediaArray.push(newMedia)
  
    // 5. Write the array back to media.json file
    fs.writeFileSync(mediaJSONPath, JSON.stringify(mediaArray)) // we cannot pass an array to this function, but we can pass the stringified version of it
  
    // 6. Send a proper response back
  
    response.status(201).send({ id: newMedia.id })
  })

// ***************************** [GET media (list) (reviews included)] **********************************

  // 2.READ --> GET http://localhost:3001/media/ (+ optional query parameters)
    
    mediaRouter.get("/", (request, response) => {
    // 1. Read the content of media.json file
    const fileContent = fs.readFileSync(mediaJSONPath) // You obtain a BUFFER object, which is MACHINE READABLE ONLY
    console.log("FILE CONTENT: ", JSON.parse(fileContent))
  
    // 2. Get back an array from the file
    const mediaArray = JSON.parse(fileContent) // JSON.parse() converts BUFFER into a real ARRAY
  
    // 3. Send back the array as a response
  
    response.send(mediaArray)
    })


// ************************** GET Media (single) (with reviews) ****************************************
  
  // 3. READ (single media) --> GET http://localhost:3001/media/:mediaId
    mediaRouter.get("/:mediaId", (request, response) => {
    console.log("REQ PARAMS: ", request.params.mediaId)
  
    // 1. Read the file --> obtaining an array
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))
  
    // 2. Find the specific media by id in the array
    const foundMedia = mediaArray.find(media => media.id === request.params.mediaId)
  
    // 3. Send a proper response
    response.send(foundMedia)
    })
  

  // ************************** UPDATE Media ***************************************
    
  // 4. UPDATE (single media) --> PUT http://localhost:3001/media/:mediaId (+ body)
    mediaRouter.put("/:mediaId", (request, response) => {
    // 1. Read the content of the file --> obtaining an array of media
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))
  
    // 2. Modify specified media into the array by merging previous properties and new properties coming from req.body
    const index = mediaArray.findIndex(media => media.id === request.params.mediaId)
    const oldMedia = mediaArray[index]
    const updatedMedia = { ...oldMedia, ...request.body, updatedAt: new Date() }
  
    mediaArray[index] = updatedMedia
  
    // 3. Save file back with the updated list of medias
    fs.writeFileSync(mediaJSONPath, JSON.stringify(mediaArray))
  
    // 4. Send back a proper response
  
    response.send(updatedMedia)
    })


    // ***************************** DELETE media ****************************************************
  // 5. DELETE (single media) --> DELETE http://localhost:3001/media/:imdbID/poster
    mediaRouter.delete("/:imdbID", (request, response) => {
    // 1. Read the file --> obtaining an array of medias
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))
  
    // 2. Filter out the specified media from the array, obtaining an array of just the remaining medias
    const remainingMedia = mediaArray.filter(media => media.id !== request.params.imdbID) 
  
    // 3. Save the remaining medias back to medias.json file
    fs.writeFileSync(mediaJSONPath, JSON.stringify(remainingMedia))
  
    // 4. Send a proper response
  
    response.status(204).send()
  })


  // **************************** Download PDF ************************************************************

  mediaRouter.get('/:id/pdf', checkIfIdExists, async(request, response, next)=>{
    try {
    const mediaArray = await readMedia()
    const media = mediaArray[request.index]
    res.setHeader("Content-Disposition", `attachment; filename=${media.Title}.pdf`);
    const source = await getMediaPdf(media)
    const destination = response;
    pipeline(source, destination, (err) => {
      if (err) next(err);
    })
    
} catch (error) {
    console.log(error)
    next(error)
}
})

  //************************ POST Review to media [/media/:id/reviews] *********************************
  mediaRouter.post("/:mediaId/reviews", (request, response) => {
    // 1. Read request body obtaining new media data
    console.log("BODY: ", request.body) // DO NOT FORGET server.use(express.json()) in server.js
  
    // 2. Add some server generated informations (unique id, creation Date, ...)
    const newMedia = { ...request.body, createdAt: new Date(), id: uniqid() } // uniqid is a 3rd party module that generates unique identifiers
    console.log(newMedia)
  
    // 3. Read media.json --> obtaining an array
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))

  
    // 4. Add new media to the array
    mediaArray.push(newMedia)
  
    // 5. Write the array back to media.json file
    fs.writeFileSync(mediaJSONPath, JSON.stringify(mediaArray)) // we cannot pass an array to this function, but we can pass the stringified version of it
  
    // 6. Send a proper response back
  
    response.status(201).send({ id: newMedia.id })

//comments: []

  })

  // ********************************* DELETE Review of media [ /media/:id/reviews ] ***************************************

    mediaRouter.delete("/:mediaId/reviews", (request, response) => {
    // 1. Read the file --> obtaining an array of medias
    const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath))
    const reviews = [{
        "comment": "",
        "rate" : "",
        "elementId" : ""
    }]
    // 2. Filter out the specified media from the array, obtaining an array of just the remaining medias
    const mediaReviewComments = mediaArray.reviews.filter(media => media.id.reviews.comment !== request.params.mediaId.comment)
    const mediaRating = mediaArray.reviews.filter(media => media.id.reviews.rating !== request.params.mediaId.rating)
    const elementId = mediaArray.reviews.filter(media => media.id.reviews.elementId!== request.params.mediaId.elementId)

  
    // 3. Save the remaining medias back to medias.json file
    fs.writeFileSync(mediaJSONPath, JSON.stringify(mediaArray))
  
    // 4. Send a proper response
  
    response.status(204).send()
  })


export default mediaRouter