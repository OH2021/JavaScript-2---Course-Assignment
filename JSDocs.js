/**
 * Fetch all posts from the API and display all posts.
 * Optional filters by a search term.
 * @param {string} [searchTerm] - The term to filter posts by content.
 */
async function fetchPosts(searchTerm = "") {
  try {
    const response = await fetch("https://v2.api.noroff.dev/social/posts", {
      headers: {
        Authorization: `Bearer ${authToken}`, // Use the token for authentication
      },
    });
    const posts = await response.json();
    postsContainer.innerHTML = "";

    posts
      .filter((post) => post.content.includes(searchTerm))
      .forEach((post) => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
          <p>${post.content}</p>
          <button onclick="editPost(${post.id}, '${post.content}')">Edit</button>
          <button onclick="deletePost(${post.id})">Delete</button>
          <button onclick="viewPost(${post.id})">View Post</button>
        `;
        postsContainer.appendChild(postElement);
      });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}
