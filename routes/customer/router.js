var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../utils');
const {customerSchema, changePasswordSchema} = require('./validation');

const{getDetail, update, changePassword, softDelete} = require('./controller');

router.route('/')
  .get(getDetail)
  .patch(validateSchema(customerSchema), update)

router.route('/changPassword')
  .patch(validateSchema(changePasswordSchema), changePassword)

router.route('/delete')
  .patch(softDelete);

module.exports = router;