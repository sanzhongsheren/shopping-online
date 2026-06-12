const Address = require("../models/address");
const { success, error, badRequest } = require("../utils/response");

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.getAddressesByUserId(req.user.userId);
    success(res, { addresses }, "地址列表获取成功");
  } catch (err) {
    console.error("获取地址失败:", err);
    error(res, "获取地址失败");
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { receiverName, receiver_name, phone, province, city, district, detailAddress, detail_address, isDefault, is_default } = req.body;
    const data = {
      receiverName: receiverName || receiver_name,
      phone,
      province,
      city,
      district,
      detailAddress: detailAddress || detail_address,
      isDefault: isDefault || is_default || false
    };
    if (!data.receiverName || !data.phone || !data.province || !data.city || !data.detailAddress) {
      return badRequest(res, "请完整填写地址信息");
    }
    const addressId = await Address.createAddress({ userId: req.user.userId, ...data });
    success(res, { addressId }, "地址添加成功");
  } catch (err) {
    console.error("添加地址失败:", err);
    error(res, "添加地址失败");
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const { receiverName, phone, province, city, district, detailAddress, isDefault } = req.body;
    const affected = await Address.updateAddress(addressId, req.user.userId, {
      receiverName, phone, province, city, district, detailAddress, isDefault
    });
    if (affected === 0) return badRequest(res, "地址不存在或无权修改");
    success(res, null, "地址更新成功");
  } catch (err) {
    console.error("更新地址失败:", err);
    error(res, "更新地址失败");
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const affected = await Address.deleteAddress(addressId, req.user.userId);
    if (affected === 0) return badRequest(res, "地址不存在或无权删除");
    success(res, null, "地址已删除");
  } catch (err) {
    console.error("删除地址失败:", err);
    error(res, "删除地址失败");
  }
};
