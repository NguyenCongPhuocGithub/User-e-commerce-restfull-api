const { Customer, Cart } = require("../../models");
const { findOne } = require("../../models/category");
const { findById } = require("../../models/supplier");

module.exports = {

  getDetail: async (req, res, next) => {
    try {
      // const { id } = req.params;
      const id = req.user._id

      let result = await Customer.findOne({
        _id: id,
        isDeleted: false,
      }).select('-password')
      .populate("media");

      if (result) {
        return res
          .status(200)
          .json({ message: "Get detailed information of customer successfully", payload: result });
      }

      return res.status(410).json({ message: "Get detailed information of customer not found" });

    } catch (err) {
      return res
        .status(404)
        .json({ message: "Get detailed information of customer failed", error: err });
    }
  },

  update: async (req, res, next) => {
    try {
      const id = req.user._id
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

      return res.status(410).json({ message: "Update information of customer not found" });

    } catch (err) {
      return res.send(404, {
        message: "Update information of customer failed",
        error: err,
      });
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const id = req.user._id
      const {
        passwordOld,
        newPassword,
        confirmPassword,
      } = req.body;

      let customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      })

      let error = [];

      const isCorrectPassOld = await customer.isValidPass(passwordOld);
      const isCorrectPassNew = await customer.isValidPass(newPassword);

      if (!isCorrectPassOld) {
        error.push("Mật khẩu cũ không đúng");
      }

      if(isCorrectPassNew) {
         error.push("Mật khẩu mới không trùng mật khẩu cũ");
      }

      if(newPassword !== confirmPassword) {
         error.push("Xác nhận mật khẩu không trùng mật khẩu mới");
      }

      if(error.length > 0) {
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

      if ( updateCustomer ) {
        return res.status(200).json({
          message: "Change password information of customer successfully",
          payload: updateCustomer,
        });
      }

      return res.status(410).json({ message: "Change password information of customer not found" });

    } catch (err) {
      return res.send(404, {
        message: "Change password information of customer failed",
        error: err,
      });
    }
  },

  softDelete: async (req, res, next) => {
    try {
      // const { id } = req.params;
      const id = req.user._id

      const result = await Customer.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      await Cart.findOneAndUpdate(
        {customerId: id, isDeleted: false},
        {isDeleted: true},
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
