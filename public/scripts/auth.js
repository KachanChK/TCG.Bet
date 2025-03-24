document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/auth/tokenAuth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            window.location.href = "/login";
        } 
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});
