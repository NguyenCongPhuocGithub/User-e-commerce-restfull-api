const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cartDetailSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: [true, "Product Id: cannot be blank"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity: cannot be blank"],
      min: 1,
      default: 1,
    },
  },
  {
    versionKey: false,
  }
);

// Virtual with Populate
cartDetailSchema.virtual("product", {
  ref: "products",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
cartDetailSchema.set("toObject", { virtuals: true });
cartDetailSchema.set("toJSON", { virtuals: true });

// ------------------------------------------------------------------------------------------------

const cartSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    products: [cartDetailSchema],
    
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

// Virtual with Populate
cartSchema.virtual("customer", {
  ref: "customers",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});

// Virtuals in console.log()
cartSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
cartSchema.set("toJSON", { virtuals: true });

const Cart = model("carts", cartSchema);
module.exports = Cart;
