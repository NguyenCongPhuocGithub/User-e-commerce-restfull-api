var express = require('express');
var passport = require('passport');
var router = express.Router();

const { validateSchema } = require('../../utils');
const {customerSchema, changePasswordSchema, forgotPasswordSchema} = require('./validation');

const{getDetail, update, changePassword, forgotPassword, softDelete} = require('./controller');

router.route('/')
  .get(passport.authenticate('jwt', { session: false }), getDetail)
  .patch(passport.authenticate('jwt', { session: false }), validateSchema(customerSchema), update)

router.route('/changePassword')
  .patch(passport.authenticate('jwt', { session: false }), validateSchema(changePasswordSchema), changePassword)

router.route('/forgotPassword')
  .patch(validateSchema(forgotPasswordSchema), forgotPassword)

router.route('/delete')
  .patch(passport.authenticate('jwt', { session: false }), softDelete);

module.exports = router;