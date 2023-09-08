import { Router } from "express";
import { isAuthenticated } from "./../../middlewares/authintication.middleware.js";
import { isValid } from "./../../middlewares/validation.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { cancelOrder, createOrder } from "./order.controller.js";

const router = Router();

// create order
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel order
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  cancelOrder
);

export default router;