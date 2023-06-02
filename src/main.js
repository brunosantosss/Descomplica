/*
    Definition of variables.
    question_area = get the value of the textarea ("Qual sua dúvida?").
    chat_area = conversation field between machine and user.
    btn_mic = get microphone button
    Recognition = initialize the initRecognition class for voice recognition
*/

const btn_mic = document.getElementById('robot-microfone');
const Recognition = initRecognition(); 
var Listening = false; 

btn_mic.addEventListener('click', (e) => {
    if(!Recognition) return;

    if(Listening) {
        Recognition.stop();
    } 
    else if(Recognition) {
        Recognition.start();
    }
    else {
        Recognition.start();
    }
    console.log("Test");
});

/*
    Creation of Functions
*/

function initRecognition() {  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const gRecognition = SpeechRecognition !== undefined ? new SpeechRecognition() : null;

    if(!gRecognition) {
        alert("Infelizmente seu navegador atual não possui suporte ao uso de Microfone. Tente utilizar o campo de digitação");
        return null;
    }

    gRecognition.lang = "pt_BR";
    gRecognition.onstart = () => Listening = true;
    gRecognition.onend = () => Listening = false;
    gRecognition.onerror = (e) => console.log(`SpeechRecognition ERROR: ${e}`);
    gRecognition.onresult = (e) => {
        SendQuestion(e.results[0][0].transcript);        
    };
    
    return gRecognition;
}

async function SendQuestion(question) {
    
    if(!question)
        return writeConversation("Desculpe, não consegui entender");

    await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer API_KEY",
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: question,
            max_tokens: 1512, // tamanho da resposta
            temperature: 1, // criatividade na resposta
        }),
    })
    .then((response) => response.json())
    .then((json) => {
        console.log(json)
        if (json.error?.message) writeConversation("Aconteceu algum problema, infelizmente não consegui obter uma resposta para sua pergunta.");

        else if (json.choices?.[0].text) {
            var response = json.choices[0].text || "Não consegui achar uma respota para sua dúvida.";

            writeConversation(response);
            console.log(response);
    }

    })
}

function writeConversation(text) {
    if ("speechSynthesis" in window) {
        var SSU = new SpeechSynthesisUtterance();
        var vozes = speechSynthesis.getVoices();
        SSU.text = text;
        SSU.volume = 1; 
        SSU.rate = 1; 
        SSU.pitch = 1; 
        SSU.voice = vozes[1]; 

        speechSynthesis.speak(SSU);
    } 

}
