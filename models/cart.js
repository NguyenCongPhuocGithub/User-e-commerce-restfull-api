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

    name: {
      type: String,
      required: [true, "Product name: cannot be blank"],
      maxLength: [100, "Product names: cannot exceed 100 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price: cannot be blank"],
      min: [0, "The price: of the product cannot be less than 0"],
      default: 0,
    },

    discount: {
      type: Number,
      min: [0, "Discount: cannot be less than 0"],
      max: [75, "Discount: cannot be greater than 75"],
      default: 0,
    },

    coverImageUrl: { type: String, default: null },

    weight: {
      type: Number,
      min: [100, "Weight: cannot be less than 100 gram"],
      required: [true, "Weight: cannot be empty"],
    },
    length: {
      type: Number,
      min: [10, "Length: cannot be less than 10 cm"],
      require: [true, "length: cannot be empty"],
    },
    width: {
      type: Number,
      min: [1, "Width: cannot be less than 1 cm"],
      required: [true, "Width: cannot be empty"],
    },
    height: {
      type: Number,
      min: [1, "Height: cannot be less than 1 cm"],
      required: [true, "Height: cannot be empty"],
    },
  },
  {
    versionKey: false,
  }
);

// Virtual with Populate
cartDetailSchema.virtual("product", {
  ref: "products",
  localField: "products",
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
