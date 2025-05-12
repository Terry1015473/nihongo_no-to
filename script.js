let songSelect;
let allSongs = [];
let homepageBGMPlayed = false;
let photos = [];

fetch('data/index.json')
    .then(response => response.json())
    .then(fileList => {
        return Promise.all(
            fileList.map(file => fetch('data/storage/' + file).then(res => res.json()))
        );
    })
    .then(datas => {
        allSongs = datas;
        populateDropdown(allSongs);
    })
    .catch(error => console.error('載入資料錯誤:',error));

fetch('photos/index.json')
    .then(response => response.json())
    .then(imageList => {
        photos = imageList.map(imageName => `photos/${imageName}`);
        // console.log('載入相片:',photos);
        createPhotoGallery()
    })
    .catch(error => console.error('載入圖片錯誤:',error));


function populateDropdown(songs){
    const select = document.getElementById('song-select');
    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'ノートを選択してください';
    select.appendChild(defaultOption);

    songs.forEach((song, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${song.title} - ${song.artist}`;
        select.appendChild(option);
    });

    if (!songSelect) {
        songSelect = new TomSelect('#song-select', {
            maxOptions: 50,
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
        div.className = 'lyric-entry';

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

function playAudio(audioSrc, autoplay = true){
    const player = document.getElementById('audio-player');
    if (audioSrc){
        player.src = audioSrc;
        player.style.display = 'block';
        player.volume = 0.05;
        player.controlsList = "nodownload";

        if (autoplay) {
            player.play().catch(err => {
                console.warn('播放失敗（可能是瀏覽器攔截）：', err);
            });
        }

        player.onended = function(){
            player.currentTime = 0;
            player.play();
        }
    } else {
        player.style.display = 'none';
        player.pause();
        player.onended = null;
    }
}

function showNotes(song){
    const container = document.getElementById('lyrics-container');
    container.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = `${song.title} - 単語`;
    container.appendChild(title);

    song.lyrics.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'lyric-entry';

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
    showGrammer(song);
}
function showGrammer(song){
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = '文法など';
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

function startBGM() {
    if (!homepageBGMPlayed) {
        const player = document.getElementById('audio-player');
        player.play().catch(err => {
            console.warn('播放失敗：', err);
        });
        homepageBGMPlayed = true;
    }
}

function createPhotoGallery(){
    const gallery = document.getElementById('photo-gallery');
    gallery.innerHTML = '';
    
    
    const row = document.createElement('div');
    row.className = 'photo-row';
    
    
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = '相片';
        row.appendChild(img);
    });
    
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = '相片';
        row.appendChild(img);
    });
    
    gallery.appendChild(row);
}

document.getElementById('song-select').addEventListener('change', (e) => {
    const index = e.target.value;
    if (index === "") {
        playAudio("audio/lemonBGM.mp3", true);
        return;
    }

    const song = allSongs[index];

    document.getElementById('content-container').style.display = 'flex';

    if (song.type == "song"){
        document.getElementById('homepage').style.display = 'none';        
        showLyrics(song);
        playAudio(song.audio, false);
    }
    else if (song.type == "note"){
        document.getElementById('homepage').style.display = 'none';
        showNotes(song);
        playAudio(song.audio, false);
    }
});
document.getElementById('back-to-homepage').addEventListener('click', () =>{
    document.getElementById('homepage').style.display = 'block';
    document.getElementById('content-container').style.display = 'none';
    playAudio("audio/lemonBGM.mp3", true);
});

document.getElementById('toggle-dark-mode').addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
})

document.addEventListener('DOMContentLoaded', () => {
    const entriesSelector = '.lyric-entry, .note-entry';
    const entries = () => document.querySelectorAll(entriesSelector);

    document.body.addEventListener('mouseover', (e) => {
        if (e.target.matches(entriesSelector)) {
            document.body.classList.add('entry-hovering');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.matches(entriesSelector)) {
            
            
            const hovered = [...entries()].some(el => el.matches(':hover'));
            if (!hovered) {
                document.body.classList.remove('entry-hovering');
            }
            
        }
    });
});



window.addEventListener('DOMContentLoaded', () => {
    playAudio("audio/lemonBGM.mp3", false); 
    // document.body.addEventListener('click', startBGM, { once: true });
    // document.body.addEventListener('mousemove', startBGM, { once: true });
    document.body.addEventListener('wheel', startBGM, { once: true });

    if (typeof Sakura !== 'undefined') {
        new Sakura('body', {
            className: 'sakura',
            fallSpeed: 0.5,
        });
    } else {
        console.error('Sakura.js 沒有正確載入');
    }
    var animation = lottie.loadAnimation({
    container: document.getElementById('cat-animation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'animation/Animation-1745651195566.json' 
  });
});
// window.addEventListener('DOMContentLoaded', createPhotoGallery);


  