const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const mediaSchema = new Schema(
  {
    imageUrls: { type: [String], default: [] },
    coverImageUrl: { type: String, default: null },
    avatarUrl: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
mediaSchema.set("toJSON", { virtuals: true });
mediaSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean()
mediaSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng sản phẩm dựa trên lược đồ đã khai báo

const Media = model("medias", mediaSchema);
module.exports = Media;