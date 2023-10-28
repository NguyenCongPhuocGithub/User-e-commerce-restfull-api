const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;


  // getSchema: yup.object({
  //   query: yup.object({
  //     category: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
  //       if (!value) return true;
  //       return ObjectId.isValid(value);
  //     }),
  //     sup: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
  //       if (!value) return true;
  //       return ObjectId.isValid(value);
  //     }),
  //     productName: yup.string(),
  //     stockStart: yup.number().min(0),
  //     stockEnd: yup.number(),
  //     priceStart: yup.number().min(0),
  //     priceEnd: yup.number(),
  //     discountStart: yup.number().min(0),
  //     discountEnd: yup.number().max(50),
  //     skip: yup.number(),
  //     limit: yup.number(),
  //   }),
  // }),

  const createSchema = yup.object({
    body: yup.object({
      productId: yup
        .string()
        .required()
        .test('validationProductID', 'ID sai định dạng', (value) => {
          return ObjectId.isValid(value);
        }),

      quantity: yup.number().required().min(0),
    }),
  })

  // const getDetailSchema = yup.object({
  //   params: yup.object({
  //     id: yup.string().test('validationID', 'ID sai định dạng', (value) => {
  //       return ObjectId.isValid(value);
  //     }),
  //   }),
  // })

  const removeSchema = yup.object({
    body: yup.object({
      customerId: yup.string().test('validationID', 'ID sai định dạng', (value) => {
        return ObjectId.isValid(value);
      }),
      productId: yup.string().test('validationID', 'ID sai định dạng', (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  })



  module.exports = {
    createSchema,
    removeSchema,

  };
