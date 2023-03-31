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
        mic_text.innerHTML = 'Clique no Microfone para falar';
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
        return writeConversation("Desculpa, não consegui entender :(", true);

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
      if (json.error?.message) writeConversation("Infelizmente aconteceu algum erro.", true);

      else if (json.choices?.[0].text) {
        var text = json.choices[0].text || "Não consegui achar uma respota para sua dúvida :(";
        writeConversation(text, true);
      }

      chat_area.scrollTop = chat_area.scrollHeight;
    })
    .finally(() => {
      question_area.value = "";
      question_area.disabled = false;
      question_area.focus();
    });

  question_area.value = "Gerando resposta..";
  question_area.disabled = true;
  
  writeConversation(question, false);
  chat_area.scrollTop = chat_area.scrollHeight;
}

function writeConversation(text, ia) {
    if(ia) {
        const ia_div = document.createElement('div');
        ia_div.classList.add("ia-div");
        ia_div.innerHTML = `Descomplica: <br><br>${text}`;
        chat_area.appendChild(ia_div);
    } 
    else {
        const person_div = document.createElement('div');
        person_div.classList.add("person-div");
        person_div.innerHTML = `Você:   ${text}`;
        chat_area.appendChild(person_div);
    }
}