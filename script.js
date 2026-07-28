// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8F8Buvjfx4XWWub0w0L5kIKjIr2h8D2I",
  authDomain: "harmony-64d79.firebaseapp.com",
  projectId: "harmony-64d79",
  storageBucket: "harmony-64d79.firebasestorage.app",
  messagingSenderId: "863416638733",
  appId: "1:863416638733:web:526e6628f1ee4fedd8a444",
  measurementId: "G-EKP6JXXT8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const authModal = document.getElementById('auth-modal');
const closeModal = document.getElementById('close-modal');
const submitLogin = document.getElementById('submit-login');
const submitSignup = document.getElementById('submit-signup');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const profileNameInput = document.getElementById('profile-name');

const audioFileInput = document.getElementById('audio-file-input');
const playlist = document.getElementById('playlist');
const audioElement = document.getElementById('audio-element');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const trackThumbnail = document.getElementById('track-thumbnail');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const featuredPlayBtn = document.getElementById('featured-play-btn');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

// Sidebar Toggles Navigation
const navIcons = document.querySelectorAll('.nav-icon');
const viewPanels = document.querySelectorAll('.view-panel');

navIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        navIcons.forEach(btn => btn.classList.remove('active'));
        icon.classList.add('active');
        
        const targetViewId = icon.getAttribute('data-target');
        viewPanels.forEach(panel => {
            if(panel.id === targetViewId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    });
});

// Default Tracks for All Accounts
const defaultTracks = [
    {
        title: "Harmony Default Track",
        artist: "Harmony Official",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    }
];

function loadDefaultPlaylist() {
    playlist.innerHTML = '';
    defaultTracks.forEach(track => {
        appendTrackToPlaylist(track.title, track.artist, track.cover, track.url);
    });
}

function appendTrackToPlaylist(title, artist, coverUrl, audioUrl) {
    const li = document.createElement('li');
    li.innerHTML = `
        <img src="${coverUrl}" class="track-thumb" alt="Cover">
        <div class="playlist-item-info">
            <span class="playlist-item-title">${title}</span>
            <span class="playlist-item-artist">${artist}</span>
        </div>
    `;
    li.addEventListener('click', () => {
        audioElement.src = audioUrl;
        currentTitle.textContent = title;
        currentArtist.textContent = artist;
        trackThumbnail.innerHTML = `<img src="${coverUrl}" alt="Cover">`;
        audioElement.play();
    });
    playlist.appendChild(li);
}

// Initialize default playlist on load
loadDefaultPlaylist();

// Authentication State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        userDisplay.style.display = 'inline';
        logoutBtn.style.display = 'inline';
        const displayName = user.displayName ? user.displayName : user.email;
        userDisplay.textContent = displayName;
        loginBtn.textContent = displayName.charAt(0).toUpperCase();
        authModal.style.display = 'none';
    } else {
        loginBtn.style.display = 'flex';
        userDisplay.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginBtn.textContent = 'U';
    }
    // Ensure default tracks persist for any session/account
    loadDefaultPlaylist();
});

// Modal Events
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Sign Up Handler with Profile Name Support
submitSignup.addEventListener('click', async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
        const user = userCredential.user;

        if (profileNameInput.value.trim() !== "") {
            await updateProfile(user, {
                displayName: profileNameInput.value.trim()
            });
            userDisplay.textContent = user.displayName;
        }

        alert('Account created successfully!');
        authModal.style.display = 'none';
    } catch (error) {
        alert(error.message);
    }
});

// Login Handler
submitLogin.addEventListener('click', async () => {
    try {
        await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
        authModal.style.display = 'none';
    } catch (error) {
        alert(error.message);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

// Universal Audio File Importation Handler (Accepts any audio extension/type)
audioFileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
        const storageRef = ref(storage, 'tracks/' + file.name);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const artist = auth.currentUser && auth.currentUser.displayName ? auth.currentUser.displayName : "Uploaded Track";
            const cover = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80";

            appendTrackToPlaylist(title, artist, cover, downloadURL);
        } catch (error) {
            console.error("Error uploading file: ", error);
            // Fallback for local testing without active storage rules or offline selection
            const localURL = URL.createObjectURL(file);
            const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            appendTrackToPlaylist(title, "Local Artist", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80", localURL);
        }
    }
});

// Player Controls & Progress Syncing
playBtn.addEventListener('click', () => {
    audioElement.play();
});

pauseBtn.addEventListener('click', () => {
    audioElement.pause();
});

audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        seekBar.value = progressPercent;
        
        let currentMinutes = Math.floor(audioElement.currentTime / 60);
        let currentSeconds = Math.floor(audioElement.currentTime % 60);
        if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;

        let totalMinutes = Math.floor(audioElement.duration / 60);
        let totalSeconds = Math.floor(audioElement.duration % 60);
        if (totalSeconds < 10) totalSeconds = "0" + totalSeconds;
        totalDurationEl.textContent = `${totalMinutes}:${totalSeconds}`;
    }
});

seekBar.addEventListener('input', () => {
    if (audioElement.duration) {
        const seekTime = (seekBar.value / 100) * audioElement.duration;
        audioElement.currentTime = seekTime;
    }
});

featuredPlayBtn.addEventListener('click', () => {
    if(defaultTracks.length > 0) {
        audioElement.src = defaultTracks[0].url;
        currentTitle.textContent = defaultTracks[0].title;
        currentArtist.textContent = defaultTracks[0].artist;
        trackThumbnail.innerHTML = `<img src="${defaultTracks[0].cover}" alt="Cover">`;
        audioElement.play();
    }
});
