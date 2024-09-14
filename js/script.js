document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts");
  const postContent = document.getElementById("postContent");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerName = document.getElementById("registerName");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const searchInput = document.getElementById("searchInput");

  function getAuthToken() {
    const token = localStorage.getItem("authToken");
    console.log("Retrieved authToken from localStorage:", token);
    return token;
  }

  // Register a new user
  window.register = async function () {
    const email = registerEmail.value;
    const password = registerPassword.value;
    const name = registerName.value;

    // Validate email format
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
          localStorage.setItem("authToken", data.token); // Store the token in localStorage
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
          fetchPosts(); // Fetch posts after successful login
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

  async function fetchPosts(searchTerm = "") {
    const authToken = getAuthToken();
    console.log("Fetching posts with authToken:", authToken);

    if (!authToken) {
      alert("You must be logged in to fetch posts.");
      return;
    }

    try {
      const response = await fetch("https://v2.api.noroff.dev/social/posts", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json", // Optional, but good practice to include
        },
      });

      const responseText = await response.text();
      console.log("Fetch posts response status:", response.status);
      console.log("Fetch posts response text:", responseText);

      let posts;
      try {
        posts = JSON.parse(responseText);
        console.log("Parsed posts data:", posts);
      } catch (jsonError) {
        console.error("Failed to parse JSON posts response:", jsonError);
        alert("Error parsing posts. Please try again.");
        return;
      }

      if (response.ok) {
        postsContainer.innerHTML = "";

        posts
          .filter((post) => post.content.includes(searchTerm))
          .forEach((post) => {
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.innerHTML = `\
              <p>${post.content}</p>\
              <button onclick="editPost(${post.id}, '${post.content}')">Edit</button>\
              <button onclick="deletePost(${post.id})">Delete</button>\
              <button onclick="viewPost(${post.id})">View Post</button>\
            `;
            postsContainer.appendChild(postElement);
          });
      } else {
        console.error("Error fetching posts:", responseText);
        alert("Failed to fetch posts. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  window.viewPost = async function (id) {
    const authToken = getAuthToken();
    console.log("Viewing post with authToken:", authToken);

    if (!authToken) {
      alert("You must be logged in to view posts.");
      return;
    }

    try {
      const response = await fetch(
        `https://v2.api.noroff.dev/social/posts/<id>`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const responseText = await response.text();
      console.log("View post response status:", response.status);
      console.log("View post response text:", responseText);

      if (response.ok) {
        let post;
        try {
          post = JSON.parse(responseText);
          console.log("Parsed post data:", post);
          alert(`Post ID: ${post.id}\nContent: ${post.content}`);
        } catch (jsonError) {
          console.error("Failed to parse JSON post response:", jsonError);
          alert("Error parsing post. Please try again.");
        }
      } else {
        console.error("Error fetching the post:", responseText);
        alert("Failed to fetch the post. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching the post by ID:", error);
    }
  };

  window.createPost = async function () {
    const content = postContent.value;
    const authToken = getAuthToken();

    if (content && authToken) {
      try {
        await fetch("https://v2.api.noroff.dev/social/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ content }),
        });
        postContent.value = "";
        fetchPosts();
      } catch (error) {
        console.error("Error creating post:", error);
      }
    } else {
      alert("Content cannot be empty or user not authenticated.");
    }
  };

  window.editPost = function (id, currentContent) {
    const newContent = prompt("Edit your post:", currentContent);
    if (newContent) {
      updatePost(id, newContent);
    }
  };

  async function updatePost(id, content) {
    const authToken = getAuthToken();
    console.log("Updating post with authToken:", authToken);

    if (!authToken) {
      alert("You must be logged in to update posts.");
      return;
    }

    try {
      await fetch(`https://v2.api.noroff.dev/social/posts/<id>`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content }),
      });
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  window.deletePost = async function (id) {
    const authToken = getAuthToken();
    console.log("Deleting post with authToken:", authToken);

    if (!authToken) {
      alert("You must be logged in to delete posts.");
      return;
    }

    try {
      await fetch(`https://v2.api.noroff.dev/social/posts/<id>`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  window.searchPosts = function () {
    const searchTerm = searchInput.value;
    fetchPosts(searchTerm);
  };
});
