const yup = require("yup");

const customerSchema = yup.object({
  body: yup.object({
    firstName: yup
      .string()
      .required("firstName: cannot be blank")
      .max(50, "firstName: cannot exceed 50 characters"),

    lastName: yup
      .string()
      .required("lastName: cannot be blank")
      .max(50, "lastName: cannot exceed 50 characters"),

    birthday: yup.date(),

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

    provinceCode: yup.number(),

    provinceName: yup
      .string()
      .max(50, "provinceName: cannot exceed 50 characters"),

    districtCode: yup.number(),

    districtName: yup
      .string()
      .max(50, "districtName: cannot exceed 50 characters"),

    wardCode: yup.string().max(500, "wardCode: cannot exceed 50 characters"),

    wardName: yup.string().max(500, "wardName: cannot exceed 50 characters"),

    address: yup.string().max(500, "address: cannot exceed 500 characters"),
  }),
});

const changePasswordSchema = yup.object({
  body: yup.object({
    passwordOld: yup
      .string()
      .required("passwordOld: cannot be blank")
      .test("passwordOld type", "password: is not a valid password!", (value) => {
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        return passwordRegex.test(value);
      })
      .min(8)
      .max(20),

    newPassword: yup
      .string()
      .required("newPassword: cannot be blank")
      .test("newPassword type", "password: is not a valid password!", (value) => {
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        return passwordRegex.test(value);
      })
      .min(8)
      .max(20),

    confirmPassword: yup
      .string()
      .required("confirmPassword: cannot be blank")
      .test(
        "confirmPassword type",
        "confirmPassword: is not a valid password!",
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
  customerSchema,
  changePasswordSchema,
};
