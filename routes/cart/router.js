const express = require('express');
const router = express.Router();

const {
  createSchema,
} = require('./validations');
const {
  getDetail,
  create,
} = require('./controller');
const { validateSchema } = require('../../utils');

router.route('/')
  .post(validateSchema(createSchema), create)
  .get(getDetail)


module.exports = router;
