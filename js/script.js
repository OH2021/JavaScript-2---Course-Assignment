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

  async function fetchPosts(searchTerm = "") {
    const authToken = getAuthToken();
    const apiKey = localStorage.getItem("apiKey");
    console.log("Fetching posts with authToken and apiKey:", authToken, apiKey);

    if (!authToken || !apiKey) {
      alert("You must be logged in and have an API Key to fetch posts.");
      return;
    }

    try {
      const response = await fetch("https://v2.api.noroff.dev/social/posts", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
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

        const postsData = posts.data || [];

        postsData
          .filter(
            (post) =>
              post.body &&
              post.body.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .forEach((post) => {
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.innerHTML = `
                        <h3>${post.title || "No Title"}</h3>
                        <p>${post.body || "No Content"}</p>
                        <button onclick="viewPost(${post.id})">View</button>
                        <button onclick="editPost(${post.id}, '${
              post.body
            }')">Edit</button>
                        <button onclick="deletePost(${post.id})">Delete</button>
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
        `https://v2.api.noroff.dev/social/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-Noroff-API-Key": localStorage.getItem("apiKey"),
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

          // Extracting post data
          const postData = post.data || {};
          const postTitle = postData.title || "No Title";
          const postBody = postData.body || "No Content";
          const postImage = postData.media ? postData.media.url : null;

          // Constructing the HTML for the modal
          const postDetails = `
            <div id="postModal" class="modal">
              <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${postTitle}</h3>
                <p>${postBody}</p>
                ${
                  postImage
                    ? `<img src="${postImage}" alt="Post Image" style="max-width: 100%; height: auto;">`
                    : ""
                }
              </div>
            </div>
          `;

          // Append modal HTML to body
          document.body.insertAdjacentHTML("beforeend", postDetails);

          // Get the modal and close button elements
          const modal = document.getElementById("postModal");
          const closeButton = document.querySelector(".close");

          // Display the modal
          modal.style.display = "block";

          // When the user clicks on the close button, close the modal
          closeButton.onclick = function () {
            modal.style.display = "none";
            modal.remove();
          };

          // When the user clicks anywhere outside the modal, close it
          window.onclick = function (event) {
            if (event.target === modal) {
              modal.style.display = "none";
              modal.remove();
            }
          };
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
    const content = postContent.value.trim();
    const authToken = getAuthToken();
    const apiKey = localStorage.getItem("apiKey");

    if (content && authToken && apiKey) {
      const title = prompt("Enter the title for your post:");

      if (!title) {
        alert("Title cannot be empty.");
        return;
      }

      try {
        const response = await fetch("https://v2.api.noroff.dev/social/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({ title, body: content }),
        });

        if (response.ok) {
          postContent.value = "";
          fetchPosts();
        } else {
          const errorResponse = await response.json();
          console.error("Error creating post:", errorResponse);
          alert(
            `Failed to create the post: ${errorResponse.errors
              .map((e) => e.message)
              .join(", ")}`
          );
        }
      } catch (error) {
        console.error("Error creating post:", error);
      }
    } else {
      alert("Content cannot be empty or user not authenticated.");
    }
  };

  window.editPost = function (id, currentContent) {
    const newContent = prompt("Edit your post:", currentContent);
    if (newContent !== null) {
      updatePost(id, newContent);
    }
  };

  async function updatePost(id, content) {
    const authToken = getAuthToken();
    const apiKey = localStorage.getItem("apiKey");

    if (!authToken || !apiKey) {
      alert("You must be logged in and have an API Key to update posts.");
      return;
    }

    try {
      const response = await fetch(
        `https://v2.api.noroff.dev/social/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({ body: content }),
        }
      );

      if (response.ok) {
        fetchPosts();
      } else {
        const errorResponse = await response.text();
        console.error("Error updating post:", errorResponse);
        alert(
          "Failed to update the post. You may not have permission to edit this post."
        );
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  window.deletePost = async function (id) {
    const authToken = getAuthToken();
    const apiKey = localStorage.getItem("apiKey");

    if (!authToken || !apiKey) {
      alert("You must be logged in and have an API Key to delete posts.");
      return;
    }

    try {
      const response = await fetch(
        `https://v2.api.noroff.dev/social/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        }
      );

      if (response.ok) {
        fetchPosts();
      } else {
        const errorResponse = await response.text();
        console.error("Error deleting post:", errorResponse);
        alert(
          "Failed to delete the post. You may not have permission to delete this post."
        );
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  window.searchPosts = function () {
    const searchTerm = searchInput.value.trim();
    fetchPosts(searchTerm);
  };

  searchInput.addEventListener("input", () => {
    searchPosts();
  });
});
