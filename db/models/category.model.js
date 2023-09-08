import mongoose, { Schema, model, Types } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, min: 4, max: 20 },
    slug: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    brandId: [{ type: Types.ObjectId, ref: "brand" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subcategories", {
  ref: "subCategory",
  localField: "_id", // category model
  foreignField: "categoryId", // subcategory model
});

export const categoryModel =
  mongoose.models.categoryModel || model("category", categorySchema);
