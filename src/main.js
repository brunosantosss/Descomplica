const OPENAI_API_KEY = "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";
const question_area = document.getElementById('question_area');
const chat_area = document.getElementById('chat-area');

// Usando o campo de digitação
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
        
        sQuestion = question_area.value;
        SendQuestion();
    }
});

// Usando o microfone
const btn_mic = document.getElementById('btn_mic');
const Recognition = initRecognition(); // inicializo o recognition.
var Listening = false; // flag controladora. que diz se o sistema está ou não escutando.

var sQuestion;

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
    gRecognition.onresult = (e) => {
        sQuestion = e.results[0][0].transcript;

        if(sQuestion)
            return SendQuestion();
            
        chat_area.value += `Descomplica:   Desculpe, não entendi :(\n\n`
    };

    return gRecognition;
}

function SendQuestion() {
    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_API_KEY,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: sQuestion,
            max_tokens: 2048, // tamanho da resposta
            temperature: 1, // criatividade na resposta
        }),
    })
    .then((response) => response.json())
    .then((json) => {
      if (chat_area.value) chat_area.value += "\n";

      if (json.error?.message) chat_area.value += `Infelizmente aconteceu algum erro :(\nError CODE: ${json.error.message}`;

      else if (json.choices?.[0].text) {
        var text = json.choices[0].text || "";
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

  chat_area.value += `Você:   ${sQuestion}` + '\n\n';
  question_area.value = "Gerando resposta..";
  question_area.disabled = true;

  chat_area.scrollTop = chat_area.scrollHeight;
}