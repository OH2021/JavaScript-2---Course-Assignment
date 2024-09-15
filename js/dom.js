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
      const postItem = document.createElement("li");
      postItem.className = "post-item";

      let postContent = `
            <h3>${post.title || "No Title"}</h3>
            <p class="post-content">${post.body || "No Content"}</p>
          `;

      // Display image if provided by the API
      if (post.media && post.media.url) {
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
