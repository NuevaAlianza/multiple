document.addEventListener('DOMContentLoaded', () => {
    const temasSelector = document.getElementById('temas');
    const cargarButton = document.getElementById('cargar');
    const preguntaDiv = document.getElementById('pregunta');
    const textoPregunta = document.getElementById('textoPregunta');
    const temaPregunta = document.getElementById('temaPregunta');
    const barra = document.getElementById('barra');
    const respuestasDiv = document.querySelector('.respuestas');
    const verRespuestaButton = document.getElementById('verRespuesta');
    const contadorPreguntas = document.getElementById('contadorPreguntas');
    const numPreguntasRestantes = document.getElementById('numPreguntasRestantes');
    
    let preguntas = [];
    let preguntasRestantes = 0;
    let respuestaCorrecta = '';
    let timer;
    let segundos = 58;
    
    // Cargar los temas desde el CSV
    const cargarTemas = async () => {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTd4xuQkipHXpfuxm5Zk3nxCdIdpRUxAQcfyQuk2BLPHzNVXgEe-CX6PR4D_ueCWFvcGDSrGvTrlyRt/pub?output=csv');
        const data = await response.text();
        const lines = data.split('\n');
        const temasSet = new Set();
        lines.forEach(line => {
            const cols = line.split(',');
            if (cols[2]) temasSet.add(cols[2]);
        });
        temasSet.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.innerText = tema;
            temasSelector.appendChild(option);
        });
    };
    
    cargarTemas();  // Llamada inicial para cargar los temas.
    
    // Cargar preguntas al hacer clic en "Cargar preguntas"
    cargarButton.addEventListener('click', () => {
        const temasSeleccionados = Array.from(temasSelector.selectedOptions).map(o => o.value);
        if (temasSeleccionados.length === 0) {
            alert('Por favor selecciona al menos un tema.');
            return;
        }
        
        preguntas = [];
        preguntasRestantes = 0;
        temasSeleccionados.forEach(tema => {
            fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTd4xuQkipHXpfuxm5Zk3nxCdIdpRUxAQcfyQuk2BLPHzNVXgEe-CX6PR4D_ueCWFvcGDSrGvTrlyRt/pub?output=csv`)
                .then(response => response.text())
                .then(data => {
                    const lines = data.split('\n');
                    lines.forEach(line => {
                        const cols = line.split(',');
                        if (cols[2] === tema) {
                            preguntas.push({
                                pregunta: cols[0],
                                respuestaCorrecta: cols[1],
                                respuestas: [cols[1], cols[3], cols[4], cols[5]].sort(() => Math.random() - 0.5),
                                tema: cols[2]
                            });
                        }
                    });
                    if (preguntasRestantes === 0) {
                        preguntasRestantes = preguntas.length;
                        numPreguntasRestantes.innerText = preguntasRestantes;
                        mostrarPregunta();
                    }
                });
        });
    });
    
    // Mostrar la siguiente pregunta
    const mostrarPregunta = () => {
        if (preguntasRestantes > 0) {
            const preguntaActual = preguntas[preguntas.length - preguntasRestantes];
            textoPregunta.innerText = preguntaActual.pregunta;
            temaPregunta.innerText = preguntaActual.tema;
            respuestasDiv.innerHTML = '';
            preguntaActual.respuestas.forEach(respuesta => {
                const div = document.createElement('div');
                div.classList.add('respuesta-option');
                div.innerText = respuesta;
                div.addEventListener('click', () => verificarRespuesta(respuesta, preguntaActual.respuestaCorrecta));
                respuestasDiv.appendChild(div);
            });
            
            // Iniciar barra de cuenta regresiva
            iniciarBarra();
            contadorPreguntas.classList.remove('oculto');
            numPreguntasRestantes.innerText = --preguntasRestantes;
        } else {
            alert('¡No hay más preguntas!');
        }
    };
    
    // Función para verificar si la respuesta es correcta
    const verificarRespuesta = (respuesta, respuestaCorrecta) => {
        if (respuesta === respuestaCorrecta) {
            alert('¡Correcto!');
        } else {
            alert('Incorrecto. La respuesta correcta es: ' + respuestaCorrecta);
        }
        mostrarPregunta();
    };
    
    // Iniciar la barra de cuenta regresiva
    const iniciarBarra = () => {
        let tiempo = 58;
        barra.style.width = '100%';
        barra.style.backgroundColor = 'green';
        
        timer = setInterval(() => {
            tiempo--;
            barra.style.width = (tiempo / 58) * 100 + '%';
            
            if (tiempo <= 20) barra.style.backgroundColor = 'orange';
            if (tiempo <= 10) barra.style.backgroundColor = 'red';
            
            if (tiempo <= 0) {
                clearInterval(timer);
                mostrarPregunta();
            }
        }, 1000);
    };
});
