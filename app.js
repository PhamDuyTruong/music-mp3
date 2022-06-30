const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const MUSIC_PLAYER_STORAGE = 'musicStorage';

const player = $('.js-player');
const playList = $('.js-playlist');
const diskImg = $('.js-img');
const title = $('.js-title');
const playBtn = $('.js-play');
const nextBtn = $('.js-next');
const prevBtn = $('.js-prev');
const replayBtn = $('.js-replay');
const randomBtn = $('js-random');
const timeRange = $('.js-time');
const audio = $('.js-audio');

const app = {
    currentSongIndex: 0,
    playedSongIndexs: [],
    isPlaying: false,
    isRandom: false,
    isReplay: false,
    config: JSON.parse(localStorage.getItem(MUSIC_PLAYER_STORAGE)) || {},
    songs: [
        {
            title: '10 Ngan Nam',
            singer: 'PC',
            img: './images/10-ngan-nam.jpg',
            audioSrc: './audio/PC-10-Ngan-Nam-Prod-Duckie-Official-Audio-mp3-PC.mp3',
        },
        {
            title: 'Ghe Qua',
            singer: 'Tofu-Dick',
            img: './images/Ghe-qua.jpg',
            audioSrc: './audio/Ghe-Qua-Dick-Tofu-PC.mp3',
        },
        {
            title: 'Hoa No Khong Mau',
            singer: 'Hoai Lam',
            img: './images/hoa-no-khong-mau.jpg',
            audioSrc: './audio/Hoa-No-Khong-Mau-Lofi-Ver-Freak-D-Hoai-Lam.mp3',
        },
        {
            title: 'La Lung',
            singer: 'Vu',
            img: './images/La-lung.jpg',
            audioSrc: './audio/LA-LUNG-Original-Vu.mp3',
        },
        {
            title: 'Lac Troi',
            singer: 'Son Tung MTP',
            img: './images/Lac-troi.jpg',
            audioSrc: './audio/Lac-Troi-Masew-Mix-Son-Tung-M-TP-Masew.mp3',
        },
        {
            title: 'Hoa Hai Duong',
            singer: 'Jack',
            img: './images/hoa-hai-duong.jpeg',
            audioSrc: './audio/audio_hoa-hai-duong.mp3',
        },
        {
            title: 'Noi Nay Co Anh',
            singer: 'Son Tung MTP',
            img: './images/Noi-nay-co-anh.jpg',
            audioSrc: './audio/Noi-Nay-Co-Anh-Masew-Bootleg-Son-Tung-M-TP-Masew.mp3',
        },
    ],

    defineProperties(){
        Object.defineProperty(this, 'currentSong', {
            get(){
                return this.songs[this.currentSongIndex];
            }
        })

        Object.defineProperty(this, 'rotate360', {
            get(){
                return {transform: 'rotate(360deg)'}
            }
        })

        Object.defineProperty(this, 'timing10Sec',{
            get(){
                return {duration: 10000, iterations: Infinity}
            }
        })
    },
    setConfig(key, value){
        this.config[key] = value;
        localStorage.setItem(MUSIC_PLAYER_STORAGE, JSON.stringify(this.config))
    },

    loadConfig(){
        this.isRandom = this.config.isRandom;
        this.isReplay = this.config.isReplay
    },

    loadCurrentSong(){
        title.textContent = this.currentSong.title;
        diskImg.src = this.currentSong.img;
        audio.src = this.currentSong.audioSrc;
    },

    handleEvents(){
        const that = this;
        const imgAnimation = diskImg.animate(that.rotate360, that.timing10Sec);
        imgAnimation.pause();
        const initialImgWidth = diskImg.offsetWidth;
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newImgWidth = initialImgWidth - scrollTop
            diskImg.style.width = newImgWidth > 0 ? newImgWidth + 'px' : 0
            diskImg.style.opacity = newImgWidth / initialImgWidth
        }

        playBtn.onclick = function(){
            that.isPlaying = !that.isPlaying;
            that.isPlaying ? audio.play() : audio.pause()
        }

        audio.onplay = function(){
            player.classList.add('playing');
            imgAnimation.play();
        }
        audio.onpause = function(){
            player.classList.remove('playing');
            imgAnimation.pause();
        }
        audio.ontimeupdate = function(){
            if(audio.duration > 0){
                const currentPercentage = audio.currentTime / audio.duration *100;
                timeRange.value = currentPercentage;
            }
        }

        timeRange.oninput = function(){
            const timePercentage = timeRange.value / 100;
            audio.currentTime = timePercentage * audio.duration;
        }

        function nextSong(){
            that.currentSongIndex++;
            if(that.currentSongIndex > that.songs.length - 1){
                that.currentSongIndex = 0;
            }
        }

        function prevSong(){
            that.currentSongIndex--;
            if(that.currentSongIndex < 0){
                that.currentSongIndex = that.songs.length - 1;
            }
        }

        function randomSong(){
            if(that.playedSongIndexs.length === that.songs.length){
                that.playedSongIndexs = [];
            }
            do{
                var randomIndex = Math.floor(Math.random() * that.songs.length);
            }while(randomIndex === that.currentSongIndex || that.playedSongIndexs.includes(randomIndex));

            that.currentSongIndex = randomIndex;
            that.playedSongIndexs.push(randomIndex);
        }

        nextBtn.onclick = function(){
            that.isRandom ? randomSong() : nextSong();
            that.loadCurrentSong();
            audio.play();
            that.rander();
            setTimeout(function(){
                $('.song.active').scrollIntoView({
                    behavior:"smooth",
                    block: "end",
                    inline: "nearest"
                });
            }, 300);
        }

        prevBtn.onclick = function(){
          that.isRandom ? randomSong() : prevSong();
          that.loadCurrentSong();
          audio.play();
          that.render();
          setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest"
            })
          }, 300)
        }

        randomBtn.onclick = function(){
            randomBtn.classList.toggle('active');
            that.isRandom = !that.isRandom;
            that.setConfig('isRandom', that.isRandom);
        }

        audio.onended = function(){
            that.isReplay ? audio.play() : nextBtn.click();
        }

        playList.onclick = function(e){
            const songNode = e.target.closest('.song.active');
            const ellipsis = e.target.closest('.ellipsis');
            const clickedSong = e.target.closest('.song');
            if(!songNode && !ellipsis){
                playList.querySelector('.song.active').classList.remove('active');
                clickedSong.classList.add('active');
                that.currentSongIndex = clickedSong.dataset.index
                that.loadCurrentSong();
                audio.play();
            }
        }
    },

    render(){
        const that = this;
        const htmls = this.songs.map((song, index) =>{
            return `
            <li class="song ${index === that.currentSongIndex ? 'active' : ''}" data-index="${index}">
                <img class="song__thumbnail" src="${song.img}" all="${song.title}">
                <div class="song__body">
                    <h2 class="song__title">${song.title}</h2>
                    <p class="song__singer">${song.singer}</p>
                </div>
                <button class="ellipsis">
                    <i class="fa-solid fa-ellipsis"></i>
                </button>
            </li>
        `
        });
        playList.innerHTML = htmls.join('')
    },

    start(){
        this.loadConfig();
        this.defineProperties();
        this.render();
        this.loadCurrentSong();
        this.handleEvents();

        if(this.isRandom){
            randomBtn.classList.add('active');
        }
        if(this.isReplay){
            replayBtn.classList.add('active');
        }
    }
};

app.start();