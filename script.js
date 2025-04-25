let songSelect;

fetch('lyrics.json')
    .then(response => response.json())
    .then(data => {
        allSongs = data;
        populateDropdown(data);
    });

function populateDropdown(songs){
    const select = document.getElementById('song-select');
    songs.forEach((song, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${song.title} - ${song.artist}`;
        select.appendChild(option);
    });

    if (!songSelect) {
        songSelect = new TomSelect('#song-select', {
            maxOptions: 10,
            placeholder: '請搜尋歌曲...',
            allowEmptyOption: true
        });
    } else {
        songSelect.clearOptions();
        songSelect.addOptions([...select.options].map(opt => ({ value: opt.value, text: opt.textContent })));
        songSelect.refreshOptions();
    }
}  

function showLyrics(song){
    const container = document.getElementById('lyrics-container');
    container.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = `${song.title} - ${song.artist}`;
    container.appendChild(title);

    song.lyrics.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'lyrics-entry';

        const jp = document.createElement('div');
        jp.className = 'japanese';
        jp.textContent = entry.japanese;

        const zh = document.createElement('div');
        zh.className = 'chinese';
        zh.textContent = entry.chinese;

        div.appendChild(jp);
        div.appendChild(zh);
        container.appendChild(div);
    });
    showNote(song);
}
function showNote(song){
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'ノート';
    container.appendChild(title);

    song.notes.forEach(entry =>{
        const div = document.createElement('div');
        div.className = 'note-entry';

        const jp = document.createElement('div');
        jp.className = 'japanese_note';
        jp.textContent = entry.japanese;

        const zh = document.createElement('div');
        zh.className = 'chinese_note';
        zh.textContent = entry.chinese;

        div.appendChild(jp);
        div.appendChild(zh);
        container.appendChild(div);
    });
}

function playAudio(audioSrc){
    const player = document.getElementById('audio-player');
    if (audioSrc){
        player.src = audioSrc;
        player.style.display = 'block';
        player.volume = 0.05;
        player.controlsList = "nodownload"
        player.play();

        player.onended = function(){
            player.currentTime = 0;
            player.play();
        }
    }else {
        player.style.display = 'None';
        player.pause();
        player.onended = null;
    }
}

document.getElementById('song-select').addEventListener('change', (e) =>{
    const index = e.target.value;
    if (index === "") return;

    const song = allSongs[index];
    showLyrics(song);
    playAudio(song.audio);
});