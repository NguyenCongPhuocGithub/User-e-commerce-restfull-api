const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Xác định bảng danh mục với các trường khác nhau và quy tắc xác thực của chúng.
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name: cannot be blank"],
      maxLength: [100, "Category name: cannot exceed 100 characters"],
      unique: [true, "Category name: must be unique"],
    },
    description: {
      type: String,
      maxLength: [500, "Category description: cannot exceed 500 characters"],
      default: null,
    },
    imageId: {
      type: Schema.Types.ObjectId,
      ref: "medias",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    versionKey: false, // Tắt trường "__v" dùng để theo dõi phiên bản
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);
// Tạo trường ảo "media" để tham chiếu đến hình ảnh sản phẩm
categorySchema.virtual("media", {
  ref: "medias", // Tên model data tham chiếu
  localField: "imageId", // Field trong data hiện tại đem đi tham chiếu
  foreignField: "_id", // Field tham chiếu trong data tham chiếu
  justOne: true, // Mỗi sản phẩm chỉ thuộc về một danh mục
});

// Virtuals in console.log()
categorySchema.set("toObject", { virtuals: true });
// Virtuals in JSON
categorySchema.set("toJSON", { virtuals: true });

// Tạo bảng danh mục dựa trên lược đồ đã khai báo
const Category = model("categories", categorySchema);
module.exports = Category;