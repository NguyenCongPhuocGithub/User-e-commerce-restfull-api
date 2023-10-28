var express = require('express');
var router = express.Router();

const {validateSchema} = require('../../utils')

const {filterProduct} = require('./controller');
const {validationQuerySchema } = require('./validation');

router.get('/product', validateSchema(validationQuerySchema), filterProduct);

module.exports = router;