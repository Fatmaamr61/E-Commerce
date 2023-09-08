import { catchError } from "../../utils/catchError.js";
import {categoryModel} from "../../../db/models/category.model.js";
import cloudinary from "./../../utils/cloud.js";
import {subCategoryModel} from "../../../db/models/subCategory.model.js"
import slugify from "slugify";

export const createSubcategory = catchError(async(req, res, next) => {
    // data
    const {categoryId} = req.params;

    // check file
    if (!req.file) return next(new Error("image is required", {cause: 400}));

    // check category
    const category = await categoryModel.findById(categoryId)
    if(!category) return next(new Error("category not found!", {cause: 404}));

    // upload 
    const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.FOLDER_CLOUD_NAME}/subcategory`,
    })  

    // save in db
    const subcategory = await subCategoryModel.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        categoryId,
        createdBy: req.user._id,
        image: {id: public_id, url: secure_url}
    })

    return res.json({success: true, results: subcategory})

})

export const updateSubcategory = catchError(async(req, res, next) => {
    // check category 
    const category = await categoryModel.findById(req.params.categoryId);
    if(!category) return next(new Error("category not found!", {cause: 404}))

    // check subcategory 
    const subcategory = await subCategoryModel.findById(req.params.subcategoryId)
    if(!subcategory) return next(new Error("subcategory not found!", {cause: 404}))

    // name
    subcategory.name = req.body.name ? req.body.name : subcategory.name;

    // slug
    subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
 
    // file
    if(req.file) {
        const {public_id, secure_url} = await cloudinary.uploader.upload(
            req.file.path, 
            {
                public_id: subcategory.image.id
            }
        );
    }

    // save category
    await subcategory.save();
    return res.json({success: true, message: "subcategory updated successfully!", results: subcategory})
})

export const deleteSubcategory = catchError(async(req, res, next) => {
    // check category 
    const category = await categoryModel.findById(req.params.categoryId);
    if(!category) return next(new Error("category not found!"))

    // check subcategory and delete
    const subcategory = await subCategoryModel.findByIdAndDelete(req.params.subcategoryId)
    if(!subcategory) return next(new Error("subcategory not found!", {cause: 404}))

    // delete image
    const result = await cloudinary.uploader.destroy(subcategory.image.id);
    console.log(result);

    // send response
    return res.json({success: true, message: "subcategory deleted successfully.."})

})

export const getAllSubCategories = catchError(async(req, res, next) => {
    const subcategories = await subCategoryModel.find(); 

    return res.json({success: true, results: subcategories})
})

export const getSubCategoryById = catchError(async(req, res, next) => {
    const {subcategoryId}  = req.params
    const subcategory = await subCategoryModel.findById(subcategoryId)
    return res.json({success: true, results: subcategory})

})
