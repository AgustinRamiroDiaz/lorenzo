import kaplay from "kaplay";
import "kaplay/global";
import "./style.css";

// Inicializar Kaplay vinculándolo al canvas existente del DOM
kaplay({
    canvas: document.getElementById('lienzoJuego') as HTMLCanvasElement,
    background: [22, 33, 62], // #16213e
    width: 800,
    height: 600,
    global: true
});

// Variables de estado mapeadas con la interfaz
let puntuacionActual = 0;
let saludActual = 100;
let oleadaActual = 1;

function actualizarInterfaz() {
    const elPuntos = document.getElementById('puntos');
    const elSalud = document.getElementById('salud');
    const elOleada = document.getElementById('oleada');
    
    if (elPuntos) elPuntos.textContent = puntuacionActual.toString();
    if (elSalud) elSalud.textContent = Math.max(0, saludActual).toString();
    if (elOleada) elOleada.textContent = oleadaActual.toString();
}

// Función para estrellas de fondo espaciales
function crearEstrellas() {
    for (let i = 0; i < 50; i++) {
        add([
            circle(1),
            pos(rand(0, width()), rand(0, height())),
            color(255, 255, 255),
            opacity(rand(0.1, 0.3)),
            "estrella"
        ]);
    }
}

// Función reutilizable para crear sangre (partículas físicas simples)
function crearSangre(p: any) {
    for (let i = 0; i < 15; i++) {
        add([
            pos(p.x, p.y),
            circle(rand(3, 8)),
            color(139, 0, 0),
            anchor("center"),
            opacity(1),
            lifespan(1, { fade: 0.5 }),
            {
                vx: rand(-400, 400),
                vy: rand(-400, 400),
                update() {
                    (this as any).pos.x += (this as any).vx * dt();
                    (this as any).pos.y += (this as any).vy * dt();
                    (this as any).vx *= Math.pow(0.95, dt() * 60); 
                    (this as any).vy *= Math.pow(0.95, dt() * 60);
                }
            }
        ]);
    }
}

// === ESCENA PRINCIPAL DEL JUEGO ===
scene("juego", () => {
    crearEstrellas(); // Generamos el ambiente

    puntuacionActual = 0;
    saludActual = 100;
    oleadaActual = 1;
    actualizarInterfaz();

    let zombisAAparecer = 5;
    let zombisAparecidos = 0;

    // -- Jugador --
    const jugador = add([
        circle(25),
        pos(width() / 2, height() / 2),
        color(52, 152, 219),
        area(),
        anchor("center"),
        "jugador",
        { velocidad: 300 }
    ]);

    // Sistema de dibujo manual del arma y detalles del personaje
    jugador.onDraw(() => {
        const posicionRatonLocal = mousePos().sub(jugador.pos);
        
        // Arma apuntando hacia donde mira el usuario
        drawLine({
            p1: vec2(0, 0),
            p2: posicionRatonLocal,
            width: 3,
            color: rgb(41, 128, 185)
        });
        
        // Detalle encima del jugador (visor)
        drawCircle({
            pos: vec2(0, -5),
            radius: 5,
            color: rgb(41, 128, 185)
        });
    });

    // Movilidad atada a KAPLAY
    onKeyDown("w", () => { if (saludActual > 0) jugador.move(0, -(jugador as any).velocidad); });
    onKeyDown("s", () => { if (saludActual > 0) jugador.move(0, (jugador as any).velocidad); });
    onKeyDown("a", () => { if (saludActual > 0) jugador.move(-(jugador as any).velocidad, 0); });
    onKeyDown("d", () => { if (saludActual > 0) jugador.move((jugador as any).velocidad, 0); });
    onKeyDown("up", () => { if (saludActual > 0) jugador.move(0, -(jugador as any).velocidad); });
    onKeyDown("down", () => { if (saludActual > 0) jugador.move(0, (jugador as any).velocidad); });
    onKeyDown("left", () => { if (saludActual > 0) jugador.move(-(jugador as any).velocidad, 0); });
    onKeyDown("right", () => { if (saludActual > 0) jugador.move((jugador as any).velocidad, 0); });

    // Delimita el jugador a la pantalla
    jugador.onUpdate(() => {
        if (jugador.pos.x < 25) jugador.pos.x = 25;
        if (jugador.pos.y < 25) jugador.pos.y = 25;
        if (jugador.pos.x > width() - 25) jugador.pos.x = width() - 25;
        if (jugador.pos.y > height() - 25) jugador.pos.y = height() - 25;
    });

    // Acción Disparar
    onClick(() => {
        if (saludActual <= 0) return;
        
        const dir = mousePos().sub(jugador.pos).unit();
        
        // Efecto de cañonazo
        add([
            pos(jugador.pos),
            circle(rand(3, 7)),
            color(255, 255, 0),
            anchor("center"),
            opacity(1),
            lifespan(1, { fade: 0.5 }),
            {
                vx: dir.x * rand(100, 300) + rand(-100, 100),
                vy: dir.y * rand(100, 300) + rand(-100, 100),
                update() {
                    (this as any).pos.x += (this as any).vx * dt();
                    (this as any).pos.y += (this as any).vy * dt();
                    (this as any).vx *= Math.pow(0.95, dt() * 60); 
                    (this as any).vy *= Math.pow(0.95, dt() * 60);
                }
            }
        ]);

        // Generar Bala
        add([
            pos(jugador.pos),
            circle(6),
            color(255, 255, 0),
            area(),
            anchor("center"),
            move(dir, 900),
            offscreen({ destroy: true }),
            "bala"
        ]);
    });

    // -- Enemigos Zombi --
    function aparecerZombi() {
        const lado = Math.floor(rand(0, 4));
        let x, y;

        if (lado === 0) { x = rand(0, width()); y = -50; }
        else if (lado === 1) { x = width() + 50; y = rand(0, height()); }
        else if (lado === 2) { x = rand(0, width()); y = height() + 50; }
        else { x = -50; y = rand(0, height()); }

        const tamano = rand(40, 60);
        const saludBase = 2 + Math.floor(oleadaActual / 3);

        add([
            circle(tamano / 2),
            pos(x, y),
            color(74, 124, 89),
            area(),
            anchor("center"),
            "zombi",
            {
                saludMaxima: saludBase,
                puntosDeSalud: saludBase,
                velocidad: 30 + rand(0, 18) + oleadaActual * 3,
                temporizadorGolpe: 0,
                tamanoZ: tamano
            }
        ]);
    }

    // Temporizador continuo para lanzar la oleada
    loop(1, () => {
        if (zombisAparecidos < zombisAAparecer) {
            aparecerZombi();
            zombisAparecidos++;
        }
    });

    // Monitorear y subir la oleada
    onUpdate(() => {
        if (zombisAparecidos === zombisAAparecer && get("zombi").length === 0) {
            oleadaActual++;
            zombisAAparecer = 5 + oleadaActual * 3;
            zombisAparecidos = 0;
            saludActual = Math.min(100, saludActual + 20);
            actualizarInterfaz();
        }
    });

    // Lógica Zombi: Seguir al jugador y colorear
    onUpdate("zombi", (z: any) => {
        const dir = jugador.pos.sub(z.pos).unit();
        z.move(dir.scale(z.velocidad));

        if (z.temporizadorGolpe > 0) {
            z.temporizadorGolpe -= dt();
            z.color = rgb(255, 255, 255); // Destello de daño activo
        } else {
            z.color = rgb(74, 124, 89);
        }

        // Intersección con el personaje manualmente para mejor control del ritmo:
        if (jugador.pos.dist(z.pos) < 25 + z.tamanoZ / 2) {
            saludActual -= 10;
            z.destroy();
            crearSangre(jugador.pos);
            actualizarInterfaz();

            if (saludActual <= 0) {
                terminarJuego();
            }
        }
    });

    // Recrear detalles gráficos del zombi (barra de vida, forma, etc.)
    onDraw("zombi", (z: any) => {
        const colorOjo = z.temporizadorGolpe > 0 ? rgb(255, 0, 0) : rgb(45, 74, 62);
        drawCircle({ pos: vec2(-8, -5), radius: 6, color: colorOjo });
        drawCircle({ pos: vec2(8, -5), radius: 6, color: colorOjo });

        drawCircle({ pos: vec2(-8, -5), radius: 3, color: rgb(26, 26, 46) });
        drawCircle({ pos: vec2(8, -5), radius: 3, color: rgb(26, 26, 46) });

        drawRect({
            pos: vec2(-10, 8),
            width: 20,
            height: 6,
            color: rgb(139, 0, 0)
        });

        drawRect({
            pos: vec2(-3, 15),
            width: 6,
            height: 15,
            color: rgb(51, 51, 51)
        });

        // Trazar barra de vida del zombi flotante
        const porcentajeSalud = z.puntosDeSalud / z.saludMaxima;
        const posicionYSalud = -z.tamanoZ / 2 - 10;
        
        drawRect({ pos: vec2(-z.tamanoZ / 2, posicionYSalud), width: z.tamanoZ, height: 5, color: rgb(51, 51, 51) });

        let colorSalud = rgb(0, 255, 0);
        if (porcentajeSalud <= 0.25) colorSalud = rgb(255, 0, 0);
        else if (porcentajeSalud <= 0.5) colorSalud = rgb(255, 255, 0);
        
        drawRect({ pos: vec2(-z.tamanoZ / 2, posicionYSalud), width: z.tamanoZ * porcentajeSalud, height: 5, color: colorSalud });
    });

    // Detección de Colisión Bala -> Zombi
    onCollide("bala", "zombi", (b: any, z: any) => {
        if (b.haColisionado === z.id) return; 
        b.haColisionado = z.id;
        
        b.destroy();
        z.puntosDeSalud--;
        z.temporizadorGolpe = 0.1;

        if (z.puntosDeSalud <= 0) {
            crearSangre(z.pos);
            z.destroy();
            puntuacionActual += 10;
            actualizarInterfaz();
        }
    });
});

// === ESCENAS DE MENÚS SECUNDARIAS ===
scene("inicio", () => {
    crearEstrellas();
});

scene("finDelJuego", () => {
    crearEstrellas();
});

// Iniciar suspendido a la espera del botón JUGAR en el html
go("inicio");

// === EVENTOS DEL DOM ===
function iniciarJuego() {
    const elInicio = document.getElementById('pantallaInicio');
    const elFin = document.getElementById('finDeJuego');
    if (elInicio) elInicio.style.display = 'none';
    if (elFin) elFin.style.display = 'none';
    go("juego");
}

function terminarJuego() {
    const puntFinal = document.getElementById('puntuacionFinal');
    const elFin = document.getElementById('finDeJuego');
    if (puntFinal) puntFinal.textContent = puntuacionActual.toString();
    if (elFin) elFin.style.display = 'block';
    go("finDelJuego"); // Corta la ejecución de la partida
}

// Bindeo de eventos UI
document.getElementById('btnIniciar')?.addEventListener('click', iniciarJuego);
document.getElementById('btnReiniciar')?.addEventListener('click', iniciarJuego);