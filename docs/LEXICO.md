# Léxico del proyecto

El sitio habla de dinero público y de obras que muchas personas esperan. Los textos describen montos, plazos y causas, sin calificar a las obras ni a quienes las ejecutan. Esta lista es la referencia para escribir cualquier texto nuevo; `tests/test_lexico.py` revisa el sitio y el README en cada cambio y falla si aparece una palabra de la columna de la izquierda.

## Palabras a evitar

| Evitar | Usar | Por qué |
|---|---|---|
| cara, caro, la más cara | #1 en monto pendiente, de mayor monto | "Caro" sugiere que algo está sobrevalorado |
| barata, barato, la más barata | la que necesita menos inversión, de menor monto | Mismo motivo, en sentido inverso |
| vieja, viejo, las más viejas | de mayor antigüedad, las que empezaron antes | "Viejo" es coloquial y suena despectivo |
| parada, parado | paralizada, paralizado | "Paralizada" es el término de la Contraloría y el que se usa en el Perú |
| plata | presupuesto, recursos, monto | Coloquial |
| se pararon, pararse | se paralizaron, paralizarse | Coloquial, y no es el término oficial |
| chica, enorme (para una obra) | de menor monto, de gran monto | Califica en vez de medir |
| solo N de M (como reproche) | N de M | El dato basta |
| frena (dinero) | concentra el monto pendiente | Más preciso |
| ni un sol | sin presupuesto asignado | Enfático |
| récord, récords | datos que destacan, destacados | Suena a celebrar una cifra |
| duelo, cara a cara, carrera | comparación, lado a lado, año por año | Plantea a los departamentos como rivales |
| gana, pierde (entre causas o lugares) | la más frecuente, encabeza | Mismo motivo |
| abandonada | (nombrar la causa oficial: "abandono de obra" cuando así figura en la base) | Atribuye una conducta |
| corrupción, mala gestión, peor gestión | no atribuye responsabilidades; no describe por sí solo la gestión | La página no acusa ni absuelve |
| derroche, despilfarro, desperdicio, malgastar | monto pendiente, monto por ejecutar | Juicio de valor |
| elefante blanco, fracaso, desastre, escándalo, vergüenza | (describir el dato) | Juicio de valor |
| culpa, culpable, negligencia | (describir la causa declarada) | Atribuye responsabilidad |

## Cómo escribir

- Datos antes que adjetivos: "falta ejecutar S/ 336.8 millones", no "una obra enorme".
- Las causas se nombran como las declara la entidad ante la Contraloría.
- Si un dato falta, se dice: "sin monto reportado", "avance sin dato".
- Las comparaciones entre lugares describen diferencias, no posiciones de ganadores o perdedores.
- Cuando un número puede leerse como juicio (más obras paralizadas en una región), se aclara que muchas vienen de gestiones anteriores.

Los nombres oficiales de obras y entidades se muestran tal como vienen en la base; la prueba no los revisa.
