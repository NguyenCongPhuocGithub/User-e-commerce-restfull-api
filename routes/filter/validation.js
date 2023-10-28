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

    priceStart: yup
      .number()
      .min(0)
      .test("priceStart: is not valid", (value, context) => {
        if (!value || !context.parent.priceEnd) return true; // Không điền giá bắt đầu

        if (context.parent.priceEnd) {
          return value < context.parent.priceEnd; // Giá kết thúc phải lớn hơn giá bắt đầu (nếu có)
        }
      }),

    priceEnd: yup
      .number()
      .min(0)
      .test("priceEnd: is not valid", (value, context) => {
        if (!value || !context.parent.priceStart) return true; // Không điền giá kết thúc

        if (context.parent.priceStart) {
          return value > context.parent.priceStart; // Giá kết thúc phải lớn hơn giá bắt đầu (nếu có)
        }
      }),

    page: yup.number().min(1),

    limit: yup.number().min(2),

    rateStar: yup.number().min(0),

    discountStart: yup.number().min(0).max(75).test("discountStart: is not valid", (value, context) => {
      if (!value || !context.parent.discountEnd) return true; // Không điền giá kết thúc

      if (context.parent.discountEnd) {
        return value < context.parent.discountEnd; // Giá kết thúc phải lớn hơn giá bắt đầu (nếu có)
      }
    }),

    discountEnd: yup.number().min(0).max(75).test("discountEnd: is not valid", (value, context) => {
      if (!value || !context.parent.discountStart) return true; // Không điền giá kết thúc

      if (context.parent.discountStart) {
        return value > context.parent.discountStart; // Giá kết thúc phải lớn hơn giá bắt đầu (nếu có)
      }
    }),
  }),
});

module.exports = {
  validationQuerySchema,
};
