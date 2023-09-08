import Router from "express";
import { isAuthenticated } from "./../../middlewares/authintication.middleware.js";
import { isAuthorized } from "./../../middlewares/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  createProductSchema,
  ProductIdSchema,
  updateProductSchema,
} from "./product.validation.js";
import {
  addDiscount,
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  removeDiscount,
  updateProduct,
} from "./product.controller.js";
const router = Router({ mergeParams: true });

// CRUD
// create product
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(createProductSchema),
  createProduct
);

// add discount 
router.patch(
  "/discount/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  addDiscount
);

// remove discount
router.patch(
  "/delDiscount/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  removeDiscount
);

// delete product
router.delete(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(ProductIdSchema),
  deleteProduct
);

// get all products
router.get("/", getAllProducts);

// get single product
router.get("/:productId", isValid(ProductIdSchema), getSingleProduct);

// get products of category
router.get("/category/:categoryId/products", getAllProducts);

// update product
router.patch(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(updateProductSchema),
  updateProduct
);

export default router;
