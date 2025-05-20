// frontend/src/components/DeviceTable.jsx
import React from 'react';

const DeviceTable = ({ devices }) => {
  return (
    <table border="1" cellPadding="5">
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
        {devices.map((device, index) => (
          <tr key={index}>
            <td>{device.type}</td>
            <td>{device.name}</td>
            <td>{device.serial}</td>
            <td>{device.model}</td>
            <td>{device.pool}</td>
            <td>{device.room}</td>
            <td>{device.maintainer}</td>
            <td>{device.contact}</td>
            <td>{device.expiry}</td>
            <td>{device.project}</td>
            <td>{device.remark}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeviceTable;
