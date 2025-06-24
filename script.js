    let songSelect;
    let allSongs = [];
    let homepageBGMPlayed = false;
    let photos = [];

    fetch('data/index.json')
      .then(res => res.json())
      .then(fileList => Promise.all(
        fileList.map(file => fetch('data/storage/' + file).then(res => res.json()))
      ))
      .then(data => {
        allSongs = data;
        populateDropdown(data);
        renderRecentNotes(data);
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
          <div class="japanese_note">${entry.japanese}</div>
          <div class="chinese_note">${entry.chinese}</div>
          <div class="part-of-speech">${entry['part of speech'] || ''}</div>
          <div class="example-sentence">${entry['example sentence'] || ''}</div>
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

    document.getElementById('song-select').addEventListener('change', e => {
      const index = e.target.value;
      if (!index) return;

      const song = allSongs[index];
      document.getElementById('homepage').style.display = 'none';
      document.getElementById('content').classList.remove('hidden');

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

    window.addEventListener('DOMContentLoaded', () => {
      playAudio("audio/lemonBGM.mp3", false);
    });