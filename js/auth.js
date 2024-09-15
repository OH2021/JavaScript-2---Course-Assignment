// auth.js

/**
 * Register a new user.
 */
window.register = async function () {
  const email = registerEmail.value;
  const password = registerPassword.value;
  const name = registerName.value;

  if (!email.endsWith("@noroff.no") && !email.endsWith("@stud.noroff.no")) {
    alert("Please use @noroff.no or @stud.noroff.no email.");
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    console.log("Registration response data:", data);

    if (response.ok) {
      console.log("Registration successful:", data);
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        console.log("Stored authToken in localStorage:", getAuthToken());
      } else {
        alert("Registration successful. Please log in to continue.");
      }
    } else {
      console.error("Error registering:", data.errors);
      const errorMessage =
        data.errors.map((error) => error.message).join(", ") ||
        "Registration failed. Please try again.";
      alert(errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Logs in a user by sending their email and password to the authentication API.
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
        fetchPosts();
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

/**
 * Creates an API key for the authenticated user.
 */
async function createApiKey() {
  const authToken = getAuthToken();
  console.log("Creating API Key with authToken:", authToken);

  if (!authToken) {
    alert("You must be logged in to create an API Key.");
    return;
  }

  try {
    const response = await fetch(
      "https://v2.api.noroff.dev/auth/create-api-key",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My API Key name",
        }),
      }
    );

    const data = await response.json();
    console.log("Create API Key response data:", data);

    if (response.ok) {
      console.log("API Key created:", data);
      localStorage.setItem("apiKey", data.data.key);
    } else {
      console.error("Error creating API Key:", data.errors);
      const errorMessage =
        data.errors.map((error) => error.message).join(", ") ||
        "Failed to create API Key. Please try again.";
      alert(errorMessage);
    }
  } catch (error) {
    console.error("Error creating API Key:", error);
  }
}
