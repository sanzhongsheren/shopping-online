require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

(async () => {
    const users = [
        { username: 'admin', password: 'admin123' },
        { username: 'seller001', password: 'seller123' },
        { username: 'seller002', password: 'seller123' },
        { username: 'seller003', password: 'seller123' },
        { username: 'buyer001', password: 'buyer123' },
        { username: 'buyer002', password: 'buyer123' },
        { username: 'buyer003', password: 'buyer123' }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        await db.query('UPDATE users SET password = ? WHERE username = ?', [hash, user.username]);
        console.log(`${user.username} 密码已更新`);
    }

    console.log('所有测试账号密码已修复为文档中的明文');
    process.exit();
})();