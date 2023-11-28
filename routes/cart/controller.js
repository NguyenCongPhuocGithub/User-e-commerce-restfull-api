const { Cart, Customer, Product } = require("../../models");
const { asyncForEach } = require("../../utils");

module.exports = {
  //Cách viết getDetail cũ
  // getDetail: async (req, res, next) => {
  //   try {
  //     const customerId = req.user._id;

  //     let result = await Cart.findOne({ customerId });

  //     if (result) {
  //       return res
  //         .status(200)
  //         .json({
  //           message: "Get detail information of cart successfully",
  //           payload: result,
  //         });
  //     }

  //     return res
  //       .status(410)
  //       .json({ message: "Get detail information of cart not found" });
  //   } catch (err) {
  //     res.status(404).json({
  //       message: "Get detail information of cart failed",
  //       payload: err,
  //     });
  //   }
  // },

  // getDetail: async (req, res, next) => {
  //   try {
  //     const customerId = req.user._id;

  //     const cart = await Cart.findOne({ customerId});

  //     if(!cart){
  //       return res.status(404).json({
  //         message: "Cart not found",
  //       });
  //     }

  //     const products = await Product.find({isDeleted: false});
  //     console.log('««««« products »»»»»', products);

  //     let updateCart = await asyncForEach(products, async(products) => {
  //        cart.products = cart.products.filter(async(productItemCart) => {
  //         if((productItemCart.productId.toString() === products._id.toString()) && (productItemCart.price !== products.price)){
  //           const newCart = await Cart.findOneAndUpdate(
  //               {_id: productItemCart._id},
  //               {"products.price" : products.price},
  //               {new: true}
  //             )
  //             return newCart;
  //           }

  //         if((productItemCart.productId.toString() === products._id.toString()) && (productItemCart.price === products.price)){
  //           const newCart = await Cart.findOneAndUpdate(
  //               {_id: productItemCart._id},
  //               {"products.price" : productItemCart.price},
  //               {new: true},
  //             )
  //             return newCart;
  //           }
  //       });
  //   });

  //   console.log('««««« updateCart »»»»»', updateCart);

  //     if (updateCart) {
  //       return res
  //         .status(200)
  //         .json({
  //           message: "Get detail information of cart successfully",
  //           payload: updateCart,
  //         });
  //     }

  //     return res
  //       .status(410)
  //       .json({ message: "Get detail information of cart not found" });
  //   } catch (err) {
  //     res.status(404).json({
  //       message: "Get detail information of cart failed",
  //       payload: err,
  //     });
  //   }
  // },

  // getDetail: async (req, res, next) => {
  //   try {
  //     const customerId = req.user._id;

  //     const cart = await Cart.findOne({ customerId });

  //     if (!cart) {
  //       return res.status(404).json({
  //         message: "Cart not found",
  //       });
  //     }

  //     const products = await Product.find({ isDeleted: false });
  //     console.log('««««« products »»»»»', products);

  //     let updated = false;

  //     await asyncForEach(cart.products, async (productItemCart) => {
  //       const product = products.find((p) => p._id.toString() === productItemCart.productId.toString());

  //       if ((product && product.price !== productItemCart.price) || (product && product.dis !== productItemCart.price)){
  //         productItemCart.price = product.price;
  //         productItemCart.discount = product.discount
  //         updated = true;
  //       }
  //     });

  //     if (updated) {
  //       await cart.save();
  //     }

  //     console.log('««««« updatedCart »»»»»', cart);

  //     return res.status(200).json({
  //       message: "Get detail information of cart successfully",
  //       payload: cart,
  //     });
  //   } catch (err) {
  //     console.log('««««« error »»»»»', err);
  //     res.status(404).json({
  //       message: "Get detail information of cart failed",
  //       payload: err,
  //     });
  //   }
  // },

  //Cách viết mới có thể cập nhật tùy chọn
  getDetail: async (req, res, next) => {
    try {
      const customerId = req.user._id;

      const cart = await Cart.findOne({ customerId });

      if (!cart) {
        return res.status(404).json({
          message: "Cart not found",
        });
      }

      const products = await Product.find({ isDeleted: false }).populate("media");

      let updated = false;

      await asyncForEach(cart.products, async (productItemCart) => {
        const product = products.find(
          (product) =>
            product._id.toString() === productItemCart.productId.toString()
        );

        if (
          (product && product.price !== productItemCart.price) ||
          (product && product.discount !== productItemCart.discount) ||
          (product && product.name !== productItemCart.name) ||
          (product && product.media.coverImageUrl !== productItemCart.coverImageUrl)
        ) {
          productItemCart.price = product.price;
          productItemCart.discount = product.discount;
          productItemCart.name = product.name;
          productItemCart.coverImageUrl = product.media.coverImageUrl
          updated = true;
        }
      });

      if (updated) {
        await cart.save();
      }


      return res.status(200).json({
        message: "Get detail information of cart successfully",
        payload: cart,
      });
    } catch (err) {
      console.log("««««« error »»»»»", err);
      res.status(404).json({
        message: "Get detail information of cart failed",
        payload: err,
      });
    }
  },

  create: async function (req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const customerId = req.user._id;

      const getCustomer = Customer.findById(customerId);
      const getProduct = Product.findById(productId).populate("media");

      const [customer, foundProduct] = await Promise.all([
        // Promise.allSettled
        getCustomer,
        getProduct,
      ]);

      const errors = [];
      if (!customer || customer.isDeleted)
        errors.push("customer: does not exist");
      if (!foundProduct || foundProduct.isDeleted)
        errors.push("product: does not exist");

      if (foundProduct && quantity > foundProduct.stock)
        errors.push(`Số lượng đặt vượt mức, số lượng hiện tại có thể cung cấp là ${foundProduct.stock} sản phẩm`);

      if (errors.length > 0) {
        return res.status(404).json({
          message: "Create cart is not valid",
          errors: `${errors}`,
        });
      }

      const cart = await Cart.findOne({ customerId });

      let newProductCart = cart.products;

      const checkProductExits = newProductCart.find(
        (product) => product.productId.toString() === productId.toString()
      );

      if (!checkProductExits) {
        if (quantity > foundProduct.stock) {
          return res.status(410).json({
            message: `Product quantity is not valid be than ${foundProduct.stock}`,
          });
        }

        newProductCart.push({
          productId,
          quantity,
          name: foundProduct.name,
          price: foundProduct.price,
          discount: foundProduct.discount,
          coverImageUrl: foundProduct.media.coverImageUrl,
          weight: foundProduct.weight,
          length: foundProduct.length,
          width: foundProduct.width,
          height: foundProduct.height,
        });
      } else {
        const nextQuantity = quantity + checkProductExits.quantity;

        if (nextQuantity > foundProduct.stock) {
          return res.status(410).json({
            message: `Product quantity is not valid be than ${foundProduct.stock}`,
          });
        }

        newProductCart = newProductCart.map((item) => {
          const product = item;
          if (productId.toString() === product.productId.toString()) {
            product.quantity = nextQuantity;
          }

          return product;
        });
      }

      const result = await Cart.findByIdAndUpdate(
        cart._id,
        {
          customerId,
          products: newProductCart,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Add product information of cart successfully",
        payload: result,
      });
    } catch (err) {
      return res.status(404).json({
        message: "Add product information of cart failed",
        error: err,
      });
    }
  },

  remove: async function (req, res, next) {
    try {
      const { productId } = req.body;
      const customerId = req.user._id;

      let cart = await Cart.findOne({ customerId });

      if (!cart) {
        return res.status(404).json({
          code: 404,
          message: "cart: does not exist",
        });
      }

      // Loại bỏ sản phẩm khớp với một productId được gửi từ front end
      const results = await Cart.findOneAndUpdate(
        { _id: cart._id },
        {
          customerId,
          products: cart.products.filter(
            (item) => item.productId.toString() != productId.toString()
          ),
        },
        { new: true }
      );

      return res.status(200).json({
        code: 200,
        message: "Delete information of cart successfully",
        payload: results,
      });
    } catch (err) {
      return res
        .status(404)
        .json({ message: "Delete information of cart failed", error: err });
    }
  },

  update: async function (req, res, next) {
    try {
      const { products } = req.body;
      const customerId = req.user._id;

      let cart = await Cart.findOne({ customerId });

      if (!cart) {
        return res.status(404).json({
          code: 404,
          message: "Cart does not exist",
        });
      }

      const updatedProducts = cart.products.map((item) => {
        const productItem = products.find(
          (product) =>
            product.productId.toString() === item.productId.toString()
        );
        if (productItem) {
          //Sử dụng item.quantity mới được
          item.quantity = productItem.quantity;
        }
        return item;
      });

      const results = await Cart.findOneAndUpdate(
        { _id: cart._id },
        {
          customerId,
          products: updatedProducts,
        },
        { new: true }
      );

      return res.status(200).json({
        code: 200,
        message: "Update information of cart successfully",
        payload: results,
      });
    } catch (error) {
      return res
        .status(404)
        .json({ message: "Update information of cart failed", error: error });
    }
  },
};
