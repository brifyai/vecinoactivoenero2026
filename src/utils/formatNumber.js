// Función para formatear números con separador de miles
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Función para formatear números grandes (K, M)
export const formatNumberShort = (num) => {
  if (num === undefined || num === null) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.', ',') + 'K';
  }
  return num.toString();
};

export default { formatNumber, formatNumberShort };
