# DetalleCaso

`DetalleCaso` es un componente React que muestra y permite gestionar un caso asignado al área de Procuraduría. El modal reúne los datos del caso, los reportes asociados, el cambio de estatus y la bitácora de notas.

## Uso

```jsx
<DetalleCaso
  idCaso={idCaso}
  onClose={cerrarDetalle}
  onCambio={actualizarCasos}
  onVerReporte={abrirReporte}
/>
```

## Propiedades

| Propiedad | Tipo | Requerida | Descripción |
| --- | --- | --- | --- |
| `idCaso` | `number \| string` | Sí | Identificador usado para consultar y actualizar el caso. |
| `onClose` | `() => void` | Sí | Cierra el modal. |
| `onCambio` | `() => void \| Promise<void>` | Sí | Actualiza la lista de casos después de intentar guardar un cambio. |
| `onVerReporte` | `(folio: number \| string) => void` | Sí | Abre el detalle del reporte asociado al folio recibido. |

## Comportamiento

- Al montarse y cuando cambia `idCaso`, consulta `/procurador/casos/{idCaso}`.
- Al cambiar el estatus, envía una solicitud `PUT` a `/procurador/casos/{idCaso}/estatus`. Si el estatus implica cerrar el caso, solicita un motivo con `window.prompt()`; cancelar el diálogo cancela la operación.
- Al agregar notas, envía `descripcion_avance` (privada) y `descripcion_publica` (opcional) a `/procurador/casos/{idCaso}/notas`.
- Los cambios de estatus y las notas vuelven a cargar el caso y notifican a `onCambio`.
- Cada reporte puede abrirse mediante `onVerReporte` o prepararse para impresión en una ventana nueva.
- La acción de imprimir el caso prepara un documento con los datos, reportes y notas disponibles.
- Mientras los datos del caso no estén cargados, el componente devuelve `null`.

## Consideraciones

- `onVerReporte` es necesaria: se invoca al pulsar “Ver” en un reporte. El uso actual desde `CasosProcurador` no proporciona esta prop, así que esa acción puede fallar hasta que el llamador pase una función.
- `window.open()` puede devolver `null` si el navegador bloquea la ventana emergente. El código actual no comprueba ese resultado antes de acceder a la ventana.
- Los documentos de impresión interpolan datos recibidos del servidor en `document.write()`. Si alguno de esos datos contiene contenido no confiable, debe escaparse o sanitizarse antes de insertarlo para evitar inyección HTML o XSS.
- MDN desaconseja `document.write()` para código nuevo. Para una mejora futura, conviene construir el contenido con APIs DOM y asignar texto con `textContent` cuando corresponda.

## Referencias MDN

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [`Window.prompt()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt)
- [`Window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
- [`Document.write()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write)
- [`Window.print()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)