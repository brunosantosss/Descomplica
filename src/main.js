const button = document.querySelector('button');
const text = document.querySelector('.text');

const Recognition = initRecognition(); // inicializo o recognition.
var Listening = false; // flag controladora. que diz se o sistema está ou não escutando.

button.addEventListener('click', (e) => {
    if(!Recognition) return;

    Listening ? Recognition.stop() : Recognition.start();
    
    button.innerHTML = Listening ? 'Pressione para falar' : 'Pressione para parar';

    button.classList.toggle("bg-indigo-500");
    button.classList.toggle("bg-red-600");
})

function initRecognition() {  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const gRecognition = SpeechRecognition !== undefined ? new SpeechRecognition() : null;

    if(!gRecognition) {
        text.innerHTML("Infelizmente seu navegador não possui compatibilidade com a API SpeechRecogninition :(");
        return null;
    }

    gRecognition.lang = "pt_BR";
    gRecognition.onstart = () => Listening = true;
    gRecognition.onend = () => Listening = false;
    gRecognition.onerror = (e) => console.log(`SpeechRecognition ERROR: ${e}`);
    gRecognition.onresult = (e) => text.innerHTML = e.results[0][0].transcript;

    return gRecognition;
}


// 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