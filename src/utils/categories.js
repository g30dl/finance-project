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
    comida: 'text-sage',
    servicios: 'text-mustard',
    transporte: 'text-navy',
    salud: 'text-burgundy',
    educacion: 'text-accent',
    hogar: 'text-rust',
    ropa: 'text-terracotta',
    entretenimiento: 'text-gold',
    tecnologia: 'text-slate',
    otros: 'text-muted-foreground',
  };

  return colors[category] || colors.otros;
};
