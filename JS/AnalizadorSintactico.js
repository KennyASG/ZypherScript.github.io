// JS/AnalizadorSintactico.js
function analizarSintactico(tokens) {
    const erroresSintacticos = [];
    let i = 0;

    function esperar(tipo, valor = null) {
        if (tokens[i] && tokens[i].tipo === tipo && (valor === null || tokens[i].valor === valor)) {
            i++;
        } else {
            erroresSintacticos.push({
                tipo: 'Sintáctico',
                mensaje: `Se esperaba ${tipo}${valor ? ' (' + valor + ')' : ''} en lugar de ${tokens[i] ? tokens[i].tipo + ' (' + tokens[i].valor + ')' : 'EOF'}`,
                linea: tokens[i] ? tokens[i].linea : 'EOF'
            });
        }
    }

    function analizarClase() {
        esperar('T_ModifAcceso', 'PLANTILLA');
        esperar('T_PalabrasClave', 'PARTIDO');
        esperar('identificadores');
        esperar('Llave_de_apertura');
        while (tokens[i] && tokens[i].tipo !== 'Llave_de_cierre') {
            analizarMetodo();
        }
        esperar('Llave_de_cierre');
    }

    function analizarMetodo() {
        esperar('T_ModifAcceso', 'PLANTILLA');
        esperar('T_PalabrasClave', 'BLOQUEO');
        esperar('identificadores');
        esperar('Parentesis_Apertura');
        if (tokens[i] && tokens[i].tipo === 'identificadores') {
            esperar('identificadores');
            esperar('Parentesis_Cierre');
        } else {
            esperar('Parentesis_Cierre');
        }
        esperar('Llave_de_apertura');
        while (tokens[i] && tokens[i].tipo !== 'Llave_de_cierre') {
            analizarSentencia();
        }
        esperar('Llave_de_cierre');
    }

    function analizarSentencia() {
        if (tokens[i].tipo === 'T_PalabrasClave') {
            switch (tokens[i].valor) {
                case 'VOLANTE':
                    esperar('T_PalabrasClave', 'VOLANTE');
                    esperar('identificadores');
                    esperar('SignoIgual');
                    esperar('numeros');
                    esperar('PuntoyComa');
                    break;
                case 'DISPARO':
                    esperar('T_PalabrasClave', 'DISPARO');
                    esperar('mensajeSalida');
                    esperar('PuntoyComa');
                    break;
                case 'VAR':
                    esperar('T_PalabrasClave', 'VAR');
                    esperar('identificadores');
                    esperar('PuntoyComa');
                    break;
                case 'PASE_FILTRADO':
                    esperar('T_PalabrasClave', 'PASE_FILTRADO');
                    esperar('Parentesis_Apertura');
                    esperar('identificadores');
                    esperar('Parentesis_Cierre');
                    esperar('Llave_de_apertura');
                    while (tokens[i] && tokens[i].tipo !== 'Llave_de_cierre') {
                        analizarCaso();
                    }
                    esperar('Llave_de_cierre');
                    break;
                default:
                    erroresSintacticos.push({
                        tipo: 'Sintáctico',
                        mensaje: `Sentencia desconocida ${tokens[i].valor}`,
                        linea: tokens[i].linea
                    });
                    i++;
            }
        } else {
            erroresSintacticos.push({
                tipo: 'Sintáctico',
                mensaje: `Sentencia inválida`,
                linea: tokens[i].linea
            });
            i++;
        }
    }

    function analizarCaso() {
        if (tokens[i].tipo === 'T_SentenciaControl') {
            esperar('T_SentenciaControl');
            esperar('numeros');
            esperar('DosPuntos');
            while (tokens[i] && tokens[i].tipo !== 'T_SentenciaControl' && tokens[i].tipo !== 'Llave_de_cierre') {
                analizarSentencia();
            }
        } else if (tokens[i].tipo === 'T_ModifAcceso' && tokens[i].valor === 'NO_CONVOCADO') {
            esperar('T_ModifAcceso', 'NO_CONVOCADO');
            esperar('DosPuntos');
            while (tokens[i] && tokens[i].tipo !== 'T_SentenciaControl' && tokens[i].tipo !== 'Llave_de_cierre') {
                analizarSentencia();
            }
        } else {
            erroresSintacticos.push({
                tipo: 'Sintáctico',
                mensaje: `Caso de sentencia inválida`,
                linea: tokens[i].linea
            });
            i++;
        }
    }

    if (tokens.length > 0) {
        analizarClase();
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
