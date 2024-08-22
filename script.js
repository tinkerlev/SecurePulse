// Global variables
let currentLanguage = localStorage.getItem('preferredLanguage') || 'he';
let translations = {};

// Utility function for fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), timeout)
        )
    ]);
}

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

async function initializeWebsite() {
    try {
        await loadTranslations(currentLanguage);
        if (typeof initContactForm === 'function') initContactForm();
        if (typeof initSmoothScrolling === 'function') initSmoothScrolling();
        if (typeof initVoiceInput === 'function') initVoiceInput();
        if (typeof initLanguageSelector === 'function') initLanguageSelector();
        if (typeof applyTranslations === 'function') applyTranslations(currentLanguage);
    } catch (error) {
        console.error('Error initializing website:', error);
        fallbackInitialization();
    }
}

function fallbackInitialization() {
    initContactForm();
    initSmoothScrolling();
    initVoiceInput();
    initLanguageSelector();
}

// Language functions
async function loadTranslations(lang) {
    try {
        const response = await fetchWithTimeout('/translations.json', {}, 5000);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log('Translations loaded:', translations);
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = {}; // או אובייקט עם תרגומים בסיסיים
        throw error; // Re-throw the error for the caller to handle
    }
}

function getDefaultTranslations() {
    // כאן תוכל להגדיר ערכי ברירת מחדל בסיסיים לתרגומים
    return {
        form_success: {
            he: "הטופס נשלח בהצלחה",
            en: "Form submitted successfully"
        },
        form_error: {
            he: "אירעה שגיאה בשליחת הטופס",
            en: "An error occurred while submitting the form"
        },
        // הוסף עוד תרגומים ברירת מחדל כאן
    };
}

function applyTranslations(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.body.className = `lang-${lang}`;

    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key] && translations[key][lang]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[key][lang];
            } else {
                element.textContent = translations[key][lang];
            }

            if (!element.closest('.no-direction-change')) {
                element.style.direction = lang === 'he' ? 'rtl' : 'ltr';
                element.style.textAlign = lang === 'he' ? 'right' : 'left';
            }
        }
    });

    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.direction = lang === 'he' ? 'rtl' : 'ltr';
        footer.style.textAlign = lang === 'he' ? 'right' : 'left';
    }

    document.querySelectorAll('#infoList li').forEach((element) => {
        if (lang !== 'he') {
            element.classList.add('leftArrow');
        } else {
            element.classList.remove('leftArrow');
        }
    });

    document.querySelectorAll('.always-ltr').forEach(element => {
        element.style.direction = 'ltr';
        element.style.unicodeBidi = 'embed';
    });

    document.querySelectorAll('time[data-translate]').forEach(element => {
        const dateKey = element.getAttribute('data-translate');
        if (translations[dateKey] && translations[dateKey][lang]) {
            element.textContent = translations[dateKey][lang];
        }
    });

    document.querySelectorAll('.question-mark').forEach(element => {
        element.style.direction = 'ltr';
    });

    document.querySelectorAll('.language-sensitive').forEach(element => {
        element.style.direction = lang === 'he' ? 'rtl' : 'ltr';
        element.style.textAlign = lang === 'he' ? 'right' : 'left';
    });

    document.title = translations.page_title[lang];
    updateLanguageFlag(lang);
}

function changeLanguage(lang) {
    currentLanguage = lang;
    applyTranslations(lang);
    localStorage.setItem('preferredLanguage', lang);
}

function updateLanguageFlag(lang) {
    const flagElement = document.getElementById('current-language-flag');
    if (flagElement) {
        const flagUrls = {
            'he': 'https://flagcdn.com/w40/il.png',
            'en': 'https://flagcdn.com/w40/us.png',
            'es': 'https://flagcdn.com/w40/es.png'
        };
        flagElement.src = flagUrls[lang] || flagUrls['en'];
    }
}

// UI Initialization functions
function initContactForm() {
    const form = document.getElementById('contact-form');
    const responseDiv = document.getElementById('contact-form-response');
    if (responseDiv) responseDiv.style.display = 'none';
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', validateInput);
        });
    }
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href !== '#') {
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initVoiceInput() {
    const recognitionButton = document.getElementById('voice-input');
    if (recognitionButton && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        if (recognition && typeof recognition.start === 'function') {
            recognitionButton.addEventListener('click', () => recognition.start());
            recognition.onresult = function(event) {
                if (event && event.results && event.results[0] && event.results[0][0]) {
                    console.log('Voice input received:', event.results[0][0].transcript);
                }
            };
        }
    }
}

function initLanguageSelector() {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    if (languageToggle && languageDropdown) {
        languageToggle.addEventListener('click', toggleLanguageDropdown);
        languageToggle.addEventListener('touchstart', toggleLanguageDropdown, { passive: true });
        
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', handleLanguageChange);
        });
        document.addEventListener('click', closeLanguageDropdown);
    }
}

// Event handlers
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const responseDiv = document.getElementById('contact-form-response');

    try {
        const response = await fetchWithTimeout(form.action, {
            method: form.method,
            body: new FormData(form)
        }, 10000);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        responseDiv.textContent = translations.form_success[currentLanguage];
        responseDiv.style.display = 'block';
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = translations.form_error[currentLanguage];
        responseDiv.style.display = 'block';
    }
}

function toggleHamburger(e) {
    document.getElementById('mobileDropDownMenu').classList.toggle('hidden');
}

function toggleLanguageDropdown(e) {
    e.stopPropagation();
    const languageDropdown = document.getElementById('language-dropdown');
    if (languageDropdown) {
        languageDropdown.style.display = languageDropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function handleLanguageChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const lang = this.getAttribute('data-lang');
    changeLanguage(lang);
    document.getElementById('language-dropdown').style.display = 'none';
}

function closeLanguageDropdown(e) {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    if (languageToggle && languageDropdown &&
        !languageToggle.contains(e.target) &&
        !languageDropdown.contains(e.target)) {
        languageDropdown.style.display = 'none';
    }
}

// Utility functions
function toggleServiceDetails(serviceId) {
    const details = document.getElementById(serviceId + '-details');
    if (details) {
        details.style.display = details.style.display === 'none' || details.style.display === '' ? 'block' : 'none';
    }
}

function validateInput(event) {
    const input = event.target;
    if (input.validity.valid) {
        input.classList.remove('invalid');
    } else {
        input.classList.add('invalid');
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            fetch('https://formspree.io/f/mldrdggd', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Handle success
                } else {
                    // Handle error
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting the form.');
            });

            let item = document.getElementById('submitMsg');
            if (item) {
                item.classList.toggle('hidden');
            }
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            // בדוק אם אנחנו כבר בדף הבית
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                e.preventDefault(); // מנע את הניווט הרגיל
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
});