/**
 * Logs in a user by sending their email and password to the authentication API.
 * On successful login, stores the access token in local storage and fetches posts.
 *
 * @async
 * @function login
 * @returns {Promise<void>} A promise that resolves when the login process is complete.
 * @throws {Error} Throws an error if there is an issue with logging in or parsing the response.
 *
 * @description
 * This function sends a POST request to the login endpoint with the provided email and password.
 * If the login is successful and an access token is received, it is stored in local storage.
 * After storing the token, it triggers the creation of an API key and fetches the posts.
 *
 * The function handles potential errors during the login process, including network errors
 * and issues with parsing the response from the server.
 */
window.login = async function () {
  const email = loginEmail.value;
  const password = loginPassword.value;

  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await response.text();
    console.log("Login response status:", response.status);
    console.log("Login response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed login response data:", data);
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      alert("Error parsing response. Please try again.");
      return;
    }

    if (response.ok) {
      console.log("Response OK. Checking for accessToken...");
      if (data.data && data.data.accessToken) {
        console.log("AccessToken found:", data.data.accessToken);
        localStorage.setItem("authToken", data.data.accessToken);
        console.log(
          "Token saved in localStorage:",
          localStorage.getItem("authToken")
        );
        await createApiKey();
        fetchPosts(); // Fetch posts after login
      } else {
        console.error("No accessToken received in the response.");
        alert("Login failed. No accessToken received.");
      }
    } else {
      const errorMessage = data.message || "Login failed. Please try again.";
      console.error("Error logging in:", errorMessage);
      alert(errorMessage);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred while logging in. Please try again.");
  }
};
