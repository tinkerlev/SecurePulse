// Global variables
let currentLanguage = localStorage.getItem('preferredLanguage') || 'he';
let translations = {};

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    loadTranslations(currentLanguage)
        .then(() => {
            initContactForm();
            initSmoothScrolling();
            initVoiceInput();
            initLanguageSelector();
            applyTranslations(currentLanguage);
        })
        .catch(error => {
            console.error('Error initializing website:', error);
            // כאן אפשר להוסיף לוגיקה לטיפול בשגיאה, כמו הצגת הודעת שגיאה למשתמש
            // או אתחול בסיסי של האתר ללא תרגומים
            fallbackInitialization();
        });
}

function fallbackInitialization() {
    // אתחול בסיסי ללא תרגומים
    initContactForm();
    initSmoothScrolling();
    initVoiceInput();
    initLanguageSelector();
    // אפשר להוסיף כאן לוגיקה נוספת לטיפול במצב ללא תרגומים
}

// Language functions
async function loadTranslations(lang) {
    try {
        const response = await fetch('/translations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        translations = data;
        console.log('Translations loaded:', translations);
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = {}; // או אובייקט עם תרגומים בסיסיים
    }
}

function applyTranslations(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.body.className = `lang-${lang}`; // מוסיף קלאס לגוף המסמך לסגנון ספציפי לשפה

    // Apply translations to all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key] && translations[key][lang]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[key][lang];
            } else {
                element.textContent = translations[key][lang];
            }

            // Set direction for each element, excluding certain elements if needed
            if (!element.closest('.no-direction-change')) {
                element.style.direction = lang === 'he' ? 'rtl' : 'ltr';
                element.style.textAlign = lang === 'he' ? 'right' : 'left';
            }
        }
    });
    // טיפול ספציפי בפוטר
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.direction = lang === 'he' ? 'rtl' : 'ltr';
        footer.style.textAlign = lang === 'he' ? 'right' : 'left';
      }
      // טיפול בכיוון החיצים של הרשימות
      document.querySelectorAll('#infoList li').forEach((element)=>{
        if (lang !== 'he'){
            element.classList.add('leftArrow');
        }
        else {
            element.classList.remove('leftArrow');
        }
      })

      // טיפול באלמנטים שתמיד צריכים להיות LTR
      document.querySelectorAll('.always-ltr').forEach(element => {
        element.style.direction = 'ltr';
        element.style.unicodeBidi = 'embed';
      });
    // Update dates
    document.querySelectorAll('time[data-translate]').forEach(element => {
        const dateKey = element.getAttribute('data-translate');
        if (translations[dateKey] && translations[dateKey][lang]) {
            element.textContent = translations[dateKey][lang];
        }
        });
        document.querySelectorAll('.question-mark').forEach(element => {
        element.style.direction = 'ltr';
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
    if (form) form.addEventListener('submit', handleFormSubmit);
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
        recognitionButton.addEventListener('click', () => recognition.start());
        recognition.onresult = function(event) {
            console.log('Voice input received:', event.results[0][0].transcript);
            // Here you can add logic to handle the voice input
        };
    }
}

function initLanguageSelector() {
    console.log('ok');
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    if (languageToggle && languageDropdown) {
       
        ['click', 'touchstart'].forEach(event => 
            languageToggle.addEventListener(event, toggleLanguageDropdown)
        );
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', handleLanguageChange);
        });
        document.addEventListener('click', closeLanguageDropdown);
    }
}

// Event handlers
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const responseDiv = document.getElementById('contact-form-response');

    fetch(form.action, {
        method: form.method,
        body: new FormData(form)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        responseDiv.textContent = translations.form_success[currentLanguage];
        responseDiv.style.display = 'block';
        form.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        responseDiv.textContent = translations.form_error[currentLanguage];
        responseDiv.style.display = 'block';
    });
}

function toggleHamburger(e){
    console.log('Clicked me: ', e,e.target, this);
    document.getElementById('mobileDropDownMenu').classList.toggle('hidden');
}

function toggleLanguageDropdown(e) {
    console.log('Here')
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
        details.style.display = !['none',''].includes(details.style.display) ? 'none' : 'block';
    }
}

document.getElementById('contactForm').addEventListener('submit', function(e) {
   
    e.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Collect form data
    // Send the data using fetch API
    fetch('https://formspree.io/f/mldrdggd', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
        } else {
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting the form.');
    });

    let item = document.getElementById('submitMsg').classList;
    item.toggle('hidden')
})

document.addEventListener('DOMContentLoaded', (event) => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
});