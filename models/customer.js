const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const bcrypt = require("bcryptjs"); // Thêm thư viện hỗ trợ mã hóa password

// Xác định bảng khách hàng với các trường khác nhau và quy tắc xác thực của chúng.
const customerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name: cannot be blank"],
      maxLength: [50, "First name: cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name: cannot be blank"],
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
        message: "Email: is not a valid email!",
      },
      required: [true, "Email: cannot be blank"],
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
      required: true,
      minLength: [8, "Password: must be at least 8 characters"],
      maxLength: [20, "Password: cannot exceed 20 characters"],
    },
    avatarId: {
      type: Schema.Types.ObjectId,
      ref: "medias",
      default: null,
    },
    birthday: {
      type: Date,
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
    provinceCode: {
      type: Number
    },
    provinceName: {
      type: String,
      maxLength: [300, "Province name: cannot exceed 300 characters"],
    },
    districtCode: {
      type: Number,
    },
    districtName: {
      type: String,
      maxLength: [300, "District name: cannot exceed 300 characters"],
    },
    wardCode: {
      type: String
    },
    wardName: {
      type: String,
      maxLength: [300, "Ward name: cannot exceed 300 characters"],
    },
    address: {
      type: String,
      maxLength: [500, "Address: cannot exceed 500 characters"],
    },
    countCancellations: {
      type: Number,
      default: 0,
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

// Virtual with Populate
customerSchema.virtual("media", {
  ref: "medias",
  localField: "avatarId",
  foreignField: "_id",
  justOne: true,
});

// Tạo trường ảo fullName
customerSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.firstName}`;
});

// Build mã hóa field
customerSchema.pre("save", async function (next) {
// Lưu hashPass thay cho việc lưu password
  this.password = await hashPassword(this.password);
  next();
});

customerSchema.pre("findOneAndUpdate", async function (next) {
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


// Kiểm tra mật khẩu có hợp lệ hay không - giải mã password
customerSchema.methods.isValidPass = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean() và hỗ trợ cho việc định nghĩa field sử dụng method liền.
customerSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng khách hàng dựa trên lược đồ đã khai báo
const Customer = model("customers", customerSchema);
module.exports = Customer;