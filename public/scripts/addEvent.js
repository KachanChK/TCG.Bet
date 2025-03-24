function verifyToken() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "/login";
        return;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "/homepage";
}

function formatDateInput(input) {
    input.addEventListener('input', function () {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2);
        if (value.length > 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
        input.value = value;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const eventDateInput = document.getElementById('event_date');
    const eventBetEndsInput = document.getElementById('event_bet_ends');
    formatDateInput(eventDateInput);
    formatDateInput(eventBetEndsInput);
});

function formatToDateString(dateString) {
    const dateParts = dateString.split('/');
    return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
}

// ----------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("addEventForm");
    const messageElement = document.getElementById("message");

    document.getElementById("saveEventBtn").addEventListener("click", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const quota_value = document.getElementById("quota_value").value;
        const event_date = document.getElementById("event_date").value;
        const event_bet_ends = document.getElementById("event_bet_ends").value;

        if (!title || !description || !quota_value || !event_date || !event_bet_ends) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/event/addEvent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, quota_value, event_date, event_bet_ends }),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = result.message || "Evento cadastrado com sucesso!";
                messageElement.className = "success";
                form.reset();
            } else {
                messageElement.textContent = result.error || "Erro ao cadastrar o evento.";
                messageElement.className = "error";
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            messageElement.textContent = "Erro ao conectar-se ao servidor.";
            messageElement.className = "error";
        }
    });
});
