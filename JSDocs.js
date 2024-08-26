/**
 * Fetch all posts from the API and display them.
 * @async
 * @function fetchPosts
 * @returns {Promise<void>} A promise that resolves when the posts have been fetched and displayed.
 * @description This function fetches all posts from the API and displays them in the posts container. It is called on page load and after creating, updating, or deleting a post.
 * @example
 * fetchPosts();
 */
async function fetchPosts() {
  try {
    const response = await fetch("https://api.example.com/posts");
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
