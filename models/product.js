const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

// Xác định bảng sản phẩm với các trường khác nhau và quy tắc xác thực của chúng.
const productSchema = new Schema(
  {
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
    stock: { type: Number, min: 1, default: 1 },
    images: {
      type: Schema.Types.Mixed, // Sử dụng Schema.Types.Mixed để định nghĩa một mảng đối tượng (object).
      default: null,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
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
    rateStar: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      maxLength: [500, "Product descriptions: must not exceed 500 characters"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "categories", //tham chiếu đến bảng "categories"
      required: [true, "Product categories: cannot be empty"],
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "suppliers", //tham chiếu đến bảng "suppliers"
      required: [true, "Product supplier: cannot be empty"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    versionKey: false, // Tắt trường "__v" dùng để theo dõi phiên bản
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);

// Tạo trường ảo "category" để tham chiếu đến danh mục sản phẩm
productSchema.virtual("category", {
  ref: "categories", // Tên model data tham chiếu
  localField: "categoryId", // Field trong data hiện tại đem đi tham chiếu
  foreignField: "_id", // Field tham chiếu trong data tham chiếu
  justOne: true, // Mỗi sản phẩm chỉ thuộc về một danh mục
});

// Tạo trường ảo "supplier" để tham chiếu đến nhà cung cấp sản phẩm
productSchema.virtual("supplier", {
  ref: "suppliers", // Tên model data tham chiếu
  localField: "supplierId", // Field trong data hiện tại đem đi tham chiếu
  foreignField: "_id", // Field tham chiếu trong data tham chiếu
  justOne: true, // Mỗi sản phẩm chỉ thuộc về một nhà cung cấp
});

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean()
productSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng sản phẩm dựa trên lược đồ đã khai báo
const Product = model("products", productSchema);

module.exports = Product;
