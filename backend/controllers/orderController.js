const Order = require("../models/order");
const { success, error, badRequest, notFound } = require("../utils/response");

// 创建订单（买家）
exports.createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, items } = req.body;
    // items: [{ productId, quantity }]
    if (!addressId || !items || items.length === 0) {
      return badRequest(res, "请选择地址和至少一件商品");
    }
    const result = await Order.createOrder(req.user.userId, addressId, paymentMethod, items);
    success(res, result, "订单创建成功");
  } catch (err) {
    console.error("创建订单失败:", err);
    error(res, err.message || "创建订单失败");
  }
};

// 买家查看自己的订单
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.getOrdersByBuyer(req.user.userId);
    success(res, { orders }, "订单列表获取成功");
  } catch (err) {
    console.error("获取订单列表失败:", err);
    error(res, "获取订单列表失败");
  }
};

// 卖家查看与自己商品相关的订单
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.getOrdersBySeller(req.user.userId);
    success(res, { orders }, "获取卖家订单列表成功");
  } catch (err) {
    console.error("获取卖家订单列表失败:", err);
    error(res, "获取卖家订单列表失败");
  }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await Order.getOrderById(orderId);
    if (!order) {
      return notFound(res, "订单不存在");
    }
    // 权限校验：只能查看自己的订单或卖家相关订单（简化版，前端可做限制，这里暂时不强制）
    success(res, { order }, "订单详情获取成功");
  } catch (err) {
    console.error("获取订单详情失败:", err);
    error(res, "获取订单详情失败");
  }
};

exports.payOrder = async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const affected = await Order.payOrder(orderId, req.user.userId);
      if (affected === 0) return badRequest(res, "订单不存在或状态不允许支付");
      success(res, null, "支付成功");
    } catch (err) {
      error(res, err.message || "支付失败");
    }
  };
  
  exports.shipOrder = async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const affected = await Order.shipOrder(orderId, req.user.userId);
      if (affected === 0) return badRequest(res, "订单不存在、未支付或非该卖家的商品");
      success(res, null, "发货成功");
    } catch (err) {
      error(res, err.message || "发货失败");
    }
  };
  
  exports.confirmReceive = async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const affected = await Order.confirmReceive(orderId, req.user.userId);
      if (affected === 0) return badRequest(res, "订单不存在或未发货");
      success(res, null, "确认收货成功");
    } catch (err) {
      error(res, err.message || "收货失败");
    }
  };
  
  exports.cancelOrder = async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { reason } = req.body;
      await Order.cancelOrder(orderId, req.user.userId, reason);
      success(res, null, "订单已取消，库存已恢复");
    } catch (err) {
      error(res, err.message || "取消订单失败");
    }
  };