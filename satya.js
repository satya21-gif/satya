const SECRET = "MoonlightPromise"; 
let attempts = 0;

// --- 3D Starfield Engine ---
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];
let numStars = 800;
let warpSpeed = 0.5;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

for (let i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width
    });
}

function animateStars() {
    // Soft, light background trail
    ctx.fillStyle = "rgba(253, 251, 247, 0.8)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const time = Date.now(); // Get the current time for the heartbeat math

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= warpSpeed;

        // Reset particle if it passes the camera
        if (star.z <= 0) {
            star.z = canvas.width;
            star.x = Math.random() * canvas.width - cx;
            star.y = Math.random() * canvas.height - cy;
        }

        const perspective = canvas.width / star.z;
        const x = star.x * perspective + cx;
        const y = star.y * perspective + cy;
        const radius = (1 - star.z / canvas.width) * 3.5; 

        if (radius > 0) {
            if (i % 10 === 0) {
                // THE HEARTBEAT MATH: 
                // Math.sin creates a wave that goes up and down. 
                // We add 'i' so every heart beats at a slightly different time.
                let pulse = 1 + Math.sin(time / 200 + i) * 0.3; 
                let heartSize = radius * 8 * pulse; // Apply the pulse to the size
                
                drawHeart(ctx, x, y, heartSize, `rgba(255, 75, 145, ${1 - (star.z / canvas.width)})`);
            } else {
                // For the rest, draw elegant glowing pink dots
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 75, 145, ${0.7 - (star.z / canvas.width)})`;
                
                // Adds a beautiful soft glow to the dots
                ctx.shadowBlur = 6;
                ctx.shadowColor = "#ffb3d1";
                ctx.fill();
                
                // Reset shadow so it doesn't break everything else
                ctx.shadowBlur = 0; 
            }
        }
    }
    requestAnimationFrame(animateStars);
}
// --- Scene Transitions & Logic ---
function switchScene(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    setTimeout(() => {
        document.getElementById(hideId).classList.add("hidden");
        document.getElementById(showId).classList.remove("hidden");
        setTimeout(() => {
            document.getElementById(showId).classList.add("active");
        }, 50);
    }, 1500);
}

function startJourney() {
    switchScene("intro-scene", "login-scene");
}

function checkSecret() {
    const input = document.getElementById("secret-word").value.trim();
    const messageBox = document.getElementById("message-box");
    
    if (input.toUpperCase() === "I LOVE YOU") {
        messageBox.innerHTML = "I love you too. ❤️ Now enter the secret word.";
        document.getElementById("secret-word").value = "";
        return;
    }

    if (input === SECRET) {
        triggerWarpSequence();
    } else {
        attempts++;
        handleWrongPassword(messageBox);
    }
}

function triggerWarpSequence() {
    const music = document.getElementById("bg-music");
    if (music) {
        music.volume = 0.4;
        music.play().catch(e => console.log("Music interaction required first."));
    }

    document.getElementById("login-scene").classList.remove("active");
    
    let acceleration = setInterval(() => {
        warpSpeed += 1.5;
        if (warpSpeed > 40) clearInterval(acceleration);
    }, 50);

    setTimeout(() => {
        const flash = document.getElementById("flash-overlay");
        flash.classList.add("flash-active");
        
        setTimeout(() => {
            warpSpeed = 0.5;
            document.getElementById("login-scene").classList.add("hidden");
            document.getElementById("success-scene").classList.remove("hidden");
            document.getElementById("success-scene").classList.add("active");
            
            flash.classList.remove("flash-active");
            
            // 6.5 seconds for the cinematic signature before starting poetry
            setTimeout(() => {
                document.getElementById("constellation-container").style.opacity = 0; 
                setTimeout(() => {
                    document.getElementById("constellation-container").classList.add("hidden");
                    document.getElementById("poetry-container").classList.remove("hidden");
                    typePoetry();
                }, 1500);
            }, 6500);

        }, 1000);
    }, 2500);
}

function handleWrongPassword(messageBox) {
    const inputArea = document.getElementById("input-area");
    const resetBtn = document.getElementById("reset-btn");
    
    document.getElementById("secret-word").value = ""; 

    if (attempts === 1) {
        messageBox.innerHTML = "✨ That doesn't seem right...<br>Try remembering something only we know. ❤️";
    } else if (attempts === 2) {
        messageBox.innerHTML = "🌙 Some memories can't be guessed.<br>They have to be lived.";
    } else if (attempts >= 3) {
        inputArea.classList.add("hidden");
        messageBox.innerHTML = "This universe wasn't made for you.<br>Only one heart knows the secret. ❤️";
        resetBtn.classList.remove("hidden");
    }
}

function resetGate() {
    attempts = 0;
    document.getElementById("message-box").innerHTML = "";
    document.getElementById("input-area").classList.remove("hidden");
    document.getElementById("reset-btn").classList.add("hidden");
}

// --- Timeline Scroll Animation Logic ---
function startTimeline() {
    switchScene("success-scene", "timeline-scene");
    setTimeout(initScrollObserver, 1500); 
}

function initScrollObserver() {
    const cards = document.querySelectorAll('.memory-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-memory');
            } else {
                entry.target.classList.remove('active-memory');
            }
        });
    }, {
        root: null,
        rootMargin: "-35% 0px -35% 0px", 
        threshold: 0
    });

    cards.forEach(card => observer.observe(card));
}

// --- Typewriter Animation Logic ---
const poetryLines = [
    { id: "line1", text: "Every star you see..." },
    { id: "line2", text: "is a memory." },
    { id: "line3", text: "Every heartbeat..." },
    { id: "line4", text: "is a promise." },
    { id: "line5", text: "Every moment is ours." }
];

async function typePoetry() {
    for (let i = 0; i < poetryLines.length; i++) {
        await typeLine(poetryLines[i].id, poetryLines[i].text, 100); 
        await new Promise(resolve => setTimeout(resolve, 800)); 
    }
    
    const btn = document.getElementById("explore-btn");
    btn.classList.remove("hidden");
    setTimeout(() => {
        btn.style.opacity = 1;
    }, 100);
}

function typeLine(id, text, speed) {
    return new Promise(resolve => {
        let i = 0;
        let element = document.getElementById(id);
        element.innerHTML = "";
        element.classList.add("typing-cursor"); 
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove("typing-cursor"); 
                resolve();
            }
        }
        type();
    });
}

// --- Gallery Logic ---
function nextMilestone() {
    switchScene("timeline-scene", "gallery-scene");
    document.getElementById("gallery-scene").scrollTo({ top: 0, behavior: 'smooth' });
}

function flipCard(card) {
    card.classList.toggle('flipped');
}

// --- Letters Logic ---
function nextMilestoneGallery() {
    switchScene("gallery-scene", "letters-scene");
    document.getElementById("letters-scene").scrollTo({ top: 0, behavior: 'smooth' });
}

const letters = {
    'miss-me': "My love,\n\nWhenever you miss me, just look up at the night sky. We might be apart right now, but we are looking at the exact same stars. \n\nI am always with you, in your heart and in your thoughts. I miss you more.\n\nForever yours,\nSatya ❤️",
    'sad': "Hey beautiful,\n\nI hate knowing you're sad. If I were there, I'd pull you into the biggest hug and wouldn't let go until you smiled.\n\nTake a deep breath. You are incredibly strong, and whatever is bothering you, we will get through it together.\n\nI love you,\nSatya ❤️",
    'hug': "Sending a virtual hug! 🫂\n\nImagine my arms wrapping around you right now, holding you tight. \n\nYou are my safe place, and I hope I can be yours too. \n\nSmile for me!\nSatya ❤️"
};

function openLetter(id) {
    document.getElementById("letter-content").innerText = letters[id];
    document.getElementById("letter-modal").classList.add("show-modal");
}

function closeLetter() {
    document.getElementById("letter-modal").classList.remove("show-modal");
}

function nextMilestoneLetters() {
    switchScene("letters-scene", "reasons-scene");
}

// --- 100 Reasons Logic ---
const reasonsList = [
    "Because of the way your eyes light up when you smile.",
    "Because you are my safest place in the whole world.",
    "Because your laugh is my absolute favorite sound.",
    "Because you make ordinary, boring moments feel extraordinary.",
    "Because of how you support my dreams and believe in me.",
    "Because I can be 100% myself around you."
];

let currentReasonCount = 1;

function generateNextReason() {
    const container = document.getElementById("reason-container");
    
    container.style.opacity = 0;

    setTimeout(() => {
        currentReasonCount++;
        let listIndex = (currentReasonCount - 1) % reasonsList.length;
        
        document.getElementById("reason-number").innerText = "REASON #" + currentReasonCount;
        document.getElementById("reason-text").innerText = reasonsList[listIndex];
        
        container.style.opacity = 1;

        if (currentReasonCount >= 5) {
            document.getElementById("finale-btn").classList.remove("hidden");
        }
    }, 500); 
}

// --- Grand Finale & Fireworks ---
function startFinale() {
    switchScene("reasons-scene", "finale-scene");
    
    setTimeout(() => {
        resizeFwCanvas();
        animateFireworks();
        
        setInterval(createFirework, 600);
        setInterval(createFirework, 800); 
    }, 1500);
}

const fwCanvas = document.getElementById("fireworks-canvas");
const fwCtx = fwCanvas.getContext("2d");
let fireworks = [];
const colors = ['#ff4b91', '#ffb3d1', '#ffffff', '#ffd700', '#ff7eb3'];

function resizeFwCanvas() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeFwCanvas);

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.friction = 0.96;
        this.gravity = 0.05;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.015; 
    }

    draw() {
        fwCtx.globalAlpha = this.alpha;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        fwCtx.fillStyle = this.color;
        fwCtx.fill();
        fwCtx.globalAlpha = 1;
    }
}

function createFirework() {
    const x = Math.random() * fwCanvas.width;
    const y = Math.random() * (fwCanvas.height / 2); 
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 40; i++) {
        fireworks.push(new Particle(x, y, color));
    }
}

function animateFireworks() {
    requestAnimationFrame(animateFireworks);
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        
        if (fireworks[i].alpha <= 0) {
            fireworks.splice(i, 1);
        }
    }
}

// --- Countdown Timer Logic ---
const targetDate = new Date("October 15, 2026 00:00:00").getTime(); 

function revealTimer() {
    document.getElementById("reveal-timer-btn").classList.add("hidden");
    const timerContainer = document.getElementById("countdown-container");
    timerContainer.classList.remove("hidden");
    
    setTimeout(() => {
        timerContainer.style.opacity = 1;
    }, 50);

    setInterval(updateCountdown, 1000);
    updateCountdown(); 
}

function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById("cd-days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("cd-hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("cd-mins").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("cd-secs").innerText = seconds < 10 ? "0" + seconds : seconds;
    } else {
        document.getElementById("countdown-container").innerHTML = "<h2 class='glow-text'>The day is finally here! ❤️</h2>";
    }
}

// --- Send Love Back Logic ---
function goToReplyScene() {
    switchScene("finale-scene", "reply-scene");
}

function sendLove(e) {
    e.preventDefault(); 
    
    const btn = document.getElementById("send-btn");
    const status = document.getElementById("form-status");
    const form = document.getElementById("love-form");
    
    btn.innerText = "Sending across the universe... ✨";
    const formData = new FormData(form);
    
    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            btn.innerText = "Sent! 💌";
            btn.style.background = "rgba(46, 213, 115, 0.4)"; 
            btn.style.borderColor = "rgba(46, 213, 115, 0.8)";
            status.innerText = "Your message is flying through the stars!";
            status.style.display = "block";
            form.reset();
        } else {
            btn.innerText = "Try Again";
            status.innerText = "Oops! Something went wrong in the universe.";
            status.style.display = "block";
        }
    })
    .catch(error => {
        btn.innerText = "Try Again";
        status.innerText = "Oops! Something went wrong.";
        status.style.display = "block";
    });
}