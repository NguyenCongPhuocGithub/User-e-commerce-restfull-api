const {
  generateVerificationCode,
  sendVerificationCode,
} = require("../../utils/jwtHelper");
const { Customer } = require("../../models");

// Lưu global variable verification Code và thời gian tồn tại
let verificationCode;
let expirationTime;

module.exports = {
  verificationMail: async (req, res, next) => {
    try {
      const { email, phoneNumber, confirmVerificationCode, typeAPI } = req.body;

      const getEmailExits = await Customer.findOne({ email });
      const getPhoneExits = Customer.findOne({ phoneNumber });
      
      const errors = [];
      const [foundEmail, foundPhoneNumber] = await Promise.all([
        getEmailExits,
        getPhoneExits,
      ]);

      if(typeAPI === "Register"){
        if (foundEmail) errors.push("Email đã tồn tại");
        if (foundPhoneNumber) errors.push("Số điện thoại đã tồn tại");
      }

      if(typeAPI === "ForgotPassword"){
        if (!foundEmail) errors.push("Email không tồn tại trong hệ thống");
      }
    
      if (errors.length > 0) {
        return res.status(404).json({
          message: "Xác nhận mã gmail không hợp lệ",
          error: `${errors}`,
        });
      }

      if (!confirmVerificationCode) {
        let generatedCode = generateVerificationCode();
        // Gán giá trị mã code gửi tới mail
        verificationCode = generatedCode.code;
        expirationTime = generatedCode.expirationTime;
        await sendVerificationCode(email, verificationCode);
        return res.status(201).json({
          message: "Gửi mã xác thực thành công",
          payload: verificationCode,
          typeAPI
        });
      } else {
        // Tạo thời gian duy trì cho mã 5p
        const currentTime = new Date();
        // Kiểm tra verificationCode đã hết hạn chưa
        if (currentTime > expirationTime) {
          return res.status(404).json({
            message: "Mã xác thực không hợp lệ",
            error: "Mã xác thực hết hạn",
            expirationTime: expirationTime,
            typeAPI
          });
        }
        if (confirmVerificationCode != verificationCode) {
          return res.status(404).json({
            message: "Xác thực mã gmail không hợp lệ",
            error: "Mã xác thực gmail không khớp",
            payload: verificationCode,
            typeAPI,
          });
        }
      }

      return res.status(200).json({
        message: "Xác thực gmail thành công",
        typeAPI
      });
    } catch (error) {
      return res.status(404).json({
        message: "Gửi mã xác thực gmail thất bại",
        error: error,
      });
    }
  },
};
