document.addEventListener('DOMContentLoaded', function () {
    //FUNCIONES ----------------------------------------------------------------------------------------
    function analizarLexico(texto) {
        const tokens = [];
        const errores = [];
        let lineaActual = 1;
        let indexLineaActual = 0; // Indica el índice del inicio de la línea actual en el texto completo
        //AGREGAR TOKENS
        const regexPatterns = [
            { tipo: 'comentarios', regex: /\/\/[^\n]*\n?/g }, // Asegúrate de que la regex maneja los comentarios correctamente
            { tipo: 'nuevaLinea', regex: /(\r\n|\n|\r)/g }, // Asegúrate de manejar nuevaLinea antes que otros tokens
            { tipo: 'T_PalabrasClave', regex: /\b(BANDERIN|ANOTAR|ARBITRO|DELANTERO|GOL|TECNICO|PARTIDO|VASCULACION|DISPARO|VAR|TIRO|VOLANTE|CAMISOLA|PENALTI|TARJETA_ROJA|TARJETA_AMARILLA|EXTREMO|REMATE|ALCANSA_BOLA|SAQUE_DE_ESQUINA|DEFENSA|SAQUE_DE_PORTERIA|PORTERO|LOCAL|CONTRATACION|FISICO|BANCA|CONTRA_ATAQUE|CENTROCAMPISTA|BLOQUEO|MARCAR|GOL_OLIMPICO|JUGADA|PELOTA|ESQUINA|CABEZAZO|BICICLETA|REPETIR|FORMACION|CARRERA)\b/g },
            { tipo: 'T_OpeLogicos', regex: /\b(DOBLETE|SOLO|GOL_ANULADO|MANO_A_MANO)\b/g },
            { tipo: 'T_SentenciaControl', regex: /\b(PASE|RECHAZO|PASE_FILTRADO|OPCION|FALTA|DEFECTO)\b/g },
            { tipo: 'T_Ciclos', regex: /\b(DRIBLE|REGATEO|TIRO_REGATEO)\b/g },
            { tipo: 'T_ModifAcceso', regex: /\b(PLANTILLA|BANCA|NO_CONVOCADO|LESIONADO)\b/g },
            { tipo: 'numeros', regex: /\b\d+\b/g },
            { tipo: 'Operador_de_asignacion', regex: /(?:\+=|-=|\*=|\/=|%=|<<=|>>=|>>>=|&=|\|=|\^=)/g },
            { tipo: 'Operador_Aritmetico', regex: /(?:\*|\+|-|\/|%)|\b(?:\*|\+|-|\/|%)\b/g },
            { tipo: 'Operador_Logico', regex: /\b(DOBLETE|SOLO|GOL_ANULADO|MANO_A_MANO)\b/g },
            { tipo: 'Operador_Relacional', regex: /(?:>=|<=|==|!=|>|<)/g },
            { tipo: 'identificadores', regex: /\b[a-zA-Z][_a-zA-Z0-9]*\b/g },
            { tipo: 'mensajeSalida', regex: /"[^"]*"/g },  // Añadir esta nueva línea para manejar los mensajes de salida entre comillas
            { tipo: 'Llave_de_apertura', regex: /\{/g },
            { tipo: 'Llave_de_cierre', regex: /\}/g },
            { tipo: 'Parentesis_Apertura', regex: /\(/g },
            { tipo: 'Parentesis_Cierre', regex: /\)/g },
            { tipo: 'PuntoyComa', regex: /\;/g },
            { tipo: 'DosPuntos', regex: /\:/g },
            { tipo: 'SignoIgual', regex: /\=/g },
            { tipo: 'Punto', regex: /\./g },
            { tipo: 'Coma', regex: /\,/g },
            { tipo: 'Corchete_Apertura', regex: /\[/g },
            { tipo: 'Corchete_Cierre', regex: /\]/g }

        ];

        let pos = 0;
        let lastPos = 0;

        while (pos < texto.length) {
            console.log(`Inicio del bucle - pos: ${pos}, lastPos: ${lastPos}, indexLineaActual: ${indexLineaActual}, lineaActual: ${lineaActual}`);
            let match = null;
            let matchLength = 0;

            regexPatterns.forEach(pattern => {
                pattern.regex.lastIndex = pos;
                const found = pattern.regex.exec(texto);
                if (found && (!match || found.index < match.index)) {
                    match = found;
                    match.type = pattern.tipo;
                    matchLength = found[0].length;
                }
            });
            //INICIO COLORACION
            let startCh = match.index - indexLineaActual; // Posición de inicio relativa al inicio de la línea
            let endCh = startCh + match[0].length; // Posición de final relativa al inicio de la línea
            let from = { line: lineaActual - 1, ch: startCh };
            let to = { line: lineaActual - 1, ch: endCh };
            console.log(`from: ${from} , to: ${to}`);
            if (match) {
                console.log(`Match encontrado - Tipo: ${match.type}, Valor: ${match[0]}, startCh: ${startCh}, endCh: ${endCh}`);
                if (match.index > lastPos) {
                    // Hay texto que no coincide entre lastPos y match.index
                    const unknownText = texto.substring(lastPos, match.index).trim();
                    if (unknownText) {
                        errores.push({ linea: lineaActual, tipo: "Símbolo o letra no reconocido", valor: unknownText });
                        // Resaltar la línea que contiene el error
                        editor.addLineClass(lineaActual - 1, 'background', 'linea-con-error');
                    }
                }
                if (match.type === 'nuevaLinea') {
                    console.log(`Antes del salto de línea - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                    lineaActual++;
                    indexLineaActual = pos + matchLength; // Actualizar el índice del inicio de la nueva línea
                    console.log(`Después del salto de línea - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                } else if (match.type === 'identificadores') {
                    const resultadoVerificacion = verificarPalabraReservadaMalEscrita(match[0]);
                    if (resultadoVerificacion.esMalEscrita) {
                        errores.push({ linea: lineaActual, tipo: "Palabra reservada mal escrita", valor: match[0] });
                        editor.addLineClass(lineaActual - 1, 'background', 'linea-con-error');
                    } else {
                        tokens.push({ tipo: match.type, valor: match[0].trim(), linea: lineaActual });
                    }
                } else {
                    tokens.push({ tipo: match.type, valor: match[0].trim(), linea: lineaActual });
                    if (match.type === 'comentarios') {
                        console.log(`Antes del comentario - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                        lineaActual++;
                        indexLineaActual = pos + matchLength + 8; // Actualizar el índice del inicio de la nueva línea
                        editor.markText(from, to, { className: 'comentario' });
                        console.log(`Después del comentario - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                        //COLORACION PALABRAS RESERVADAS
                    } else if (match.type === 'T_PalabrasClave' || match.type === 'T_OpeLogicos' || match.type === 'T_SentenciaControl' || match.type === 'T_Ciclos' || match.type === 'T_ModifAcceso') {
                        editor.markText(from, to, { className: 'palabraReservada' });
                    } else if (match.type === 'numeros') {
                        editor.markText(from, to, { className: 'numero' });
                    } else if (match.type === 'mensajeSalida') {
                        editor.markText(from, to, { className: 'mensajeSalida' });
                    } else if (match.type === 'Operador_de_asignacion') {
                        editor.markText(from, to, { className: 'simbolo' });
                    } else if (match.type === 'Operador_Aritmetico') {
                        editor.markText(from, to, { className: 'simbolo' });
                    } else if (match.type === 'Operador_Logico') {
                        editor.markText(from, to, { className: 'simbolo' });
                    } else if (match.type === 'Operador_Relacional' || match.type === 'Llave_de_apertura' || match.type === 'Llave_de_cierre' || match.type === 'Parentesis_Apertura' || match.type === 'Parentesis_Cierre' || match.type === 'PuntoyComa' || match.type === 'Punto' || match.type === 'DosPuntos' || match.type === 'SignoIgual'||match.type === 'Coma'|| match.type === 'Corchete_Apertura' || match.type === 'Corchete_Cierre') {
                        editor.markText(from, to, { className: 'simbolo' });
                    }
                }
                pos = lastPos = match.index + matchLength;
            } else {
                pos++;
            }
            console.log(`Fin del bucle - pos: ${pos}, lastPos: ${lastPos}`);
        }

        // Verificar si hay texto no reconocido al final del archivo
        if (lastPos < texto.length) {
            const unknownText = texto.substring(lastPos).trim();
            if (unknownText) {
                errores.push({ linea: lineaActual, tipo: "Símbolo o letra no reconocido", valor: unknownText });
            }
        }

        return { tokens, errores };
    }
    // Agregar la lista de palabras reservadas completas
    const palabrasReservadas = ['BANDERIN', 'ANOTAR', 'DELANTERO', 'GOL', 'TECNICO', 'PARTIDO', 'VASCULACION', 'DISPARO', 'VAR', 'TIRO', 'VOLANTE', 'CAMISOLA', 'PENALTI', 'TARJETA_ROJA', 'TARJETA_AMARILLA', 'EXTREMO', 'REMATE', 'ALCANSA_BOLA', 'SAQUE_DE_ESQUINA', 'DEFENSA', 'SAQUE_DE_PORTERIA', 'PORTERO', 'LOCAL', 'CONTRATACION', 'FISICO', 'BANCA', 'CONTRA_ATAQUE', 'CENTROCAMPISTA', 'BLOQUEO', 'MARCAR', 'GOL_OLIMPICO', 'JUGADA', 'PELOTA', 'ESQUINA', 'CABEZAZO', 'BICICLETA', 'REPETIR', 'FORMACION', 'CARRERA', 'DOBLETE', 'SOLO', 'GOL_ANULADO', 'MANO_A_MANO', 'PASE', 'RECHAZO', 'PASE_FILTRADO', 'OPCION', 'FALTA', 'DEFECTO', 'DRIBLE', 'REGATEO', 'TIRO_REGATEO', 'PLANTILLA', 'BANCA', 'NO_CONVOCADO', 'LESIONADO'];
    // Función para calcular la distancia de Levenshtein
    function levenshtein(a, b) {
        const matrix = [];
        let i, j;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        for (i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Función para verificar si una palabra se parece a alguna palabra reservada
    function verificarPalabraReservadaMalEscrita(palabra) {
        let mejorSimilitud = Infinity;
        let palabraCercana = '';

        palabrasReservadas.forEach(reservada => {
            const distancia = levenshtein(palabra, reservada);
            const longitudMaxima = Math.max(palabra.length, reservada.length);
            const similitud = 1 - distancia / longitudMaxima;

            if (similitud >= 0.75) {
                if (distancia < mejorSimilitud) {
                    mejorSimilitud = distancia;
                    palabraCercana = reservada;
                }
            }
        });

        if (mejorSimilitud !== Infinity) {
            return { esMalEscrita: true, cercana: palabraCercana };
        }

        return { esMalEscrita: false };
    }

    function updateTokenTable(tokens) {
        var tbody = document.getElementById('tokenTableBody');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos tokens

        tokens.forEach(function (token) {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td>${token.linea}</td><td>${token.valor}</td><td>${token.tipo}</td><td>${token.valor}</td>`;
            tbody.appendChild(tr);
        });
    }

    function updateErrorTable(errores) {
        var tbody = document.getElementById('errorTableBody');
        tbody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos errores

        errores.forEach(function (error) {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td>${error.linea}</td><td>${error.tipo}</td><td>${error.valor}</td>`;
            tbody.appendChild(tr);
        });
    }

    //FIN FUNCIONES -----------------------------------------------------------------------------------
    //BOTONES -----------------------------------------------------------------------------------------
    // BOTON ANALIZADOR LEXICO
    document.getElementById('lexicalAnalysisButton').addEventListener('click', function () {
        for (let i = 0; i < editor.lineCount(); i++) {
            editor.removeLineClass(i, 'background', 'linea-con-error');
        }

        const codigo = editor.getValue();
        const resultado = analizarLexico(codigo);
        console.log("Análisis léxico completado.");
        alert("Análisis léxico completado.");
        window.tokensGlobal = resultado.tokens; // Guardar tokens en una variable global
        window.erroresLexicosGlobal = resultado.errores; // Guardar errores en una variable global
    });

    //BOTON TABLA DE ERRORES
    document.getElementById('displayErrorTableButton').addEventListener('click', function () {
        if (!window.erroresLexicosGlobal || window.erroresLexicosGlobal.length === 0) {
            alert("No hay errores para mostrar. Por favor, realiza primero el análisis léxico.");
            return;
        }
        updateErrorTable(window.erroresLexicosGlobal);
        document.getElementById('errorTableModal').style.display = 'block';  // Mostrar la tabla
    });

    //BOTON TABLA DE TOKENS
    document.getElementById('displayTokenTableButton').addEventListener('click', function () {
        if (!window.tokensGlobal || window.tokensGlobal.length === 0) {
            alert("No hay tokens para mostrar. Por favor, realiza primero el análisis léxico.");
            return;
        }
        updateTokenTable(window.tokensGlobal);
        document.getElementById('tokenTableModal').style.display = 'block';  // Mostrar la tabla
    });

    //BOTON ANALISIS SINTACTICO
    document.getElementById('syntaxAnalysisButton').addEventListener('click', function () {
        console.log("Análisis Sintáctico activado");
        alert("Análisis Sintáctico activado");
    });

    //FIN BOTONES---------------------------------------------------------------------------------------

});