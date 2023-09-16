import { catchError } from "../../utils/catchError.js";
import { couponModel } from "../../../db/models/coupon.model.js";
import { cartModel } from "../../../db/models/cart.model.js";
import { productModel } from "../../../db/models/product.model.js";
import { orderModel } from "../../../db/models/order.model.js";
import { createInvoice } from "../../utils/createInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "./../../utils/cloud.js";
import { clearCart, updateStock } from "./order.services.js";
import { sendEmail } from "./../../utils/sendEmail.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// create order
export const createOrder = catchError(async (req, res, next) => {
  // data
  const { payment, address, phone, coupon } = req.body;

  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!coupon) return next(new Error("Invalid coupon"));
  }

  // check cart
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart!"));
  let orderProducts = [];
  let orderPrice = 0;

  // check products
  for (let i = 0; i < products.length; i++) {
    // check product existance
    const product = await productModel.findById(products[i].productId);
    if (!product)
      return next(
        new Error(`product ${products[i].productId} not found!`, { cause: 404 })
      );
    // check product stock
    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `the product ${product.name} out of stock, only ${product.availableItems} are left`
        )
      );
    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: products[i].quantity * product.finalPrice,
    });

    orderPrice += products[i].quantity * product.finalPrice;
  }

  const finalPrice = checkCoupon
    ? Number.parseFloat(
        orderPrice - (orderPrice * checkCoupon.discount) / 100
      ).toFixed(2)
    : orderPrice;

  // create order
  const order = await orderModel.create({
    user: req.user._id,
    products: orderProducts,
    address,
    phone,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    payment,
    price: orderPrice,
    finalPrice,
  });

  // generate invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemp/${order._id}.pdf`
  );
  createInvoice(invoice, pdfPath);

  // upload cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoice`,
  });

  // TODO delete file from file

  // add invoice to order
  order.invoice = { id: public_id, url: secure_url };
  await order.save();

  // send Email
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });

  if (isSent) {
    // update stock
    updateStock(order.products, true);
    // clear cart
    clearCart(req.user._id);
  }

  // stripe payment
  if (payment == "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);

    let existCoupon;
    if (order.coupon.name !== undefined) {
      existCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order._id.toString() },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.name,
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: existCoupon ? [{ coupon: existCoupon.id }] : [],
    });

    return res.json({
      success: true,
      results: session.url,
    });
  }

  // respose
  return res.json({
    success: true,
    message: "order placed successfully! kindly check your email",
  });
});

// cancel order
export const cancelOrder = catchError(async (req, res, next) => {
  const order = await orderModel.findById(req.params.orderId);
  if (!order) return next(new Error("Order not Found!", { cause: 404 }));

  if (order.status === "shipped" || order.status === "delivered")
    return next(new Error("Order cannot be cancelled"));

  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  return res.json({ success: true, message: "order cancelled successfully!" });
});

export const orderWebhook = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRECT
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;

  if (event.type === "checkout.session.completed") {
    // change order status
    await orderModel.findByIdAndUpdate(
      { _id: orderId },
      { status: "visa paid" }
    );
  }
  // change order status
  await orderModel.findByIdAndUpdate(
    { _id: orderId },
    { status: "failed payment" }
  );
  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
