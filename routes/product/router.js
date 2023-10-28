var express = require('express');
var router = express.Router();

const {validateSchema, checkIdSchema} = require('../../utils')

const {getAll, getDetail, search} = require('./controller');
const {validationQuerySchema } = require('./validation');

router.route('/all')
    .get(getAll);
    
router.get('/search', validateSchema(validationQuerySchema), search);

router.route('/:id')
    .get(validateSchema(checkIdSchema), getDetail)

module.exports = router;