var express = require('express');
var router = express.Router();

const { validateSchema, checkIdSchema } = require('../../utils');
const { categoryQuerySchema } = require('./validation');

const {getAll, getList, getDetail, search} = require('./controller');

router.route('/all')
    .get(getAll)

router.route('/')
  .get(getList)

router.route('/search')
  .get(validateSchema(categoryQuerySchema), search);

router.route('/:id')
  .get(validateSchema(checkIdSchema), getDetail)

module.exports = router;