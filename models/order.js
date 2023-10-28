const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Xác định lược đồ cho các mục sản phẩm trong một đơn hàng.
const productSchema = new Schema(
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
    price: { type: Number },
    discount: { type: Number },
    weight: {type: Number },
    length: {type: Number},
    width: { type: Number },
    height: { type: Number},
  },
  {
    versionKey: false,
  }
);

// Tạo trường ảo "product" để tham chiếu đến sản phẩm
productSchema.virtual("product", {
  ref: "products",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

// -----------------------------------------------------------------------------------------------

// Xác định lược đồ cho các đơn hàng.
const orderSchema = new Schema(
  {
    createdDate: {
      type: Date,
      required: [true, "Created date: cannot be blank"],
      default: Date.now,
    },

    shippedDate: {
      type: Date,
      validate: {
        validator: function (value) {
          //Kiểm tra ngày vận chuyển
          if (!value) return true;
          if (value >= this.createdDate) {
            return true;
          }
          return false;
        },
        message: "Shipped date: is invalid!",
      },
    },

    paymentType: {
      type: String,
      required: [true, "Payment type: cannot be blank"],
      default: "CASH",
      enum: ["CASH", "CREDIT_CARD"],
    },

    status: {
      type: String,
      required: [true, "Status: cannot be blank"],
      default: "PLACED",
      enum: [
        "PLACED",
        "PREPARING",
        "DELIVERING",
        "COMPLETED",
        "CANCELED",
        "REJECTED",
        "FLAKER",
      ],
    },

    isOnline: {
      type: Boolean,
      required: [true, "isOnline: cannot be blank"],
    },

    totalFee: {
      type: Number,
      default: 0,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    productList: [productSchema], // danh sách sản phẩm
  },

  {
    versionKey: false, // Tắt trường "__v" dùng để theo dõi phiên bản
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);

// Tạo trường ảo "customer" để tham chiếu đến khách hàng
orderSchema.virtual("customer", {
  ref: "customers",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});

// Tạo trường ảo "employee" để tham chiếu đến nhân viên
orderSchema.virtual("employee", {
  ref: "employees",
  localField: "employeeId",
  foreignField: "_id",
  justOne: true,
});

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

// Tạo bảng orders dựa trên lược đồ đã khai báo
const Order = model("orders", orderSchema);
module.exports = Order;
