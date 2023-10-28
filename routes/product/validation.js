const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;

const validationQuerySchema = yup.object().shape({
  query: yup.object({
    categoryId: yup
      .string()
      .test("Validate ObjectID", "categoryId: is not valid ObjectID", (value) => {
        if (!value) return true;
        return ObjectId.isValid(value);
      }),

    supplierId: yup
      .string()
      .test("Validate ObjectID", "supplierId: not valid ObjectID", (value) => {
        if (!value) return true;
        return ObjectId.isValid(value);
      }),
    
    keyword: yup.string(),

    page: yup.number().min(1),

    limit: yup.number().min(2),
  }),
});

module.exports = {
  validationQuerySchema,
};
