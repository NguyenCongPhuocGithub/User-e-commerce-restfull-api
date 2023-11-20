const JWT = require('jsonwebtoken');

const jwtSettings = require('../constants/jwtSetting');

const generateToken = (user) => {
    const expiresIn = '30d';
    return JWT.sign(
        { 
            iat: Math.floor(Date.now() / 1000),
            ...user, //user được trả dữ liệu về theo quy định lúc nhận đối số
        },
        jwtSettings.SECRET,
        {
            expiresIn,
        },
    );
};

const generateRefreshToken = (id) => {
    const expiresIn = '30d';
  
    return JWT.sign({ id }, jwtSettings.SECRET, { expiresIn })
  };
module.exports = {
    generateToken,
    generateRefreshToken,
};