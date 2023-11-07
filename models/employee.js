const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const bcrypt = require("bcryptjs");
const { string } = require("yup");

// Xác định bảng nhân viên với các trường khác nhau và quy tắc xác thực của chúng.
const employeeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name: cannot be empty"],
      maxLength: [50, "First name: cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name: cannot be empty"],
      maxLength: [50, "Last name: cannot exceed 50 characters"],
    },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          // xác thực địa chỉ email.
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: `Email: is not a valid email address!`,
      },
      required: [true, "Email: cannot be empty"],
      maxLength: [50, "Email: cannot exceed 50 characters"],
      unique: [true, "Email: must be unique"],
    },
    password: {
      type: String,
      validate: {
        validator: function (value) {
          // xác thực địa chỉ email.
          const passwordRegex =
            /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
          return passwordRegex.test(value);
        },
        message: "Password: is not a valid password!",
      },
      required: [true, "Password: cannot be empty"],
      minLength: [8, "Password: must be at least 8 characters"],
      maxLength: [20, "Password: cannot exceed 20 characters"],
    },
    birthday: {
      type: String,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          // Xác thực số điện thoại
          const phoneRegex = /^(0[0-9]|84[0-9])\s?\d{8,9}$/;
          return phoneRegex.test(value);
        },
        message: "Phone number: is not a valid phone number.",
      },
      unique: [true, " Phone number must be unique"],
    },
    avatarId: {
      type: Schema.Types.ObjectId,
      ref: "medias",
      default: null,
    },
    address: {
      type: String,
      maxLength: [500, "Address: cannot exceed 500 characters"],
    },
    typeRole: {
      required: [true, "typeRole: cannot be empty"],
      type: String,
      enum: ["MANAGE", "SALES", "SHIPPER"],
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

// Tạo trường ảo fullName
employeeSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.firstName}`;
});
// Virtual with Populate
employeeSchema.virtual("media", {
  ref: "medias",
  localField: "avatarId",
  foreignField: "_id",
  justOne: true,
});

// Build mã hóa field
employeeSchema.pre("save", async function (next) {
  // Lưu hashPass thay cho việc lưu password
  this.password = await hashPassword(this.password);
  next();
});

employeeSchema.pre("findOneAndUpdate", async function (next) {
  // Lưu hashPass thay cho việc lưu password
  if (this._update.password) {
    this._update.password = await hashPassword(this._update.password);
  }
  next();
});

// hash mật khẩu trước khi lưu vào cơ sở dữ liệu.
async function hashPassword(value) {
  if (value) {
    const salt = await bcrypt.genSalt(10); // 10 kí tự: ABCDEFGHIK + 123456
    const hashedPassword = await bcrypt.hash(value, salt);

    return hashedPassword;
  }
}
// End mã hóa field

// Kiểm tra mật khẩu có hợp lệ hay không
employeeSchema.methods.isValidPass = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean()
employeeSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng khách hàng dựa trên lược đồ đã khai báo
const Employee = model("employees", employeeSchema);
module.exports = Employee;