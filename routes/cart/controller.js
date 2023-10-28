const { Cart, Customer, Product } = require('../../models');
const { asyncForEach } = require('../../utils');

module.exports = {
  getDetail: async (req, res, next) => {
    try {
      const customerId = req.user._id;

      let result = await Cart.findOne({ customerId });

      if (result) {
        return res.status(200).json({ message: "Get detail information of cart successfully", payload: result });
      }

      return res.status(410).json({ message: 'Get detail information of cart not found' });
    } catch (err) {
      res.status(404).json({
        message: 'Get detail information of cart failed',
        payload: err,
      });
    }
  },

  create: async function (req, res, next) {
    try {

      const { productId, quantity } = req.body;
      const customerId = req.user._id;

      const getCustomer = Customer.findById(customerId);
      const getProduct = Product.findById(productId);

      const [customer, foundProduct] = await Promise.all([ // Promise.allSettled
        getCustomer,
        getProduct,
      ]);

      const errors = [];
      if (!customer || customer.isDeleted)
        errors.push('customer: does not exist');
      if (!foundProduct || foundProduct.isDeleted)
        errors.push('product: does not exist');

      if (foundProduct && quantity > foundProduct.stock)
        errors.push('quality: cannot be than stock product');

      if (errors.length > 0) {
        return res.status(404).json({
          message: 'Create cart is not valid',
          errors: `${errors}`,
        });
      }

      const cart = await Cart.findOne({ customerId })

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
        message: 'Add product information of cart successfully',
        payload: result,
      });
    } catch (err) {
      return res.status(404).json({ message: "Add product information of cart failed", error: err });
    }
  },

  // remove: async function (req, res, next) {
  //   try {
  //     const { productId } = req.body;
  //     const customerId = req.user._id;

  //     let cart = await Cart.findOne({ customerId });

  //     if (!cart) {
  //       return res.status(404).json({
  //         code: 404,
  //         message: 'cart: does not exist',
  //       });
  //     }

  //     //Loại bỏ sản phẩm khớp với một productId được gửi từ front end
  //     await Cart.findOneAndUpdate(cart._id, {
  //       customerId,
  //       products: cart.products.filter((item) => item.productId !== productId),
  //     });

  //     return res.send({
  //       code: 200,
  //       message: 'Delete information of cart successfully',
  //     });
  //   } catch (err) {
  //     return res.status(404).json({ message: "Delete information of cart failed", error: err });
  //   }
  // },
};
