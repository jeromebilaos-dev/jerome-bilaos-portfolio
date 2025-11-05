document.addEventListener("DOMContentLoaded", function() {
  
  // This function loads an HTML file and injects it into a placeholder
  const loadHTML = (filePath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
      fetch(filePath)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          placeholder.innerHTML = data;
        })
        .catch(error => {
          console.error('Error loading HTML:', error);
          placeholder.innerHTML = `<p style="color:red;">Error loading ${placeholderId}.</p>`;
        });
    }
  };

  // Load the header and footer into their placeholders
  loadHTML('partials/header.html', 'header-placeholder');
  loadHTML('partials/footer.html', 'footer-placeholder');

});