import React from 'react';

function DeviceTable({ devices }) {
  return (
    <table border="1">
      <thead>
        <tr>
          <th>设备类型</th>
          <th>设备名称</th>
          <th>设备序列号</th>
          <th>设备型号</th>
          <th>资源池</th>
          <th>机房</th>
          <th>维护人</th>
          <th>联系方式</th>
          <th>维保到期</th>
          <th>项目</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((d, i) => (
          <tr key={i}>
            <td>{d.device_type}</td>
            <td>{d.device_name}</td>
            <td>{d.serial_number}</td>
            <td>{d.model}</td>
            <td>{d.resource_pool}</td>
            <td>{d.room_name}</td>
            <td>{d.maintainer}</td>
            <td>{d.maintainer_contact}</td>
            <td>{d.warranty_expiry}</td>
            <td>{d.project}</td>
            <td>{d.remark}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DeviceTable;
