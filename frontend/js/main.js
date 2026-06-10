/**
 * 商品网上交易系统 - 主交互逻辑
 * 页面通用功能：导航栏加载、用户状态管理、登录检查等
 */

const App = {
  /** 当前登录用户 */
  user: null,

  /** 是否已登录 */
  get isLoggedIn() { return !!this.user; },

  /** 用户角色判断 */
  get isBuyer() { return this.user && this.user.role === 'buyer'; },
  get isSeller() { return this.user && this.user.role === 'seller'; },
  get isAdmin() { return this.user && this.user.role === 'admin'; },

  /** 页面映射 */
  pages: {
    home: '/index.html',
    login: '/pages/login.html',
    'product-list': '/pages/product-list.html',
    'product-detail': '/pages/product-detail.html',
    cart: '/pages/cart.html',
    checkout: '/pages/checkout.html',
    order: '/pages/order.html',
    profile: '/pages/user-profile.html',
    messages: '/pages/messages.html',
    audit: '/pages/audit.html',
  },

  /**
   * 初始化
   */
  init() {
    this.loadUser();
    this.renderHeader();
    this.renderFooter();
    this.updateCartBadge();
    this.bindGlobalEvents();
  },

  /**
   * 从 localStorage 加载用户
   */
  loadUser() {
    try {
      const data = Utils.getStorage('user');
      this.user = data ? JSON.parse(data) : null;
    } catch {
      this.user = null;
    }
  },

  /**
   * 检查登录状态，未登录跳转
   */
  requireLogin() {
    if (!this.isLoggedIn) {
      const current = window.location.pathname;
      const msg = encodeURIComponent('请先登录');
      window.location.href = this.pages.login + '?redirect=' + encodeURIComponent(current) + '&msg=' + msg;
      return false;
    }
    return true;
  },

  /**
   * 渲染顶部导航
   */
  renderHeader() {
    const header = document.getElementById('app-header');
    if (!header) return;

    const userHtml = this.isLoggedIn
      ? '<li class="nav-item dropdown">' +
          '<a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">' +
            '<i class="fas fa-user-circle"></i> ' + this.user.username +
          '</a>' +
          '<ul class="dropdown-menu dropdown-menu-end">' +
            '<li><a class="dropdown-item" href="' + this.pages.profile + '"><i class="fas fa-user-cog me-2"></i>个人中心</a></li>' +
            (this.isBuyer ? '<li><a class="dropdown-item" href="' + this.pages.order + '"><i class="fas fa-receipt me-2"></i>我的订单</a></li>' : '') +
            (this.isSeller ? '<li><a class="dropdown-item" href="' + this.pages.order + '"><i class="fas fa-receipt me-2"></i>订单管理</a></li><li><a class="dropdown-item" href="' + this.pages.profile + '?tab=products"><i class="fas fa-box me-2"></i>商品管理</a></li>' : '') +
            (this.isAdmin ? '<li><a class="dropdown-item" href="' + this.pages.audit + '"><i class="fas fa-check-double me-2"></i>审核管理</a></li><li><a class="dropdown-item" href="' + this.pages.order + '"><i class="fas fa-receipt me-2"></i>订单管理</a></li>' : '') +
            '<li><hr class="dropdown-divider"></li>' +
            '<li><a class="dropdown-item" href="#" id="btn-logout"><i class="fas fa-sign-out-alt me-2"></i>退出登录</a></li>' +
          '</ul>' +
        '</li>'
      : '<li class="nav-item"><a class="nav-link" href="' + this.pages.login + '"><i class="fas fa-sign-in-alt"></i> 登录</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + this.pages.login + '?tab=register"><i class="fas fa-user-plus"></i> 注册</a></li>';

    header.innerHTML =
      '<nav class="navbar navbar-expand-lg">' +
        '<div class="container">' +
          '<a class="navbar-brand logo" href="' + this.pages.home + '">商品<span>交易系统</span></a>' +
          '<div class="search-box d-none d-md-flex">' +
            '<div class="input-group">' +
              '<input type="text" class="form-control" id="global-search-input" placeholder="搜索商品..." />' +
              '<button class="btn btn-search" id="global-search-btn"><i class="fas fa-search"></i></button>' +
            '</div>' +
          '</div>' +
          '<div class="header-icons d-flex align-items-center">' +
            '<ul class="navbar-nav ms-auto flex-row align-items-center">' +
              '<li class="nav-item position-relative">' +
                '<a class="nav-link" href="' + (this.isLoggedIn ? this.pages.cart : this.pages.login) + '">' +
                  '<i class="fas fa-shopping-cart"></i> 购物车' +
                  '<span class="cart-badge badge rounded-pill bg-danger" id="cart-count" style="display:none;">0</span>' +
                '</a>' +
              '</li>' +
              userHtml +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</nav>';
  },

  /**
   * 渲染页脚
   */
  renderFooter() {
    const footer = document.getElementById('app-footer');
    if (!footer) return;
    footer.innerHTML =
      '<div class="container">' +
        '<p class="mb-0">&copy; 2026 商品网上交易系统 - 软件工程项目</p>' +
      '</div>';
  },

  /**
   * 更新购物车角标
   */
  async updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    if (!this.isLoggedIn) { badge.style.display = 'none'; return; }
    try {
      const items = await API.getCart();
      if (items && items.length > 0) {
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    } catch {
      badge.style.display = 'none';
    }
  },

  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 退出登录
    document.addEventListener('click', function(e) {
      var target = e.target.closest('#btn-logout');
      if (target) {
        e.preventDefault();
        API.logout();
        Utils.toast('已退出登录', 'info');
        setTimeout(function() { window.location.href = App.pages.home; }, 500);
      }
    });

    // 全局搜索
    document.addEventListener('click', function(e) {
      var target = e.target.closest('#global-search-btn');
      if (target) {
        var keyword = document.getElementById('global-search-input');
        if (keyword && keyword.value.trim()) {
          window.location.href = App.pages['product-list'] + '?keyword=' + encodeURIComponent(keyword.value.trim());
        }
      }
    });

    document.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        var input = e.target.closest('#global-search-input');
        if (input && input.value.trim()) {
          window.location.href = App.pages['product-list'] + '?keyword=' + encodeURIComponent(input.value.trim());
        }
      }
    });
  },

  /**
   * 页面跳转
   */
  goTo(page, params) {
    let url = this.pages[page] || page;
    if (params) {
      var qs = [];
      for (var k in params) qs.push(k + '=' + encodeURIComponent(params[k]));
      url += (url.indexOf('?') > -1 ? '&' : '?') + qs.join('&');
    }
    window.location.href = url;
  },
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
