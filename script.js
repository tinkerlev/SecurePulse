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
    initLanguageSelector();
    // אפשר להוסיף כאן לוגיקה נוספת לטיפול במצב ללא תרגומים
}

// Language functions
async function loadTranslations( ) {
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

function initLanguageSelector() {
    console.log('ok');
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    if (languageToggle && languageDropdown) {
       
        ['click', 'touchstart'].forEach(event => 
            languageToggle.addEventListener(event, toggleLanguageDropdown, { passive: event === 'touchstart' })
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
            console.log('Form submitted successfully');
        } else {
            console.error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting the form.');
    });

    let item = document.getElementById('submitMsg').classList;
    item.toggle('hidden');
})

document.addEventListener('DOMContentLoaded', () => {

});

// פונקציה לסגירת ופתיחת תפריט

function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

document.getElementById('menu-toggle').addEventListener('click', toggleMenu);

// טיפול בבדיקת חדירה באופן עצמאי 

document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();

    // הוספת האזנה לטופס הסריקה
    const securityScanForm = document.getElementById('securityScanForm');
    if (securityScanForm) {
        securityScanForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const target = document.getElementById('target').value;
            const scanTypes = [];
            if (document.getElementById('nikto').checked) scanTypes.push('nikto');
            if (document.getElementById('nmap').checked) scanTypes.push('nmap');

            try {
                const response = await fetch('/run-scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ target, scanTypes }),
                });

                const data = await response.json();
                displayResults(data);
            } catch (error) {
                console.error('Error running scan:', error);
                alert('There was an error running the scan. Please try again.');
            }
        });
    }
});

// פונקציה להצגת התוצאות
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<h2>Scan Results:</h2>`;
    if (data.nikto) {
        resultsDiv.innerHTML += `<h3>Nikto Scan:</h3><pre>${data.nikto}</pre>`;
    }
    if (data.nmap) {
        resultsDiv.innerHTML += `<h3>Nmap Scan:</h3><pre>${data.nmap}</pre>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();

    // הוספת האזנה לטופס הסריקה
    const securityScanForm = document.getElementById('securityScanForm');
    if (securityScanForm) {
        securityScanForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const target = document.getElementById('target').value;
            const scanTypes = [];
            if (document.getElementById('nikto').checked) scanTypes.push('nikto');
            if (document.getElementById('nmap').checked) scanTypes.push('nmap');

            try {
                const response = await fetch('/run-scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ target, scanTypes }),
                });

                const data = await response.json();
                displayResults(data);
            } catch (error) {
                console.error('Error running scan:', error);
                alert('There was an error running the scan. Please try again.');
            }
        });
    }

    // פונקציות למודאל תנאי השימוש
    const modal = document.getElementById("termsModal");
    const openTermsBtn = document.getElementById("openTerms");
    const closeBtn = document.getElementsByClassName("close")[0];

    openTermsBtn.onclick = function(event) {
        event.preventDefault(); // למנוע פתיחה של קישור
        modal.style.display = "block";
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

// פונקציה להצגת התוצאות
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<h2>Scan Results:</h2>`;
    if (data.nikto) {
        resultsDiv.innerHTML += `<h3>Nikto Scan:</h3><pre>${data.nikto}</pre>`;
    }
    if (data.nmap) {
        resultsDiv.innerHTML += `<h3>Nmap Scan:</h3><pre>${data.nmap}</pre>`;
    }
}
