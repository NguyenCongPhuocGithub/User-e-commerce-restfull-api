const yup = require("yup");

const verificationMailSchema = yup.object({
    body: yup.object({
        email: yup
        .string()
        .required("email: cannot be blank")
        .test("email type", "email: is not a valid email!", (value) => {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        }),
    }),
});

module.exports = {
  verificationMailSchema,
};
