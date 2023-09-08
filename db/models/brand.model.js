import mongoose, { model, Types, Schema} from "mongoose"

const brandSchema = new Schema({
    name: { type: String, required: true, min: 4, max: 20 },
    slug: { type: String, required: true },
    image: {
        url: { type: String, required: true },
        id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    
}, { timestamps: true});

export const brandModel = mongoose.models.brand || model("brand", brandSchema);
