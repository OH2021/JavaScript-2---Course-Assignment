/**
 * Fetches posts from the API and optionally filters them based on a search term.
 *
 * @param {string} [searchTerm=""] - The term to filter posts by content. Defaults to an empty string if not provided.
 * @returns {Promise<void>} A promise that resolves when the posts have been fetched and displayed.
 *
 * @throws {Error} Throws an error if there is an issue with fetching or parsing the posts.
 *
 * @example
 * // Fetch posts with no search term (i.e., all posts)
 * fetchPosts();
 *
 * @example
 * // Fetch posts that include the term "JavaScript"
 * fetchPosts("JavaScript");
 */
async function fetchPosts(searchTerm = "") {
  const authToken = getAuthToken();
  const apiKey = localStorage.getItem("apiKey");

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

    let posts;
    try {
      posts = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Failed to parse JSON posts response:", jsonError);
      alert("Error parsing posts. Please try again.");
      return;
    }

    if (response.ok) {
      // Apply the filter before displaying posts
      const filteredPosts = posts.data.filter((post) =>
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
      displayPosts(filteredPosts); // Pass filtered posts to display function
    } else {
      console.error("Error fetching posts:", responseText);
      alert("Failed to fetch posts. Please try again.");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}
