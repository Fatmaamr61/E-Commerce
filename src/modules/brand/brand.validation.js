import joi from "joi"
import { isValidObjectId } from "../../middlewares/validation.middleware.js";


// create brand schema
export const createbrandSchema = joi.object({
    name: joi.string().min(4).max(20).required(),
    createdBy: joi.string().custom(isValidObjectId),
}).required()

// update brand
export const updatebrandSchema = joi.object({
    name: joi.string().min(4).max(20),
    brandId: joi.string().custom(isValidObjectId).required(),
}).required()

// delete brand
export const deletebrandSchema = joi.object({
    brandId: joi.string().custom(isValidObjectId).required(),
}).required()