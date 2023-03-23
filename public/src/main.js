/*
    Definition of variables.
    question_area = get the value of the textarea ("Qual sua dúvida?").
    chat_area = conversation field between machine and user.
    btn_mic = get microphone button
    Recognition = initialize the initRecognition class for voice recognition
*/
const question_area = document.getElementById('question_area');
const chat_area = document.getElementById('chat-area');
const btn_mic = document.getElementById('btn_mic');
const Recognition = initRecognition(); 
var Listening = false; 

question_area.addEventListener("keypress", (e) => {
    var initial_container = document.getElementById('initial-container');
    var chat_area = document.getElementById('chat-area');

    if(question_area.value && e.key === "Enter") {
        initial_container.classList.add("hide");

        setTimeout(() => {
            initial_container.classList.add("hidden");
            chat_area.classList.remove("hidden");
            chat_area.classList.add("block");
        }, 600);
        
        SendQuestion(question_area.value);
    }
});

btn_mic.addEventListener('click', (e) => {
    if(!Recognition) return;
    
    var mic_text = document.getElementById("mic-text");

    if(Listening) {
        var initial_container = document.getElementById('initial-container');
        var chat_area = document.getElementById('chat-area');
        mic_text.innerHTML = 'Clique no Microfone falar';
        Recognition.stop();
        
        initial_container.classList.add("hide");

        setTimeout(() => {
            initial_container.classList.add("hidden");
            chat_area.classList.remove("hidden");
            chat_area.classList.add("block");
        }, 600);
    } 
    else if(Recognition) {
        mic_text.innerHTML = 'Clique no Microfone parar de falar';
        Recognition.start();
    }
    else {
        mic_text.innerHTML = 'Clique no Microfone parar de falar';
        Recognition.start();
    }
});

/*
    Creation of Functions
*/

function initRecognition() {  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const gRecognition = SpeechRecognition !== undefined ? new SpeechRecognition() : null;

    if(!gRecognition) {
        alert("Infelizmente seu navegador atual não possui suporte ao uso de Microfone. Tente utilizar o campo de digitação")
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

function SendQuestion(question) {
    
    if(!question)
        return chat_area.value += `Descomplica:   Desculpe, não entendi :(\n\n`

    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + "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",
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: question,
            max_tokens: 2048, // tamanho da resposta
            temperature: 1, // criatividade na resposta
        }),
    })
    .then((response) => response.json())
    .then((json) => {
      if (chat_area.value) chat_area.value += "\n";

      if (json.error?.message) chat_area.value += `Infelizmente aconteceu algum erro.`;

      else if (json.choices?.[0].text) {
        var text = json.choices[0].text || "Não consegui achar uma respota para sua dúvida :(";
        chat_area.value += `Descomplica:   ${text}`;
      }

      chat_area.scrollTop = chat_area.scrollHeight;
    })
    .finally(() => {
      question_area.value = "";
      question_area.disabled = false;
      question_area.focus();
    });

  if (chat_area.value) chat_area.value += "\n\n";

  chat_area.value += `Você:   ${question}` + '\n\n';
  question_area.value = "Gerando resposta..";
  question_area.disabled = true;

  chat_area.scrollTop = chat_area.scrollHeight;
}