import {Router} from 'express';
import {isAuthenticated} from "./../../middlewares/authintication.middleware.js"
import {isAuthorized} from "./../../middlewares/authorization.middleware.js"
import { fileUpload, filterObject } from '../../utils/multer.js';
import { isValid } from '../../middlewares/validation.middleware.js';
import { creatSubCategorySchema, updateSubcategorySchema } from './subCategory.validation.js';
import { createSubcategory, updateSubcategory, deleteSubcategory, getAllSubCategories, getSubCategoryById } from './subCategory.controller.js';
const router = Router({mergeParams: true});

// CRUD
// create subcategory
router.post('/', isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("subcategory"), isValid(creatSubCategorySchema), createSubcategory)

// update subcategory
router.patch('/:subcategoryId', isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("subcategory"), isValid(updateSubcategorySchema), updateSubcategory)

// delete subcategory
router.delete('/:subcategoryId', isAuthenticated, isAuthorized("admin"), isValid(updateSubcategorySchema), deleteSubcategory)

// get all subcategories
router.get('/', getAllSubCategories)

// get subcategory
router.get('/:subcategoryId', getSubCategoryById)


export default router;