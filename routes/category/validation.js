const yup = require("yup");

 const categoryQuerySchema = yup.object({
    query: yup.object({
      name: yup.string().required("name: cannot be empty"),
    }),
  });

module.exports = {
  categoryQuerySchema,
};

