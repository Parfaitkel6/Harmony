import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
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
    // --- Toast Notification System ---
    function showPlatformToast(message, type = 'info') {
        const existingToast = document.querySelector('.platform-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `platform-toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: rgba(20, 20, 30, 0.92);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 12px 18px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
            z-index: 99999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: translateY(15px);
        `;
        toast.innerText = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- Sidebar Toggle Logic (Desktop Rail Collapse / Mobile Off-canvas Drawer) ---
    const appLayout = document.querySelector('.app-layout');
    const sidebar = document.querySelector('.sidebar');
    const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
    const toggleTriggers = document.querySelectorAll('.sidebar-trigger');

    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('is-open');
            sidebarBackdrop.classList.toggle('is-open');
        } else {
            appLayout.classList.toggle('sidebar-collapsed');
        }
    }

    toggleTriggers.forEach(btn => btn.addEventListener('click', toggleSidebar));
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', toggleSidebar);

    // --- Navigation & Dynamic Views ---
    const menuLinks = document.querySelectorAll('.menu a');
    const musicGridContainer = document.querySelector('.music-grid');
    const sectionTitle = document.querySelector('.section-title');
    const featuredBanner = document.querySelector('.featured-album-banner');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('open-playlist-drawer-btn')) return;
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('is-open');
                sidebarBackdrop.classList.remove('is-open');
            }

            const menuText = link.innerText.trim().toLowerCase();
            renderDynamicMenuView(menuText);
        });
    });

    function updateCounts() {
        const albumsCountEl = document.querySelector('.albums-count');
        const artistsCountEl = document.querySelector('.artists-count');
        const uniqueAlbums = [...new Set(tracks.map(t => t.album).filter(Boolean))];
        const uniqueArtists = [...new Set(tracks.map(t => t.artist).filter(Boolean))];
        if (albumsCountEl) albumsCountEl.innerText = uniqueAlbums.length;
        if (artistsCountEl) artistsCountEl.innerText = uniqueArtists.length;
    }

    function renderDynamicMenuView(viewName) {
        if (!musicGridContainer) return;

        if (viewName.includes('discover') || viewName.includes('home')) {
            if (sectionTitle) sectionTitle.innerText = "Trending Now";
            if (featuredBanner) featuredBanner.style.display = 'block';
            musicGridContainer.innerHTML = '';
            tracks.forEach((track, index) => {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.innerHTML = `
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
            if (featuredBanner) featuredBanner.style.display = 'none';
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
            if (featuredBanner) featuredBanner.style.display = 'none';
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
                    <div class="music-card-info">
                        <h4>${artist}</h4>
                        <p>Artist Profile</p>
                    </div>
                `;
                musicGridContainer.appendChild(card);
            });
            return;
        }
    }

    // --- Profile Dropdowns ---
    const profileContainers = document.querySelectorAll('.profile-container, .header-profile-trigger');
    const profileDropdown = document.querySelector('.profile-dropdown');

    profileContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profileDropdown) profileDropdown.classList.toggle('is-open');
        });
    });

    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('is-open');
    });

    // --- Firebase Authentication ---
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
                showPlatformToast(`Auth Error: ${error.message}`, 'error');
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

    // --- Audio Engine ---
    const musicCards = document.querySelectorAll('.music-card');
    const trackNameEl = document.querySelector('.track-name');
    const trackArtistEl = document.querySelector('.track-artist');
    const playPauseBtns = document.querySelectorAll('.play-pause');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const progressBar = document.querySelectorAll('.progress-bar');
    const currentTimeEls = document.querySelectorAll('.current-time');
    const totalTimeEls = document.querySelectorAll('.total-time');
    const playNowBtn = document.querySelector('.play-now-btn');

    let baseTracks = Array.from(musicCards).map((card, index) => ({
        title: card.getAttribute('data-song') || 'Track ' + (index + 1),
        artist: card.getAttribute('data-artist') || 'Unknown Artist',
        album: card.getAttribute('data-album') || 'Single',
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

    updateCounts();

    if (playNowBtn) {
        playNowBtn.addEventListener('click', () => loadTrack(0));
    }

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
            progressBar.forEach(bar => bar.value = progressPercent);
            currentTimeEls.forEach(el => el.innerText = formatTime(audioElement.currentTime));
            totalTimeEls.forEach(el => el.innerText = formatTime(audioElement.duration));
        }
    });

    audioElement.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    });

    // --- Playlist & Upload Handlers ---
    const drawerOverlay = document.querySelector('.playlist-drawer-overlay');
    const openDrawerBtns = document.querySelectorAll('.open-playlist-drawer-btn');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const queueListEl = document.querySelector('.queue-list');
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const profileImportAudioBtn = document.querySelector('.profile-import-audio-btn');

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
                showPlatformToast('Please sign in to upload audio tracks.', 'error');
                return;
            }

            for (const file of files) {
                try {
                    const storageRef = ref(storage, `users/${currentUser.uid}/playlists/Playlist/${Date.now()}_${file.name}`);
                    showPlatformToast(`Uploading "${file.name}"...`, 'info');
                    
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    const cleanTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                    const newTrack = {
                        title: cleanTitle,
                        artist: currentUser.email.split('@')[0],
                        album: 'Imported Playlist',
                        src: downloadUrl
                    };

                    tracks.push(newTrack);
                    importedTracks.push(newTrack);
                } catch (error) {
                    showPlatformToast(`Upload failed: ${error.message}`, 'error');
                }
            }

            localStorage.setItem('harmony_imported_tracks', JSON.stringify(importedTracks));
            updateQueueUI();
            updateCounts();
            showPlatformToast('Tracks successfully imported!', 'success');
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
                showPlatformToast(`Playlist "${pName}" created!`, 'success');
            }
        });
    }
});
