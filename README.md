# PediKine v0.6

## Correcciones finales de esta sesión

### CNAF
- Predeterminado: estrategia con corte en 10 kg.
- ≤10 kg: 2 L/kg/min.
- >10 kg: 20 L/min + 0,5 L/min por cada kg sobre 10.
- Se mantiene RCH (corte 12 kg) como protocolo alternativo seleccionable.
- Se añade referencia AEP/SECIP 2021 y se mantiene Fisher & Paykel para rangos técnicos de interfaz.

### Salbutamol nebulizado
- Calculadora principal basada en peso:
  - 0,15 mg/kg/dosis.
  - mínimo 2,5 mg.
  - máximo 5 mg.
- Convierte automáticamente:
  mg → mL de salbutamol 5 mg/mL → mL de SF para completar 4 mL.
- Mantiene las pautas chilenas fijas como referencias separadas.
- Mantiene modo manual para comprobar ejemplos como:
  0,7 mL × 5 mg/mL = 3,5 mg + 3,3 mL SF = 4 mL.
- Alerta para confirmar siempre la concentración disponible.

## Publicación
Reemplazar en la raíz de GitHub:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js

README.md es opcional.
