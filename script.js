    let songSelect;
    let allSongs = [];
    let homepageBGMPlayed = false;
    let photos = [];
    // Word ticker variables
    let allWords = [];
    let currentWordIndex = 0;
    let autoPlay = true;
    let wordTimer;
    let countdown = 5;

    fetch('data/index.json')
      .then(res => res.json())
      .then(fileList => Promise.all(
        fileList.map(file => fetch('data/storage/' + file).then(res => res.json()))
      ))
      .then(data => {
        allSongs = data;
        populateDropdown(data);
        renderRecentNotes(data);
        extractAllWords(data);
        initWordTicker();        
      });

    fetch('photos/index.json')
      .then(res => res.json())
      .then(list => {
        photos = list.map(name => `photos/${name}`);
        renderPhotos();
      });

    function populateDropdown(songs) {
      const select = document.getElementById('song-select');
      select.innerHTML = '<option value="">ノートを選択してください</option>';
      songs.forEach((song, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = song.title;
        select.appendChild(opt);
      });
      songSelect = new TomSelect('#song-select', {
        maxOptions: 100,
        placeholder: '検索...',
        allowEmptyOption: true
      });
    }

    function renderRecentNotes(songs) {
      const container = document.getElementById('recent-notes');
      if (!container) return;

      container.innerHTML = '';

      songs.slice(0, 4).forEach((song, index) => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
          <div class="title">${song.title}</div>
          <div class="snippet">${song.type}</div>
        `;
        div.addEventListener('click', () => {
          document.getElementById('song-select').value = index;
          document.getElementById('homepage').style.display = 'none';
          document.getElementById('content').classList.remove('hidden');

          document.getElementById('lyrics-container').innerHTML = '';
          document.getElementById('notes-container').innerHTML = '';

          if (song.type === 'song') showLyrics(song);
          else if (song.type === 'note') showNotes(song);

          playAudio(song.audio, false);
        });
        container.appendChild(div);
      });
    }

    function renderPhotos() {
      const gallery = document.getElementById('photo-gallery');
      if (!gallery) return;
      gallery.innerHTML = '';
      photos.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        gallery.appendChild(img);
      });
    }

    function formatText(text) {
      if (!text) return '';
      return text.replace(/\n/g, '<br>');
    }    

    function showLyrics(song) {
      const container = document.getElementById('lyrics-container');
      container.innerHTML = '<h2>歌詞</h2>';
      song.lyrics.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'lyric-entry';
        div.innerHTML = `
          <div class="japanese">${entry.japanese}</div>
          <div class="chinese">${entry.chinese}</div>
        `;
        container.appendChild(div);
      });
      showNotes(song);
    }

    function showNotes(song) {
      const container = document.getElementById('notes-container');
      container.innerHTML = '<h2>ノート</h2>';
      song.notes.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'note-entry';
        div.innerHTML = `
          <div class="japanese_note">${formatText(entry.japanese)}</div>
          <div class="chinese_note">${formatText(entry.chinese)}</div>
          <div class="part-of-speech">${formatText(entry['part of speech'] || '')}</div>
          <div class="example-sentence">${formatText(entry['example sentence'] || '')}</div>
        `;
        container.appendChild(div);
      });
    }

    function playAudio(audioSrc, autoplay = true) {
      const player = document.getElementById('audio-player');
      if (!audioSrc) {
        player.pause();
        player.src = '';
        return;
      }
      player.src = audioSrc;
      player.volume = 0.05;
      player.controlsList = 'nodownload';
      player.style.display = 'block';

      if (autoplay) {
        player.play().catch(err => console.warn('播放失敗:', err));
      }

      player.onended = () => {
        player.currentTime = 0;
        player.play();
      };
    }

    // Word ticker functions
    function extractAllWords(songs) {
      allWords = [];
      songs.forEach(song => {
        if (song.notes && Array.isArray(song.notes)) {
          song.notes.forEach(note => {
            if (note.japanese && note.chinese) {
              allWords.push({
                japanese: note.japanese,
                chinese: note.chinese,
                partOfSpeech: note['part of speech'] || '',
                example: note['example sentence'] || '',
                Source: song.title
              });
            }
          });
        }
      });
      // Shuffle the words array
      for (let i = allWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
      }
    }

    function initWordTicker() {
      if (allWords.length === 0) {
        document.getElementById('word-chinese').textContent = 'No words available';
        return;
      }
      
      displayCurrentWord();
      if (autoPlay) {
        startAutoPlay();
      }
    }

    function displayCurrentWord() {
      if (allWords.length === 0) return;
      
      const word = allWords[currentWordIndex];
      const wordCard = document.getElementById('word-card');
      
      // Add flip animation
      wordCard.classList.add('flipping');
      
      setTimeout(() => {
        document.getElementById('word-japanese').textContent = word.japanese;
        document.getElementById('word-chinese').textContent = word.chinese;
        
        const posElement = document.getElementById('word-pos');
        const exampleElement = document.getElementById('word-example');
        const sourceElement = document.getElementById('word-source');
        
        if (word.partOfSpeech) {
          posElement.textContent = word.partOfSpeech;
          posElement.style.display = 'inline-block';
        } else {
          posElement.style.display = 'none';
        }
        
        if (word.example) {
          exampleElement.textContent = word.example;
          exampleElement.style.display = 'block';
        } else {
          exampleElement.style.display = 'none';
        }

        if (word.Source){
            sourceElement.textContent = word.Source;
            sourceElement.style.display = 'block';
        } else {
            sourceElement.style.display = 'none';
        }
        
        wordCard.classList.remove('flipping');
      }, 250);
    }

    function nextWord() {
      currentWordIndex = (currentWordIndex + 1) % allWords.length;
      displayCurrentWord();
      
      if (autoPlay && wordTimer) {
        restartAutoPlay();
      }
    }

    function startAutoPlay() {
      countdown = 8;
      updateTimer();
      wordTimer = setInterval(() => {
        countdown--;
        updateTimer();
        if (countdown < 0) {
          nextWord();
        }
      }, 1000);
    }

    function stopAutoPlay() {
      if (wordTimer) {
        clearInterval(wordTimer);
        wordTimer = null;
      }
      document.getElementById('word-timer').textContent = '';
    }

    function restartAutoPlay() {
      stopAutoPlay();
      if (autoPlay) {
        startAutoPlay();
      }
    }

    function updateTimer() {
      document.getElementById('word-timer').textContent = autoPlay ? `${countdown}s` : '';
    }

    function toggleAutoPlay() {
      autoPlay = !autoPlay;
      const toggleBtn = document.getElementById('toggle-auto');
      toggleBtn.textContent = `自動: ${autoPlay ? 'ON' : 'OFF'}`;
      
      if (autoPlay) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
    }


    document.getElementById('song-select').addEventListener('change', e => {
      const index = e.target.value;
      if (!index) return;

      const song = allSongs[index];
      document.getElementById('homepage').style.display = 'none';
      document.getElementById('content').classList.remove('hidden');

      document.getElementById('lyrics-container').innerHTML = '';
      document.getElementById('notes-container').innerHTML = '';

      if (song.type === 'song') showLyrics(song);
      else if (song.type === 'note') showNotes(song);

      playAudio(song.audio, false);
    });

    document.getElementById('back-to-homepage').addEventListener('click', () => {
      document.getElementById('homepage').style.display = 'block';
      document.getElementById('content').classList.add('hidden');
      playAudio("audio/lemonBGM.mp3", false);
    });

    document.getElementById('toggle-dark-mode').addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });

    // Word ticker event listeners
    document.getElementById('next-word').addEventListener('click', () => {
      nextWord();
    });

    document.getElementById('toggle-auto').addEventListener('click', () => {
      toggleAutoPlay();
    });

    // // Optional: Click word card to show next word
    // document.getElementById('word-card').addEventListener('click', () => {
    //   if (!autoPlay) {
    //     nextWord();
    //   }
    // });

    window.addEventListener('DOMContentLoaded', () => {
      playAudio("audio/lemonBGM.mp3", false);
    });