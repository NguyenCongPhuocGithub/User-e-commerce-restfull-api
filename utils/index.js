const yup = require("yup");
const fs = require("fs");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  // Thực thi việc xác thực với cấu trúc chia nhánh body, query, params
  validateSchema: (schema) => async (req, res, next) => {
    try {
      //Check dữ liệu được gửi từ front end lên có phải với body, params, query.
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        {
          //Thực thi việc check lỗi hết trả về một lần
          abortEarly: false,
        }
      );

      return next();
    } catch (err) {
      return res.send(400, {
        type: err.name,
        errors: err.errors,
        provider: "YUP",
      });
    }
  },

  //Function thực thi check kiểu dữ liệu có phải là ID mongodb(ObjectId)
  checkIdSchema: yup.object({
    params: yup.object({
      id: yup.string().test("inValid", "ID: is not a valid id", (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  }),

  // Function thực thi check giá trị theo regex dùng để thực hiện search
  fuzzySearch: (text) => {
    const regex = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    return new RegExp(regex, "gi");
  },

  // Function thực thi loop giá trị thay vì map và forEach thì fuzzySearch loại bỏ giá trị trả về array và xác định index trả về theo thứ tự 
  asyncForEach: async (array, callback) => {
    for (let index = 0; index < array.length; index += 1) {
      //callBack function được gọi lại mỗi lần theo số index và trả đối số về theo index
      //Note: tại nơi gọi function asyncForEach sẽ nhận đối số trước và function callback sẽ loop lần lược
      await callback(array[index], index, array);
    }
  },
};

