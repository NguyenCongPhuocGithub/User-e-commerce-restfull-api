const express = require('express');
const passport = require('passport');
const router = express.Router();

const { validateSchema } = require('../../utils');

const {loginSchema, registerSchema}= require('./validation');

const {  
    login,
    register,
    checkRefreshToken,
    getMe,
    basicLogin,
} = require('./controller');

router.route('/login')
    .post(
        validateSchema(loginSchema),
        passport.authenticate('local', {session: false}),
        login,
    );

    router.route('/register')
    .post(
    validateSchema(registerSchema),
    register,
  );

router.route('/refresh-token')
    .post(checkRefreshToken)

router.route('/basic')
    .post(
      passport.authenticate('basic', { session: false }),
      basicLogin,
);

router.route('/profile')
  .get(
    passport.authenticate('jwt', { session: false }),
    getMe,
  );

module.exports = router;

