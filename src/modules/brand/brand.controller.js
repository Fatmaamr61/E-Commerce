import { catchError } from "../../utils/catchError.js";
import {brandModel} from "../../../db/models/Brand.model.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";

export const createBrand = catchError(async(req, res, next)=> {  
    // file
    if(!req.file) return next(new Error("Brand image is required!"));

    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.FOLDER_CLOUD_NAME}/Brand` })
    // save Brand in db
    const {name} = req.body;
    const Brand = await brandModel.create({
        name,
        createdBy: req.user._id,
        image: {id: public_id, url: secure_url},
        slug: slugify(req.body.name),
    });

    // send response 
    return res.status(201).json({success: true, results: Brand})
})

export const updateBrand = catchError(async(req, res, next) => {
    // check Brand
    const Brand = await brandModel.findById(req.params.brandId);
    if(!Brand) return next(new Error("Brand not found!"))

    // name
    Brand.name = req.body.name ? req.body.name : Brand.name;

    // slug
    Brand.slug = req.body.name ? slugify(req.body.name) : Brand.slug

    // file
    if(req.file) {
        const {public_id, secure_url} = await cloudinary.uploader.upload(
            req.file.path, 
            {
                public_id: Brand.image.id
            }
        );
    }
    // save Brand
    await Brand.save();
    return res.json({success: true, results: Brand})
})

export const deleteBrand = catchError(async(req, res, next) => {
    // check Brand and delete
    const Brand = await brandModel.findByIdAndDelete(req.params.brandId);
    if(!Brand) return next(new Error("Brand not found!"))

    // delete image
    const result = await cloudinary.uploader.destroy(Brand.image.id);
    console.log(result);

    // send response
    return res.json({success: true, message: "Brand deleted successfully.."})

})

export const getAllBrands = catchError(async(req, res, next) => {
    const Brands = await brandModel.find(); 
    return res.json({success: true, results: Brands})
})

export const getBrandById = catchError(async(req, res, next) => {
    const {brandId}  = req.params
    const Brand = await brandModel.findById(brandId)
    return res.json({success: true, results: Brand})

})
