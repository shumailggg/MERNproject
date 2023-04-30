const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorhandler.js");
const Product = require("../models/productModel.js");

//Create New Order
const newOrder = async (req, res, next) => {
  try {
    // console.log(req.body);
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

//Get Single Order
const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order Not Found With This Id", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

//Get Logedin User Orders
const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

//Get All Orders ---Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// update order Status --Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order Not Found With this ID", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You Already Delivered this order", 404));
    }
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (order) => {
        await updateStock(order.product, order.quantity);
      });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ ValidateBeforeSavwew: false });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//Updating Stock Function
const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  // console.log("Working")
  product.Stock -= quantity;
  product.save({ validateBeforeSave: false });
};

//delete Order ---Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order Not Found With this ID", 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order Deleted SuccessFully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
