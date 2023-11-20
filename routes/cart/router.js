const express = require('express');
const router = express.Router();

const {
  createSchema,
} = require('./validations');
const {
  getDetail,
  create,
  remove,
  update,
} = require('./controller');
const { validateSchema } = require('../../utils');

router.route('/')
  .post(validateSchema(createSchema), create)
  .get(getDetail)

router.route('/delete')
  .patch(remove)

router.route('/update')
  .patch(update)

module.exports = router;
