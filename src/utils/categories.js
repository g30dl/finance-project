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
    comida: 'text-category-food',
    servicios: 'text-category-services',
    transporte: 'text-category-transport',
    salud: 'text-category-health',
    educacion: 'text-category-education',
    hogar: 'text-category-home',
    ropa: 'text-category-shopping',
    entretenimiento: 'text-category-entertainment',
    tecnologia: 'text-category-tech',
    otros: 'text-category-other',
  };

  return colors[category] || colors.otros;
};
