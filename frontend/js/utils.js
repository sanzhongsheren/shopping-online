/**
 * 商品网上交易系统 - 工具函数模块
 */

const Utils = {
  /**
   * 格式化价格
   */
  formatPrice(price) {
    return '¥' + parseFloat(price).toFixed(2);
  },

  /**
   * 格式化日期
   */
  formatDate(dateStr, fmt) {
    if (!dateStr) return '-';
    fmt = fmt || 'YYYY-MM-DD HH:mm:ss';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    const map = {
      'YYYY': d.getFullYear(),
      'MM': pad(d.getMonth() + 1),
      'DD': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds()),
    };
    let result = fmt;
    for (const [key, val] of Object.entries(map)) {
      result = result.replace(key, val);
    }
    return result;
  },

  /**
   * 状态文本映射
   */
  statusText: {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    active: '已激活',
    disabled: '已禁用',
    onsale: '在售',
    offsale: '下架',
    deleted: '已删除',
    pending_payment: '待付款',
    paid: '已付款',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
    user_register: '用户注册审核',
    product_publish: '商品发布审核',
    product_edit: '商品编辑审核',
    user: '用户',
    product: '商品',
    normal: '正常',
    hidden: '隐藏',
  },

  /**
   * 获取状态标签HTML
   */
  statusBadge(status) {
    const text = this.statusText[status] || status;
    return '<span class="status-badge status-' + status + '">' + text + '</span>';
  },

  /**
   * 获取用户角色标签
   */
  roleBadge(role) {
    const map = { buyer: '买家', seller: '卖家', admin: '管理员' };
    const colorMap = { buyer: 'primary', seller: 'success', admin: 'warning' };
    return '<span class="badge bg-' + colorMap[role] + '">' + (map[role] || role) + '</span>';
  },

  /**
   * 验证手机号
   */
  validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  /**
   * 验证邮箱
   */
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * 表单验证（通用）
   */
  validateForm(rules) {
    const errors = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = fieldRules.value ? fieldRules.value.trim() : '';
      if (fieldRules.required && !value) {
        errors[field] = fieldRules.label + '不能为空';
        continue;
      }
      if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || fieldRules.label + '格式不正确';
      }
      if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = fieldRules.label + '不能少于' + fieldRules.minLength + '个字符';
      }
      if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = fieldRules.label + '不能超过' + fieldRules.maxLength + '个字符';
      }
    }
    return Object.keys(errors).length > 0 ? errors : null;
  },

  /**
   * 显示表单错误
   */
  showFormErrors(errors) {
    document.querySelectorAll('.is-invalid').forEach(function(el) { el.classList.remove('is-invalid'); });
    document.querySelectorAll('.invalid-feedback').forEach(function(el) { el.remove(); });
    if (!errors) return;
    for (const [field, msg] of Object.entries(errors)) {
      const input = document.getElementById(field) || document.querySelector('[name="' + field + '"]');
      if (input) {
        input.classList.add('is-invalid');
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = msg;
        input.parentNode.appendChild(feedback);
      }
    }
  },

  /**
   * 获取URL查询参数
   */
  getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  },

  /**
   * 安全获取 localStorage
   */
  getStorage(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },

  setStorage(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },

  removeStorage(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },

  /**
   * Toast 通知
   */
  toast(message, type, duration) {
    type = type || 'success';
    duration = duration || 3000;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const bgColors = { success: '#47b847', error: '#e4393c', warning: '#faad14', info: '#1890ff' };

    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.cssText =
      'background:' + (bgColors[type] || bgColors.info) + ';' +
      'color:#fff;border-radius:8px;padding:12px 20px;margin-bottom:8px;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;' +
      'animation:slideIn 0.3s ease;min-width:280px;';
    toast.innerHTML =
      '<i class="fas ' + (icons[type] || icons.info) + '" style="margin-right:10px;font-size:16px;"></i>' +
      '<span style="flex:1;">' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  },
};

// 注入 toast 动画样式
(function() {
  var style = document.createElement('style');
  style.textContent =
    '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
  document.head.appendChild(style);
})();
