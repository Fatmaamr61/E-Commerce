import joi from "joi";
import { isValidObjectId } from "../../middlewares/validation.middleware.js";

// create subcategory
export const creatSubCategorySchema = joi.object({
    name: joi.string().min(5).max(20).required(),
    categoryId: joi.string().custom(isValidObjectId).required(),
}).required();

// update subcategory
export const updateSubcategorySchema = joi.object({
    name: joi.string().min(5).max(20),
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategoryId: joi.string().custom(isValidObjectId).required(),
}).required();
