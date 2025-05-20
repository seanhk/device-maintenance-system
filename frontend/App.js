import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState('');
  const [file, setFile] = useState(null);

  const fetchDevices = async () => {
    const res = await axios.get(`http://localhost:3100/api/devices?filter=${filter}`);
    setDevices(res.data);
  };

  useEffect(() => {
    fetchDevices();
  }, [filter]);

  const handleImport = async () => {
    if (!file) return alert('请选择Excel文件');
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:3100/api/devices/import', formData);
    alert('导入成功');
    fetchDevices();
  };

  const handleExport = async () => {
    const res = await axios.get('http://localhost:3100/api/devices/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'devices.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>设备维护管理系统</h2>
      <input
        placeholder="搜索设备名称或类型"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: 10, width: 300 }}
      />
      <button onClick={handleExport} style={{ marginLeft: 10 }}>导出Excel</button>
      <div style={{ marginTop: 20 }}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleImport} style={{ marginLeft: 10 }}>导入更新</button>
      </div>
      <table border="1" cellPadding="5" style={{ marginTop: 20, borderCollapse: 'collapse' }}>
<thead>
<tr>
<th>设备类型</th>
<th>设备名称</th>
<th>设备序列号</th>
<th>设备型号</th>
<th>资源池</th>
<th>机房名称</th>
<th>维护人</th>
<th>维护人联系方式</th>
<th>维保到期时间</th>
<th>项目</th>
<th>备注</th>
</tr>
</thead>
<tbody>
{devices.map(device => (
<tr key={device.id}>
<td>{device.device_type}</td>
<td>{device.device_name}</td>
<td>{device.device_sn}</td>
<td>{device.device_model}</td>
<td>{device.resource_pool}</td>
<td>{device.data_center}</td>
<td>{device.maintainer}</td>
<td>{device.maintainer_contact}</td>
<td>{device.maintenance_expiry ? device.maintenance_expiry.slice(0,10) : ''}</td>
<td>{device.project}</td>
<td>{device.remarks}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}
