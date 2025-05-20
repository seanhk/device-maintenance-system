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
      <table border="1" cellPadding
