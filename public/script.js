// script.js - Our main website interactivity

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = mobileMenu.querySelectorAll('a');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    closeMobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });

    mobileMenu.addEventListener('click', (event) => {
        if (event.target === mobileMenu) {
            mobileMenu.classList.remove('open');
        }
    });

    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const body = document.body;

    function applyTheme(theme) {
        body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            // Ensure mobileThemeToggleBtn exists before trying to access its querySelector
            if (mobileThemeToggleBtn) mobileThemeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            if (mobileThemeToggleBtn) mobileThemeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    }

    function toggleTheme() {
        const currentTheme = body.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (mobileThemeToggleBtn) { // Check if element exists before adding listener
        mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light');
    }

    // --- Explore Features Button ---
    const exploreFeaturesBtn = document.getElementById('explore-features-btn');
    if (exploreFeaturesBtn) {
        exploreFeaturesBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const featuresSection = document.getElementById('features-overview');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Feature Details Modal Logic (MODIFIED for Crowd Detection) ---
    const featureModal = document.getElementById('feature-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalFeatureTitle = document.getElementById('modal-feature-title');
    const modalFeatureImage = document.getElementById('modal-feature-image');
    const modalFeatureDescription = document.getElementById('modal-feature-description');
    const modalFeatureHowItWorks = document.getElementById('modal-feature-how-it-works');
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');

    const featureData = {
        weapon: {
            title: "Weapon Detection",
            image: "https://placehold.co/600x350/1a1a2e/00ffff?text=Weapon+Detected+Example",
            description: "Our advanced AI system provides real-time identification of various weapons, including firearms and knives, in live video feeds. This feature is crucial for enhancing security in public spaces, private properties, and sensitive areas by enabling immediate alerts to security personnel.",
            howItWorks: "Utilizes YOLOv8 deep learning models trained on extensive datasets of weapon imagery. The system processes video frames, identifies weapon-like objects, and highlights them, triggering an alert if detected. It can distinguish between different types of weapons with high accuracy."
        },
        fire_smoke: {
            title: "Fire and Smoke Detection",
            image: "https://placehold.co/600x350/1a1a2e/ff0000?text=Fire+Smoke+Detected+Example",
            description: "This feature offers automated and early detection of fire and smoke occurrences. It's vital for preventing large-scale damage and ensuring timely evacuation in buildings, forests, or industrial zones.",
            howItWorks: "Employs specialized YOLOv8 models trained to recognize the visual patterns of fire and smoke. The system continuously analyzes video streams from surveillance cameras. Upon detection, it provides immediate visual alerts and can be integrated with alarm systems for rapid response."
        },
        license_plate: {
            title: "License Plate Recognition (LPR)",
            image: "https://placehold.co/600x350/1a1a2e/00ff00?text=License+Plate+Recognized+ABC123",
            description: "Our LPR system accurately recognizes vehicle license plates from video feeds. This is essential for automated access control, parking management, traffic monitoring, and identifying vehicles of interest.",
            howItWorks: "Leverages EasyOCR for optical character recognition on detected license plate regions. The system first identifies potential license plates in video frames, then extracts and interprets the alphanumeric characters. It can process plates from various angles and lighting conditions."
        },
        theft: {
            title: "Theft Detection (Object Disappearance)",
            image: "https://placehold.co/600x350/1a1a2e/ffff00?text=Object+Missing+Alert+Example",
            description: "Identifies when specific valuable objects are removed from a monitored area, triggering an immediate alert. Ideal for retail, museums, or warehouses.",
            howItWorks: "Utilizes YOLOv8 models trained to recognize and track specific objects. The system maintains a record of objects present in a scene over time. If a previously detected and tracked object is no longer present in subsequent frames, an 'object missing' alert is generated, indicating potential theft."
        },
        crowd: {
            title: "Crowd Detection",
            image: "https://placehold.co/600x350/1a1a2e/ff6600?text=Crowd+Density+Alert+Example",
            description: "Monitors crowd density in public spaces, events, or critical infrastructure. It helps identify unusual gatherings, potential stampedes, or security breaches.",
            howItWorks: "Uses YOLOv8 to detect and count individuals (persons) within video frames. Based on predefined thresholds, the system classifies the crowd density as 'Low', 'Medium', or 'High'. If a 'High Crowd' density is detected, an alert is triggered, allowing for proactive crowd management and security intervention."
        }
    };

    function openFeatureModal(featureKey) {
        const data = featureData[featureKey];
        if (data) {
            // Check if this feature has a dedicated page (like Crowd Detection)
            // We get the button that was clicked to access its data-page attribute
            const featureButton = document.querySelector(`.view-details-btn[data-feature="${featureKey}"]`);
            const pageUrl = featureButton ? featureButton.dataset.page : null;

            if (pageUrl) {
                // Redirect to the dedicated page
                window.location.href = pageUrl;
                return; // Stop further modal processing
            }

            // If no dedicated page, proceed with opening the modal
            modalFeatureTitle.textContent = data.title;
            modalFeatureImage.src = data.image;
            modalFeatureDescription.textContent = data.description;
            modalFeatureHowItWorks.textContent = `How it works: ${data.howItWorks}`;
            featureModal.classList.remove('hidden');
        }
    }

    function closeFeatureModal() {
        featureModal.classList.add('hidden');
    }

    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const featureKey = button.dataset.feature;
            openFeatureModal(featureKey);
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFeatureModal);
    }

    if (featureModal) {
        featureModal.addEventListener('click', (event) => {
            if (event.target === featureModal) {
                closeFeatureModal();
            }
        });
    }

    // --- CCTV Integration & Simulation Logic (Original section, not for direct crowd detection) ---
    // This section is for the main page's "Live Demo" webcam and general simulation.
    // The crowd_detection.html page has its own separate webcam logic.
    const connectCCTVBtn = document.getElementById('connect-cctv-btn');
    const cctvFeed = document.getElementById('cctv-feed');
    const cctvPlaceholder = document.getElementById('cctv-placeholder');
    const cctvStatus = document.getElementById('cctv-status');
    const detectionOverlay = document.getElementById('detection-overlay');

    let mainPageMediaStream = null; // Separate stream for the main page's demo
    let mainPageDetectionInterval = null;

    if (connectCCTVBtn) {
        connectCCTVBtn.addEventListener('click', async () => {
            cctvStatus.textContent = "Status: Connecting to webcam...";
            detectionOverlay.classList.add('hidden');

            try {
                if (mainPageMediaStream) { // Stop any existing stream
                    mainPageMediaStream.getTracks().forEach(track => track.stop());
                    clearInterval(mainPageDetectionInterval);
                }

                mainPageMediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cctvFeed.srcObject = mainPageMediaStream;
                cctvPlaceholder.classList.add('hidden');
                cctvFeed.classList.remove('hidden');
                cctvStatus.textContent = "Status: Webcam Connected. Simulating Detection...";

                // Set a default simulation mode for this general demo (e.g., weapon)
                // This call goes to the Node.js proxy, then to the Python backend
                await fetch('/set-detection-mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'weapon' }) // Default to weapon simulation for this page
                });

                mainPageDetectionInterval = setInterval(async () => {
                    // Capture frame from cctvFeed (main page demo)
                    const canvas = document.createElement('canvas');
                    canvas.width = cctvFeed.videoWidth;
                    canvas.height = cctvFeed.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(cctvFeed, 0, 0, canvas.width, canvas.height);
                    const imageData = canvas.toDataURL('image/jpeg', 0.8);

                    try {
                        const response = await fetch('/detect-frame', { // Send to Node.js proxy
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: imageData })
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            detectionOverlay.textContent = `Error: ${errorData.error || 'Backend Issue'}`;
                            detectionOverlay.style.backgroundColor = 'rgba(128, 0, 0, 0.7)';
                            detectionOverlay.classList.remove('hidden');
                            return;
                        }

                        const result = await response.json();
                        if (result.detection) {
                            detectionOverlay.textContent = result.detection;
                            detectionOverlay.style.color = result.color || '#FF0000';
                            detectionOverlay.style.textShadow = `0 0 10px ${result.color || '#FF0000'}`;
                            detectionOverlay.classList.remove('hidden');
                        } else {
                            detectionOverlay.classList.add('hidden');
                        }
                    } catch (error) {
                        console.error('Error sending frame for main demo detection:', error);
                        detectionOverlay.textContent = "Detection Error!";
                        detectionOverlay.style.backgroundColor = 'rgba(128, 0, 0, 0.7)';
                        detectionOverlay.classList.remove('hidden');
                    }
                }, 1000); // Send frame every 1 second for the main demo

            } catch (err) {
                console.error("Error accessing webcam:", err);
                cctvStatus.textContent = "Status: Error connecting webcam. Please allow camera access.";
                cctvPlaceholder.classList.remove('hidden');
                cctvFeed.classList.add('hidden');
                detectionOverlay.classList.add('hidden');
                if (mainPageMediaStream) {
                    mainPageMediaStream.getTracks().forEach(track => track.stop());
                    mainPageMediaStream = null;
                }
                if (mainPageDetectionInterval) {
                    clearInterval(mainPageDetectionInterval);
                    mainPageDetectionInterval = null;
                }
            }
        });
    }

    // --- Gemini API Integration (no changes here, just included for completeness) ---

    // NOTE: This API Key is exposed in frontend JS. For production, use a backend proxy for security.
    const apiKey = "AIzaSyCiH31DrmxET3zfQ5egEeZ0U6zeH7Lp3_U"; // Replace with your actual Gemini API key if needed elsewhere
    console.log("API Key placeholder for frontend loaded:", apiKey ? "Yes" : "No");

    // Object Description Generator
    const objectInput = document.getElementById('object-input');
    const generateObjectDescriptionBtn = document.getElementById('generate-object-description');
    const objectDescriptionOutput = document.getElementById('object-description-output');
    const objectLoadingIndicator = document.getElementById('object-loading-indicator');

    if (generateObjectDescriptionBtn) { // Ensure element exists on the page
        generateObjectDescriptionBtn.addEventListener('click', async () => {
            const objectName = objectInput.value.trim();
            if (!objectName) {
                objectDescriptionOutput.innerHTML = '<p class="text-red-500">Please enter an object name.</p>';
                return;
            }

            objectDescriptionOutput.innerHTML = '';
            objectLoadingIndicator.classList.remove('hidden');

            try {
                const response = await fetch('/generate-object-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ objectName: objectName })
                });

                console.log("Backend Response Status for Object:", response.status, response.statusText);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Backend Error Response for Object:', errorData);
                    throw new Error(`Backend request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
                }

                const result = await response.json();
                console.log("Raw Result from Backend for Object:", result);

                if (result.description) {
                    objectDescriptionOutput.innerHTML = `<p>${result.description}</p>`;
                } else {
                    objectDescriptionOutput.innerHTML = '<p class="text-red-500">Could not generate description. The AI response from the backend was empty or did not contain valid content. This might be due to content filtering or an unexpected response format.</p>';
                }
            } catch (error) {
                console.error('Error generating object description:', error);
                objectDescriptionOutput.innerHTML = `<p class="text-red-500">An error occurred: ${error.message}. Please check your browser console for details, then try again.</p>`;
            } finally {
                objectLoadingIndicator.classList.add('hidden');
            }
        });
    }


    // Security Protocol Advisor
    const scenarioInput = document.getElementById('scenario-input');
    const generateSecurityAdviceBtn = document.getElementById('generate-security-advice');
    const securityAdviceOutput = document.getElementById('security-advice-output');
    const securityLoadingIndicator = document.getElementById('security-loading-indicator');

    if (generateSecurityAdviceBtn) { // Ensure element exists on the page
        generateSecurityAdviceBtn.addEventListener('click', async () => {
            const scenario = scenarioInput.value.trim();
            if (!scenario) {
                securityAdviceOutput.innerHTML = '<p class="text-red-500">Please describe a security scenario.</p>';
                return;
            }

            securityAdviceOutput.innerHTML = '';
            securityLoadingIndicator.classList.remove('hidden');

            try {
                const response = await fetch('/generate-security-advice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scenario: scenario })
                });

                console.log("Backend Response Status for Security Advice:", response.status, response.statusText);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Backend Error Response for Security Advice:', errorData);
                    throw new Error(`Backend request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
                }

                const result = await response.json();
                console.log("Raw Result from Backend for Security Advice:", result);

                if (result.advice) {
                    securityAdviceOutput.innerHTML = `<p>${result.advice}</p>`;
                } else {
                    securityAdviceOutput.innerHTML = '<p class="text-red-500">Could not generate security advice. The AI response from the backend was empty or did not contain valid content. This might be due to content filtering or an unexpected response format.</p>';
                }
            } catch (error) {
                console.error('Error generating security advice:', error);
                securityAdviceOutput.innerHTML = `<p class="text-red-500">An error occurred: ${error.message}. Please check your browser console for details, then try again.</p>`;
            } finally {
                securityLoadingIndicator.classList.add('hidden');
            }
        });
    }
});
