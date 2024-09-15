// Initialize current page
let currentPage = 1;

/**
 * Fetch all posts from the API and display them.
 * @param {string} [searchTerm=""] - The term to filter posts by content.
 */
async function fetchPosts(searchTerm = "") {
  const authToken = getAuthToken();
  const apiKey = localStorage.getItem("apiKey");
  console.log("Fetching posts with authToken and apiKey:", authToken, apiKey);

  if (!authToken || !apiKey) {
    alert("You must be logged in and have an API Key to fetch posts.");
    return;
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/social/posts?page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

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
      displayPosts(posts.data || [], searchTerm);
    } else {
      console.error("Error fetching posts:", responseText);
      alert("Failed to fetch posts. Please try again.");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

/**
 * Creates a new post.
 */
window.createPost = async function () {
  const content = document.getElementById("postContent").value.trim();
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
        document.getElementById("postContent").value = "";
        fetchPosts(); // Refresh the posts list
      } else {
        const errorResponse = await response.json(); // Parse JSON response for errors
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

/**
 * Update a post with new content.
 * @param {number} id - The ID of the post to update.
 * @param {string} content - The new content for the post.
 */
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
      fetchPosts(); // Refresh the posts list
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

/**
 * Delete a post.
 * @param {number} id - The ID of the post to delete.
 */
async function deletePost(id) {
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (response.ok) {
      fetchPosts();
    } else {
      const errorResponse = await response.json();
      console.error("Error deleting post:", errorResponse);
      alert(
        `Failed to delete the post: ${errorResponse.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("An unexpected error occurred while deleting the post.");
  }
}

/**
 * View the details of a post.
 * @param {number} postId - The ID of the post to view.
 */
function viewPost(postId) {
  console.log(`Viewing post with ID: ${postId}`);
  fetch(`https://v2.api.noroff.dev/social/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "X-Noroff-API-Key": localStorage.getItem("apiKey"),
    },
  })
    .then((response) => response.json())
    .then((post) => {
      document.getElementById("postDetailsContent").innerHTML = `
          <h3>${post.title || "No Title"}</h3>
          <p>${post.body || "No Content"}</p>
          ${
            post.media && post.media.url
              ? `<img src="${post.media.url}" alt="${
                  post.media.alt || "Post image"
                }" class="post-image" />`
              : ""
          }
          <button onclick="closePostDetails()">Close</button>
        `;
      document.getElementById("postDetailsModal").style.display = "flex";
    })
    .catch((error) => {
      console.error("Error viewing post:", error);
      alert("Failed to fetch post details.");
    });
}

/**
 * Edit a post.
 * @param {number} postId - The ID of the post to edit.
 * @param {string} postContent - The current content of the post.
 */
function editPost(postId, postContent) {
  console.log(`Editing post with ID: ${postId} and content: ${postContent}`);
  const newContent = prompt("Edit post content:", postContent);
  if (newContent !== null) {
    updatePost(postId, newContent);
  }
}

/**
 * Close the post details modal.
 */
function closePostDetails() {
  document.getElementById("postDetailsModal").style.display = "none";
}

/**
 * Search for posts by content.
 */
window.searchPosts = function () {
  const searchTerm = document.getElementById("searchInput").value.trim();
  fetchPosts(searchTerm);
};

/**
 * Display posts with optional images.
 * @param {Array} posts - Array of post objects.
 * @param {string} [searchTerm=""] - Term to filter posts by content.
 */
function displayPosts(posts, searchTerm = "") {
  const postList = document.getElementById("postList");

  if (!postList) {
    console.error('Element with ID "postList" not found in the DOM.');
    return;
  }

  postList.innerHTML = "";

  posts
    .filter((post) => {
      return (
        typeof post.body === "string" &&
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .forEach((post) => {
      console.log("Processing post:", post);
      const postItem = document.createElement("li");
      postItem.className = "post-item";

      let postContent = `
            <h3>${post.title || "No Title"}</h3>
            <p class="post-content">${post.body || "No Content"}</p>
          `;

      if (post.media && post.media.url) {
        console.log("Image URL:", post.media.url);
        postContent += `
              <img src="${post.media.url}" alt="${
          post.media.alt || "Post image"
        }" class="post-image" />
            `;
      }

      postContent += `
            <div class="post-buttons">
              <button onclick="editPost(${post.id}, '${
        post.body || ""
      }')">Edit</button>
              <button onclick="deletePost(${post.id})">Delete</button>
            </div>
          `;

      postItem.innerHTML = postContent;
      postList.appendChild(postItem);
    });
}
