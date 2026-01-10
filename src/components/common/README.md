# Biblioteca de Componentes UI

Componentes reutilizables de la aplicacion Familia Finanzas.

## Importacion

```javascript
import { Button, Input, Card, Modal, Alert } from '@/components/common';
```

## Componentes Disponibles

### Button
Boton con multiples variantes y estados.
- Variantes: primary, secondary, danger, ghost, outline
- Tamanos: sm, md, lg
- Estados: loading, disabled
- Soporte para iconos

### Input
Input de texto con validacion y estados de error.
- Label opcional
- Iconos izquierda/derecha
- Mensajes de error y ayuda
- Full width opcional

### Select
Dropdown personalizado con estilos consistentes.
- Label opcional
- Validacion de errores
- Placeholder configurable

### Card
Contenedor generico con header opcional.
- Titulo y subtitulo
- Accion en el header
- Padding configurable

### Modal
Dialog modal centrado con overlay.
- Tamanos: sm, md, lg, xl
- Cierre con ESC
- Cierre al hacer clic en overlay

### Alert
Mensaje de alerta con variantes.
- Variantes: success, warning, danger, info
- Con titulo opcional
- Cierre opcional

### Badge
Etiqueta para estados y categorias.
- Variantes de color
- Tamanos: sm, md, lg
- Punto de color opcional

### Textarea
Area de texto con contador de caracteres.
- Validacion
- Contador de caracteres
- No redimensionable

### EmptyState
Estado vacio cuando no hay datos.
- Con icono
- Titulo y descripcion
- CTA opcional

### Tooltip
Informacion adicional al hover.
- Posiciones: top, bottom, left, right
- Con flecha

## Ejemplos de Uso

Revisar `src/pages/ComponentsShowcase.jsx` para una vista completa.
