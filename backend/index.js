const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// MySQL 连接
const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'your_password', // 替换为你自己的密码
  database: 'device_maintenance'
});

db.connect(err => {
  if (err) console.error('数据库连接失败:', err);
  else console.log('成功连接到 MySQL');
});

// 初始化表
db.query(`
  CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_type VARCHAR(100),
    device_name VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    resource_pool VARCHAR(100),
    room_name VARCHAR(100),
    maintainer VARCHAR(100),
    maintainer_contact VARCHAR(100),
    warranty_expiry DATE,
    project VARCHAR(100),
    remark TEXT
  )
`);

// 获取设备列表
app.get('/api/devices', (req, res) => {
  db.query('SELECT * FROM devices', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 添加或更新设备
app.post('/api/devices', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO devices (...) VALUES (...)
    ON DUPLICATE KEY UPDATE ...
  `;
  // 为简洁省略展开，实际为所有字段如 device_type 等
  db.query(sql, [...], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// 导入 Excel
const upload = multer({ dest: 'uploads/' });
app.post('/api/import', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const sql = `
    INSERT INTO devices (...) VALUES (...)
    ON DUPLICATE KEY UPDATE ...
  `;

  data.forEach(row => {
    db.query(sql, [...]);
  });

  res.json({ success: true });
});

// 导出 Excel
app.get('/api/export', (req, res) => {
  db.query('SELECT * FROM devices', (err, results) => {
    if (err) return res.status(500).send(err);

    const worksheet = xlsx.utils.json_to_sheet(results);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Devices');

    const exportPath = path.join(__dirname, 'devices_export.xlsx');
    xlsx.writeFile(workbook, exportPath);

    res.download(exportPath, 'devices.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(exportPath);
    });
  });
});

// 提供前端页面
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});
