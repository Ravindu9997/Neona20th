import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- DATA STRUCTURE REORGANIZATION FOR DYNAMIC LOCAL IMAGES ---
// Define the image filenames and the required narrative details.
// The component assumes these files are present in the 'public/images/' directory.
const imageDataMap = [
  {
    filename: "skydive.png",
    title: "Neona the fearless",
    description: "She always flys headfirst (literally), her bravery knows no bounds. Always on the lookout for her next thrill.",
    aspect: "landscape",
    alt: "Woman skydiving headfirst"
  },
  {
    filename: "badminton.png",
    title: "Neona the Badminton Champ",
    description: "Witnessing the rare 'Badminton Rage Mode.' Her opponent may need a new racket, and possibly therapy.",
    aspect: "portrait",
    alt: "Woman aggressively playing badminton"
  },
  {
    filename: "everest.png",
    title: "Neona the everest conquerer (On the last day)",
    description: "If the due date was to conquer everest by tonight, she'll have it done by 11:59PM",
    aspect: "square",
    alt: "Woman standing triumphantly on Mount Everest"
  },
  {
    filename: "thief.png",
    title: "Neona the master theif",
    description: "Executing a flawless infiltration to steal the last brick of chocolate. Her stealth is only matched by her hunger.",
    aspect: "landscape",
    alt: "Woman dressed in black sneaking around"
  },
  {
    filename: "ceo.png",
    title: "Neona the Chief Executive Ochestra",
    description: "Holding an emergency board meeting so she can display her angelic voice, haven't heard any of her employees complain though",
    aspect: "square",
    alt: "Woman sitting on the floor leading a business meeting"
  },
  {
    filename: "diving.png",
    title: "Neona the deep diver",
    description: "She went diving so deep that her browser crashed. Always researching and studying everything that intrigues her",
    aspect: "portrait",
    alt: "Woman diving in the ocean with tropical fish"
  }
];

// Map this data to the final structure used by the component, setting the correct public path.
const collageData = imageDataMap.map(item => ({
    ...item,
    imgUrl: `/images/${item.filename}` // The required public path
}));


/**
 * Custom hook to observe elements as they enter the viewport
 * Applies 'inView' state based on IntersectionObserver results.
 */
const useInView = (options) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Only set to true once it enters to maintain the initial animation
      if (entry.isIntersecting) {
        setInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup function
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
};

/**
 * Component for a single narrative section that animates on scroll.
 */
const NarrativeSection = ({ item, index }) => {
  // Use a lower threshold for mobile devices (e.g., 0.1) and higher for desktop (0.3)
  const threshold = window.innerWidth < 768 ? 0.1 : 0.3;
  const [ref, inView] = useInView({ threshold: threshold });

  const isReversed = index % 2 !== 0;
  
  // Dynamic height adjustment for mobile to prevent image cropping
  const mobileHeightClass = item.aspect === 'portrait' 
    ? 'h-[60vh]' // Taller container for portrait images on mobile
    : 'h-[40vh]'; // Shorter container for landscape/square images on mobile

  return (
    <div
      ref={ref}
      className={`relative min-h-screen flex items-center justify-center p-8 overflow-hidden
                  transition-all duration-1000 ease-out
                  ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}
                  ${isReversed ? 'bg-gray-800 text-gray-100' : 'bg-gray-900 text-white'}
                  border-b border-red-700`}
    >
      <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 max-w-5xl mx-auto z-10`}>
        {/* Image Card - Adjusted for Mobile Viewport Height (vh) */}
        <div 
          className={`relative w-full md:w-1/2 rounded-xl overflow-hidden shadow-2xl border-4 border-red-500 transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 
            ${mobileHeightClass} md:h-auto md:max-h-full`}
        >
          <img
            src={item.imgUrl}
            alt={item.alt || item.title}
            // FIX: Changed object-cover (crops) to object-contain (fits entirely)
            // Added bg-black to the image container to see the letterboxing on mobile
            className="w-full h-full object-contain bg-black filter grayscale-[10%] contrast-110 saturate-120"
            // Fallback for missing local image
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x600/9ca3af/ffffff?text=Image+Missing" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-70 text-center">
            <span className="text-gray-100 text-lg font-sans font-bold">{item.title}</span>
          </div>
        </div>

        {/* Description */}
        <div className="w-full md:w-1/2 text-center md:text-left p-4">
          <h3 className="text-red-400 text-4xl font-bold font-mono tracking-wide mb-4 border-b-2 border-red-600 pb-2">
            {item.title}
          </h3>
          <p className="text-gray-300 text-xl font-serif leading-relaxed italic">
            "{item.description}"
          </p>
        </div>
      </div>
      {/* Glitch overlay background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,0,0,0.1) 1px, rgba(255,0,0,0.1) 2px)', backgroundSize: '100% 4px', animation: 'glitch-line.5s infinite alternate' }}></div>
    </div>
  );
};

/**
 * Component to dynamically create the scattered, blurred background collage
 */
const DynamicCollageBackground = ({ images }) => {
  // To create a denser collage like the example, we'll duplicate images if there are few unique ones.
  // Adjust 'duplicationFactor' based on how many unique images you have and how dense you want it.
  const duplicationFactor = 4; // Each image will appear 4 times
  const denseCollageImages = Array.from({ length: duplicationFactor }, (_, i) => 
    images.map(img => ({ ...img, uniqueKey: `${img.filename}-${i}-${Math.random()}` }))
  ).flat();

  // Shuffle the array to ensure random distribution
  for (let i = denseCollageImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [denseCollageImages[i], denseCollageImages[j]] = [denseCollageImages[j], denseCollageImages[i]];
  }

  return (
    // Apply blur and overall color adjustments to the container
    <div className="absolute inset-0 overflow-hidden bg-gray-900 filter blur-[2px] sepia-[0.4] contrast-[1.2] saturate-[1.4]"
         style={{ animation: 'panBackground 60s linear infinite alternate' }}>
      {denseCollageImages.map((item, index) => {
        // More varied and overlapping positions
        const x = `${Math.random() * 100}%`;
        const y = `${Math.random() * 100}%`;
        const rotation = `${Math.random() * 60 - 30}deg`; // -30deg to +30deg
        const size = `${30 + Math.random() * 50}vh`; // Larger, more varied sizes

        return (
          <img
            key={item.uniqueKey} // Use uniqueKey for duplicated items
            src={item.imgUrl}
            alt={item.alt}
            className="absolute object-cover transition-opacity duration-1000"
            style={{
              width: size,
              height: size, // Maintain aspect ratio roughly
              top: y,
              left: x,
              transform: `translate(-50%, -50%) rotate(${rotation})`,
              // Individual images are not blurred to allow the container blur to dominate
              // Apply subtle individual opacity for depth
              opacity: 0.6 + Math.random() * 0.4, // 60% to 100% opacity
              // Add subtle movement for each image
              animation: `collageMovement ${30 + index * 2}s linear infinite alternate`,
              animationDelay: `${index * 1.5}s`,
              zIndex: Math.floor(Math.random() * 10) // Random z-index for overlapping order
            }}
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x300/1e293b/94a3b8?text=Image" }}
          />
        );
      })}
    </div>
  );
};


// Main Birthday Card Application Component
const App = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Hide scroll indicator after some scrolling
  const handleScroll = useCallback(() => {
    // Only check scrollY if window is available (client-side render)
    if (typeof window !== 'undefined' && window.scrollY > 100) {
      setShowScrollIndicator(false);
    } else if (typeof window !== 'undefined' && window.scrollY <= 100) {
      setShowScrollIndicator(true);
    }
  }, []);

  useEffect(() => {
    // Attach and clean up scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Pass only the images intended for the background collage
  const backgroundImages = collageData; 


  return (
    <div className="min-h-screen bg-gray-950 text-white font-inter overflow-x-hidden">

      {/* Custom Styles and Keyframes */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Inter:wght@400;700&family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        
        /* Font Definitions */
        .font-monoton { font-family: 'Monoton', cursive; }
        .font-serif { font-family: 'Georgia', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        
        /* Keyframes for Scanlines (Retro Background Noise) */
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }

        /* Keyframes for Fade In Up (Scroll Reveal) */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Keyframes for Glitch Text (Title Effect) */
        @keyframes glitch-text {
          0% { transform: translate(0); text-shadow: 2px 2px #ff0000, -2px -2px #0000ff; }
          25% { transform: translate(-2px, 2px); text-shadow: -2px 2px #00ff00, 2px -2px #ff00ff; }
          50% { transform: translate(2px, -2px); text-shadow: 2px -2px #00ffff, -2px 2px #ff0000; }
          75% { transform: translate(-2px, -2px); text-shadow: -2px -2px #ff00ff, 2px 2px #00ff00; }
          100% { transform: translate(0); text-shadow: 2px 2px #ff0000, -2px -2px #0000ff; }
        }

        /* Keyframes for Glitch Line (Narrative Section Overlay) */
        @keyframes glitch-line {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
        }

        /* Keyframes for Background Pan (Title Screen) */
        @keyframes panBackground {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        /* Keyframes for Subtle Image Movement in the Collage */
        @keyframes collageMovement {
          0% { transform: translate(-50%, -50%) rotate(var(--initial-rotation, 0deg)); }
          100% { transform: translate(calc(-50% + var(--translate-x, 0px)), calc(-50% + var(--translate-y, 0px))) rotate(var(--final-rotation, 0deg)); }
        }
        
        /* Keyframes for Final Message Sparkle */
        @keyframes sparkle {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        /* Class Application */
        .animate-glitch { animation: glitch-text 0.8s infinite alternate; }

        .retro-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-image: linear-gradient(rgba(170, 170, 170, 0.2) 50%, transparent 50%),
                            linear-gradient(90deg, rgba(170, 170, 170, 0.1) 50%, transparent 50%);
          background-size: 100% 2px, 2px 100%;
          opacity: 0.3;
          animation: scanlines 10s linear infinite;
        }

        /* Tailwind utility override to apply custom keyframes */
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 2s infinite ease-in-out; }
        .animate-bounce-slow { animation: bounce 1.5s infinite; }
        `}
      </style>

      {/* Title Screen */}
      <section className="relative h-screen flex flex-col items-center justify-center p-4 sm:p-8 text-center overflow-hidden border-b-8 border-red-700">
        
        {/* Dynamic Blurred Background Component */}
        <DynamicCollageBackground images={backgroundImages} />
        
        <div className="relative z-10">
          <h1
            // FIX: Reduced base text size from text-7xl to text-5xl for mobile
            className="text-5xl sm:text-7xl md:text-9xl font-monoton tracking-tighter mb-4 text-red-500 animate-glitch"
            style={{ textShadow: '4px 4px #4b5563, 6px 6px #1f2937' }}
          >
            WARRANTY VOID
          </h1>
          <h2 
            // FIX: Reduced base text size from text-3xl to text-2xl for mobile
            className="text-2xl sm:text-3xl font-mono mb-8 text-gray-300 opacity-0 animate-fade-in-up delay-[700ms]"
            style={{ animationDelay: '700ms', textShadow: '2px 2px #000000ff' }}
          >
            NEONA IS OFFICIALLY EXPIRED @ 20
          </h2>
          <p 
            // FIX: Reduced base text size from text-xl to text-lg for mobile
            className="text-lg sm:text-xl font-serif leading-relaxed text-center italic text-gray-200 mt-8 opacity-0 animate-fade-in-up delay-[1000ms]"
            style={{ animationDelay: '1000ms', textShadow: '2px 2px #000000ff' }}
          >
            Scroll down to see some of her great adventures
          </p>

          {/* Scroll Down Indicator */}
          <div className={`mt-16 flex flex-col items-center transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-gray-400 text-lg animate-bounce-slow">Scroll Down</span>
            <svg className="w-8 h-8 text-gray-400 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Narrative Sections */}
      {collageData.map((item, index) => (
          <NarrativeSection key={index} item={item} index={index} />
        ))
      }

      {/* Final Birthday Message Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 to-red-950 p-4 sm:p-8 text-center retro-background relative overflow-hidden border-t-8 border-red-500">
        <div className="relative z-10 max-w-3xl mx-auto p-8 bg-gray-900 bg-opacity-90 rounded-2xl shadow-3xl border-4 border-red-400 opacity-0 animate-fade-in-up delay-[300ms]"
             style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <h2 className="text-5xl sm:text-6xl font-monoton tracking-wider mb-6 text-yellow-300 animate-pulse-slow"
              style={{ textShadow: '3px 3px #a31d1d, 5px 5px #ff0000' }}>
            Happy 20th Birthday! Pookie Bear
          </h2>
          <p className="text-xl sm:text-2xl font-serif leading-relaxed text-gray-200 mb-6 italic">
            They say I don't like them young, they say im into underage girls, they say I doesn't date if they are over 19. But that officially ends today
            because you're officially expired!. Way past your due date. Already on deaths door. Wrinkles coming in. Hair becoming white. Memory of a goldfish. 
            But guess what. Am I throwing you out like expired milk? No, because I love you pookie bear and I want to be with you until you turn 200. Can't wait 
            to have the baddest granny at the retirement village. Happy Birthday Pookie Bear, I hope you have a wonderful day and have many many more happy birthdays to come.
          </p>
          <p className="text-lg sm:text-xl font-mono text-gray-400">
            With love, from your fellow unc Rav
          </p>
        </div>
        {/* Subtle particle effect or retro graphics for this section */}
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ff0000 1px, transparent 1px)', backgroundSize: '10px 10px', animation: 'sparkle 10s infinite linear' }}></div>
      </section>

      <footer className="text-center py-6 bg-gray-950 text-gray-600 font-mono text-sm">
        <p>System Check: Status - Incredibly loved & irreplaceable.</p>
      </footer>
    </div>
  );
};

export default App;