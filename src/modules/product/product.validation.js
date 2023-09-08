import joi from "joi";
import { isValidObjectId } from "./../../middlewares/validation.middleware.js";

export const createProductSchema = joi
  .object({
    name: joi.string().min(4).max(20).required(),
    price: joi.number().min(1).required(),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    soldItems: joi.number().min(0),
    discount: joi.number().min(1).max(100),
    createdBy: joi.string().custom(isValidObjectId),
    category: joi.string().custom(isValidObjectId),
    subcategory: joi.string().custom(isValidObjectId),
    brand: joi.string().custom(isValidObjectId),
  })
  .required();

// delete and get product schema
export const ProductIdSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// update product schema
export const updateProductSchema = joi
  .object({
    name: joi.string().min(4).max(20),
    price: joi.number().min(1),
    description: joi.string(),
    availableItems: joi.number().min(1),
    soldItems: joi.number().min(0),
    discount: joi.number().min(1).max(100),
    createdBy: joi.string().custom(isValidObjectId),
    category: joi.string().custom(isValidObjectId),
    subcategory: joi.string().custom(isValidObjectId),
    brand: joi.string().custom(isValidObjectId),
  })
  .required();
