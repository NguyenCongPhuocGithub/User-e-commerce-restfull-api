const JWT = require("jsonwebtoken");

const {
  generateToken,
  generateRefreshToken,
} = require("../../utils/jwtHelper");
const { Customer, Cart} = require("../../models");
const jwtSettings = require("../../constants/jwtSetting");

module.exports = {
  //Build code login truyền giá trị từ front end vào generateToken and refreshToken, tạo ra token với giá trị được truyền vào.
  login: async (req, res, next) => {
    try {
      const {
        _id,
        firstName,
        lastName,
        email,
        password,
        birthday,
        phoneNumber,
        provinceCode,
        provinceName,
        districtCode,
        districtName,
        wardCode,
        wardName,
        address,
        updatedAt,
      } = req.user;

      const token = generateToken({
        _id,
        firstName,
        lastName,
        email,
        password,
        birthday,
        phoneNumber,
        provinceCode,
        provinceName,
        districtCode,
        districtName,
        wardCode,
        wardName,
        address,
        updatedAt,
      });
      
      const refreshToken = generateRefreshToken(_id);

      return res.status(200).json({
        message: "Login of user successfully",
        token,
        refreshToken,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Login of user failed", error: err });
    }
  },

  //Build code register thực hiện tìm kiếm theo email hoặc phoneNumber có tồn tại không,
  //có trả về alreay exists, không có thực hiện tạo mới account với thông tin truyền từ front end.
  register: async function (req, res, next) {
    try {
      const {firstName, lastName, email, phoneNumber, password, birthday } = req.body;

      const getEmailExits = Customer.findOne({ email });
      const getPhoneExits = Customer.findOne({ phoneNumber });

      const [foundEmail, foundPhoneNumber] = await Promise.all([
        getEmailExits,
        getPhoneExits,
      ]);

      const errors = [];
      if (foundEmail) errors.push("email: already exists");
      // if (!isEmpty(foundEmail)) errors.push('Email đã tồn tại');
      if (foundPhoneNumber) errors.push("phoneNumber :already exists");

      if (errors.length > 0) {
        return res.status(404).json({
          message: "Register is not valid",
          error: `${errors}`,
        });
      }

      const newCustomer = new Customer({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        birthday,
        avatarId: null,
      });

      let result = await newCustomer.save();

      const customerId = result._id;

      const newCart = new Cart({ customerId });

      newCart.save();

      // Đã tạo tài khoản thành công

      return res.send({
        message: "Register of user successfully",
        payload: result,
      });

    } catch (err) {
      return res.status(500).json({ message: "Register of user failed", error: err });
    }
  },

  //Kiểm tra verify refreshToken, có thực hiện trả về id customer và thực hiện tìm kiếm 
  //trả về thông tin user tiếp tục thực hiện việc generateToken tạo ra token với thông tin user trả về.
  checkRefreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      JWT.verify(
        refreshToken,
        jwtSettings.SECRET,
        async (err, payload, done) => {
          if (err) {
            return res.status(401).json({
              message: "refreshToken: is not valid",
            });
          } else {
            const { id } = payload;

            const customer = await Customer.findOne({
              _id: id,
              isDeleted: false,
            })
              .select("-password")
              .lean();

            if (employee) {
              const {
                _id,
                firstName,
                lastName,
                phoneNumber,
                address,
                email,
                birthday,
                updatedAt,
              } = customer;

              const token = generateToken({
                _id,
                firstName,
                lastName,
                phoneNumber,
                address,
                email,
                birthday,
                updatedAt,
              });

              return res
                .status(200)
                .json({
                  message: "checkRefreshToken of user successfully",
                  token: token,
                });
            }
            return res
              .status(401)
              .json({ message: "checkRefreshToken of user not found" });
          }
        }
      );
    } catch (err) {
      return res.status(500).json({
        message: "checkRefreshToken of user failed",
        error: err,
      });
    }
  },

  basicLogin: async (req, res, next) => {
    try {
      const user = await Employee.findById(req.user._id)
        .select("-password")
        .lean();
      const token = generateToken(user);

      return res
        .status(200)
        .json({ message: "Basic login of user successfully", token: token });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Login of user failed", error: err });
    }
  },

  getMe: async (req, res, next) => {
    try {
      return res.status(200).json({
        message: "Get me of user successfully",
        payload: req.user,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Login of user failed", error: err });
    }
  },
};
