import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
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
    // --- Custom Platform Toast Notification System ---
    function showPlatformToast(message, type = 'info') {
        const existingToast = document.querySelector('.platform-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `platform-toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(20, 20, 30, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 14px 22px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            z-index: 99999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: translateY(20px);
        `;
        toast.innerText = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- Sidebar Toggle ---
    const sidebar = document.querySelector('.sidebar');
    const sidebarTrigger = document.querySelector('.sidebar-trigger');

    if (sidebar && sidebarTrigger) {
        sidebarTrigger.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // --- Menu Navigation & Dynamic View Rendering ---
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('open-playlist-drawer-btn')) return;
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');

            const menuText = link.innerText.trim().toLowerCase();
            renderDynamicMenuView(menuText);
        });
    });

    function renderDynamicMenuView(viewName) {
        const musicGridContainer = document.querySelector('.music-grid');
        const sectionTitle = document.querySelector('.section-title');
        if (!musicGridContainer) return;

        if (viewName.includes('home')) {
            if (sectionTitle) sectionTitle.innerText = "Trending Songs";
            musicGridContainer.innerHTML = '';
            tracks.forEach((track, index) => {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.innerHTML = `
                    <div class="music-card-art placeholder-art"><i class="fa-solid fa-music"></i></div>
                    <div class="music-card-info">
                        <h4>${track.title}</h4>
                        <p>${track.artist}</p>
                    </div>
                `;
                card.addEventListener('click', () => loadTrack(index));
                musicGridContainer.appendChild(card);
            });
            return;
        }

        if (viewName.includes('album')) {
            if (sectionTitle) sectionTitle.innerText = "Albums";
            musicGridContainer.innerHTML = '';
            const albums = tracks.filter(t => t.album);
            if (albums.length === 0) {
                musicGridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">You have no albums</div>`;
                return;
            }
            albums.forEach((track, index) => {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.innerHTML = `
                    <div class="music-card-art placeholder-art"><i class="fa-solid fa-compact-disc"></i></div>
                    <div class="music-card-info">
                        <h4>${track.album}</h4>
                        <p>${track.artist}</p>
                    </div>
                `;
                card.addEventListener('click', () => loadTrack(index));
                musicGridContainer.appendChild(card);
            });
            return;
        }

        if (viewName.includes('artist')) {
            if (sectionTitle) sectionTitle.innerText = "Artists";
            musicGridContainer.innerHTML = '';
            const uniqueArtists = [...new Set(tracks.map(t => t.artist))];
            if (uniqueArtists.length === 0) {
                musicGridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">You have no artists</div>`;
                return;
            }
            uniqueArtists.forEach(artist => {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.innerHTML = `
                    <div class="music-card-art placeholder-art" style="border-radius: 50%;"><i class="fa-solid fa-user"></i></div>
                    <div class="music-card-info" style="text-align: center;">
                        <h4>${artist}</h4>
                        <p>Artist</p>
                    </div>
                `;
                musicGridContainer.appendChild(card);
            });
            return;
        }
    }

    // --- Profile Dropdown Toggle ---
    const profileContainer = document.querySelector('.profile-container');
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (profileIcon && profileDropdown) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('is-open');
        });
        document.addEventListener('click', (e) => {
            if (profileContainer && !profileContainer.contains(e.target)) {
                profileDropdown.classList.remove('is-open');
            }
        });
    }

    // --- Authentication & Email Verification Handler ---
    const welcomeLandingOverlay = document.querySelector('.welcome-landing-overlay');
    const landingAuthForm = document.getElementById('landing-auth-form');
    const skipWelcomeLink = document.querySelector('.skip-welcome-link');
    const welcomeAuthTabs = document.querySelectorAll('.welcome-landing-card .auth-tab');
    let landingAuthMode = 'login';

    welcomeAuthTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            welcomeAuthTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            landingAuthMode = tab.getAttribute('data-tab');
            const submitBtn = welcomeLandingOverlay?.querySelector('.auth-submit-btn');
            if (submitBtn) submitBtn.innerText = landingAuthMode === 'login' ? 'Sign In' : 'Register Account';
            const usernameGroup = document.querySelector('.landing-username-group');
            if (usernameGroup) usernameGroup.style.display = landingAuthMode === 'signup' ? 'flex' : 'none';
        });
    });

    if (landingAuthForm) {
        landingAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('landing-auth-email').value.trim();
            const password = document.getElementById('landing-auth-password').value.trim();
            const username = document.getElementById('landing-auth-username')?.value.trim() || email.split('@')[0];

            try {
                if (landingAuthMode === 'signup') {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    await sendEmailVerification(user);
                    await setDoc(doc(db, 'users', user.uid), { username, email }, { merge: true });
                    showPlatformToast('Account created! Verification email sent. Check your inbox.', 'success');
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                    showPlatformToast('Signed in successfully!', 'success');
                }
                if (welcomeLandingOverlay) welcomeLandingOverlay.classList.add('is-hidden');
            } catch (error) {
                showPlatformToast(`Authentication Error: ${error.message}`, 'error');
            }
        });
    }

    if (skipWelcomeLink && welcomeLandingOverlay) {
        skipWelcomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            welcomeLandingOverlay.classList.add('is-hidden');
        });
    }

    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                showPlatformToast('Signed out successfully.', 'info');
                if (profileDropdown) profileDropdown.classList.remove('is-open');
                if (welcomeLandingOverlay) welcomeLandingOverlay.classList.remove('is-hidden');
            } catch (error) {
                showPlatformToast(`Sign out error: ${error.message}`, 'error');
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        const profileUserEmail = document.querySelector('.profile-user-email');
        const profileUsername = document.querySelector('.profile-username');
        if (user) {
            if (profileUserEmail) profileUserEmail.innerText = user.email;
            if (profileUsername) profileUsername.innerText = user.email.split('@')[0];
            if (signOutBtn) signOutBtn.style.display = 'flex';
            if (welcomeLandingOverlay) welcomeLandingOverlay.classList.add('is-hidden');
        } else {
            if (profileUserEmail) profileUserEmail.innerText = 'Not signed in';
            if (profileUsername) profileUsername.innerText = 'Music Lover';
            if (signOutBtn) signOutBtn.style.display = 'none';
        }
    });

    // --- Audio Engine & Playback State ---
    const musicCards = document.querySelectorAll('.music-card');
    const trackNameEl = document.querySelector('.track-name');
    const trackArtistEl = document.querySelector('.track-artist');
    const playPauseBtns = document.querySelectorAll('.play-pause');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const progressBar = document.querySelectorAll('.progress-bar');
    const currentTimeEls = document.querySelectorAll('.current-time');
    const totalTimeEls = document.querySelectorAll('.total-time');

    let baseTracks = Array.from(musicCards).map((card, index) => ({
        title: card.getAttribute('data-song') || 'Track ' + (index + 1),
        artist: card.getAttribute('data-artist') || 'Unknown Artist',
        cover: null,
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
        
        if (trackNameEl) trackNameEl.innerText = track.title;
        if (trackArtistEl) trackArtistEl.innerText = track.artist;

        audioElement.src = track.src;
        audioElement.load();
        playTrack();
        updateQueueUI();
    }

    function playTrack() {
        audioElement.play().then(() => {
            isPlaying = true;
            playPauseBtns.forEach(btn => btn.innerHTML = '<i class="fa-solid fa-pause"></i>');
        }).catch(err => console.log("Playback prevented:", err));
    }

    function pauseTrack() {
        audioElement.pause();
        isPlaying = false;
        playPauseBtns.forEach(btn => btn.innerHTML = '<i class="fa-solid fa-play"></i>');
    }

    playPauseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!audioElement.src) loadTrack(0);
            else if (isPlaying) pauseTrack();
            else playTrack();
        });
    });

    nextBtns.forEach(btn => btn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    }));

    prevBtns.forEach(btn => btn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
    }));

    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.forEach(bar => {
                bar.value = progressPercent;
                bar.style.setProperty('--slider-fill', `${progressPercent}%`);
            });
            currentTimeEls.forEach(el => el.innerText = formatTime(audioElement.currentTime));
            totalTimeEls.forEach(el => el.innerText = formatTime(audioElement.duration));
        }
    });

    audioElement.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    });

    // --- Playlist & Local Audio Import Routing ---
    const drawerOverlay = document.querySelector('.playlist-drawer-overlay');
    const openDrawerBtns = document.querySelectorAll('.open-playlist-drawer-btn');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const queueListEl = document.querySelector('.queue-list');
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const profileImportAudioBtn = document.querySelector('.profile-import-audio-btn');

    let customPlaylists = JSON.parse(localStorage.getItem('harmony_playlists')) || [{ name: 'Playlist', tracks: [] }];

    async function savePlaylists() {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await setDoc(doc(db, 'users', currentUser.uid), { playlists: customPlaylists, importedTracks }, { merge: true });
            } catch (err) {
                console.error("Firestore sync error:", err);
            }
        }
        localStorage.setItem('harmony_playlists', JSON.stringify(customPlaylists));
        localStorage.setItem('harmony_imported_tracks', JSON.stringify(importedTracks));
    }

    openDrawerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (drawerOverlay) drawerOverlay.classList.add('is-open');
            updateQueueUI();
        });
    });

    if (closeDrawerBtn && drawerOverlay) {
        closeDrawerBtn.addEventListener('click', () => drawerOverlay.classList.remove('is-open'));
    }

    if (profileImportAudioBtn && audioFileInput) {
        profileImportAudioBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (profileDropdown) profileDropdown.classList.remove('is-open');
            if (drawerOverlay) drawerOverlay.classList.add('is-open');
            audioFileInput.click();
        });
    }

    if (audioFileInput) {
        audioFileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            const currentUser = auth.currentUser;
            if (!currentUser) {
                showPlatformToast('Please sign in to upload audio tracks to cloud storage.', 'error');
                return;
            }

            let playlistTarget = customPlaylists.find(p => p.name.toLowerCase() === 'playlist') || customPlaylists[0];
            if (!playlistTarget) {
                playlistTarget = { name: 'Playlist', tracks: [] };
                customPlaylists.push(playlistTarget);
            }

            for (const file of files) {
                try {
                    const storageRef = ref(storage, `users/${currentUser.uid}/playlists/Playlist/${Date.now()}_${file.name}`);
                    showPlatformToast(`Uploading "${file.name}" to Playlist...`, 'info');
                    
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    const cleanTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                    const newTrack = {
                        title: cleanTitle,
                        artist: currentUser.email.split('@')[0],
                        cover: null,
                        src: downloadUrl,
                        playlist: 'Playlist'
                    };

                    tracks.push(newTrack);
                    importedTracks.push(newTrack);
                    
                    if (!playlistTarget.tracks.some(t => t.title === newTrack.title)) {
                        playlistTarget.tracks.push(newTrack);
                    }
                } catch (error) {
                    showPlatformToast(`Upload failed: ${error.message}`, 'error');
                }
            }

            await savePlaylists();
            updateQueueUI();
            showPlatformToast('Imported tracks successfully saved to Playlist!', 'success');
            audioFileInput.value = '';
        });
    }

    function updateQueueUI() {
        if (!queueListEl) return;
        queueListEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = `queue-item ${index === currentTrackIndex ? 'active' : ''}`;
            li.innerHTML = `<span>${track.title} - ${track.artist}</span>`;
            li.addEventListener('click', () => loadTrack(index));
            queueListEl.appendChild(li);
        });
    }

    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', () => {
            const pName = prompt('Enter new playlist name:');
            if (pName && pName.trim() !== '') {
                if (!customPlaylists.some(p => p.name.toLowerCase() === pName.trim().toLowerCase())) {
                    customPlaylists.push({ name: pName.trim(), tracks: [] });
                    savePlaylists();
                    showPlatformToast(`Playlist "${pName}" created!`, 'success');
                } else {
                    showPlatformToast('Playlist already exists.', 'error');
                }
            }
        });
    }
});
