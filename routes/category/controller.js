const { fuzzySearch } = require("../../utils");
const { Category } = require("../../models");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const results = await Category.find({ isDeleted: false }).populate("media").sort({ name: 1 });

      if(results){
        return res
          .status(200)
          .json({ message: "Get all information of category successfully", count: results.length, payload: results });
      }

      return res
        .status(410)
        .json({ message: "Get all information of category not found" });

    } catch (err) {
      return res.status(404).json({
        message: "Get all information of category failed",
        error: err,
      });
    }
  },

  getList: async (req, res, next) => {
    try {
      const { page, pageSize } = req.query;
      const limit = pageSize || 10;
      const skip = (page - 1) * limit || 0;

      const conditionFind = { isDeleted: false };

      let results = await Category.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .populate("media");

      const total = await Category.countDocuments(conditionFind);

      if(results){

        return res
          .status(200)
          .json({ code: 200, message: "Get list information of category successfully", total, count: results.length, payload: results });
      }

      return res
      .status(410)
      .json({ message: "Get list information of category not found" });

    } catch (err) {
      return res
        .status(404)
        .json({ message: "Get list information of category failed", error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      let result = await Category.findOne({
        _id: id,
        isDeleted: false,
      }).populate("media");

      if (result) {
        return res.status(200).json({ message:"Get detail information of category successfully", payload: result });
      }

      return res.status(410).json({ message: "Get all information of category not found" });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Get all information of category failed", error: err });
    }
  },

  search: async (req, res, next) => {
    try {
      const { name } = req.query;
      const conditionFind = { isDeleted: false };

      if (name) conditionFind.name = fuzzySearch(name);

      const result = await Category.find(conditionFind).populate("media");

      const total = await Category.countDocuments(conditionFind);

      if(result){
        return res
        .status(200)
        .json({ message: "Search information of category successfully", total, count: result.length, payload: result });
      }
      return res
        .status(410)
        .json({ message: "Search information of category not found" });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Search information of category failed", error: err });
    }
  },

};
