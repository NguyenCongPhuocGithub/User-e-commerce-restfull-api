const yup = require("yup");


  const registerSchema = yup.object({
    body: yup.object({
      firstName: yup
        .string()
        .required("firstName: cannot be blank")
        .max(50, "firstName: cannot exceed 50 characters"),

      lastName: yup
        .string()
        .required("lastName: cannot be blank")
        .max(50, "lastName: cannot exceed 50 characters"),

      email: yup
        .string()
        .required("email: cannot be blank")
        .test("email type", "email: is not a valid email!", (value) => {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        }),

      password: yup
        .string()
        .required("password: cannot be blank")
        .test(
          "password type",
          "password: is not a valid password!",
          (value) => {
            const passwordRegex =
              /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

            return passwordRegex.test(value);
          }
        )
        .min(8)
        .max(20),

      phoneNumber: yup
        .string()
        .required("phoneNumber: cannot be blank")
        .test(
          "phoneNumber type",
          "phoneNumber: is not a valid phoneNumber!",
          (value) => {
            const phoneRegex =
              /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

            return phoneRegex.test(value);
          }
        ),
    }),
  });

  const loginSchema = yup.object({
    body: yup.object({
      email: yup
        .string()
        .required("email: cannot be blank")
        .test("email type", "email: is not a valid email!", (value) => {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        }),

      password: yup
        .string()
        .required()
        .required("password: cannot be blank")
        .test(
          "password type",
          "password: is not a valid password!",
          (value) => {
            const passwordRegex =
              /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

            return passwordRegex.test(value);
          }
        )
        .min(8)
        .max(20),
    }),
  });


  module.exports = {
    registerSchema,
    loginSchema
  };
