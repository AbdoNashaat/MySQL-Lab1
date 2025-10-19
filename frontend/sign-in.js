const usernameEL = document.getElementById('floatingInput');
const passwordEL = document.getElementById("floatingPassword");
const loginBTN = document.getElementById('submitBtn');

loginBTN.addEventListener('click', async function () {
    const username = usernameEL.value;
    const password = passwordEL.value;

    if (!password || !username) {
        alert('missing credentials');
    } else {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json()
            
            if (response.ok && data.success){
                window.location.href = "./home.html";
            } else alert(data.message)

        } catch (err) {
            alert(`Failed login: ${err}`)
        }
    }

})

