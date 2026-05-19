# Especificaciones del Juego: Masacre Zombi

## 1. Visión General
"Masacre Zombi" es un juego de supervivencia tipo *top-down shooter* desarrollado con **KAPLAY** (TypeScript). El jugador debe sobrevivir a oleadas interminables de zombis, ganar experiencia, subir de nivel y mejorar sus estadísticas mientras acumula puntos.

---

## 2. El Jugador (Stats y Progresión)

### 2.1. Estadísticas Base
- **Nivel Inicial:** 1 (Nivel máximo: 50)
- **Salud Máxima Inicial:** 100
- **Daño Inicial:** 1 por disparo
- **Velocidad de Movimiento Base:** 300
- **Puntuación:** 0 (Se obtienen 10 puntos por cada zombi derrotado)

### 2.2. Sistema de Experiencia (XP)
- Cada zombi derrotado otorga **100 XP** exactos.
- **Experiencia para Nivel 2:** 2000 XP (equivale a matar 20 zombis).
- **Escalado de Experiencia:** La experiencia requerida para cada nuevo nivel se multiplica por **1.5** respecto al nivel anterior (`expRequerida * 1.5`).

### 2.3. Beneficios por Subir de Nivel
Al completar la XP requerida, el jugador sube de nivel y obtiene instantáneamente las siguientes mejoras:
- **Daño:** Aumenta de forma fija en **+1.5 puntos**.
- **Salud Máxima:** Aumenta de forma aleatoria entre **+20 y +50 puntos**.
- **Curación Total:** La salud actual se restaura inmediatamente al 100% de la nueva salud máxima.
- **Velocidad de Movimiento:** Aumenta en **+15 puntos**.
- **Visual:** Aparece un texto flotante en pantalla ("¡NIVEL X!") para notificar el hito.

---

## 3. Enemigos (Zombis)

Los zombis aparecen constantemente desde fuera de los márgenes de la pantalla (arriba, abajo, izquierda, derecha) y persiguen agresivamente al jugador.

### 3.1. Estadísticas de Zombis
- **Daño que infligen:** 10 puntos de salud por golpe al jugador.
- **Velocidad:** `30 + aleatorio(0, 18) + (Oleada Actual * 3)`. (Se vuelven más rápidos cada oleada).
- **Salud Máxima (Escalado):**
  - **Nivel 1 del Jugador:** Los zombis tienen una vida fija equivalente a `Daño del Jugador * 3` (exactamente 3 golpes para morir al inicio).
  - **Nivel > 1 del Jugador:** La vida de los zombis pasa a ser dinámica. Tienen una cantidad de vida que requiere entre **2 y 5 impactos** para ser destruidos, calculada como: `Daño del Jugador * aleatorio(2, 5)`.

### 3.2. Interfaz del Zombi
- Cada zombi posee una **barra de vida flotante** que cambia de color según el porcentaje de salud restante (Verde > Amarillo > Rojo).
- Por encima de la barra, hay un texto blanco que muestra la **vida actual / vida máxima** exacta (ej. `4/5`).
- Al recibir daño, los ojos del zombi destellan en rojo y su cuerpo en blanco temporalmente (retroalimentación visual de daño).

---

## 4. Sistema de Oleadas

El juego se divide en distintas "oleadas" que determinan la cantidad de enemigos que aparecen y rigen un pequeño sistema de descanso.

- **Fórmula de Aparición:** La cantidad de zombis en una oleada es `5 + (Oleada Actual * 3)`.
  - *Oleada 1:* 8 zombis.
  - *Oleada 2:* 11 zombis.
  - *Oleada 3:* 14 zombis, etc.
- **Transición de Oleada:** Una nueva oleada comienza únicamente cuando todos los zombis programados para la oleada actual han aparecido **y** han sido completamente derrotados.
- **Bono por Sobrevivir:** Al pasar exitosamente a la siguiente oleada, el jugador **recupera 20 puntos de salud** (hasta el límite de su salud máxima actual).

---

## 5. Controles
- **Movimiento:** Teclas `W, A, S, D` o Flechas Direccionales.
- **Apuntar:** Movimiento del Ratón (el arma y la mirilla siguen el cursor).
- **Disparar:** Clic Izquierdo del Ratón.

## 6. Condiciones de Derrota
El juego termina cuando la "Salud Actual" del jugador llega a `0` o menos, mostrando una pantalla de *"FIN DEL JUEGO"* con la puntuación total y un botón para reiniciar la partida conservando el progreso guardado (se resetean todas las estadísticas).
