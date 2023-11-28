const { Order, Customer, Cart, Product } = require("../../models");
const { asyncForEach } = require("../../utils");

module.exports = {
  //Build code get list theo page, pageSize, status truyền lên từ front end
  //status tìm "PLACED" || "PREPARING" || "DELIVERING" || "COMPLETED" || "REJECTED" 
  getList: async (req, res, next) => {
    try {
      const { page, pageSize, status } = req.query;
      const limit = pageSize || 10;
      const skip = (page - 1) * limit || 0;

      const customerId = req.user._id;

      let conditionFind;

      if (status) {
        conditionFind = {
          status:
            "PLACED" ||
            "PREPARING" ||
            "DELIVERING" ||
            "COMPLETED" ||
            "REJECTED",
          status: status,
          customerId: customerId,
          isOnline: true,
        };
      } else {
        conditionFind = {
          status: {
            $in: ["PLACED", "PREPARING", "DELIVERING", "COMPLETED", "REJECTED"],
          },
          customerId: customerId,
          isOnline: true,
        };
      }

      let results = await Order.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .sort({ createdDate: -1, shippedDate: -1 })
        .lean();

      const total = await Order.countDocuments(conditionFind);

      if (results)
        return res.status(200).json({
          message: "Get list information of order successfully",
          total,
          count: results.length,
          payload: results,
        });

      return res
        .status(410)
        .json({ message: "Get list information of order not found" });
    } catch (error) {
      return res
        .status(404)
        .json({ message: "Get list information of order failed", error });
    }
  },
  
  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customerId = req.user._id;

      let result = await Order.findOne({ _id: id, customerId: customerId, isOnline: true });

      if (result) {
        return res.status(200).json({
          code: 200,
          message: "Get detail information of order successfully",
          payload: result,
        });
      }

      return res
        .status(410)
        .json({ message: "Get detail information of order not found" });
    } catch (err) {
      return res.status(404).json({
        code: 404,
        message: "Get detail information of order failed",
        error: err,
      });
    }
  },

  //Build create Order online theo luồng đặt ngay một sản phẩm
  create: async (req, res, next) => {
    try {
      //Nhận từ front end paymentType, productList, totalFee
      const { paymentType, productList, totalFee } = req.body;

      const customerId = req.user._id;

      const createdDate = Date.now();

      const shippedDate = new Date(createdDate);
      
      // const totalFee = 20000;

      //Thực hiện tìm kiếm customer và kiểm tra có tồn tại hay không
      const getCustomer = Customer.findOne({
        _id: customerId,
        isDeleted: false,
      })
      .select("-password -countCancellations -isDeleted -createdAt -updatedAt");

      const [customer] = await Promise.all([getCustomer]);

      const errors = [];
      if (!customer) errors.push("customer: is note found");

      //Thực hiện kiểm trả customer phải có provinceCode, districtCode, wardCode thiếu một trong ba giá trị này không cho order
      if(!customer.provinceCode || !customer.districtCode || !customer.wardCode ) errors.push("customer address: is not found");

      //Thực hiện kiểm tra vị trí của customer có nằm trong Đà Nẵng không, có thời gian dự kiến ship trong ba ngày, ngược lại trong ship trong năm ngày
      if(customer && customer.provinceCode === 203){
        shippedDate.setDate(shippedDate.getDate() + 3);
      }else{
        shippedDate.setDate(shippedDate.getDate() + 5);
      }

      let resultsProductList = [];
      //Thực hiện kiểm tra sản phẩm có tồn tại và match với sản phẩm front end truyền lên
      await asyncForEach(productList, async (item) => {
        console.log('««««« item »»»»»', item);
        const product = await Product.findOne({
          _id: item.productId,
          isDeleted: false,
        });

        if (!product) {
          errors.push(`Product ${item.productId} is not found`);
        } else {
          //Nếu có thực hiện số lượng sản phẩm phải ít hơn số lượng tồn kho
          if (product.stock < item.quantity) {
            return errors.push(`Stock product${item.productId} is not enough`);
          }
        }

        //Sau khi kiểm tra xong sản phẩm được thực hiện loop qua và push vào array resultsProductList với mỗi sản phẩm
        return resultsProductList.push({
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          discount: product.discount,
          weight: product.weight * item.quantity,
          length: product.length * item.quantity,
          width: product.width * item.quantity,
          height: product.height * item.quantity,
        });
      });

      //Kiểm tra số lượng lỗi trước khi thực hiện tạo order mới
      if (errors.length > 0) {
        return res.status(404).json({
          message: "Create information of order is not enough",
          error: `${errors}`,
        });
      }

      console.log('««««« totalFee »»»»»', totalFee);
      //Kiểm tra không có lỗi thực hiện tạo order mới với thông tin từ front end truyền vào
      const newRecord = new Order({
        createdDate,
        shippedDate,
        paymentType,
        customerId,
        totalFee: totalFee,
        customer,
        productList: resultsProductList,
        isOnline: true,
      });

      //Thực hiện lưu giá trị newRecord vào variable results trả về payload
      let results = await newRecord.save();

      //Thực hiện kiểm tra và trừ số lượng sản phẩm trong kho
      await asyncForEach(results.productList, async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      });

      return res.status(200).json({
        message: "Create information of order successfully",
        payload: results,
      });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Create information of order failed", error: err });
    }
  },

//Build create Order online theo luồng đặt ngay một sản phẩm
//Note: luồng tương tự với đặt ngay một sản phẩm, chỉ thêm luồng đã được command ở bên dưới
  createFromCart: async (req, res, next) => {
    try {
      const { paymentType, productList, totalFee } = req.body;

      const customerId = req.user._id;

      // const totalFee = 20000;
      // console.log('««««« totalFee »»»»»', totalFee);

      const createdDate = Date.now();
      const shippedDate = new Date(createdDate);

      const getCustomer = Customer.findOne({
        _id: customerId,
        isDeleted: false,
      })
      .select("-password -countCancellations -isDeleted -createdAt -updatedAt");

      const [customer] = await Promise.all([getCustomer]);

      const errors = [];
      if (!customer) errors.push("customer: is note found");

      if(!customer.provinceCode || !customer.districtCode || !customer.wardCode ) errors.push("customer address: is not found");

      if(customer && customer.provinceCode === 203){
        // shippedDate.setDate(shippedDate.getDate() + 3);
        shippedDate.setHours(shippedDate.getHours() + 3);
      }else{
        errors.push("provinceCode: is not valid");
      }

      let resultsProductList = [];

      await asyncForEach(productList, async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          isDeleted: false,
        }).populate("media");

        if (!product) {
          errors.push(`Product ${item.productId} is not found`);
        } else {
          // Kiểm tra sản phẩm có tồn tại và số lượng trong giỏ hàng hợp lệ hay không
          //Note: Việc kiểm tra số lượng truyền lên khớp với số lượng cart không sẽ dẫn tới phải thực hiện update trước khi tạo
          const isProductInCart = await Cart.exists({
            customerId: customerId,
            "products.productId": item.productId,
            // "products.quantity": item.quantity,
          });

          if (!isProductInCart) {
            errors.push(
              `Product ${item.productId} is not in the cart or the quantity is not valid`
            );
          }

          if (product.stock < item.quantity) {
            errors.push(`Số lượng sản phẩm ${item.name} đặt vượt mức, hiện tại có thể cung cấp là ${product.stock} sản phẩm`);
          }
        }

        return resultsProductList.push({
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          discount: product.discount,
          weight: product.weight * item.quantity,
          length: product.length * item.quantity,
          width: product.width * item.quantity,
          height: product.height * item.quantity,
          imageProduct: product.media.coverImageUrl,
        });
      });

      if (errors.length > 0) {
        return res.status(404).json({
          message: "Create information of order is not enough",
          error: `${errors}`,
        });
      }

      const newRecord = new Order({
        createdDate,
        shippedDate,
        paymentType,
        customerId,
        totalFee,
        customer,
        productList: resultsProductList,
        isOnline: true,
      });

      let results = await newRecord.save();

      await asyncForEach(results.productList, async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      });

      //Thực thi xóa product đã mua trong cart
      let cart = await Cart.findOne({ customerId });

      if (!cart) {
        return res.status(404).json({
          code: 404,
          message: "cart: does not exist",
        });
      }

      // const product = await asyncForEach(results.productList, async (item) => {
      //   // Tìm và xóa sản phẩm khỏi giỏ hàng
      //   cart.products = cart.products.filter(
      //     (cartItem) => cartItem.productId !== item.productId
      //   );
      // });

      // await Cart.findOneAndUpdate(cart._id, {
      //   customerId,
      //   products: product,
      // }
      // );

      // const updateProduct = await Cart.findOneAndUpdate(cart._id, {
      //   customerId: customerId,
      //   products: results.productList.forEach((item) => {
      //     // Tìm và xóa sản phẩm khỏi giỏ hàng
      //     cart.products = cart.products.filter(
      //       (cartItem) => cartItem.productId !== item.productId
      //     );
      //   })
      // }
      // );

      // code đúng
      //   results.productList.forEach((item) => {
      //   // Tìm và xóa sản phẩm khỏi giỏ hàng
      //   cart.products = cart.products.filter(
      //     (cartItem) => cartItem.productId.toString() !== item.productId.toString()
      //   );
      // });

      // Trả về array products trong cart sau khi check và xóa
      await asyncForEach(results.productList, async (item) => {
        // Tìm và xóa sản phẩm khỏi giỏ hàng
        cart.products = cart.products.filter(
          (cartItem) =>
            cartItem.productId.toString() !== item.productId.toString()
        );
      });

      //Thực hiện lưu lại giá trị mới sản phẩm không được đặt vào cart
      await cart.save();

      return res.status(200).json({
        message: "Create information of order successfully",
        payload: results,
      });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Create information of order failed", error: err });
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const customerId = req.user._id;

      let validOrder = await Order.findOne({
        _id: id,
        customerId: customerId,
        isOnline: true,
        $nor: [
          { status: "DELIVERING" },
          { status: "COMPLETED" },
          { status: "CANCELED" },
          { status: "REJECTED" },
          { status: "FLAKER" },
        ],
      });

      if (validOrder) {
        if (validOrder.status === status) {
          return res
            .status(410)
            .json({ message: "status: Cannot be duplicated" });
        }

        const result = await Order.findByIdAndUpdate(
          validOrder._id,
          { status },
          { new: true }
        );

        await asyncForEach(result.productList, async (item) => {
          await Product.findOneAndUpdate(
            { _id: item.productId },
            { $inc: { stock: +item.quantity } }
          );
        });

        if (result) {
          return res.status(200).json({
            payload: result,
            message: "Update status information of order successfully",
          });
        }
      }
      

      return res
        .status(410)
        .json({ message: "Update status information of order not found" });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Update status information of order failed", error: err });
    }
  },
};
