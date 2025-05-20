// frontend/src/components/ImportExcel.jsx
import React from 'react';

const ImportExcel = ({ onImport }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
    </div>
  );
};

export default ImportExcel;
