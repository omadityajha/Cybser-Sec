document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    const togglePersonalInfo = document.getElementById('togglePersonalInfo');
    const personalInfoForm = document.querySelector('.personal-info-form');
    const checkPasswordBtn = document.getElementById('checkPassword');
    const failedRules = document.querySelector('.failed-rules');
    const failedRulesList = document.getElementById('failedRulesList');
    const securityBuddy = document.querySelector('.buddy-character');
    const speechBubble = document.querySelector('.buddy-speech-bubble');
    const buddyMessage = document.querySelector('.buddy-message');

    // Buddy messages object
    const buddyMessages = {
        default: "Hi! I'm your Security Buddy!",
        passwordFocus: "Make it strong! Mix letters, numbers, and symbols! 💪",
        passwordWeak: "Hmm... Could be stronger! Try adding more variety! 💡",
        passwordStrong: "Now that's what I call a strong password! 🎉",
        passwordEmpty: "Don't forget to enter a password! 😊",
        checking: "Let me check that password for you... 🔍",
        copied: "Password copied! Keep it safe! 🔐",
        generated: "Here's a strong password for you! 🎯"
    };

    // Toggle personal info form
    togglePersonalInfo.addEventListener('click', () => {
        const isHidden = personalInfoForm.style.display === 'none';
        personalInfoForm.style.display = isHidden ? 'block' : 'none';
        togglePersonalInfo.querySelector('.fa-chevron-down').style.transform = 
            isHidden ? 'rotate(180deg)' : 'rotate(0)';
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Check password on submit
    checkPasswordBtn.addEventListener('click', () => {
        if (!passwordInput.value) {
            showBuddyMessage(buddyMessages.passwordEmpty, 3000);
            return;
        }
        
        showBuddyMessage(buddyMessages.checking);
        
        setTimeout(() => {
            const personalInfo = getPersonalInfo();
            const { strength, failedRules } = checkPasswordStrength(passwordInput.value, personalInfo);
            
            updateStrengthMeter(strength);
            displayFailedRules(failedRules);
            
            if (strength > 80) {
                showBuddyMessage(buddyMessages.passwordStrong, 3000);
            } else {
                showBuddyMessage(buddyMessages.passwordWeak, 3000);
            }
        }, 1000);
    });

    function getPersonalInfo() {
        return {
            fullName: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            dob: document.getElementById('dob').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            socialMedia: document.getElementById('socialMedia').value,
            familyNames: document.getElementById('familyNames').value.split(',').map(name => name.trim()),
            petNames: document.getElementById('petNames').value.split(',').map(name => name.trim())
        };
    }

    function checkPasswordStrength(password, personalInfo) {
        let strength = 100;
        const failedRules = [];

        // Basic checks
        if (password.length < 8) {
            failedRules.push('Password must be at least 8 characters long');
            strength -= 20;
        }
        if (!/[A-Z]/.test(password)) {
            failedRules.push('Password must contain at least one uppercase letter');
            strength -= 10;
        }
        if (!/[a-z]/.test(password)) {
            failedRules.push('Password must contain at least one lowercase letter');
            strength -= 10;
        }
        if (!/[0-9]/.test(password)) {
            failedRules.push('Password must contain at least one number');
            strength -= 10;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            failedRules.push('Password must contain at least one special character');
            strength -= 10;
        }

        // Common pattern checks
        if (/12345|qwerty|password|letmein|admin/i.test(password)) {
            failedRules.push('Password contains common patterns or words');
            strength -= 20;
        }

        // Sequential character check
        if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/.test(password.toLowerCase())) {
            failedRules.push('Password contains sequential characters');
            strength -= 15;
        }

        // Repeated character check
        if (/(.)\1{2,}/.test(password)) {
            failedRules.push('Password contains repeated characters');
            strength -= 15;
        }

        // Personal information checks
        if (personalInfo.fullName && personalInfo.fullName.length > 0) {
            const names = personalInfo.fullName.toLowerCase().split(' ');
            if (names.some(name => password.toLowerCase().includes(name))) {
                failedRules.push('Password contains your name');
                strength -= 20;
            }
        }

        if (personalInfo.username && password.toLowerCase().includes(personalInfo.username.toLowerCase())) {
            failedRules.push('Password contains your username');
            strength -= 20;
        }

        if (personalInfo.email) {
            const emailParts = personalInfo.email.toLowerCase().split('@')[0];
            if (password.toLowerCase().includes(emailParts)) {
                failedRules.push('Password contains your email address');
                strength -= 20;
            }
        }

        // Date checks
        const datePatterns = [
            /\d{2}[/-]\d{2}[/-]\d{4}/,
            /\d{4}[/-]\d{2}[/-]\d{2}/,
            /\d{8}/
        ];

        if (datePatterns.some(pattern => pattern.test(password))) {
            failedRules.push('Password contains a date pattern');
            strength -= 15;
        }

        // Phone number check
        if (/\d{10}|\d{3}[-.]?\d{3}[-.]?\d{4}/.test(password)) {
            failedRules.push('Password contains a phone number pattern');
            strength -= 15;
        }

        // Ensure strength doesn't go below 0
        strength = Math.max(0, strength);

        return { strength, failedRules };
    }

    function updateStrengthMeter(strength) {
        strengthBar.style.width = `${strength}%`;
        
        let strengthLabel = '';
        let color = '';
        
        if (strength <= 20) {
            strengthLabel = 'Very Weak';
            color = '#e74c3c';
        } else if (strength <= 40) {
            strengthLabel = 'Weak';
            color = '#e67e22';
        } else if (strength <= 60) {
            strengthLabel = 'Fair';
            color = '#f1c40f';
        } else if (strength <= 80) {
            strengthLabel = 'Good';
            color = '#2ecc71';
        } else {
            strengthLabel = 'Strong';
            color = '#27ae60';
        }

        strengthBar.style.backgroundColor = color;
        strengthText.textContent = strengthLabel;
        strengthText.style.color = color;
    }

    function displayFailedRules(rules) {
        if (rules.length > 0) {
            failedRulesList.innerHTML = rules
                .map(rule => `<li>${rule}</li>`)
                .join('');
            failedRules.style.display = 'block';
        } else {
            failedRules.style.display = 'none';
        }
    }

    // Add data-tooltip attributes to buttons
    togglePassword.setAttribute('data-tooltip', 'Toggle Password Visibility');
    copyBtn.setAttribute('data-tooltip', 'Copy Password');
    generatePasswordBtn.setAttribute('data-tooltip', 'Generate Strong Password');

    // Function to show buddy message
    function showBuddyMessage(message, duration = 0) {
        buddyMessage.textContent = message;
        speechBubble.classList.add('show');
        buddyMessage.style.animation = 'messagePop 0.3s ease forwards';
        
        if (duration > 0) {
            setTimeout(() => {
                speechBubble.classList.remove('show');
            }, duration);
        }
    }

    // Event listeners for password input
    passwordInput.addEventListener('focus', () => {
        showBuddyMessage(buddyMessages.passwordFocus);
    });

    passwordInput.addEventListener('blur', () => {
        speechBubble.classList.remove('show');
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length === 0) {
            showBuddyMessage(buddyMessages.passwordEmpty);
        } else if (passwordInput.value.length < 8) {
            showBuddyMessage(buddyMessages.passwordWeak);
        }
    });

    // Update copy button handler
    copyBtn.addEventListener('click', () => {
        showBuddyMessage(buddyMessages.copied, 2000);
    });

    // Update generate password handler
    generatePasswordBtn.addEventListener('click', () => {
        showBuddyMessage(buddyMessages.generated, 2000);
    });

    // Make buddy interactive on hover/click
    securityBuddy.addEventListener('click', () => {
        showBuddyMessage(buddyMessages.default, 3000);
    });
}); 