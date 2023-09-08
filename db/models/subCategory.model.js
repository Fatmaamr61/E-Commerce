import mongoose, { Schema, model, Types } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: { type: String, required: true, min: 5, max: 20 },
    slug: { type: String, required: true },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "category",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    brandId: [{ type: Types.ObjectId, ref: "brand" }],
  },
  { timestamps: true }
);

export const subCategoryModel =
  mongoose.models.subCategoryModel || model("subCategory", subCategorySchema);
