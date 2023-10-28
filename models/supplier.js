const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Xác định bảng nhà cung cấp với các trường khác nhau và quy tắc xác thực của chúng.
const supplierSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name: cannot be blank."],
      maxLength: [100, "Supplier name: cannot exceed 100 characters."],
    },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          // xác thực địa chỉ email.
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: "Email: is not a valid email address.",
      },
      required: [true, "Email cannot be blank."],
      unique: [true," Email must be unique"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          // Xác thực số điện thoại
          const phoneRegex =
            /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        },
        message: "Phone number: is not a valid phone number.",
      },
      unique: [true," Phone number must be unique"],
    },
    address: {
      type: String,
      maxLength: [500, "Address cannot exceed 500 characters."],
      default: null,
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

// Tạo bảng nhà cung cấp dựa trên lược đồ đã khai báo
const Supplier = model("suppliers", supplierSchema);
module.exports = Supplier;
