const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'device_user',
  password: process.env.DB_PASS || 'device_pass',
  database: process.env.DB_NAME || 'device_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 创建表（如果不存在）
async function createTable() {
  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_type VARCHAR(100),
    device_name VARCHAR(100) UNIQUE,
    device_sn VARCHAR(100),
    device_model VARCHAR(100),
    resource_pool VARCHAR(100),
    data_center VARCHAR(100),
    maintainer VARCHAR(100),
    maintainer_contact VARCHAR(100),
    maintenance_expiry DATE,
    project VARCHAR(100),
    remarks TEXT
  ) CHARACTER SET utf8mb4;
  `;
  const conn = await pool.getConnection();
  await conn.query(createTableSQL);
  conn.release();
}

createTable();

// 查询设备列表，支持筛选
app.get('/api/devices', async (req, res) => {
  try {
    const { filter } = req.query;
    let sql = 'SELECT * FROM devices';
    let params = [];
    if (filter) {
      sql += ` WHERE device_name LIKE ? OR device_type LIKE ?`;
      params.push(`%${filter}%`, `%${filter}%`);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量导入或更新设备（以 device_name 为主键）
app.post('/api/devices/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const conn = await pool.getConnection();
    for (const row of data) {
      const {
        device_type,
        device_name,
        device_sn,
        device_model,
        resource_pool,
        data_center,
        maintainer,
        maintainer_contact,
        maintenance_expiry,
        project,
        remarks
      } = row;

      // 插入或更新
      await conn.query(
        `INSERT INTO devices (device_type, device_name, device_sn, device_model, resource_pool, data_center, maintainer, maintainer_contact, maintenance_expiry, project, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          device_type=VALUES(device_type),
          device_sn=VALUES(device_sn),
          device_model=VALUES(device_model),
          resource_pool=VALUES(resource_pool),
          data_center=VALUES(data_center),
          maintainer=VALUES(maintainer),
          maintainer_contact=VALUES(maintainer_contact),
          maintenance_expiry=VALUES(maintenance_expiry),
          project=VALUES(project),
          remarks=VALUES(remarks)
        `,
        [device_type, device_name, device_sn, device_model, resource_pool, data_center, maintainer, maintainer_contact, maintenance_expiry, project, remarks]
      );
    }
    conn.release();
    fs.unlinkSync(req.file.path);
    res.json({ message: '导入成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出Excel接口
app.get('/api/devices/export', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM devices');
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="devices.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3100, () => {
  console.log('Backend running on port 3100');
});
