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
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const featuredPlayBtn = document.getElementById('featured-play-btn');

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

// File Upload & Cloud Storage Handler
audioFileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
        const storageRef = ref(storage, 'tracks/' + file.name);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const li = document.createElement('li');
            li.textContent = file.name;
            li.addEventListener('click', () => {
                audioElement.src = downloadURL;
                currentTitle.textContent = file.name;
                audioElement.play();
            });
            playlist.appendChild(li);
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    }
});

// Player Controls
playBtn.addEventListener('click', () => {
    audioElement.play();
});

pauseBtn.addEventListener('click', () => {
    audioElement.pause();
});

featuredPlayBtn.addEventListener('click', () => {
    alert("Upload your tracks or select one from the Trending list below to play!");
});
