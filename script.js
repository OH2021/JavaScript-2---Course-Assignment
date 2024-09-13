document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts");
  const postContent = document.getElementById("postContent");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  let authToken = localStorage.getItem("authToken");

  // Fetch and display posts on page load
  fetchPosts();

  /**
   * Register a new user.
   */
  async function register() {
    const email = registerEmail.value;
    const password = registerPassword.value;
    if (email.endsWith("@noroff.no") || email.endsWith("@stud.noroff.no")) {
      try {
        const response = await fetch(
          "https://v2.api.noroff.dev/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );
        const data = await response.json();
        console.log("Success!:", data);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please use @noroff.no or @stud.noroff.no email.");
    }
  }

  /**
   * Login a registered user.
   */
  async function login() {
    const email = loginEmail.value;
    const password = loginPassword.value;
    try {
      const response = await fetch("https://v2.api.noroff.dev/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      authToken = data.token;
      localStorage.setItem("authToken", authToken); // Save token to localStorage
      console.log("Login successful:", data);
      fetchPosts();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

  /**
   * Fetch all posts from the API and display all posts.
   */
  async function fetchPosts() {
    try {
      const response = await fetch("https://v2.api.noroff.dev/social/posts");
      const posts = await response.json();
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
          <p>${post.content}</p>
          <button onclick="editPost(${post.id}, '${post.content}')">Edit</button>
          <button onclick="deletePost(${post.id})">Delete</button>
        `;
        postsContainer.appendChild(postElement);
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  /**
   * Create a new post using the API.
   */
  async function createPost() {
    const content = postContent.value;
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
    }
  }

  /**
   * Edit an existing post.
   */
  window.editPost = function (id, currentContent) {
    const newContent = prompt("Edit your post:", currentContent);
    if (newContent) {
      updatePost(id, newContent);
    }
  };

  /**
   * Update a post using the API.
   */
  async function updatePost(id, content) {
    try {
      await fetch(`https://v2.api.noroff.dev/social/posts/${id}`, {
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

  /**
   * Delete a post.
   */
  window.deletePost = async function (id) {
    try {
      await fetch(`https://v2.api.noroff.dev/social/posts/${id}`, {
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
});
