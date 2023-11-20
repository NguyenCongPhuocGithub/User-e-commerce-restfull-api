const { Product } = require("../../models");

module.exports = {
  //Thực hiện filter product theo các variabel truyền lên từ front end.
  filterProduct: async (req, res, next) => {
    try {
      const {
        discountStart,
        discountEnd,
        priceStart,
        priceEnd,
        page,
        pageSize,
        categoryId,
        supplierId,
        rateStar,
        upPrice,
        downPrice,
      } = req.query;

      const limit = pageSize || 10;
      const skip = (page - 1) * limit || 0;

      const conditionFind = { isDeleted: false };

      if (categoryId) {
        conditionFind.categoryId = categoryId;
      }

      if (supplierId) {
        conditionFind.supplierId = supplierId;
      }

      if (rateStar) {
        conditionFind.rateStar = rateStar;
      }

      if (priceStart && priceEnd) {
        const comparePriceStart = { $lte: ["$price", priceEnd] };
        const comparePriceEnd = { $gte: ["$price", priceStart] };
        conditionFind.$expr = { $and: [comparePriceStart, comparePriceEnd] };
      } else if (priceStart) {
        conditionFind.price = { $gte: parseFloat(priceStart) };
      } else if (priceEnd) {
        conditionFind.price = { $lte: parseFloat(priceEnd) };
      }

      if (discountStart && discountEnd) {
        const compareDiscountStart = { $lte: ["$discount", discountEnd] };
        const compareDiscountEnd = { $gte: ["$discount", discountStart] };
        conditionFind.$expr = {
          $and: [compareDiscountStart, compareDiscountEnd],
        };
      } else if (discountStart) {
        conditionFind.discount = { $gte: parseFloat(discountStart) };
      } else if (discountEnd) {
        conditionFind.discount = { $lte: parseFloat(discountEnd) };
      }

      let arrange = {};

        if (upPrice && !downPrice) {
          arrange.price = 1;
        }
        if (downPrice && !upPrice) {
          arrange.price = -1;
        }

      const results = await Product.find(conditionFind)
        .populate("category")
        .populate("supplier")
        .populate("media")
        .skip(skip)
        .limit(limit)
        .sort(arrange);

      const total = await Product.countDocuments(conditionFind);

      if (results) {
        return res.status(200).json({
          message: "Filter information of product successfully",
          total,
          count: results.length,
          payload: results,
        });
      }

      return res.status(410).json({
        message: "Filter information of product not found",
      });
    } catch (err) {
      return res.status(404).json({
        message: "Filter information of product failed",
        error: err,
      });
    }
  },
};
