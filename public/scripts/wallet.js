function logout() {
    localStorage.clear();
}

// --------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    await loadWallet();
});

async function loadWallet() {
    try {
        const token = localStorage.getItem('authToken')
        if (!token) {
            console.error('Token de autenticação não encontrado.');
            return;
        }

        const response = await fetch("http://localhost:3000/account/getWallet", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const walletInfo = await response.json();
        const wallet = walletInfo.wallet
        const walletBalanceCents = wallet[0]['BALANCE']
        const walletBalance = walletBalanceCents / 100
        const walletHistory = walletInfo.walletHistory

        if (response.ok) {
            const balanceElement = document.getElementById('ShowBalance');
            balanceElement.textContent = walletBalance.toFixed(2) || "INDISPONÍVEL";
            walletHistory.forEach(history => showWalletHistory(history));
        } else {
            console.error('Erro ao carregar eventos', walletHistory.error);
        }
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear(); 

    return `${day}/${month}/${year}`; 
}

function showWalletHistory(history) {
    const table = document.getElementById('walletHistory').getElementsByTagName('tbody')[0];
    console.log('HISTORICO RECEBIDO:', history)
    const row = table.insertRow();

    const cellId = row.insertCell(0);
    const cellType = row.insertCell(1);
    const cellAmount = row.insertCell(2);
    const amountCents = history['AMOUNT']
    const amount = amountCents / 100;


    cellId.textContent = history['ID'];
    cellType.textContent = history['TRANSACTION_TYPE'];
    cellAmount.textContent = `R$${amount.toFixed(2)}`;
}

// -------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("depositForm");
    const messageElement = document.getElementById("message");

    document.getElementById("addFunds").addEventListener("click", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        let valorSemPrefixo = document.getElementById("depositPrice").value.replace("R$", "").trim();
        valorSemPrefixo = valorSemPrefixo.replace(/\./g, "").replace(",", ".");
        const numeroFloat = parseFloat(valorSemPrefixo);

        console.log(numeroFloat);
        const amount = numeroFloat;

        if (!amount) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/account/addFunds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ balance: amount }),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = result.message || "Fundos adicionados com sucesso!";
                messageElement.className = "success";
                form.reset();
            } else {
                messageElement.textContent = result.error || "Erro ao adicionar fundos.";
                messageElement.className = "error";
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            messageElement.textContent = "Erro ao conectar-se ao servidor.";
            messageElement.className = "error";
        }
    });
});

// -------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("withdrawForm");
    const messageElement = document.getElementById("messageWithdraw");

    document.getElementById("withdrawFunds").addEventListener("click", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        let valorSemPrefixo = document.getElementById("withdrawValue").value.replace("R$", "").trim();
        valorSemPrefixo = valorSemPrefixo.replace(/\./g, "").replace(",", ".");
        const numeroFloat = parseFloat(valorSemPrefixo);

        console.log(numeroFloat);
        const amount = numeroFloat;

        if (!amount) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/account/withdrawFunds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ balance: amount }),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = result.message || "Fundos sacados com sucesso!";
                messageElement.className = "success";
                form.reset();
            } else {
                messageElement.textContent = result.error || "Erro ao sacar fundos.";
                messageElement.className = "error";
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            messageElement.textContent = "Erro ao conectar-se ao servidor.";
            messageElement.className = "error";
        }
    });
});