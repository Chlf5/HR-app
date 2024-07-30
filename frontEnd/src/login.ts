document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const loginForm = document.getElementById("login_form") as HTMLFormElement;
    const message = document.getElementById('message');
    let mainStart = document.getElementById('main_start') as HTMLElement | null;

    // Function to hide the loading interface
    function hide() {
        if (mainStart && loginForm) {
            loginForm.style.display = 'none';
            mainStart.style.display = 'block';
        }
    }


    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const body = document.getElementById('body') as HTMLElement;

        try {
            const response = await fetch('http://127.0.0.1:5000/empInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mail: email, pass: password })
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const result = await response.json();
            const authenticated: boolean = result.authenticated;
            body.style.background = `none`;

            if (authenticated) {
                localStorage.setItem('userEmail', JSON.stringify(email)); 
                hide();
                // Hide the loading interface and redirect after 3 seconds
                setTimeout(() => {
                    // Redirect to main.html after successful login
                    window.location.href = `html/main.html`;
                }, 3000);
            } else {
                if (message) {
                    message.textContent = 'Incorrect email or password';
                }
            }
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            if (message) {
                message.textContent = 'Failed to authenticate. Please try again later.';
            }
        }
    });
});
