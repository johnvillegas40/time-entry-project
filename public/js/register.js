// Check Password

let password = document.getElementById("inputPassword");
let confirmPassword = document.getElementById("confirmPassword");

let validatePassword = () => {
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords Do Not Match");
    } else {
        confirmPassword.setCustomValidity('');
    }
}


password.onchange = validatePassword;
confirmPassword.onkeyup = validatePassword;

