const express = require('express');
const router = express.Router();

const { validateSchema, checkIdSchema } = require('../../utils');
const {
    createSchema,
    updateStatusSchema,
    getListSchema,
} = require('./validation');

const {
    getDetail,
    create,
    updateStatus,
    getList,
    createFromCart,
} = require('./controller');

router.route('/')
    .get(validateSchema(getListSchema), getList)
    .post(validateSchema(createSchema), create)

router.route('/createFromCart')
  .post(validateSchema(createSchema), createFromCart)

router.route('/:id')
  .get(validateSchema(checkIdSchema), getDetail)

router.route('/status/:id')
  .patch(validateSchema(checkIdSchema),validateSchema(updateStatusSchema), updateStatus)


module.exports = router;