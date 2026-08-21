# PediKine v0.12

## Cambios de esta versión

### Edad del paciente
- Se elimina el uso de edad decimal en la interfaz.
- Ahora se ingresa:
  - años cumplidos
  - meses adicionales (0–11)
- Ejemplo: 2 años + 5 meses = 29 meses internamente = 2,42 años cuando una fórmula lo requiere.
- La barra “Paciente actual” muestra la edad como `2 a 5 m`.

### PRAM y oxigenoterapia
- El componente SpO₂ diferencia:
  - aire ambiente
  - paciente con O₂/CNAF
- Si recibe O₂, PediKine solicita una SpO₂ basal previa en aire ambiente.
- Si sólo está documentado que la basal era <92%, puede marcarse esa condición y se asignan 2 puntos.
- Si no existe un dato basal fiable, la app no calcula un PRAM completo.
- No se recomienda retirar O₂ sólo para obtener el score si eso puede desestabilizar al paciente.

### Validación de datos
- Edad: años enteros y meses 0–11.
- SpO₂: 50–100%.
- FiO₂: 0,21–1,00 o 21–100%.
- Se bloquea el rango ambiguo entre 1 y 21 para FiO₂.
- Validaciones adicionales para FR, PaO₂, peso y talla.

### Fármacos y concentraciones
- Las dosis por peso se mantienen en mg/μg.
- Se agregan concentraciones editables para:
  - salbutamol nebulizado (mg/mL)
  - ipratropio nebulizado (μg/mL)
  - dexametasona (mg/mL)
  - prednisona/prednisolona (mg/mL)
- La app convierte automáticamente a mL sólo cuando la concentración ingresada es válida.
- Salbutamol queda precargado en 5 mg/mL e ipratropio en 250 μg/mL; ambos deben verificarse contra el envase disponible.

### Interfaz
- Encabezado actualizado a v0.12.
- Iconos PWA versionados como v012 para evitar caché de iOS.
