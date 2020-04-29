// Check Password

let password = document.getElementById("inputRegPassword");
let confirmPassword = document.getElementById("confirmRegPassword");

let validatePassword = () => {
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords Do Not Match");
    } else {
        confirmPassword.setCustomValidity('');
    }
}


password.onchange = validatePassword;
confirmPassword.onkeyup = validatePassword;

