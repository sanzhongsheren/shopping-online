const Product = require("../models/product");
const { success, error, badRequest, notFound } = require("../utils/response");
const Audit = require("../models/audit");

/**
 * 获取商品列表（公开）
 */
exports.getProductList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
    const keyword = req.query.keyword || undefined;

    const result = await Product.getProductList({ page, pageSize, categoryId, keyword });
    success(res, result, "商品列表获取成功");
  } catch (err) {
    console.error("商品列表查询错误:", err);
    error(res, "获取商品列表失败");
  }
};

/**
 * 获取商品详情（公开）
 */
exports.getProductDetail = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return badRequest(res, "无效的商品ID");

    const product = await Product.getProductById(productId);
    if (!product) return notFound(res, "商品不存在");

    success(res, { product }, "商品详情获取成功");
  } catch (err) {
    console.error("商品详情查询错误:", err);
    error(res, "获取商品详情失败");
  }
};

/**
 * 创建商品（卖家）
 */
exports.createProduct = async (req, res) => {
  try {
    const { categoryId, productName, description, price, stock, imageUrl } = req.body;
    if (!categoryId || !productName || price === undefined || stock === undefined) {
      return badRequest(res, "分类、商品名称、价格、库存为必填项");
    }

    const productId = await Product.createProduct({
      sellerId: req.user.userId,
      categoryId,
      productName,
      description,
      price,
      stock,
      imageUrl
    });
    // 自动提交商品发布审核
    await Audit.createAudit('product_publish', 'product', productId, req.user.userId);

    success(res, { productId }, "商品创建成功，等待审核");
  } catch (err) {
    console.error("创建商品失败:", err);
    error(res, "创建商品失败");
  }
};

/**
 * 更新商品（卖家只能修改自己的）
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return badRequest(res, "无效的商品ID");

    const { productName, description, price, stock, categoryId, imageUrl } = req.body;
    if (!productName || price === undefined || stock === undefined) {
      return badRequest(res, "商品名称、价格、库存不能为空");
    }

    const affected = await Product.updateProduct(productId, req.user.userId, {
      productName, description, price, stock, categoryId, imageUrl
    });
    if (affected === 0) return badRequest(res, "商品不存在或无权修改");

    success(res, null, "商品更新成功");
  } catch (err) {
    console.error("更新商品失败:", err);
    error(res, "更新商品失败");
  }
};

/**
 * 下架商品（卖家）
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return badRequest(res, "无效的商品ID");

    const affected = await Product.deleteProduct(productId, req.user.userId);
    if (affected === 0) return badRequest(res, "商品不存在或无权操作");

    success(res, null, "商品已下架");
  } catch (err) {
    console.error("下架商品失败:", err);
    error(res, "下架商品失败");
  }
};

/**
 * 管理员审核商品
 */
exports.approveProduct = async (req, res) => {
  try {
    const { productId, status } = req.body;   // status: 'approved' 或 'rejected'
    if (!productId || !status) {
      return badRequest(res, "缺少商品ID或审核状态");
    }
    const allowed = ["approved", "rejected"];
    if (!allowed.includes(status)) {
      return badRequest(res, "审核状态只能为 approved 或 rejected");
    }

    await Product.approveProduct(productId, status);
    success(res, null, `商品审核${status === 'approved' ? '通过' : '驳回'}`);
  } catch (err) {
    console.error("商品审核失败:", err);
    error(res, "商品审核失败");
  }
};