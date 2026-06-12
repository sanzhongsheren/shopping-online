const Cart = require("../models/cart");
const { success, error, badRequest } = require("../utils/response");

exports.getCart = async (req, res) => {
  try {
    const items = await Cart.getCartByUserId(req.user.userId);
    success(res, { items }, "购物车列表获取成功");
  } catch (err) {
    console.error("获取购物车失败:", err);
    error(res, "获取购物车失败");
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return badRequest(res, "缺少商品ID或数量");
    }
    await Cart.addToCart(req.user.userId, productId, quantity || 1);
    success(res, null, "已加入购物车");
  } catch (err) {
    console.error("加入购物车失败:", err);
    error(res, "加入购物车失败");
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return badRequest(res, "数量不能少于1");
    const affected = await Cart.updateCartItem(cartId, req.user.userId, quantity);
    if (affected === 0) return badRequest(res, "购物车项不存在");
    success(res, null, "更新成功");
  } catch (err) {
    console.error("更新购物车失败:", err);
    error(res, "更新购物车失败");
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    const affected = await Cart.removeCartItem(cartId, req.user.userId);
    if (affected === 0) return badRequest(res, "购物车项不存在");
    success(res, null, "已删除");
  } catch (err) {
    console.error("删除购物车项失败:", err);
    error(res, "删除购物车项失败");
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.user.userId);
    success(res, null, "购物车已清空");
  } catch (err) {
    console.error("清空购物车失败:", err);
    error(res, "清空购物车失败");
  }
};
