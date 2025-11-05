// Get a reference to the button and the hidden audio player from the HTML
const playPauseBtn = document.getElementById('play-pause-btn');
const audio = document.getElementById('background-audio');

// Add a 'click' event listener to the button
playPauseBtn.addEventListener('click', () => {

  // Check if the audio is currently paused
  if (audio.paused) {
    // If it's paused, play the audio
    audio.play();
    // And change the button's text to show the 'Pause' icon
    playPauseBtn.innerHTML = '⏸️ Pause';
  } else {
    // If it's playing, pause the audio
    audio.pause();
    // And change the button's text back to the 'Play' icon
    playPauseBtn.innerHTML = '▶️ Play';
  }

});