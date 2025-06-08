import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Function to generate a random number within a range
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let container: HTMLElement | null = null;
let numStars: number = 0; // 'numStars' is read when calculating number of stars.
let stars: HTMLDivElement[] = []; // Store references to star elements
let starScrollTriggers: ScrollTrigger[] = []; // To store ScrollTriggers for cleanup

// Function to create a star element
export function createStar(): HTMLDivElement | null {
  if (!container) return null;

  const star: HTMLDivElement = document.createElement('div');
  star.className = `star`;

  const xPos: number = getRandomInt(0, container.clientWidth);
  const yPos: number = getRandomInt(0, container.clientHeight);
  const size: number = getRandomInt(1, 4); // Size 1 to 4
  const opacity: number = Math.random();

  star.style.position = 'absolute';
  star.style.backgroundColor = '#a8782f';
  star.style.borderRadius = '50%';
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.left = `${xPos}px`;
  star.style.top = `${yPos}px`;
  star.style.opacity = `${opacity}`;
  star.dataset.originalOpacity = opacity.toString();
  star.dataset.initialY = yPos.toString(); // Store initial Y position
  star.dataset.starSize = size.toString(); // Store star size for speed variation

  return star;
}

// This function will now set up the ScrollTrigger animations for each star
export function setupStarParallax(): void {
  if (!container) return; // Ensure container is ready

  // Kill any existing ScrollTriggers related to stars to prevent duplicates
  starScrollTriggers.forEach((st) => st.kill());
  starScrollTriggers = []; // Clear the array

  const starsElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('.star'); // Get current stars

  // Calculate the total scrollable height of the document
  const scrollableHeight: number = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  if (scrollableHeight <= 0) {
    console.warn(
      "No scrollable height detected. Ensure your 'body' or main content has sufficient height to allow scrolling.",
    );
    return;
  }

  starsElements.forEach((star: HTMLDivElement) => {
    const initialY: number = parseFloat(star.dataset.initialY || '0');
    const starSize: number = parseFloat(star.dataset.starSize || '1');

    // Adjust speed based on star size: larger stars move faster
    const baseParallaxSpeed: number = 0.08;
    const sizeFactor: number = 0.07;
    const effectiveParallaxSpeed: number =
      baseParallaxSpeed + (starSize - 1) * sizeFactor;

    // Define the total Y movement range for this star.
    const totalStarMovement: number =
      -scrollableHeight * effectiveParallaxSpeed; // Negative to move upwards

    // Create the GSAP tween that ScrollTrigger will "scrub"
    const starTween = gsap.to(star, {
      y: totalStarMovement, // Animate Y property to this total displacement
      ease: 'none', // Critical for linear parallax
      paused: true, // Best practice: Pause the tween, ScrollTrigger will control it
    });

    // Create the ScrollTrigger for each star
    const st = ScrollTrigger.create({
      trigger: 'body', // The element that defines the scrollable area
      start: 'top top', // When the top of the body hits the top of the viewport
      end: 'bottom top', // When the bottom of the body hits the top of the viewport
      scrub: true, // Links the animation progress directly to scroll progress
      animation: starTween, // The tween to be scrubbed

      // The onUpdate callback is where we handle the continuous looping.
      // Removed 'self' parameter as it's not directly used in the current logic.
      onUpdate: () => {
        const currentTotalOffset: number = window.scrollY;

        const starHeight = star.offsetHeight;
        const currentContainerHeight = container!.clientHeight;

        // Calculate the star's desired y position based on current scroll and its speed.
        const rawY = initialY - currentTotalOffset * effectiveParallaxSpeed;

        // Apply looping logic to `rawY` to get `newLoopedY`.
        let newLoopedY = rawY;

        // If the star moves entirely off-screen above the top, bring it to the bottom.
        while (newLoopedY + starHeight < 0) {
          newLoopedY += currentContainerHeight;
        }
        // If the star moves entirely off-screen below the bottom, bring it to the top.
        while (newLoopedY > currentContainerHeight) {
          newLoopedY -= currentContainerHeight;
        }

        // Directly set the star's y position.
        gsap.set(star, { y: newLoopedY });
      },
      // markers: true, // Uncomment for debugging during development
    });
    starScrollTriggers.push(st); // Store for cleanup
  });

  // No window scroll listener is needed here because ScrollTrigger handles it.
  // The 'updateStarPositions' function no longer exists.
}

export function createStars(): void {
  container = document.getElementById('body');
  if (!container) {
    console.warn("Container with ID 'body' not found.");
    return;
  }

  // Clear existing ScrollTriggers before creating new ones
  starScrollTriggers.forEach((st) => st.kill());
  starScrollTriggers = [];

  // Clear existing star DOM elements and array
  stars.forEach((star) => {
    if (container && star.parentNode === container) {
      container.removeChild(star);
    }
  });
  stars = [];

  numStars = Math.round(
    (container.clientWidth * container.clientHeight) / 12000,
  );

  for (let i = 0; i < numStars; i++) {
    const star = createStar();
    if (star) {
      container.appendChild(star);
      stars.push(star);
    }
  }

  // Set up the parallax animations after stars are created
  setupStarParallax();

  // It's good practice to refresh ScrollTrigger after DOM changes that affect layout
  ScrollTrigger.refresh();
}

// Update star brightness and add glow effect on hover
export function updateStarAppearance(event: MouseEvent): void {
  const starsElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('.star');

  starsElements.forEach((star: HTMLDivElement) => {
    const rect: DOMRect = star.getBoundingClientRect();
    const distance: number = Math.sqrt(
      (event.clientX - rect.left) ** 2 + (event.clientY - rect.top) ** 2,
    );
    const maxDistance: number = 30;
    star.style.transition = 'opacity 0.2s ease-out, box-shadow 0.2s ease-out';
    const width: number = parseFloat(star.style.width.replace('px', ''));
    const glowStrength: number = width * 0.7;

    const originalOpacity: number = parseFloat(
      star.dataset.originalOpacity || '0',
    );

    if (distance < maxDistance) {
      star.style.opacity = `1`;
      star.style.boxShadow = `rgba(255, 255, 255) 0 0 ${
        glowStrength * 2
      }px ${glowStrength}px`;
    } else {
      star.style.opacity = `${originalOpacity}`;
      star.style.boxShadow = '0 0 0 0 rgba(255, 255, 255)';
    }
  });
}
