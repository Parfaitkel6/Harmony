import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyD8F8Buvjfx4XWWub0w0L5kIKjIr2h8D2I",
    authDomain: "harmony-64d79.firebaseapp.com",
    projectId: "harmony-64d79",
    storageBucket: "harmony-64d79.firebasestorage.app",
    messagingSenderId: "863416638733",
    appId: "1:863416638733:web:526e6628f1ee4fedd8a444",
    measurementId: "G-EKP6JXXT8J"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarTrigger = document.querySelector('.sidebar-trigger');

    sidebarTrigger.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
        });
    });

    const profileContainer = document.querySelector('.profile-container');
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const mainContainer = document.querySelector('.wrapper');

    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('is-open');
    });

    mainContainer.addEventListener('click', () => {
        if (profileDropdown.classList.contains('is-open')) {
            profileDropdown.classList.remove('is-open');
        }
    });

    document.addEventListener('click', (e) => {
        if (!profileContainer.contains(e.target)) {
            profileDropdown.classList.remove('is-open');
        }
    });

    const settingsModalOverlay = document.querySelector('.settings-modal-overlay');
    const settingsModalTrigger = document.querySelector('.settings-modal-trigger');
    const closeSettingsBtn = document.querySelector('.close-settings-btn');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');

    settingsModalTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('is-open');
        settingsModalOverlay.classList.add('is-open');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModalOverlay.classList.remove('is-open');
    });

    settingsModalOverlay.addEventListener('click', (e) => {
        if (e.target === settingsModalOverlay) {
            settingsModalOverlay.classList.remove('is-open');
        }
    });

    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            settingsTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            const targetTab = tab.getAttribute('data-tab');
            settingsPanels.forEach(panel => {
                panel.classList.remove('is-active');
                if (panel.id === `panel-${targetTab}`) {
                    panel.classList.add('is-active');
                }
            });
        });
    });

    const settingBlurRange = document.getElementById('setting-blur');
    const settingAccentSelect = document.getElementById('setting-accent');
    const clearCacheBtn = document.getElementById('clear-cache-btn');

    settingBlurRange.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
        localStorage.setItem('harmony_blur', val);
    });

    const savedBlur = localStorage.getItem('harmony_blur');
    if (savedBlur) {
        settingBlurRange.value = savedBlur;
        document.documentElement.style.setProperty('--glass-blur', `${savedBlur}px`);
    }

    settingAccentSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'indigo') {
            document.body.classList.add('theme-indigo');
            localStorage.setItem('harmony_theme', 'indigo');
        } else {
            document.body.classList.remove('theme-indigo');
            localStorage.setItem('harmony_theme', 'default');
        }
    });

    const savedTheme = localStorage.getItem('harmony_theme');
    if (savedTheme === 'indigo') {
        document.body.classList.add('theme-indigo');
        settingAccentSelect.value = 'indigo';
    }

    clearCacheBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your local track cache and recent history?')) {
            localStorage.removeItem('harmony_imported_tracks');
            localStorage.removeItem('harmony_recents');
            alert('Local cache cleared successfully.');
            location.reload();
        }
    });

    const statsModalOverlay = document.querySelector('.stats-modal-overlay');
    const statsModalTrigger = document.querySelector('.stats-modal-trigger');
    const closeStatsBtn = document.querySelector('.close-stats-btn');
    const statTotalPlayedEl = document.getElementById('stat-total-played');
    const statListeningTimeEl = document.getElementById('stat-listening-time');

    let totalSongsPlayed = parseInt(localStorage.getItem('harmony_total_played')) || 0;
    let totalSecondsListened = parseInt(localStorage.getItem('harmony_listening_time')) || 0;

    statsModalTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('is-open');
        statTotalPlayedEl.innerText = totalSongsPlayed;
        statListeningTimeEl.innerText = `${Math.floor(totalSecondsListened / 60)} mins`;
        statsModalOverlay.classList.add('is-open');
    });

    closeStatsBtn.addEventListener('click', () => {
        statsModalOverlay.classList.remove('is-open');
    });

    statsModalOverlay.addEventListener('click', (e) => {
        if (e.target === statsModalOverlay) {
            statsModalOverlay.classList.remove('is-open');
        }
    });

    const recentsModalOverlay = document.querySelector('.recents-modal-overlay');
    const recentsModalTrigger = document.querySelector('.recents-modal-trigger');
    const closeRecentsBtn = document.querySelector('.close-recents-btn');
    const recentsListEl = document.querySelector('.recents-list');

    recentsModalTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('is-open');
        renderRecentsList();
        recentsModalOverlay.classList.add('is-open');
    });

    closeRecentsBtn.addEventListener('click', () => {
        recentsModalOverlay.classList.remove('is-open');
    });

    recentsModalOverlay.addEventListener('click', (e) => {
        if (e.target === recentsModalOverlay) {
            recentsModalOverlay.classList.remove('is-open');
        }
    });

    function recordRecentTrack(track) {
        let recents = JSON.parse(localStorage.getItem('harmony_recents')) || [];
        recents = recents.filter(t => t.title !== track.title);
        recents.unshift(track);
        if (recents.length > 20) recents.pop();
        localStorage.setItem('harmony_recents', JSON.stringify(recents));
    }

    function renderRecentsList() {
        const recents = JSON.parse(localStorage.getItem('harmony_recents')) || [];
        recentsListEl.innerHTML = '';
        if (recents.length === 0) {
            recentsListEl.innerHTML = '<li style="color: var(--text-muted); font-size: 13px; font-style: italic;">No recent tracks played yet.</li>';
            return;
        }
        recents.forEach(track => {
            const li = document.createElement('li');
            li.className = 'queue-item';
            li.innerHTML = `<span>${track.title} - ${track.artist}</span>`;
            recentsListEl.appendChild(li);
        });
    }

    const roomModalOverlay = document.querySelector('.room-modal-overlay');
    const jointRoomMenuBtn = document.querySelector('.menu-joint-room');
    const closeRoomBtn = document.querySelector('.close-room-btn');
    const startRoomBtn = document.getElementById('start-room-btn');
    const roomStatusBox = document.querySelector('.room-status-box');

    jointRoomMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        roomModalOverlay.classList.add('is-open');
    });

    closeRoomBtn.addEventListener('click', () => {
        roomModalOverlay.classList.remove('is-open');
    });

    roomModalOverlay.addEventListener('click', (e) => {
        if (e.target === roomModalOverlay) {
            roomModalOverlay.classList.remove('is-open');
        }
    });

    startRoomBtn.addEventListener('click', () => {
        const roomId = 'Room_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        roomStatusBox.innerHTML = `Status: Active<br><strong>Room ID:</strong> ${roomId} (Host Session Connected)`;
        alert(`Successfully hosted and connected to Joint Room: ${roomId}`);
    });

    const welcomeLandingOverlay = document.querySelector('.welcome-landing-overlay');
    const landingAuthForm = document.getElementById('landing-auth-form');
    const landingAuthEmailInput = document.getElementById('landing-auth-email');
    const landingAuthPasswordInput = document.getElementById('landing-auth-password');
    const skipWelcomeLink = document.querySelector('.skip-welcome-link');
    const welcomeAuthTabs = document.querySelectorAll('.welcome-landing-card .auth-tab');
    const landingSubmitBtn = welcomeLandingOverlay.querySelector('.auth-submit-btn');

    let landingAuthMode = 'login';

    welcomeAuthTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            welcomeAuthTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            landingAuthMode = tab.getAttribute('data-tab');
            landingSubmitBtn.innerText = landingAuthMode === 'login' ? 'Sign In' : 'Register Account';
            
            const usernameGroup = document.querySelector('.landing-username-group');
            usernameGroup.style.display = landingAuthMode === 'signup' ? 'flex' : 'none';
        });
    });

    landingAuthForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = landingAuthEmailInput.value.trim();
        const password = landingAuthPasswordInput.value.trim();
        const username = document.getElementById('landing-auth-username').value.trim();

        try {
            if (landingAuthMode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, 'users', user.uid), { username: username || email.split('@')[0], email }, { merge: true });
                alert('Account created successfully!');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Signed in successfully!');
            }
            welcomeLandingOverlay.classList.add('is-hidden');
        } catch (error) {
            alert(`Authentication Error: ${error.message}`);
        }
    });

    skipWelcomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        welcomeLandingOverlay.classList.add('is-hidden');
        updateDynamicGreeting(auth.currentUser ? auth.currentUser.email : null, false);
    });

    const authModalOverlay = document.querySelector('.auth-modal-overlay');
    const authModalTrigger = document.querySelector('.auth-modal-trigger');
    const closeAuthBtn = document.querySelector('.close-auth-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForm = document.getElementById('auth-form');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authSubmitBtn = document.querySelector('.auth-submit-btn');
    const profileUserEmail = document.querySelector('.profile-user-email');
    const signOutBtn = document.querySelector('.sign-out-btn');
    const profileIconSpan = document.querySelector('.profile-icon span');

    let authMode = 'login';

    authModalTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('is-open');
        authModalOverlay.classList.add('is-open');
    });

    closeAuthBtn.addEventListener('click', () => {
        authModalOverlay.classList.remove('is-open');
    });

    authModalOverlay.addEventListener('click', (e) => {
        if (e.target === authModalOverlay) {
            authModalOverlay.classList.remove('is-open');
        }
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            authMode = tab.getAttribute('data-tab');
            authSubmitBtn.innerText = authMode === 'login' ? 'Sign In' : 'Register Account';
            
            const usernameGroup = document.querySelector('.auth-username-group');
            usernameGroup.style.display = authMode === 'signup' ? 'flex' : 'none';
        });
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value.trim();
        const username = document.getElementById('auth-username').value.trim();

        try {
            if (authMode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, 'users', user.uid), { username: username || email.split('@')[0], email }, { merge: true });
                alert('Account created and signed in successfully!');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Signed in successfully!');
            }
            authModalOverlay.classList.remove('is-open');
            authForm.reset();
        } catch (error) {
            alert(`Authentication Error: ${error.message}`);
        }
    });

    signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            alert('Signed out successfully.');
            profileDropdown.classList.remove('is-open');
            welcomeLandingOverlay.classList.remove('is-hidden');
            updateDynamicGreeting(null, false);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    });

    const timeGreetingText = document.querySelector('.time-greeting-text');

    function updateDynamicGreeting(identifier, isCustomUsername = false) {
        const currentHour = new Date().getHours();
        let greeting = 'Welcome';

        if (currentHour >= 5 && currentHour < 12) {
            greeting = 'Good morning';
        } else if (currentHour >= 12 && currentHour < 17) {
            greeting = 'Good afternoon';
        } else if (currentHour >= 17 && currentHour < 22) {
            greeting = 'Good evening';
        } else {
            greeting = 'Good night';
        }

        if (identifier) {
            const displayName = isCustomUsername ? identifier : identifier.split('@')[0];
            const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            timeGreetingText.innerText = `${greeting}, ${capitalizedName}`;
        } else {
            timeGreetingText.innerText = `${greeting}, Music Lover`;
        }
    }

    const musicCards = document.querySelectorAll('.music-card');
    const trackNameEl = document.querySelector('.track-name');
    const trackArtistEl = document.querySelector('.track-artist');
    const trackArtEls = document.querySelectorAll('.track-art, .current-track .track-art');
    const playPauseBtns = document.querySelectorAll('.play-pause');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const progressBar = document.querySelectorAll('.progress-bar');
    const currentTimeEls = document.querySelectorAll('.current-time');
    const totalTimeEls = document.querySelectorAll('.total-time');

    const expandedTitleEl = document.querySelector('.expanded-title');
    const expandedArtistEl = document.querySelector('.expanded-artist');
    const expandedArtContainer = document.querySelector('.expanded-art-container');
    const lyricsTextEl = document.querySelector('.lyrics-text');

    const albumCountEl = document.querySelector('.album-count');
    const artistCountEl = document.querySelector('.artist-count');

    let baseTracks = Array.from(musicCards).map((card, index) => ({
        title: card.getAttribute('data-song'),
        artist: card.getAttribute('data-artist'),
        cover: null,
        lyrics: 'No lyrics available. Use Online or Local buttons above to load lyrics.',
        src: [
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        ][index % 3]
    }));

    let importedTracks = JSON.parse(localStorage.getItem('harmony_imported_tracks')) || [];
    let tracks = [...baseTracks, ...importedTracks];

    let currentTrackIndex = 0;
    let audioElement = new Audio();
    let isPlaying = false;

    function updateMenuCounts() {
        const uniqueArtists = new Set(tracks.map(t => t.artist.toLowerCase().trim()));
        const uniqueAlbums = new Set(tracks.map(t => t.title.toLowerCase().trim()));
        if (artistCountEl) artistCountEl.innerText = uniqueArtists.size;
        if (albumCountEl) albumCountEl.innerText = uniqueAlbums.size;
    }

    updateMenuCounts();

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function loadTrack(index) {
        if (tracks.length === 0) return;
        currentTrackIndex = index;
        const track = tracks[index];
        
        trackNameEl.innerText = track.title;
        trackArtistEl.innerText = track.artist;
        expandedTitleEl.innerText = track.title;
        expandedArtistEl.innerText = track.artist;
        lyricsTextEl.innerText = track.lyrics || 'No lyrics available. Use Online or Local buttons above to load lyrics.';

        if (track.cover) {
            trackArtEls.forEach(el => {
                el.outerHTML = `<img src="${track.cover}" class="track-art" alt="Cover">`;
            });
            expandedArtContainer.outerHTML = `<img src="${track.cover}" class="expanded-art-container expanded-art-img" alt="Cover">`;
        } else {
            trackArtEls.forEach(el => {
                if (el.tagName === 'IMG') {
                    el.outerHTML = `<div class="track-art placeholder-art"></div>`;
                }
            });
            if (expandedArtContainer.tagName === 'IMG') {
                expandedArtContainer.outerHTML = `<div class="expanded-art-container placeholder-art"></div>`;
            }
        }

        audioElement.src = track.src;
        audioElement.load();
        playTrack();
        updateQueueUI();
        recordRecentTrack(track);

        totalSongsPlayed++;
        localStorage.setItem('harmony_total_played', totalSongsPlayed);
    }

    function playTrack() {
        audioElement.play().then(() => {
            isPlaying = true;
            playPauseBtns.forEach(btn => {
                btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            });
        }).catch(err => console.log("Playback prevented:", err));
    }

    function pauseTrack() {
        audioElement.pause();
        isPlaying = false;
        playPauseBtns.forEach(btn => {
            btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
    }

    musicCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            loadTrack(index);
        });
    });

    function togglePlayPause() {
        if (!audioElement.src) {
            loadTrack(0);
            return;
        }
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    playPauseBtns.forEach(btn => {
        btn.addEventListener('click', togglePlayPause);
    });

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
    }

    nextBtns.forEach(btn => btn.addEventListener('click', nextTrack));
    prevBtns.forEach(btn => btn.addEventListener('click', prevTrack));

    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            
            progressBar.forEach(bar => {
                bar.value = progressPercent;
                bar.style.setProperty('--slider-fill', `${progressPercent}%`);
            });
            
            currentTimeEls.forEach(el => el.innerText = formatTime(audioElement.currentTime));
            totalTimeEls.forEach(el => el.innerText = formatTime(audioElement.duration));

            totalSecondsListened++;
            localStorage.setItem('harmony_listening_time', totalSecondsListened);
        }
    });

    audioElement.addEventListener('ended', nextTrack);

    progressBar.forEach(bar => {
        bar.addEventListener('input', (e) => {
            if (audioElement.duration) {
                const seekTime = (e.target.value / 100) * audioElement.duration;
                audioElement.currentTime = seekTime;
                bar.style.setProperty('--slider-fill', `${e.target.value}%`);
            }
        });
    });

    const volumeBar = document.querySelector('.volume-bar');
    const muteToggle = document.querySelector('.mute-toggle');
    let lastVolume = localStorage.getItem('harmony_volume') || 80;

    volumeBar.value = lastVolume;
    audioElement.volume = lastVolume / 100;
    volumeBar.style.setProperty('--slider-fill', `${lastVolume}%`);

    volumeBar.addEventListener('input', (e) => {
        const val = e.target.value;
        audioElement.volume = val / 100;
        localStorage.setItem('harmony_volume', val);
        volumeBar.style.setProperty('--slider-fill', `${val}%`);
        
        const icon = muteToggle.querySelector('i');
        if (val == 0) icon.className = 'fa-solid fa-volume-xmark';
        else if (val < 50) icon.className = 'fa-solid fa-volume-low';
        else icon.className = 'fa-solid fa-volume-high';
    });

    muteToggle.addEventListener('click', () => {
        const icon = muteToggle.querySelector('i');
        if (audioElement.volume > 0) {
            lastVolume = volumeBar.value;
            volumeBar.value = 0;
            audioElement.volume = 0;
            volumeBar.style.setProperty('--slider-fill', '0%');
            icon.className = 'fa-solid fa-volume-xmark';
        } else {
            volumeBar.value = lastVolume;
            audioElement.volume = lastVolume / 100;
            volumeBar.style.setProperty('--slider-fill', `${lastVolume}%`);
            icon.className = lastVolume < 50 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
        }
    });

    const nowPlayingBar = document.querySelector('.now-playing-bar');
    const expandedOverlay = document.querySelector('.expanded-player-overlay');
    const collapseOverlayBtn = document.querySelector('.collapse-overlay-btn');

    nowPlayingBar.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        expandedOverlay.classList.add('is-visible');
    });

    collapseOverlayBtn.addEventListener('click', () => {
        expandedOverlay.classList.remove('is-visible');
    });

    const fetchOnlineLyricsBtn = document.querySelector('.fetch-online-lyrics-btn');
    const uploadLocalLyricsBtn = document.querySelector('.upload-local-lyrics-btn');
    const lyricsFileInput = document.getElementById('lyrics-file-input');

    fetchOnlineLyricsBtn.addEventListener('click', async () => {
        if (tracks.length === 0 || trackNameEl.innerText === 'No track selected') {
            alert('Please select a track first.');
            return;
        }
        const currentTrack = tracks[currentTrackIndex];
        lyricsTextEl.innerText = 'Searching lyrics online...';
        
        try {
            const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(currentTrack.artist)}/${encodeURIComponent(currentTrack.title)}`);
            const data = await response.json();
            if (data.lyrics) {
                currentTrack.lyrics = data.lyrics;
                lyricsTextEl.innerText = data.lyrics;
                savePlaylists();
            } else {
                lyricsTextEl.innerText = `Could not find lyrics online for "${currentTrack.title}". Try uploading a local file.`;
            }
        } catch (err) {
            lyricsTextEl.innerText = `Network error fetching lyrics. You can upload a local lyrics file (.txt/.lrc).`;
        }
    });

    uploadLocalLyricsBtn.addEventListener('click', () => {
        if (tracks.length === 0 || trackNameEl.innerText === 'No track selected') {
            alert('Please select a track first.');
            return;
        }
        lyricsFileInput.click();
    });

    lyricsFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const currentTrack = tracks[currentTrackIndex];
            currentTrack.lyrics = content;
            lyricsTextEl.innerText = content;
            savePlaylists();
            alert('Local lyrics loaded successfully!');
            lyricsFileInput.value = '';
        };
        reader.readAsText(file);
    });

    const drawerOverlay = document.querySelector('.playlist-drawer-overlay');
    const openDrawerBtns = document.querySelectorAll('.open-playlist-drawer-btn');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const queueListEl = document.querySelector('.queue-list');
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    const customPlaylistsContainer = document.querySelector('.custom-playlists-container');
    const addPlaylistBtn = document.querySelector('.add-playlist-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const profileImportAudioBtn = document.querySelector('.profile-import-audio-btn');

    let customPlaylists = [
        { name: 'Favorites', tracks: [] }
    ];

    async function savePlaylists() {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, { playlists: customPlaylists, importedTracks }, { merge: true });
            } catch (error) {
                console.error('Error saving data to Firestore:', error);
            }
        }
        localStorage.setItem('harmony_playlists', JSON.stringify(customPlaylists));
        localStorage.setItem('harmony_imported_tracks', JSON.stringify(importedTracks));
    }

    async function loadUserData(user) {
        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.playlists) customPlaylists = data.playlists;
                    if (data.importedTracks) {
                        importedTracks = data.importedTracks;
                        tracks = [...baseTracks, ...importedTracks];
                    }
                    if (data.username) {
                        profileUserEmail.innerText = `@${data.username}`;
                        profileIconSpan.innerText = data.username.charAt(0).toUpperCase();
                        updateDynamicGreeting(data.username, true);
                    } else {
                        updateDynamicGreeting(user.email, false);
                    }
                }
            } catch (error) {
                console.error('Error loading data from Firestore:', error);
            }
        } else {
            const localPlaylists = localStorage.getItem('harmony_playlists');
            customPlaylists = localPlaylists ? JSON.parse(localPlaylists) : [{ name: 'Favorites', tracks: [] }];
            updateDynamicGreeting(null, false);
        }
        renderCustomPlaylists();
        updateMenuCounts();
        updateQueueUI();
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            authModalTrigger.style.display = 'none';
            signOutBtn.style.display = 'flex';
            welcomeLandingOverlay.classList.add('is-hidden');
            await loadUserData(user);
        } else {
            profileUserEmail.innerText = 'Not signed in';
            profileIconSpan.innerText = 'U';
            authModalTrigger.style.display = 'flex';
            signOutBtn.style.display = 'none';
            updateDynamicGreeting(null, false);
            await loadUserData(null);
        }
    });

    openDrawerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            drawerOverlay.classList.add('is-open');
            updateQueueUI();
            renderCustomPlaylists();
        });
    });

    closeDrawerBtn.addEventListener('click', () => {
        drawerOverlay.classList.remove('is-open');
    });

    drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) {
            drawerOverlay.classList.remove('is-open');
        }
    });

    profileImportAudioBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('is-open');
        drawerOverlay.classList.add('is-open');
        updateQueueUI();
        renderCustomPlaylists();
        audioFileInput.click();
    });

    audioFileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Please sign in to upload and stream audio files from cloud storage.');
            return;
        }

        for (const file of files) {
            try {
                const storageRef = ref(storage, `users/${currentUser.uid}/audio_tracks/${Date.now()}_${file.name}`);
                alert(`Uploading "${file.name}" to cloud storage...`);
                
                await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(storageRef);
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                const newTrack = {
                    title: nameWithoutExt,
                    artist: currentUser.email.split('@')[0],
                    cover: null,
                    lyrics: 'No lyrics available. Use Online or Local buttons above to load lyrics.',
                    src: downloadUrl
                };

                tracks.push(newTrack);
                importedTracks.push(newTrack);
            } catch (error) {
                console.error('Cloud upload error:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        savePlaylists();
        updateQueueUI();
        updateMenuCounts();
        alert('All selected audio files uploaded and ready to stream!');
        audioFileInput.value = '';
    });

    function updateQueueUI() {
        queueListEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = `queue-item ${index === currentTrackIndex ? 'active' : ''}`;
            li.innerHTML = `<span>${track.title} - ${track.artist}</span>`;
            li.addEventListener('click', () => {
                loadTrack(index);
            });
            queueListEl.appendChild(li);
        });
    }

    createPlaylistBtn.addEventListener('click', () => {
        const playlistName = prompt('Enter new playlist name:');
        if (playlistName && playlistName.trim() !== '') {
            if (!customPlaylists.some(p => p.name.toLowerCase() === playlistName.trim().toLowerCase())) {
                customPlaylists.push({ name: playlistName.trim(), tracks: [] });
                savePlaylists();
                renderCustomPlaylists();
            } else {
                alert('A playlist with this name already exists.');
            }
        }
    });

    addPlaylistBtn.addEventListener('click', () => {
        if (tracks.length === 0 || trackNameEl.innerText === 'No track selected') {
            alert('Please select a track to add to a playlist first.');
            return;
        }

        const currentTrack = tracks[currentTrackIndex];
        const playlistNames = customPlaylists.map(p => p.name).join(', ');
        const targetName = prompt(`Add "${currentTrack.title}" to which playlist?\nAvailable: ${playlistNames}`, customPlaylists[0]?.name);

        if (targetName) {
            const found = customPlaylists.find(p => p.name.toLowerCase() === targetName.trim().toLowerCase());
            if (found) {
                const trackDataToStore = { title: currentTrack.title, artist: currentTrack.artist, cover: currentTrack.cover, lyrics: currentTrack.lyrics, src: currentTrack.src };
                if (!found.tracks.some(t => t.title === currentTrack.title)) {
                    found.tracks.push(trackDataToStore);
                    savePlaylists();
                    renderCustomPlaylists();
                    alert(`Added to "${found.name}"!`);
                } else {
                    alert('Track is already in this playlist.');
                }
            } else {
                alert('Playlist not found.');
            }
        }
    });

    function renderCustomPlaylists() {
        customPlaylistsContainer.innerHTML = '';
        customPlaylists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'custom-playlist-card';
            
            let trackItems = playlist.tracks.length > 0 
                ? playlist.tracks.map(t => `<li>• ${t.title} (${t.artist})</li>`).join('') 
                : '<li style="font-style: italic;">No tracks added yet</li>';

            card.innerHTML = `
                <div class="custom-playlist-title">
                    <span><i class="fa-solid fa-compact-disc"></i> ${playlist.name}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${playlist.tracks.length} songs</span>
                </div>
                <ul class="custom-playlist-tracks">
                    ${trackItems}
                </ul>
            `;
            customPlaylistsContainer.appendChild(card);
        });
    }

    const searchBarInput = document.querySelector('.search-bar');
    const musicGridContainer = document.querySelector('.music-grid');

    searchBarInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        const musicCardsList = musicGridContainer.querySelectorAll('.music-card');
        musicCardsList.forEach(card => {
            const songName = card.getAttribute('data-song').toLowerCase();
            const artistName = card.getAttribute('data-artist').toLowerCase();
            
            if (songName.includes(query) || artistName.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        const queueItems = queueListEl.querySelectorAll('.queue-item');
        tracks.forEach((track, index) => {
            if (queueItems[index]) {
                const match = track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query);
                queueItems[index].style.display = match ? 'flex' : 'none';
            }
        });
    });
});
