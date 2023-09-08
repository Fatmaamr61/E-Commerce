import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import { createbrandSchema, deletebrandSchema, updatebrandSchema } from "./brand.validation.js";
import { isAuthenticated } from "../../middlewares/authintication.middleware.js";
import { isAuthorized } from "../../middlewares/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { createBrand, deleteBrand, updateBrand , getAllBrands, getBrandById} from "./brand.controller.js";

const router = Router()

// CRUD
// create brand
router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("brand"), isValid(createbrandSchema), createBrand)

// update brand
router.patch("/:brandId", isAuthenticated, isAuthorized("admin"), fileUpload(filterObject.image).single("brand"), isValid(updatebrandSchema), updateBrand )

// delete brand
router.delete("/:brandId", isAuthenticated, isAuthorized("admin"), isValid(deletebrandSchema), deleteBrand )

// get all brands
router.get("/", getAllBrands )

// get brand by id
router.get("/:brandId", getBrandById)


export default router