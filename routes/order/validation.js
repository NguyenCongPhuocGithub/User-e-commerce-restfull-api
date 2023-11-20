const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;

const updateStatusSchema = yup.object({
  query: yup.object({
    status: yup
      .string()
      .required("status: cannot be empty ")
      .oneOf(
        [
          "REJECTED",
        ],
        "status: is not valid"
      ),
  }),
});

const createSchema = yup.object({
  body: yup.object({
    // createdDate: yup.date(),

    // shippedDate: yup
    //   .date()
    //   .test(
    //     "check date",
    //     "shippedDate: is note valid be must than createdDate",
    //     (value) => {
    //       if (!value) return true;

    //       if (value && this.createdDate && value < this.createdDate) {
    //         return false;
    //       }

    //       if (value < new Date()) {
    //         return false;
    //       }

    //       return true;
    //     }
    //   ),

    paymentType: yup
      .string()
      .required("paymentType: cannot be blank")
      .oneOf(["CASH", "CREDIT_CARD"], "paymentType: is not valid")
      .default("CASH"),

    status: yup
      .string()
      .required("status: cannot be blank")
      .oneOf(
        ["PLACED","REJECTED"],
        "status: is not valid"
      )
      .default("PLACED"),

    totalFee: yup.number().required("totalFee: cannot be blank"),

    isOnline: yup.boolean().required("isOnline: cannot be blank").default(true),

    productList: yup.array().of(
      yup.object().shape({
        productId: yup
          .string()
          .test("validationProductID", "ID: is not valid", (value) => {
            return ObjectId.isValid(value);
          }),

        quantity: yup.number().required("quantity: cannot be empty ").min(1),
      })
    ),
  }),
});

const getListSchema = yup.object({
  query: yup.object({
    page: yup.number().min(1),
    pagesize: yup.number().min(8),
  }),
});

module.exports = {
  updateStatusSchema,
  createSchema,
  getListSchema,
};
