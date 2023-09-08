import { catchError } from "../../utils/catchError.js";
import { productModel } from "../../../db/models/product.model.js";
import { cartModel } from "../../../db/models/cart.model.js";

// add to cart
export const addToCart = catchError(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));

  if (!product.inStock(quantity))
    return next(
      new Error(
        `sorry!! only ${product.availableItems} items left in the stock..`
      )
    );

  // check product in cart
  const cartProduct = await cartModel.findOne({
    "products.productId": productId,
  });

  if (cartProduct) {
    const newQuantity = quantity + cartProduct.products[0].quantity;

    if (!product.inStock(newQuantity))
      return next(
        new Error(
          `sorry!! only ${product.availableItems} items left in the stock..`
        )
      );

    // update products
    const cart = await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        "products.productId": productId,
      },
      { $set: { "products.$.quantity": newQuantity } },
      { new: true }
    );
    // response
    return res.json({
      success: true,
      message: "product added successfully",
      results: cart,
    });
  } else {
    // add to cart
    const cart = await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { $push: { products: { productId, quantity } } },
      { new: true }
    );
    // response
    return res.json({
      success: true,
      message: "new product added successfully",
      results: cart,
    });
  }
});

// get user cart
export const userCart = catchError(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ user: req.user._id })
    .populate(
      "products.productId",
      "name defaultImage.url price discount finalPrice"
    );
  return res.json({ success: true, result: cart });
});

// update cart
export const updateCart = catchError(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));

  // check stock
  if (quantity > product.availableItems)
    return next(
      new Error(
        `sorry!! only ${product.availableItems} items left in the stock..`
      )
    );

  // update products
  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

  return res.json({ success: true, message: "cart updated !!", results: cart });
});

// remove product from cart
export const removeProductFromCart = catchError(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { products: { productId: req.params.productId } },
    },
    { new: true }
  );
  return res.json({
    success: true,
    message: "product deleted successfully!!",
    results: cart,
  });
});

// clear cart
export const clearCart = catchError(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );

  return res.json({ success: true, message: "cart cleared!", results: cart });
});
