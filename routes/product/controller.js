const { Product } = require("../../models");
const { fuzzySearch } = require("../../utils");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      let results = await Product.find({
        isDeleted: false,
      })
        .populate("category")
        .populate("supplier")
        .populate("media")
        .lean();

      if (results) {
        return res.status(200).json({
          message: "Get all information of product successfully",
          count: results.length,
          payload: results,
        });
      }

      return res
        .status(410)
        .json({ message: "Get all information of product not found" });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Get all information of product failed", error: err });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      let result = await Product.findOne({
        _id: id,
        isDeleted: false,
      })
        .populate("category")
        .populate("supplier");

      if (result) {
        return res.status(200).json({
          message: "Get detail information of product successfully",
          payload: result,
        });
      }

      return res.status(410).json({
        message: "Get detail information of product not found",
      });
    } catch (error) {
      return res.status(404).json({
        message: "Get detail information of product faild",
      });
    }
  },

  search: async (req, res, next) => {
    try {
      const { keyword, page, pageSize } = req.query;

      const limit = pageSize || 10;
      const skip = (page - 1) * limit || 0;

      const conditionFind = { isDeleted: false };

      const results = await Product.aggregate()
        .match({ isDeleted: false })
        .lookup({
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        })
        .lookup({
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplier",
        })
        .unwind({
          path: "$category",
          preserveNullAndEmptyArrays: true,
        })
        .unwind({
          path: "$supplier",
          preserveNullAndEmptyArrays: true,
        })
        .match({
          $or: [
            { name: { $regex: fuzzySearch(keyword) } },
            { "category.name": { $regex: fuzzySearch(keyword) } },
            { "supplier.name": { $regex: fuzzySearch(keyword) } },
          ],
        })
        .sort({
          name: 1,
        })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(conditionFind);

      if (results) {
        return res.status(200).json({
          message: "Search information of product successfully",
          total,
          count: results.length,
          payload: results,
        });
      }

      return res.status(410).json({
        message: "Search information of product not found",
      });
    } catch (err) {
      return res.status(404).json({
        message: "Search information of product failed",
        error: err,
      });
    }
  },
};
