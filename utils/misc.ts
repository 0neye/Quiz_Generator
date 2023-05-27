import gsap from "gsap";
/**
 * Generates a text generation effect by shuffling through a given string's characters
 * and replacing them at a given interval to create the illusion of text being typed out.
 *
 * @param ref - A reference to the string value to be modified.
 * @param lettersPerSecond - The number of letters to be shuffled through per second. 
 */
export function textGenerationEffect(ref: Ref<string>, lettersPerSecond: number) {
    // Get the original string value
    const original = ref.value;
    ref.value = "";
    // Set the initial index to 0
    let index = 0;
    // Set the interval duration based on the letters per second
    const duration = 1000 / lettersPerSecond;
    // Create an array of possible characters to shuffle through
    const chars = "abcdefghijklmnopqrstuvwxyz";
    // Start an interval
    const interval = setInterval(() => {
        // If the index is equal to the length of the original string, stop the interval
        if (index === original.length) {
            clearInterval(interval);
            ref.value = original;
            return;
        }
        // Get a random character from the chars array
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        // Append the random character to the current string value
        ref.value += randomChar;
        // Increment the index
        index++;
        // Wait for half of the duration, then replace the random character with the original one
        setTimeout(() => {
            ref.value = ref.value.slice(0, -1) + original[index - 1];
        }, duration / 2);
    }, duration);
}

/**
 * Animates a growing effect on the target element of a mouse event using GSAP library.
 * 
 * @param event - The mouse event that triggered the function.
 */
export function grow(event: MouseEvent) {
    //console.log(event.target);
    gsap.to(event.target, {
        duration: 0.2,
        scale: 1.1,
        ease: "power2.inOut",
    });
}
/**
 * Animates a shrinking effect on the target element of a mouse event using GSAP library.
 *
 * @param {MouseEvent} event - The mouse event that triggered the animation.
 */
export function shrink(event: MouseEvent) {
    gsap.to(event.target, {
        duration: 0.3,
        scale: 1,
        ease: "power2.inOut",
    });
}

// Define a Particle class with properties such as x, y, vx, vy, alpha, color
class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: Array<number>;
    hitMaxAlpha: boolean;

    constructor(x: number, y: number, vx: number, vy: number, alpha: number, color: Array<number>, hitMaxAlpha: boolean = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.alpha = alpha;
        this.color = color;
        this.hitMaxAlpha = hitMaxAlpha;
    }
}

/**
 * Function to animate a canvas with particles and lines.
 * @returns {void}
 */
export function animateCanvas() {
    if (!process.client) return;
    // Get the canvas and context
    let canvas: any
    let ctx: any
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;


    // scroll effect adds upward/downward velocity in the opposite direction
    // implemented in the updateParticlea and createParticle functions, and main loop
    let scrolled = 0; // used below
    let scrollSpeed = 0;


    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScrollTop > lastScrollTop) {
            scrolled = -1;
            console.log(scrolled);
        } else {
            scrolled = 1;
            console.log(scrolled);
        }
        scrollSpeed = PARTICLE_SPEED * scrolled * 0.5; //kinda magic

        lastScrollTop = currentScrollTop;
    });


    // Define some "constants"
    let MAX_PARTICLES = 50; // The maximum number of particles
    const PARTICLE_SIZE = 3; // The size of each particle
    const PARTICLE_SPEED = 0.7; // The speed of each particle
    const SCROLL_EFFECT_MAX_SPEED = PARTICLE_SPEED * 3; // The maximum speed of the particles after the scroll effect
    const LINE_DISTANCE = 350; // The maximum distance between two particles to draw a line
    const LINE_WIDTH = 0.5; // The width of the line
    const LINE_COLOR = [100, 120, 150]; // The base color of the line
    const PARTICLE_COLOR = [100, 120, 150]; // The color of the particles

    // Define a function to create a new particle with random position, velocity, and alpha
    function createParticle(): Particle {
        // Generate random values for x, y, vx, vy, and alpha
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = Math.random() * PARTICLE_SPEED * 2 - PARTICLE_SPEED;
        const vy = Math.random() * (PARTICLE_SPEED * 2 - PARTICLE_SPEED) + scrollSpeed; // so new particles maintain the scroll effect
        const alpha = Math.random();

        // Return a new particle with gray color
        return new Particle(x, y, vx, vy, alpha, PARTICLE_COLOR);
    }

    // Define a function to update a particle's position, velocity, and alpha
    function updateParticle(p: Particle): void {
        // Update the position by adding the velocity
        p.x += p.vx;
        p.y += p.vy;

        // Dampening the velocity if it's out of bounds of PARTICLE_SPEED
        if (p.vx > PARTICLE_SPEED) p.vx -= PARTICLE_SPEED * 0.1;
        if (p.vx < -PARTICLE_SPEED) p.vx -= -PARTICLE_SPEED * 0.1;
        if (p.vy > PARTICLE_SPEED) p.vy -= PARTICLE_SPEED * 0.1;
        if (p.vy < -PARTICLE_SPEED) p.vy -= -PARTICLE_SPEED * 0.1;
        // Clamp it if it's over the max speed
        if (p.vx > SCROLL_EFFECT_MAX_SPEED) p.vx = SCROLL_EFFECT_MAX_SPEED;
        if (p.vx < -SCROLL_EFFECT_MAX_SPEED) p.vx = -SCROLL_EFFECT_MAX_SPEED;
        if (p.vy > SCROLL_EFFECT_MAX_SPEED) p.vy = SCROLL_EFFECT_MAX_SPEED;
        if (p.vy < -SCROLL_EFFECT_MAX_SPEED) p.vy = -SCROLL_EFFECT_MAX_SPEED;

        // Update the alpha
        if (p.alpha > 1) {
            p.hitMaxAlpha = true;
        }
        if (!p.hitMaxAlpha) {
            p.alpha += 0.005;
        } else {
            p.alpha -= 0.005;
        }

        // Wrap the position around the canvas edges
        if (p.x < 0) p.x += canvas.width;
        if (p.x > canvas.width) p.x -= canvas.width;
        if (p.y < 0) p.y += canvas.height;
        if (p.y > canvas.height) p.y -= canvas.height;
    }

    // Define a function to draw a particle on the canvas
    function drawParticle(p: Particle): void {
        // Set the fill style to the particle's color and alpha
        ctx.fillStyle = `rgba(${PARTICLE_COLOR[0]},${PARTICLE_COLOR[1]},${PARTICLE_COLOR[2]},${p.alpha})`;

        // Draw a circle at the particle's position with the particle's size
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }

    // Define a function to check the distance between two particles
    function getDistance(p1: Particle, p2: Particle): number {
        // Use the Pythagorean theorem to calculate the distance
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Define a function to draw a line between two particles with opacity based on distance
    function drawLine(p1: Particle, p2: Particle): void {
        // Calculate the distance between the particles
        const d = getDistance(p1, p2);

        // If the distance is less than the maximum distance
        if (d < LINE_DISTANCE) {
            // Calculate the opacity based on the distance
            const opacity = (LINE_DISTANCE - d) / LINE_DISTANCE * p1.alpha * p2.alpha * 2;

            // Set the stroke style to the line color and opacity
            ctx.strokeStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${opacity})`;

            // Set the line width to the constant value
            ctx.lineWidth = LINE_WIDTH;

            // Draw a line from p1 to p2
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    // Create an array to store the particles
    const particles: Particle[] = [];

    // Create a loop that runs every frame
    function loop(): void {
        // respond to changes in the window size
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        MAX_PARTICLES = Math.floor(canvas.width / 50); // magic number

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // For each particle in the array
        for (let i = 0; i < particles.length; i++) {
            // Get the current particle
            const p = particles[i];

            // For the scroll effect
            if (scrolled != 0) {
                p.vy += scrollSpeed;
            }

            // Update its position, velocity, and alpha
            updateParticle(p);

            // Draw it on the canvas
            drawParticle(p);

            // If its alpha is zero or it is out of bounds, remove it from the array
            if (p.alpha <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
                particles.splice(i, 1);
                i--;
            }
        }
        scrolled = 0;

        // Create a new particle and add it to the array
        if (particles.length < MAX_PARTICLES) {
            const newParticle = createParticle();
            particles.push(newParticle);
        }

        // For each pair of particles in the array
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                // Get the current pair of particles
                const p1 = particles[i];
                const p2 = particles[j];

                // If they are within a certain distance, draw a line between them with opacity based on distance
                drawLine(p1, p2);
            }
        }

        // Request the next frame
        requestAnimationFrame(loop);
    }
    // Start the loop
    loop()
}
