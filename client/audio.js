//can't use iffy b/c stops recording


//let socket = io.connect();
var socket = wsEvents(new WebSocket('ws://localhost:3000'));


/////////////////TEST IF AUDIO WORKS IN BROWSER//////////
window.SpeechRecognition = window.SpeechRecognition ||
  window.webkitSpeechRecognition || null;

if (window.SpeechRecognition === null) {
  document.getElementById('ws-unsupported').classList.remove('hidden');
  document.getElementById('button-play-ws').setAttribute('disabled', 'disabled');
  document.getElementById('button-stop-ws').setAttribute('disabled', 'disabled');

/////////////////IF BROWSER WORKS, THEN RECORD//////////
} else {
  var recognizer = new window.SpeechRecognition();
  var transcription = document.getElementById('transcription');
  var log = document.getElementById('log');

  // Recognizer doesn't stop listening even if the user pauses
  recognizer.continuous = true;

  // Start recognizing
  recognizer.onresult = function (event) {
    transcription.textContent = '';

    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcription.textContent = event.results[i][0].transcript;

        //send to socket
        socket.emit('send audioText', transcription.textContent)
        console.log('AUDIO DATA SENT', Date.now())

      } else {
        transcription.textContent += event.results[i][0].transcript;
      }
    }

  };


  // Listen for errors
  recognizer.onerror = function (event) {
    log.innerHTML = 'Recognition error: ' + event.message + '<br />' + log.innerHTML;
  };

  document.getElementById('button-play-ws').addEventListener('click', function () {
    // Set if we need interim results
    recognizer.interimResults = document.querySelector('input[name="recognition-type"][value="interim"]').checked;

    try {
      recognizer.start();
      log.innerHTML = 'Recognition started' + '<br />' + log.innerHTML;
    } catch (ex) {
      log.innerHTML = 'Recognition error: ' + ex.message + '<br />' + log.innerHTML;
    }
  });

  document.getElementById('button-stop-ws').addEventListener('click', function () {
    recognizer.stop();
    log.innerHTML = 'Recognition stopped' + '<br />' + log.innerHTML;
  });

  document.getElementById('clear-all').addEventListener('click', function () {
    transcription.textContent = '';
    log.textContent = '';
  });
}