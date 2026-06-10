/**
 * 商品网上交易系统 - API 接口层
 * 封装所有后端接口调用，统一处理响应格式解包
 */

const API = {
  // 后端接口基础地址
  BASE_URL: '/api',

  // 当前登录用户 Token
  _token: null,

  /**
   * 初始化（从 localStorage 恢复 Token）
   */
  init() {
    this._token = Utils.getStorage('token');
  },

  /**
   * 获取请求头
   */
  _headers(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (this._token) {
      headers['Authorization'] = 'Bearer ' + this._token;
    }
    return headers;
  },

  /**
   * 通用请求方法
   */
  async _request(method, url, data = null) {
    const opts = { method, headers: this._headers() };
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      opts.body = JSON.stringify(data);
    }

    try {
      const res = await fetch(this.BASE_URL + url, opts);
      const json = await res.json();

      if (!res.ok) {
        const err = new Error(json.message || '请求失败');
        err.code = res.status;
        err.data = json;
        throw err;
      }
      return json;
    } catch (err) {
      if (err.code) throw err;
      throw new Error('网络错误，请检查网络连接');
    }
  },

  /** GET 请求 */
  get(url) { return this._request('GET', url); },

  /** POST 请求 */
  post(url, data) { return this._request('POST', url, data); },

  /** PUT 请求 */
  put(url, data) { return this._request('PUT', url, data); },

  /** DELETE 请求 */
  del(url) { return this._request('DELETE', url); },

  // ==================== 用户模块 ====================

  /** 用户注册 */
  async register(data) {
    const res = await this.post('/users/register', data);
    return res.data || { userId: null };
  },

  /** 用户登录，自动保存 token 和用户信息 */
  async login(data) {
    const res = await this.post('/users/login', data);
    if (res.data && res.data.token) {
      this._token = res.data.token;
      Utils.setStorage('token', res.data.token);
      if (res.data.user) Utils.setStorage('user', JSON.stringify(res.data.user));
    }
    return res.data || res;
  },

  /** 退出登录 */
  logout() {
    this._token = null;
    Utils.removeStorage('token');
    Utils.removeStorage('user');
  },

  /** 获取当前用户信息 */
  async getProfile() {
    const res = await this.get('/users/profile');
    return (res.data && res.data.user) || res.data || null;
  },

  /** 更新用户信息 */
  async updateProfile(data) {
    const res = await this.put('/users/profile', data);
    return res.data;
  },

  /** 获取用户地址列表 */
  async getAddresses() {
    const res = await this.get('/users/addresses');
    return (res.data && res.data.addresses) || [];
  },

  /** 添加地址 */
  async addAddress(data) {
    const res = await this.post('/users/addresses', data);
    return res.data;
  },

  /** 更新地址 */
  async updateAddress(id, data) {
    const res = await this.put('/users/addresses/' + id, data);
    return res.data;
  },

  /** 删除地址 */
  async deleteAddress(id) {
    const res = await this.del('/users/addresses/' + id);
    return res.data;
  },

  // ==================== 商品模块 ====================

  /** 获取商品列表 */
  async getProducts(params = {}) {
    const q = new URLSearchParams();
    const map = { page_size: 'pageSize', category_id: 'categoryId' };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        q.append(map[k] || k, v);
      }
    }
    const qs = q.toString();
    const res = await this.get('/products' + (qs ? '?' + qs : ''));
    if (res.data) {
      const list = res.data.list || [];
      list._pagination = res.data.pagination || null;
      return list;
    }
    return [];
  },

  /** 获取商品详情 */
  async getProduct(id) {
    const res = await this.get('/products/' + id);
    return (res.data && res.data.product) || res.data || null;
  },

  /** 获取分类列表 */
  async getCategories() {
    const res = await this.get('/products/categories');
    return (res.data && res.data.categories) || [];
  },

  /** 添加商品（卖家） */
  async addProduct(data) {
    const res = await this.post('/products', data);
    return res.data;
  },

  /** 更新商品 */
  async updateProduct(id, data) {
    const res = await this.put('/products/' + id, data);
    return res.data;
  },

  /** 删除商品 */
  async deleteProduct(id) {
    const res = await this.del('/products/' + id);
    return res.data;
  },

  // ==================== 购物车模块 ====================

  /** 获取购物车 */
  async getCart() {
    const res = await this.get('/cart');
    return (res.data && res.data.items) || [];
  },

  /** 添加到购物车 */
  async addToCart(data) {
    const res = await this.post('/cart', data);
    return res.data;
  },

  /** 更新购物车数量 */
  async updateCartItem(id, data) {
    const res = await this.put('/cart/' + id, data);
    return res.data;
  },

  /** 删除购物车项 */
  async removeCartItem(id) {
    const res = await this.del('/cart/' + id);
    return res.data;
  },

  /** 清空购物车 */
  async clearCart() {
    const res = await this.del('/cart');
    return res.data;
  },

  // ==================== 订单模块 ====================

  /** 创建订单 */
  async createOrder(data) {
    const res = await this.post('/orders', data);
    return res.data;
  },

  /** 获取买家订单列表 */
  async getMyOrders() {
    const res = await this.get('/orders/my');
    return (res.data && res.data.orders) || [];
  },

  /** 获取卖家订单列表 */
  async getSellerOrders() {
    const res = await this.get('/orders/seller');
    return (res.data && res.data.orders) || [];
  },

  /** 获取订单详情 */
  async getOrder(id) {
    const res = await this.get('/orders/' + id);
    return (res.data && res.data.order) || res.data || null;
  },

  /** 支付订单（买家） */
  async payOrder(id) {
    const res = await this.put('/orders/' + id + '/pay');
    return res.data;
  },

  /** 发货（卖家） */
  async shipOrder(id) {
    const res = await this.put('/orders/' + id + '/ship');
    return res.data;
  },

  /** 确认收货（买家） */
  async receiveOrder(id) {
    const res = await this.put('/orders/' + id + '/receive');
    return res.data;
  },

  /** 取消订单 */
  async cancelOrder(id, reason) {
    const res = await this.put('/orders/' + id + '/cancel', { reason });
    return res.data;
  },

  // ==================== 审核模块 ====================

  /** 获取待审核列表（管理员） */
  async getPendingAudits() {
    const res = await this.get('/audit/pending');
    return (res.data && res.data.list) || [];
  },

  /** 提交审核 */
  async submitAudit(data) {
    const res = await this.post('/audit/submit', data);
    return res.data;
  },

  /** 处理审核（管理员）：data = { auditId, status, rejectReason } */
  async processAudit(data) {
    const res = await this.put('/audit/process', data);
    return res.data;
  },

  // ==================== 留言模块 ====================

  /** 获取留言（公开：商品留言；登录后可查看自己的留言） */
  async getMessages(params = {}) {
    const q = new URLSearchParams();
    const map = { target_type: 'target_type', target_id: 'target_id' };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        q.append(map[k] || k, v);
      }
    }
    const qs = q.toString();
    const res = await this.get('/messages' + (qs ? '?' + qs : ''));
    return (res.data && res.data.messages) || [];
  },

  /** 发送留言（需要登录） */
  async sendMessage(data) {
    const res = await this.post('/messages', data);
    return res.data;
  },

  /** 删除留言 */
  async deleteMessage(id) {
    const res = await this.del('/messages/' + id);
    return res.data;
  },

  // ==================== 收藏模块 ====================

  /** 获取收藏列表 */
  async getFavorites() {
    const res = await this.get('/favorites');
    return (res.data && res.data.items) || [];
  },

  /** 添加收藏 */
  async addFavorite(productId) {
    const res = await this.post('/favorites', { productId });
    return res.data;
  },

  /** 取消收藏 */
  async removeFavorite(productId) {
    const res = await this.del('/favorites/' + productId);
    return res.data;
  },

  /** 检查是否已收藏 */
  async checkFavorite(productId) {
    const res = await this.get('/favorites/check/' + productId);
    return (res.data && res.data.favorited) || false;
  },
};

// 初始化
API.init();
