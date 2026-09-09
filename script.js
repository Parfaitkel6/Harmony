import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "firebase/auth";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "firebase/storage";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from "firebase/firestore";

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
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

const DB_NAME = 'HarmonyCache';
const STORE_NAME = 'account_tracks';

function openIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const idb = e.target.result;
            if (!idb.objectStoreNames.contains(STORE_NAME)) {
                idb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveLocalTrack(track) {
    try {
        const idb = await openIDB();
        return new Promise((resolve) => {
            const tx = idb.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.add(track);
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
}

async function getLocalTracks(uid) {
    try {
        const idb = await openIDB();
        return new Promise((resolve) => {
            const tx = idb.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => resolve((req.result || []).filter(t => t.uid === uid));
            req.onerror = () => resolve([]);
        });
    } catch { return []; }
}

async function deleteLocalTrack(id) {
    if (id === undefined || id === null) return;
    try {
        const idb = await openIDB();
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
    } catch (err) {
        console.warn("IndexedDB track removal error:", err);
    }
}

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

let isSeeking = false;
const defaultTracks = [
    {
        title: "Harmony Default Track",
        artist: "Harmony Official",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        isDefault: true
    }
];

function notify(msg) { console.log(`[Harmony Engine]: ${msg}`); }

// Navigation View Routing
document.querySelectorAll('.nav-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        document.querySelectorAll('.nav-icon').forEach(btn => btn.classList.remove('active'));
        icon.classList.add('active');
        
        const targetViewId = icon.getAttribute('data-target');
        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === targetViewId);
        });
    });
});

function appendTrackToPlaylist(track) {
    const li = document.createElement('li');
    li.className = 'playlist-item';

    const meta = document.createElement('div');
    meta.className = 'track-meta';

    const img = document.createElement('img');
    img.src = track.cover;
    img.className = 'track-thumb';
    img.alt = 'Cover';

    const info = document.createElement('div');
    info.className = 'playlist-item-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'playlist-item-title';
    titleSpan.textContent = track.title;

    const artistSpan = document.createElement('span');
    artistSpan.className = 'playlist-item-artist';
    artistSpan.textContent = track.artist;

    info.appendChild(titleSpan);
    info.appendChild(artistSpan);
    meta.appendChild(img);
    meta.appendChild(info);
    li.appendChild(meta);

    li.addEventListener('click', (e) => {
        if (e.target.closest('.delete-track-btn')) return;
        playTrack(track);
    });

    if (!track.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-track-btn';
        deleteBtn.title = 'Delete Track';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await removeTrack(track, li);
        });

        li.appendChild(deleteBtn);
    }

    playlist.appendChild(li);
}

function playTrack(track) {
    audioElement.src = track.url;
    currentTitle.textContent = track.title;
    currentArtist.textContent = track.artist;
    trackThumbnail.innerHTML = '';
    const img = document.createElement('img');
    img.src = track.cover;
    img.className = 'track-thumb';
    trackThumbnail.appendChild(img);
    
    audioElement.play().catch(err => notify("Playback prevented: " + err.message));
}

async function removeTrack(track, liElement) {
    liElement.remove();

    if (audioElement.src === track.url) {
        audioElement.pause();
        audioElement.src = '';
        currentTitle.textContent = 'No Track Selected';
        currentArtist.textContent = '---';
        trackThumbnail.innerHTML = '<div class="track-thumb"></div>';
        seekBar.value = 0;
        currentTimeEl.textContent = '0:00';
    }

    if (track.id) await deleteLocalTrack(track.id);

    if (track.docId) {
        try {
            await deleteDoc(doc(db, "user_tracks", track.docId));
        } catch (err) {
            console.error("Firestore removal failure:", err);
        }
    }

    if (track.storagePath) {
        try {
            const storageRef = ref(storage, track.storagePath);
            await deleteObject(storageRef);
        } catch (err) {
            console.warn("Storage binary deletion failure:", err);
        }
    }
}

function loadDefaultPlaylist() {
    playlist.innerHTML = '';
    defaultTracks.forEach(t => appendTrackToPlaylist(t));
}

async function loadAccountTracks(uid) {
    loadDefaultPlaylist();

    const cachedTracks = await getLocalTracks(uid);
    cachedTracks.forEach(t => appendTrackToPlaylist(t));

    if (uid !== 'guest') {
        try {
            const q = query(collection(db, "user_tracks"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                playlist.innerHTML = '';
                defaultTracks.forEach(t => appendTrackToPlaylist(t));
                
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    appendTrackToPlaylist({ ...data, docId: docSnap.id });
                });
            }
        } catch (err) {
            console.error("Cloud fetch error:", err);
        }
    }
}

// Authentication State Sync
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDisplay) {
            userDisplay.style.display = 'inline';
            userDisplay.textContent = user.displayName || user.email;
        }
        if (logoutBtn) logoutBtn.style.display = 'inline';
        if (authModal) authModal.style.display = 'none';

        await loadAccountTracks(user.uid);
    } else {
        if (loginBtn) loginBtn.style.display = 'inline';
        if (userDisplay) userDisplay.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';

        await loadAccountTracks('guest');
    }
});

// Modal Events
loginBtn?.addEventListener('click', () => { authModal.style.display = 'flex'; });
closeModal?.addEventListener('click', () => { authModal.style.display = 'none'; });

// Sign Up
submitSignup?.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    const displayName = profileNameInput.value.trim();

    if (!email || !password) return notify('Email and Password required.');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
            userDisplay.textContent = displayName;
        }
        authModal.style.display = 'none';
    } catch (error) {
        notify(error.message);
    }
});

// Login
submitLogin?.addEventListener('click', async () => {
    try {
        await signInWithEmailAndPassword(auth, authEmail.value.trim(), authPassword.value.trim());
        authModal.style.display = 'none';
    } catch (error) {
        notify(error.message);
    }
});

// Logout
logoutBtn?.addEventListener('click', () => signOut(auth).catch(err => notify(err.message)));

// Multi-threaded File Upload Engine with Delete Registry
audioFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i));
    if (!files.length) return;

    const user = auth.currentUser;
    const uid = user ? user.uid : 'guest';

    const uploadPromises = files.map(async (file) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const storagePath = `tracks/${uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        let audioUrl = '';
        let isCloudStored = false;

        try {
            const snapshot = await uploadBytes(storageRef, file);
            audioUrl = await getDownloadURL(snapshot.ref);
            isCloudStored = true;
        } catch (error) {
            audioUrl = URL.createObjectURL(file);
        }

        const trackMetaData = {
            uid: uid,
            title: cleanName,
            artist: user?.displayName || (uid === 'guest' ? "Guest Import" : "Uploaded Track"),
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80",
            url: audioUrl,
            storagePath: isCloudStored ? storagePath : null,
            createdAt: new Date().toISOString(),
            isDefault: false
        };

        if (isCloudStored && uid !== 'guest') {
            try {
                const docRef = await addDoc(collection(db, "user_tracks"), {
                    ...trackMetaData,
                    serverTimestamp: serverTimestamp()
                });
                trackMetaData.docId = docRef.id;
            } catch (dbErr) {
                console.error("Firestore persistence failure:", dbErr);
            }
        }

        const idbId = await saveLocalTrack(trackMetaData);
        if (idbId) trackMetaData.id = idbId;

        return trackMetaData;
    });

    const processedTracks = await Promise.all(uploadPromises);
    processedTracks.forEach(t => appendTrackToPlaylist(t));
    audioFileInput.value = '';
});

// Playback Controls
playBtn?.addEventListener('click', () => audioElement.play().catch(e => notify(e.message)));
pauseBtn?.addEventListener('click', () => audioElement.pause());

audioElement.addEventListener('loadedmetadata', () => {
    if (audioElement.duration && !isNaN(audioElement.duration)) {
        const totalMinutes = Math.floor(audioElement.duration / 60);
        const totalSeconds = Math.floor(audioElement.duration % 60);
        totalDurationEl.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    }
});

audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration && !isSeeking) {
        seekBar.value = (audioElement.currentTime / audioElement.duration) * 100;
        
        const currentMinutes = Math.floor(audioElement.currentTime / 60);
        const currentSeconds = Math.floor(audioElement.currentTime % 60);
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
    }
});

seekBar?.addEventListener('mousedown', () => { isSeeking = true; });
seekBar?.addEventListener('mouseup', () => { isSeeking = false; });
seekBar?.addEventListener('input', () => {
    if (audioElement.duration && !isNaN(audioElement.duration)) {
        audioElement.currentTime = (seekBar.value / 100) * audioElement.duration;
    }
});

featuredPlayBtn?.addEventListener('click', () => {
    if (defaultTracks.length > 0) playTrack(defaultTracks[0]);
});
