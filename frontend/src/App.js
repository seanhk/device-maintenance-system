// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import DeviceTable from './components/DeviceTable';
import ImportExcel from './components/ImportExcel';
import ExportExcel from './components/ExportExcel';

function App() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error(err));
  }, []);

  const handleImport = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/import', {
      method: 'POST',
      body: formData
    }).then(() => window.location.reload());
  };

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  return (
    <div>
      <h2>设备维护信息</h2>
      <ImportExcel onImport={handleImport} />
      <ExportExcel onExport={handleExport} />
      <DeviceTable devices={devices} />
    </div>
  );
}

export default App;
