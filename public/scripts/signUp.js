document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const birthdate = document.getElementById("birthdate").value;
    const messageElement = document.getElementById("message");
    console.log(JSON.stringify({ username, email, password, birthdate }))
    try {
        const response = await fetch("http://localhost:3000/account/signUp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, birthdate }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("authToken", result.token);
            messageElement.textContent = "Login realizado com sucesso!";
            messageElement.style.color = "green";
            console.log("Token armazenado:", result.token);
            window.location.href = '/login'
        } else {
            messageElement.textContent = result.error || "Erro ao realizar login.";
            messageElement.style.color = "red";
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        messageElement.textContent = "Erro ao conectar-se ao servidor.";
        messageElement.style.color = "red";
    }
});

function formatDateInput(input) {
    input.addEventListener('input', function () {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2);
        if (value.length > 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
        input.value = value;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const birthdateInput = document.getElementById('birthdate');
    formatDateInput(birthdateInput);
});

function formatToDateString(dateString) {
    const dateParts = dateString.split('/');
    return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
}