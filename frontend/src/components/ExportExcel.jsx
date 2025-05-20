// frontend/src/components/ExportExcel.jsx
import React from 'react';

const ExportExcel = ({ onExport }) => {
  return (
    <button onClick={onExport}>导出Excel</button>
  );
};

export default ExportExcel;
