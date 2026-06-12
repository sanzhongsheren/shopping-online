const Favorite = require("../models/favorite");
const { success, error, badRequest } = require("../utils/response");

exports.getFavorites = async (req, res) => {
  try {
    const items = await Favorite.getFavoritesByUserId(req.user.userId);
    success(res, { items }, "收藏列表获取成功");
  } catch (err) {
    console.error("获取收藏失败:", err);
    error(res, "获取收藏失败");
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return badRequest(res, "缺少商品ID");
    await Favorite.addFavorite(req.user.userId, productId);
    success(res, null, "收藏成功");
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return success(res, null, "已收藏");
    }
    console.error("收藏失败:", err);
    error(res, "收藏失败");
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    await Favorite.removeFavorite(req.user.userId, productId);
    success(res, null, "已取消收藏");
  } catch (err) {
    console.error("取消收藏失败:", err);
    error(res, "取消收藏失败");
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const favorited = await Favorite.checkFavorite(req.user.userId, productId);
    success(res, { favorited }, "查询成功");
  } catch (err) {
    console.error("查询收藏失败:", err);
    error(res, "查询收藏失败");
  }
};
