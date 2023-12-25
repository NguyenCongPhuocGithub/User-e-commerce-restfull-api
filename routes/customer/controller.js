const { Customer, Cart } = require("../../models");
const { sendVerificationCode } = require("../../utils/jwtHelper");

//Lưu verificationCode
let verificationCode;
let verificationCodeExpiration;

module.exports = {
  getDetail: async (req, res, next) => {
    try {
      // const { id } = req.params;
      const id = req.user._id;

      let result = await Customer.findOne({
        _id: id,
        isDeleted: false,
      })
        .select("-password")
        .populate("media");

      if (result) {
        return res.status(200).json({
          message: "Get detailed information of customer successfully",
          payload: result,
        });
      }

      return res
        .status(410)
        .json({ message: "Get detailed information of customer not found" });
    } catch (err) {
      return res.status(404).json({
        message: "Get detailed information of customer failed",
        error: err,
      });
    }
  },

  update: async (req, res, next) => {
    try {
      const id = req.user._id;
      const {
        firstName,
        lastName,
        birthday,
        phoneNumber,
        provinceCode,
        provinceName,
        districtCode,
        districtName,
        wardCode,
        wardName,
        address,
      } = req.body;

      const updateCustomer = await Customer.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          firstName,
          lastName,
          phoneNumber,
          birthday,
          provinceCode,
          provinceName,
          districtCode,
          districtName,
          wardCode,
          wardName,
          address,
        },
        { new: true }
      );

      if (updateCustomer) {
        return res.status(200).json({
          message: "Update information of customer successfully",
          payload: updateCustomer,
        });
      }

      return res
        .status(410)
        .json({ message: "Update information of customer not found" });
    } catch (err) {
      return res.send(404, {
        message: "Update information of customer failed",
        error: err,
      });
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const id = req.user._id;
      const { passwordOld, newPassword, confirmPassword } = req.body;

      let customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      let error = [];

      // Thực hiện truyền password chưa mã hóa vào thực hiện với password được mã hóa
      const isCorrectPassOld = await customer.isValidPass(passwordOld);
      const isCorrectPassNew = await customer.isValidPass(newPassword);

      if (!isCorrectPassOld) {
        error.push("Mật khẩu cũ không đúng");
      }

      if (isCorrectPassNew) {
        error.push("Mật khẩu mới không trùng mật khẩu cũ");
      }

      if (newPassword !== confirmPassword) {
        error.push("Xác nhận mật khẩu không trùng mật khẩu mới");
      }

      if (error.length > 0) {
        return res.status(404).json({
          message: "Change password information of customer failed",
          error: `${error}`,
        });
      }

      const updateCustomer = await Customer.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          password: newPassword,
        },
        { new: true }
      );

      if (updateCustomer) {
        return res.status(200).json({
          message: "Change password information of customer successfully",
          payload: updateCustomer,
        });
      }

      return res
        .status(410)
        .json({ message: "Change password information of customer not found" });
    } catch (err) {
      return res.send(404, {
        message: "Change password information of customer failed",
        error: err,
      });
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email, newPassword, confirmPassword} =
        req.body;

      let customer = await Customer.findOne({
        email: email,
        isDeleted: false,
      });

      let errors = [];
      
        if (!customer) {
          return res.status(404).json({
            message: "Cập nhật thông tin mật khẩu thất bại",
            error: `Email của bạn không tồn tại trong hệ thống`,
          });
      }

      if (!newPassword) {
        errors.push("Vui lòng nhập mật khẩu mới");
      }

      if (newPassword !== confirmPassword) {
        errors.push("Xác nhận mật khẩu không trùng mật khẩu mới");
      }

      // Tiếp tục xử lý các lỗi khác và trả về kết quả
      if (errors.length > 0) {
        return res.status(404).json({
          message: "Thay đổi thông tin mật khẩu trong quá trình thực hiện",
          error: `${errors}`,
        });
      }

      const updateCustomer = await Customer.findOneAndUpdate(
        { _id: customer._id, isDeleted: false },
        {
          password: newPassword,
        },
        { new: true }
      );

      if (updateCustomer) {
        return res.status(200).json({
          message: "Thay đổi mật khẩu thành công",
          payload: updateCustomer,
        });
      }

      return res
        .status(410)
        .json({ message: "Thay đổi thông tin mật khẩu không tìm thấy" });
    } catch (error) {
      return res.send(404, {
        message: "Thay đổi thông tin mật khẩu thất bại",
        error: err,
      });
    }
  },

  softDelete: async (req, res, next) => {
    try {
      // const { id } = req.params;
      const id = req.user._id;

      const result = await Customer.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      await Cart.findOneAndUpdate(
        { customerId: id, isDeleted: false },
        { isDeleted: true }
      );

      if (result) {
        return res.send(200, {
          message: "Soft Delete information of customer successfully",
          payload: result,
        });
      }

      return res.send(410, {
        message: "Soft Delete information of customer not found",
      });
    } catch (error) {
      return res.send(404, {
        message: "Soft Delete information of customer failed",
        error,
      });
    }
  },
};
