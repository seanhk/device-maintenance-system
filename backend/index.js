const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
const db = mysql.createConnection({
  host: 'db',           // 如果你用 Docker Compose，服务名是 db
  user: 'root',
  password: 'your_password', // 替换为你的密码
  database: 'device_maintenance'
});

db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('成功连接到 MySQL');
  }
});

// 创建表（如果不存在）
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
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// 添加/更新设备（按设备名称作为主键更新）
app.post('/api/devices', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO devices (device_type, device_name, serial_number, model, resource_pool, room_name, maintainer, maintainer_contact, warranty_expiry, project, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      device_type = VALUES(device_type),
      serial_number = VALUES(serial_number),
      model = VALUES(model),
      resource_pool = VALUES(resource_pool),
      room_name = VALUES(room_name),
      maintainer = VALUES(maintainer),
      maintainer_contact = VALUES(maintainer_contact),
      warranty_expiry = VALUES(warranty_expiry),
      project = VALUES(project),
      remark = VALUES(remark)
  `;
  db.query(sql, [
    d.device_type, d.device_name, d.serial_number, d.model, d.resource_pool,
    d.room_name, d.maintainer, d.maintainer_contact, d.warranty_expiry,
    d.project, d.remark
  ], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// Excel 导入
const upload = multer({ dest: 'uploads/' });
app.post('/api/import', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const sql = `
    INSERT INTO devices (device_type, device_name, serial_number, model, resource_pool, room_name, maintainer, maintainer_contact, warranty_expiry, project, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      device_type = VALUES(device_type),
      serial_number = VALUES(serial_number),
      model = VALUES(model),
      resource_pool = VALUES(resource_pool),
      room_name = VALUES(room_name),
      maintainer = VALUES(maintainer),
      maintainer_contact = VALUES(maintainer_contact),
      warranty_expiry = VALUES(warranty_expiry),
      project = VALUES(project),
      remark = VALUES(remark)
  `;

  data.forEach(row => {
    db.query(sql, [
      row.device_type || '', row.device_name || '', row.serial_number || '',
      row.model || '', row.resource_pool || '', row.room_name || '',
      row.maintainer || '', row.maintainer_contact || '', row.warranty_expiry || null,
      row.project || '', row.remark || ''
    ]);
  });

  res.json({ success: true });
});

// 静态文件（React 前端）
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});
