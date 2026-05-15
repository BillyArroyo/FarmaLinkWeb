# Comando: /agregar-producto

## Descripción
Inserta un nuevo producto en el catálogo de FarmaLink. El comando valida los datos, busca una foto automáticamente si no se proporciona, y guarda en Supabase. También puede generar el SQL para importación masiva.

## Uso
```
/agregar-producto
/agregar-producto [nombre del producto]
/agregar-producto --csv [ruta-al-archivo.csv]
/agregar-producto --bulk [cantidad]
```

**Ejemplos:**
```
/agregar-producto
/agregar-producto "Paracetamol 500mg Caja x100"
/agregar-producto --csv productos_lista.csv
/agregar-producto --bulk 50
```

## Modos de operación

### Modo interactivo (sin argumentos o con nombre)
Claude solicita los datos necesarios en orden y valida cada campo:

```
Nombre del producto: _
Laboratorio/Marca: _
Categoría: [Analgésicos / Antibióticos / Vitaminas / Antiinflamatorios / Dermatología / Gastro / Cardiovascular / Otro]
Precio de venta (S/.): _
Precio de costo (S/.): _ [opcional]
Stock inicial: _
Código de barras (EAN): _ [opcional]
¿Tiene promoción activa? [s/n]: _
  → Si sí: ¿Tipo? [2x1 / descuento% / combo]
  → Detalles de la promo: _
¿Subir foto manualmente? [s/n]:
  → Si no: Claude busca foto automáticamente por nombre+laboratorio
```

### Modo CSV — importación masiva
Formato del CSV esperado:
```csv
nombre,laboratorio,categoria,precio,precio_costo,stock,codigo_barras,promo_tipo,promo_detalle
"Paracetamol 500mg x100","Farmindustria","Analgésicos",8.50,4.20,200,"7751234567890","","" 
"Amoxicilina 500mg x10","Medifarma","Antibióticos",12.00,6.50,150,"7751234567891","descuento","15"
"Vitamina C 1g x30","Bayer","Vitaminas",18.00,9.00,300,"","2x1",""
```

Claude procesará el CSV fila por fila, validará cada producto, buscará fotos automáticamente y mostrará un resumen antes de insertar.

### Modo bulk — generación rápida
Genera N productos de ejemplo para testing con datos realistas del mercado peruano.

## Lo que hace Claude al ejecutar este comando

### 1. Validaciones obligatorias
```typescript
// Validaciones antes de insertar
assert(nombre.length >= 5, "Nombre muy corto")
assert(nombre.length <= 200, "Nombre muy largo")
assert(precio > 0, "Precio debe ser mayor a 0")
assert(precio < 10000, "Precio fuera de rango razonable — confirmar")
assert(stock >= 0, "Stock no puede ser negativo")
assert(CATEGORIAS_VALIDAS.includes(categoria), "Categoría no válida")
```

### 2. Buscar foto automáticamente
```typescript
// Orden de búsqueda:
// 1. Open Food Facts API: GET /product/{codigo_barras}
// 2. Búsqueda por nombre en Unsplash (categoría "medicine pharmacy")
// 3. Placeholder genérico de Supabase Storage según categoría

async function buscarFotoProducto(nombre: string, codigoBarras?: string): Promise<string>
```

Si no se encuentra foto: usar imagen de placeholder por categoría guardada en `public/placeholders/[categoria].jpg`.

### 3. Generar SQL de inserción
```sql
INSERT INTO productos (
  nombre, laboratorio, categoria, precio, precio_costo,
  stock, codigo_barras, imagen_url, promo_tipo, promo_detalle, activo
) VALUES (
  'Paracetamol 500mg Caja x100',
  'Farmindustria',
  'Analgésicos',
  8.50, 4.20,
  200, '7751234567890',
  'https://[bucket].supabase.co/storage/v1/object/public/farmalink-assets/productos/...',
  NULL, NULL, true
) RETURNING id, nombre, codigo_barras;
```

### 4. Actualizar datos mock (solo en desarrollo)
Si el proyecto aún usa datos hardcodeados en `src/app/data/farmalink.ts`, agregar el producto al array `PRODUCTOS` para que aparezca en la UI de desarrollo. **Solo para testing — no es la fuente de datos en producción.**

### 5. Confirmar la inserción
Antes de ejecutar, mostrar resumen:
```
┌─────────────────────────────────────────┐
│  Nuevo producto a insertar:             │
│  Nombre:       Paracetamol 500mg x100   │
│  Laboratorio:  Farmindustria            │
│  Categoría:    Analgésicos              │
│  Precio:       S/. 8.50                 │
│  Stock:        200 unidades             │
│  Foto:         ✓ encontrada (Open Food) │
│  Promo:        Sin promoción            │
└─────────────────────────────────────────┘
¿Confirmar inserción? [s/n]
```

## Categorías válidas del sistema

Las mismas que aparecen en `CatalogoInicio.tsx`:
- Analgésicos
- Antibióticos
- Vitaminas y suplementos
- Antiinflamatorios
- Dermatología
- Gastroenterología
- Cardiovascular
- Respiratorio
- Diabetes
- Pediátrico
- Cuidado personal
- Otro

## Validaciones de precio (mercado peruano)

| Categoría | Precio mínimo | Precio máximo típico |
|-----------|-------------|---------------------|
| Analgésicos | S/. 1.50 | S/. 50.00 |
| Antibióticos | S/. 5.00 | S/. 200.00 |
| Vitaminas | S/. 5.00 | S/. 150.00 |
| Cardiovascular | S/. 15.00 | S/. 500.00 |

Si el precio está fuera del rango típico: advertir pero permitir confirmación manual.

## Formato de `promo_detalle` en Supabase

```json
// promo_tipo: "2x1"
{ "producto_gratis_id": "uuid-del-producto-gratis", "cantidad_minima": 2 }

// promo_tipo: "descuento_porcentaje"  
{ "porcentaje": 15, "cantidad_minima": 1 }

// promo_tipo: "combo"
{ "productos_incluidos": ["uuid1", "uuid2"], "precio_combo": 25.00 }
```

## Notas importantes
- Nunca insertar sin confirmar con el usuario primero
- Si el código de barras ya existe en la BD: advertir y preguntar si actualizar
- Las fotos se guardan en Supabase Storage bucket `farmalink-assets` en ruta `productos/{id}/foto.jpg`
- Para importación de más de 100 productos, recomendar usar la interfaz admin `GestionCatalogo.tsx` con CSV masivo
