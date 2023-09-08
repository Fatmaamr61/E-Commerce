import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation.js";
import { isAuthenticated } from "../../middlewares/authintication.middleware.js";
import { isAuthorized } from "../../middlewares/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { createCategory, deleteCategory, updateCategory , getAllCategories, getCategoryById, getSubcategoriesOfCategory} from "./category.controller.js";
import subcategoryRouter from "./../subCategory/subCategory.router.js";
import productRouter from "./../product/product.router.js";

const router = Router()
router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/:categoryId/products", productRouter);

// CRUD
// create category
router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("category"), isValid(createCategorySchema), createCategory)

// update category
router.patch("/:categoryId", isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("category"), isValid(updateCategorySchema), updateCategory )

// delete category
router.delete("/:categoryId", isAuthenticated, isAuthorized("admin"), isValid(deleteCategorySchema), deleteCategory )

// get all categories
router.get("/", getAllCategories )

// get category by id
router.get("/:categoryId", getCategoryById)

// get subcategory from category
router.get("/:categoryId/subcategories", getSubcategoriesOfCategory) 

export default router