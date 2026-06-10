module.exports = {
    success(res, data = null, message = "success", code = 200) {
      return res.status(code).json({ code, message, data });
    },
    error(res, message = "服务器内部错误", code = 500) {
      return res.status(code).json({ code, message });
    },
    notFound(res, message = "资源不存在") {
      return res.status(404).json({ code: 404, message });
    },
    badRequest(res, message = "请求参数错误") {
      return res.status(400).json({ code: 400, message });
    }
  };