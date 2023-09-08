import { catchError } from "../../utils/catchError.js";
import {categoryModel} from "../../../db/models/category.model.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";

export const createCategory = catchError(async(req, res, next)=> {  
    // file
    if(!req.file) return next(new Error("category image is required!"));

    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.FOLDER_CLOUD_NAME}/category` })
    // save category in db
    const {name} = req.body;
    const category = await categoryModel.create({
        name,
        createdBy: req.user._id,
        image: {id: public_id, url: secure_url},
        slug: slugify(req.body.name),
    });

    // send response 
    return res.status(201).json({success: true, results: category})
})

export const updateCategory = catchError(async(req, res, next) => {
    // check category
    const category = await categoryModel.findById(req.params.categoryId);
    if(!category) return next(new Error("category not found!"))

    // name
    category.name = req.body.name ? req.body.name : category.name;

    // slug
    category.slug = req.body.name ? slugify(req.body.name) : category.slug

    // file
    if(req.file) {
        const {public_id, secure_url} = await cloudinary.uploader.upload(
            req.file.path, 
            {
                public_id: category.image.id
            }
        );
    }

    // save category
    await category.save();
    return res.json({success: true, results: category})

})

export const deleteCategory = catchError(async(req, res, next) => {
    // check category and delete
    const category = await categoryModel.findByIdAndDelete(req.params.categoryId);
    if(!category) return next(new Error("category not found!"))

    // delete image
    const result = await cloudinary.uploader.destroy(category.image.id);
    console.log(result);


    // send response
    return res.json({success: true, message: "category deleted successfully.."})

})

export const getAllCategories = catchError(async(req, res, next) => {
    const categories = await categoryModel.find(); 
    if(!categories) return next(new Error('no categories found!', {cause: 404}))

    return res.json({success: true, results: categories})
})

export const getCategoryById = catchError(async(req, res, next) => {
    const {categoryId}  = req.params
    const category = await categoryModel.findById(categoryId)
    return res.json({success: true, results: category})

})

export const getSubcategoriesOfCategory = catchError(async(req, res, next) => {
    const {categoryId}  = req.params;

    const subcategories = await categoryModel.findById(categoryId).populate("subcategories", "name -_id -categoryId"); 
    return res.json({success: true, results: subcategories})
})