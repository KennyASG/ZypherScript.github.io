
function analizarSintactico(tokens) {
    const erroresSintacticos = [];
    let i = 0;

    function esperar(tipo) {
        if (tokens[i] && tokens[i].tipo === tipo) {
            i++;
        } else {
            erroresSintacticos.push({
                tipo: 'Sintáctico',
                mensaje: `Se esperaba ${tipo} en lugar de ${tokens[i] ? tokens[i].tipo : 'EOF'}`,
                linea: tokens[i] ? tokens[i].linea : 'EOF'
            });
        }
    }

    while (i < tokens.length) {
        if (tokens[i].tipo === 'T_PalabrasClave' && tokens[i].valor === 'BANDERIN') {
            i++;
            esperar('identificadores');
            esperar('Operador_de_asignacion');
            esperar('numeros');
            esperar('PuntoyComa');
        } else {
            erroresSintacticos.push({
                tipo: 'Sintáctico',
                mensaje: `Declaración inválida`,
                linea: tokens[i].linea
            });
            i++;
        }
    }

    return erroresSintacticos;
}

function mostrarErroresSintacticos(errores) {
    const cuerpoTabla = document.getElementById('errorTableBody');
    cuerpoTabla.innerHTML = '';
    errores.forEach(error => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${error.linea}</td><td>${error.tipo}</td><td>${error.mensaje}</td>`;
        cuerpoTabla.appendChild(fila);
    });
}
