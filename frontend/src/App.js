import React, { useEffect, useState } from 'react';

function App() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => setDevices(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>设备维护信息</h1>
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
              <td>{device.maintenance_expiry?.slice(0, 10)}</td>
              <td>{device.project}</td>
              <td>{device.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
