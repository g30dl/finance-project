export const getCategoryIcon = (category) => {
  const icons = {
    comida: '🛒',
    servicios: '💡',
    transporte: '🚗',
    salud: '🏥',
    educacion: '📚',
    hogar: '🏠',
    ropa: '👕',
    entretenimiento: '🎬',
    tecnologia: '💻',
    otros: '📦',
  };

  return icons[category] || icons.otros;
};

export const getCategoryColor = (category) => {
  const colors = {
    comida: 'text-emerald-400',
    servicios: 'text-amber-400',
    transporte: 'text-blue-400',
    salud: 'text-rose-400',
    educacion: 'text-purple-400',
    hogar: 'text-orange-400',
    ropa: 'text-pink-400',
    entretenimiento: 'text-cyan-400',
    tecnologia: 'text-indigo-400',
    otros: 'text-slate-400',
  };

  return colors[category] || colors.otros;
};
