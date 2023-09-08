import { productModel } from "../../../db/models/product.model.js";
import { catchError } from "../../utils/catchError.js";
import cloudinary from "../../utils/cloud.js";
import { nanoid } from "nanoid";
import slugify from "slugify";

export const createProduct = catchError(async (req, res, next) => {
  // check file
  if (!req.files)
    return next(new Error("product image is required!", { cause: 400 }));

  // unique folder name
  const cloudFolder = nanoid();
  let images = [];

  // upload images
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/product/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  // upload default image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/product/${cloudFolder}` }
  );

  // create product
  const product = await productModel.create({
    ...req.body,
    slug: slugify(req.body.name),
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images,
  });

  const finalPrice = req.body.discount
    ? Number.parseFloat(
        product.price - (product.price * req.body.discount) / 100
      ).toFixed(2)
    : req.body.price;

  product.discount = req.body.discount;
  product.finalPrice = finalPrice;
  await product.save();

  res.json({ success: true, results: product });
});

export const addDiscount = catchError(async (req, res, next) => {
  // data
  const { discount } = req.body;

  // check product
  const product = await productModel.findById({ _id: req.params.productId });
  if (!product) return next(new Error("product not found!"));

  if (discount) {
    const finalPrice = Number.parseFloat(
      product.price - (product.price * discount) / 100
    ).toFixed(2);
    product.discount = discount;
    product.finalPrice = finalPrice;
    await product.save();
    return res.json({
      success: true,
      message: "discount added successfully!",
      results: product,
    });
  }
  return res.json({ success: true, results: product });
});

export const removeDiscount = catchError(async (req, res, next) => {
  // check product
  const product = await productModel.findByIdAndUpdate(
    { _id: req.params.productId },
    { $unset: { discount: 1, finalPrice: 1 } },
    { new: true }
  );

  if (!product) return next(new Error("product not found!"));

  return res.json({ success: true, results: product });
});

export const deleteProduct = catchError(async (req, res, next) => {
  // check product
  const product = await productModel.findById(req.params.productId);
  if (!product) return next(new Error("product not found!"));

  // check owner
  if (req.user._id.toString() !== product.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 401 }));

  // delete images
  const imageArr = product.images;
  console.log(imageArr);
  const ids = imageArr.map((imageObj) => imageObj.id);
  ids.push(product.defaultImage.id);
  console.log(ids);

  const results = await cloudinary.api.delete_resources(ids);
  console.log(results);

  // delete folder
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD_NAME}/product/${product.cloudFolder}`
  );

  // delete product
  await productModel.findByIdAndDelete(req.params.productId);

  // send response
  return res.json({ success: true, message: "product deleted successfully.." });
});

export const getAllProducts = catchError(async (req, res, next) => {
  if (req.params.categoryId) {
    const category = await categoryModel.findById(req.params.categoryId);
    if (!category)
      return next(new Error("category not found!", { cause: 404 }));

    const product = await productModel.find({
      category: req.params.categoryId,
    });
    return res.json({ success: true, results: product });
  }

  const { fields } = req.query;
  const { sort } = req.query;

  let page = parseInt(req.query.page) || 1;
  page = page < 1 ? 1 : page;

  const products = await productModel
    .find({ ...req.query })
    .paginate(page)
    .customSelect(fields)
    .sort(sort);

  if (products.length < 1)
    return next(new Error("no products found!", { cause: 404 }));

  return res.json({ page, success: true, results: products });
});

export const getSingleProduct = catchError(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  return res.json({ success: true, results: product });
});

export const updateProduct = catchError(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));
  // check owner
  if (req.user._id.toString() !== product.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 401 }));

  // update product
  const updatedProduct = await productModel.findByIdAndUpdate(
    { productId: req.params.productId },
    req.body,
    { new: true }
  );

  return res.json({ success: true, results: updatedProduct });
});
