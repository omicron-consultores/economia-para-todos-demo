# Investigación: cómo hacer el demo realista

**Economía para Todos · Investigación previa a la implementación**
Fecha: 12/11/2026. Fuentes en línea revisadas a esa fecha. Lo marcado **[verificar]** no se pudo confirmar en una fuente oficial.

---

## 0. Hallazgos clave (lo que cambia el demo)

1. **El SIN ya no usa el "Padrón Biométrico" (PBD-11).** Desde el 5/5/2025 rige el **Registro Nacional de Contribuyentes (RNC)** ([RND 10-2500-00000017](https://s1.boliviaimpuestos.com/img/2025/04/21153738/NUEVA-RND-102500000017.pdf)). Es el modelo de datos que nuestro registro debería reflejar.
2. **El INE no entrega datos de personas,** porque su información está protegida por el secreto estadístico. Los datos que se pueden autocompletar salen de **Ciudadanía Digital (AGETIC)** y de la contrastación de identidad con el **SEGIP**. Del INE se usan los **catálogos**: actividades económicas (CAEB, que el SIN adaptó como "CAEB-SIN") y códigos de municipio.
3. **El aporte de Bs 255 no cuadra con la normativa real.** María, con Bs 8.500 de ventas al mes, cabe en el **Régimen Tributario Simplificado (RTS)**, donde pagaría alrededor de Bs 75–100 al mes. El aporte mínimo a la Gestora como independiente es ≈ **Bs 476 al mes**. Hay que decidir qué representa el "aporte" (ver §2).
4. **El SUS ya cubre gratis a María,** así que un "Seguro básico" de salud no le agrega valor. La protección realista es un **microseguro** (vida, accidentes o sepelio) más el **aporte a la Gestora como independiente**.
5. **"Economía para todos" no aparece como programa ni eslogan oficial.** El eslogan del gobierno de Paz es "Capitalismo para todos" ([eju.tv](https://eju.tv/2025/12/capitalismo-para-todos-entre-eslogan-y-la-realidad/)). Conviene tenerlo en cuenta por el riesgo de que el demo se asocie con un partido.
6. **Hoy no existe una ventanilla única operativa** que una SIN, SEPREC, municipio y Gestora. El decreto **DS 5595 "Tranca Cero"** (03/2026) empuja la interoperabilidad y la eliminación de fotocopias. Ese hueco es justamente el valor que el demo puede mostrar.

---

## 1. Registro: el modelo de datos del SIN

### 1.1 Qué pide el SIN hoy (inscripción en línea en el RNC, persona natural)

Fuentes: RND 10-2500-00000017, el manual R-0347 y las guías de [boliviaimpuestos.com](https://boliviaimpuestos.com/apertura-del-nit-en-el-rnc-en-linea/).

| Bloque | Campos | Notas |
|---|---|---|
| **Identidad** | Tipo de documento, N° de CI, **complemento**, nombres, apellidos, **fecha de nacimiento** | Se contrastan en línea con el SEGIP. Si no coinciden, el trámite debe hacerse en persona. |
| **Contacto** | **Correo electrónico** (verificado con un PIN), celular | Al correo llegan las credenciales y las notificaciones. |
| **Actividad** | Sector → subsector → actividad(es) del **clasificador CAEB-SIN**; % de participación de cada actividad (suman 100%) | La actividad con mayor % es la principal. |
| **Cuestionario** | Unas 21 preguntas: recursos humanos, económicos, materiales y tecnológicos; proveedores, clientes, cuentas bancarias, importación/exportación, web | Obligatorio. |
| **Datos complementarios** | Nivel de estudios, profesión u ocupación, estado civil, nacionalidad | |
| **Domicilios (3)** | **Tributario**, **comercial/productivo** y **habitual**. Cada uno con departamento, municipio, zona, tipo urbano/rural, **georreferencia (pin en mapa)** y referencia de texto libre (hasta 500 caracteres) | En línea, el pin reemplaza al croquis. Calle y número **[verificar]**. |
| **Documentos** | PDF, hasta 5 archivos de 15 MB cada uno, según la actividad | Para persona natural: CI y factura de luz de menos de 60 días. Esta no se exige si el domicilio coincide con el del CI. |
| **Cierre** | Verificar → Finalizar → **número de trámite** | Puede haber **verificación en el domicilio** en un plazo de 5 días hábiles. Hay reportes de que se eliminó en 2026 **[verificar]**. |

**Qué recibe la persona** (RND 17, art. 8 y [RND 10-2600-00000031](https://www.impuestos.gob.bo/wp-content/uploads/2026/08/RND-102600000031.pdf)):
- el **NIT**, que en persona natural es el CI más dígitos asignados **[verificar el formato]**;
- las credenciales del **SIAT en Línea** y la app "SIAT en tus manos";
- el acceso al **Buzón Tributario**;
- el **Documento de Exhibición NIT**, para colocar en el local;
- el **reporte informativo tributario**: régimen, impuestos, deberes formales y modalidad de facturación;
- desde 08/2026, la **Certificación de Registro en el RNC con QR**.

### 1.2 Régimen tributario de María

- **Régimen Tributario Simplificado (RTS):** según el [DS 3698](https://bolivia.infoleyes.com/norma/6870/decreto-supremo-3698), aplica a artesanos, comerciantes minoristas y vivanderos. El capital debe estar entre Bs 12.001 y 60.000 y las ventas anuales hasta Bs 184.000. Se paga una **cuota fija cada dos meses**, de Bs 47 a 350 según el capital, y **no se emiten facturas**.
  - María vende Bs 8.500 × 12 = Bs 102.000 al año, así que **califica**. Si su capital (máquinas e insumos) fuera de unos Bs 25.000, estaría en la **categoría 4: Bs 158 cada dos meses ≈ Bs 79 al mes**.
- **Régimen General:** IVA 13% (formulario 200, mensual), IT 3% (formulario 400, mensual) e IUE 25% (anual), con facturación en línea, que para pequeños es la modalidad *Portal Web*.
- **SIETE-RG (5% de las ventas):** se anunció y luego se retiró. La [Ley 1733 de Alivio Tributario](https://boliviaimpuestos.com/ley-1733-de-alivio-tributario-pdf/) (27/05/2026) **no lo incluiría** según un blog, mientras que otra nota de prensa dice lo contrario **[verificar en la Gaceta]**. **El demo no debería apoyarse en el SIETE-RG.**

### 1.3 Qué se puede autocompletar con interoperabilidad (y qué no)

| Fuente | ¿Es realista? | Qué aporta |
|---|---|---|
| **Ciudadanía Digital (AGETIC, protocolo OpenID)** | **Sí**, es la vía principal | El inicio de sesión ya devuelve el **CI, nombre completo y fecha de nacimiento verificados, más correo y celular** ([especificación AGETIC](https://intranet.agetic.gob.bo/nube/s/TQG4JGfHaCgrBsb/download)). |
| **SEGIP** | **Parcial** | Solo **contrasta**: dice si los datos coinciden o no. No entrega foto ni estado civil a terceros ([Ley 145](https://web.mingobierno.gob.bo/wp-content/uploads/2025/09/LEY-N%C2%B0-145-DEL-SERVICIO-DE-IDENTIFICACION-PERSONAL-SEGIP.pdf)). |
| **Plataforma de Interoperabilidad del Estado** | **Sí**, solo para entidades públicas | El SIN, SEPREC, la Gestora y el SEGIP publican sus datos ahí ([AGETIC](https://www.agetic.gob.bo/?p=3666)). Permite mostrar "¿ya tienes NIT, matrícula o Gestora?". |
| **INE** | **Solo catálogos** | CAEB-2022, códigos de municipio y departamento, Censo 2024. No entrega datos individuales. |
| **SEPREC** | Parcial | Matrícula de comercio. No se inscribe al mismo tiempo que el NIT; solo existe un cruce de bases SEPREC–SIN. |
| **Municipio (licencia de funcionamiento)** | **No** | En La Paz el trámite está en línea en [iGob 24/7](https://igob247.lapaz.bo/) y es gratuito. En El Alto no hay trámite en línea confirmado. |
| **Central de riesgos de ASFI / Infocred** | Solo con **consentimiento** y a través de una entidad financiera | El demo debe mostrar "Autorizo al BDP a consultar mi historial". |

> No existe todavía una ley de protección de datos personales: está anunciada. El consentimiento explícito en el flujo suma credibilidad.

### 1.4 Propuesta de flujo de registro

El Scope Freeze pide "pocos campos" y que el registro "se sienta real". La interoperabilidad permite cumplir con el modelo del SIN **sin** un formulario largo:

| Paso | Pantalla | Qué escribe María | Qué se autocompleta |
|---|---|---|---|
| 1 | **Ingresar con Ciudadanía Digital** (alternativa: CI + complemento + fecha de nacimiento → contraste con SEGIP) | Nada, o 3 campos | Nombre, CI, fecha de nacimiento, correo y celular, con la marca "Verificado por SEGIP" |
| 2 | **Lo que ya sabemos de ti** (consulta al SIN, SEPREC y Gestora) | Nada | "Sin NIT · Sin matrícula · Sin aportes a la Gestora". Se ve la interoperabilidad. |
| 3 | **¿A qué te dedicas?** Buscador CAEB-SIN con sugerencias en lenguaje cotidiano ("costura", "confección") | Elegir 1 actividad | Sector y subsector; actividad principal al 100% |
| 4 | **¿Dónde trabajas?** Mapa con pin, zona y referencia; casilla "Trabajo en mi casa" | Pin y referencia | El mismo domicilio como tributario, comercial y habitual |
| 5 | **Tu negocio** | Ventas aproximadas del mes, capital aproximado (rangos), trabajadores | **Régimen sugerido: RTS categoría X**, con la cuota estimada |
| 6 | **Revisa y autoriza** | Aceptar el consentimiento | Resumen con la etiqueta "Se enviará a: SIN · SEPREC · Gestora · BDP" |
| → | **Éxito** | — | **NIT asignado (demo)**, número de trámite y Libreta |

El cuestionario del SIN y los datos complementarios (estudios, estado civil) se pueden mostrar reducidos, de 3 a 4 preguntas, o marcados como "se completan después".

---

## 2. Mi aporte: decisión de modelo

En el demo actual, Bs 255 equivale a **exactamente el 3% de las ventas**, que es la tasa del IT. Frente a la realidad:

- El **RTS** de María costaría ≈ Bs 79 al mes.
- El **aporte mínimo a la Gestora** como independiente es 14,42% sobre un salario mínimo de Bs 3.300 ([DS 5516](https://www.bloomberglinea.com/latinoamerica/bolivia/rodrigo-paz-aumenta-un-20-el-salario-minimo-en-bolivia/)), es decir **≈ Bs 476 al mes**.
- El ingreso laboral promedio es Bs 2.847 al mes ([Correo del Sur](https://correodelsur.com/economia/20260823/poblacion-ocupada-cae-en-205-mil-personas-en-el-primer-semestre.html)).

Opciones:
- **A. Aporte = impuesto (RTS) más microseguro.** Es realista: ≈ Bs 79 + Bs 30 ≈ **Bs 110 al mes**. Hay que bajar los beneficios en proporción.
- **B. Aporte único del programa (propuesta),** que agrupa impuesto, previsión y seguro, con una etiqueta explícita: "Modelo propuesto, no vigente". Permite mantener Bs 255, pero entonces no puede incluir el aporte completo a la Gestora.
- **C. Desglosar el aporte en la pantalla:** Impuesto (RTS) + Seguro + Ahorro previsional voluntario. Es la más transparente y "SIN-compatible".

Recomiendo **C**, porque muestra que el programa reúne obligaciones que hoy están dispersas.

---

## 3. Crédito

- **Productos reales del BDP:**
  - **[Manufactura BDP](https://www.bdp.com.bo/bdp-manufactura/):** hasta 10% anual, capital de operación a 3 años, inversión a 10 años. Es el más adecuado para una costurera.
  - **[Mujer BDP](https://www.bdp.com.bo/mujer-bdp-2/):** 11% para micro.
  - **[Emprende BDP](https://www.bdp.com.bo/bdp-emprende/)** y **SIBOLIVIA**.
- **Tasa máxima para microcrédito productivo: 11,5%** ([DS 2055, modificado por DS 5403/2025](https://www.lexivox.org/norms/BO-DS-N5403.xhtml)).
- **Garantías:** FOGACP cubre hasta 50%. El nuevo **Fondo Amplio de Garantía** (DS 5542, 03/2026) también cubre 50% e incluye comercio y servicios.
- **Para el demo:** mantener "hasta Bs 12.000" y agregar:
  - producto **"Manufactura BDP · capital de operación"**, **tasa referencial 10% anual**, **plazo 12–24 meses**, **cuota estimada ≈ Bs 550–1.100 al mes**;
  - garantía: personal o fondo de garantía al 50%;
  - el paso **"Autorizo consultar mi historial en la central de riesgos de ASFI"**;
  - la respuesta "Tu solicitud llegó a: BDP – Agencia El Alto · N° de solicitud".
- **Lista de perfil:** "4 meses de historial" está escrito a mano en el código. Debería derivarse de los datos e incluir "NIT activo" y "Al día con el SIN".

## 4. Protección

- **Salud:** el **SUS** ([Ley 1152](https://www.lexivox.org/norms/BO-L-N1152.html)) es gratuito sin afiliación. El demo puede mostrar "Ya tienes cobertura del SUS" e informar, sin venderlo.
- **Seguro:** un **microseguro de vida, accidentes o sepelio** regulado por la APS, de **Bs 7 a 50 al mes**. Por ejemplo, Baneco ofrece sepelio por Bs 84 al año ([tarifario](https://baneco.com.bo/assets/content/docs/footers/tarifario/Tarifario%20Seguros-0115.pdf)).
- **Previsión:** la **Gestora Pública**, con aporte de independiente del **14,42%** (10% va a la cuenta individual) y base mínima de 1 salario mínimo ([Gestora](https://gestora.bo/archivos/bajar?id=5410)). Se puede pagar hasta 12 meses por adelantado. El demo puede mostrar un **simulador simple**: "Si aportas Bs X, a los 65…" (con datos ficticios).

## 5. Capacitación

Conviene usar oferentes y temas reales:
- **SIN – Núcleos de Apoyo Contable y Fiscal (NAF):** asesoría tributaria gratuita en universidades.
- **BDP Lab:** plan de negocio e incubadora.
- **Pro-Bolivia:** capacitación y ferias.
- **Pro Mujer:** curso previo al crédito.

Agregar un curso **"Tu NIT y tus obligaciones (RTS)"** dictado por el NAF y emitir un **certificado** al llegar al 100%. Para el BDP, el certificado sirve como señal de perfil.

## 6. Oportunidades

- **Compras estatales (SICOES, [DS 0181](https://www.lexivox.org/norms/BO-DS-N181.html)):**
  - Modalidades: **Contratación Menor** (hasta Bs 50.000), **ANPE** (de Bs 50.001 a 1.000.000) y Licitación (más de Bs 1.000.000).
  - **Margen de preferencia del 20% para MyPEs**, que exige registro en **Pro-Bolivia** ([DS 4505](https://www.asfi.gob.bo/images/MARCO_NORMATIVO/SERV_FINAN_/D.S._4505.pdf)) y es acumulable con el 10% por producción nacional.
  - Catálogo "Compro Hecho en Bolivia".
- **Para el demo:** cada oportunidad pública debe mostrar la **modalidad**, el **código de convocatoria (estilo CUCE)**, el **margen de preferencia aplicable** y los requisitos reales (NIT activo, registro en Pro-Bolivia, matrícula cuando corresponda).
- **Ferias reales:** la **Casa del Emprendedor Productivo de El Alto** (abierta en 11/2026), Expocruz y la Feria 16 de Julio. Se pueden nombrar, o usar nombres genéricos si se prefiere evitar alusiones.

## 7. Libreta, Inicio y Perfil

- La **Libreta** debería mostrar: **NIT**, **régimen (RTS cat. X)**, actividad CAEB y **estado ante cada institución**.
- Agregar una **"Ruta de formalización"** con estados:
  - Identidad ✓
  - NIT ✓
  - Matrícula SEPREC (opcional o pendiente)
  - Licencia municipal (pendiente)
  - Gestora
  - Pro-Bolivia (habilita el margen de preferencia)

  Es lo que hace creíble una formalización **por etapas**.
- En **Inicio**: "**Próximo pago: cuota RTS, vence el …**" y el acceso a "Documento de Exhibición NIT".
- En **Ajustes**: correo, celular, notificaciones del Buzón Tributario, consentimientos otorgados (y su revocación) y cerrar sesión.

## 8. Centro Nacional de Gestión

- **Corte y periodo:** cada KPI debe decir "al 31/10/2026" o "acumulado 2026". Hoy no está claro, por ejemplo, de qué periodo es la "Recaudación".
- **Fuente por KPI:** etiquetas de origen como "SIN", "BDP", "Gestora" o "Programa". Comunican interoperabilidad, que es el mensaje que Chemonics quiere dar.
- **Coherencia con cifras reales** (sirve como guion para el presentador):

  | Cifra | Valor | Fuente |
  |---|---|---|
  | Unidades económicas registradas | 398.131 (solo ~112.700 activas) | SEPREC, 11/2025 |
  | Nuevos inscritos en 2025 | ~52.000 | SIN |
  | Informalidad | 82–85% | INE / OIT |
  | Recaudación 2025 | ~Bs 45.900 MM | SIN |
  | Población | 11.365.333 | Censo 2024 |

  Los 184.730 participantes del demo son plausibles como meta del programa. Recaudación del demo, Bs 92,4 MM: es el 0,2% del total del SIN, coherente si se rotula como "aportes del programa".
- **200.000 frente a 184.730:** la transición dice "200.000 Marías" y el KPI muestra 184.730. O se alinean, o se presenta como "meta 200.000 · avance 92%".
- **Embudo de formalización** (registrados → con NIT → al día → con crédito/protección): es la lectura más útil para el SIN y el BDP.
- **Filtros:** municipio dentro del departamento, y régimen tributario (RTS/General).

## 9. Detalles de realismo en el código actual

- `Actividad económica` es texto libre → debería ser el catálogo CAEB-SIN.
- `bolivia-locations.ts` tiene 3–5 municipios por departamento, de los 339 reales → usar la lista de códigos de municipio del INE.
- El CI no tiene complemento ni fecha de nacimiento. El teléfono no se valida (8 dígitos, empieza en 6 o 7). Las ventas no tienen formato de moneda.
- "Paso 1 de 1", el tiempo fijo "03:42" y "Miembro desde abril 2026" no corresponden a un registro recién hecho.
- "Ya estoy registrado" lleva al formulario de registro; debería ir a "Ingresar".
- Ajustes tiene solo 2 filas estáticas.
- El estado de la Libreta toma `maria.programStatus` sin importar quién se registró.

---

## 10. Decisiones tomadas (12/11/2026)

1. **Modelo del aporte: B, aporte único del programa.** Una sola cifra mensual (5% de las ventas declaradas, es decir Bs 425 para María; ajustado desde el 3% inicial el 15/11/2026). Se rotula como **"modelo propuesto, no vigente"** e integra las obligaciones tributarias del programa.
2. **Entrada al registro: ambas.** El botón principal es "Ingresar con Ciudadanía Digital". La alternativa es "Usar mi carnet", que pide CI, complemento y fecha de nacimiento y los contrasta con el SEGIP.
3. **Alcance: registro en 6 pasos cortos.** "llenar datos demo" completa cada paso para mantener el ritmo de la presentación.
4. **Nombres: instituciones reales, productos genéricos.** Se nombran el SIN, SEGIP, BDP, Gestora, SEPREC y SICOES. Los productos llevan nombres genéricos, por ejemplo "Crédito productivo BDP".

## 11. Pendientes por verificar

- Texto oficial de la Ley 1733: si incluye o no el SIETE-RG.
- Formato exacto del NIT de persona natural.
- Si sigue vigente la verificación en domicilio en 2026.
- Subcampos de dirección (calle y número).
- Trámite en línea de licencia en El Alto.
- Tasa del seguro voluntario de la CNS.
