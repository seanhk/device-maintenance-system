import React from 'react';

function ImportExcel({ onImport }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onImport(file);
  };

  return <input type="file" accept=".xlsx" onChange={handleChange} />;
}

export default ImportExcel;
