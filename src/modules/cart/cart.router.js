import { Router } from "express";
import { isAuthenticated } from "./../../middlewares/authintication.middleware.js";
import { isValid } from "./../../middlewares/validation.middleware.js";
import { CartSchema, removeProductSchema } from "./cart.validation.js";
import {
  addToCart,
  clearCart,
  removeProductFromCart,
  updateCart,
  userCart,
} from "./cart.controller.js";

const router = Router();

// CRUD
// add product to cart
router.post("/", isAuthenticated, isValid(CartSchema), addToCart);

// user cart
router.get("/", isAuthenticated, userCart);

// update cart
router.patch("/", isAuthenticated, isValid(CartSchema), updateCart);

// clear cart
router.put("/clear", isAuthenticated, clearCart);

// remove product from cart
router.patch(
  "/:productId",
  isAuthenticated,
  isValid(removeProductSchema),
  removeProductFromCart
);

export default router;
