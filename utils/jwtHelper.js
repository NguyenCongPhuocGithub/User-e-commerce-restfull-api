const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const jwtSettings = require("../constants/jwtSetting");

const generateToken = (user) => {
  const expiresIn = "30d";
  return JWT.sign(
    {
      iat: Math.floor(Date.now() / 1000),
      ...user, //user được trả dữ liệu về theo quy định lúc nhận đối số
    },
    jwtSettings.SECRET,
    {
      expiresIn,
    }
  );
};

const generateRefreshToken = (id) => {
  const expiresIn = "30d";

  return JWT.sign({ id }, jwtSettings.SECRET, { expiresIn });
};

const sendVerificationCode = async (email, verificationCode) => {
  try {
    //config gửi mail từ nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nguyencongphuoccv@gmail.com", // Địa chỉ email Gmail của bạn
        pass: process.env.PASSWORDEMAIL, // Mật khẩu ứng dụng của bạn
      },
    });

    // Tính thời gian hiệu lực của mã xác thực (10 phút)
    const expiresInMinutes = 5;

    const emailHTML = `
    <p>Mã xác thực của bạn là: <strong>${verificationCode}</strong></p>
    <p>Mã xác thực này có hiệu lực trong vòng ${expiresInMinutes} phút.</p>
  `;

    const mailOptions = {
      from: "nguyencongphuoccv@gmail.com",
      to: email,
      subject: "Xác thực địa chỉ email của bạn từ Jollibee",
      html: emailHTML, // Sử dụng HTML cho nội dung email,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi gửi email xác thực:", error);
    throw error;
  }
};

const generateVerificationCode = () => {
  const createdAt = new Date();
  const expiresIn = 1 * 60 * 1000;
  const expirationTime = new Date(createdAt.getTime() + expiresIn);

  return {
    code: Math.floor(Math.random() * (999999 - 100000 + 1) + 100000),
    createdAt,
    expiresIn,
    expirationTime,
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateVerificationCode,
  sendVerificationCode,
};
