import { checkSchema, validationResult } from "express-validator";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs-extra'
import { readMedia } from "../../lib/fs-tools.js";
import createError from 'http-errors'

const schema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title validation failed , type must be string  ",
    },
  },
  type: {
    in: ["body"],
    isString: {
      errorMessage: "type validation failed , type must be  string ",
    },
  },
  year: {
    in: ["body"],
    isString: {
      errorMessage: "year validation failed , type must be string ",
    },
  },
  poster: {
    in: ["body"],
    isString: {
      errorMessage: "cover validation failed , type must be string",
    },
  },
};



const reviewSchema = {
  review: {
    isString: {
      errorMessage: "Text field is required for comment",
    },
  },
  rate: {
    isString: {
      errorMessage: "User name is required for comment",
    },
  },
};

export const checkReviewSchema = checkSchema(reviewSchema);

export const inputValidation = checkSchema(schema);

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Blog post validation is failed");
    error.status = 400;
    error.errors = errors.array();
    next(error);
  }
  next();
};



const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)),'../data')
const mediaJSONPath = join(dataFolderPath,'media.json')
const reviewJSONPath = join(dataFolderPath,'reviews.json')

export const checkIfIdExists =  async (req,res,next) => {
  try {
      const mediaArray = await readMedia()
      const mediaIndex = mediaArray.findIndex(el=>el.imdbId===req.params.id)
          if(mediaIndex>=0){
            req.index=mediaIndex

            if(!req.params.reviewId){
              next()
              } else{
                const reviewIndex = mediaArray[mediaIndex].reviews.findIndex(review => review.reviewId === req.params.reviewId)
                if(reviewIndex>=0){
                  req.reviewIndex = reviewIndex
                  next()
                } else {
                  next(createError(404,'review not found'))
                }
              }
      }
      else{
          next(createError(404,'Movie not found'))
      }
  } catch (error) {
     console.log(error)
      next(createError(404,' Error'))
  }
} 