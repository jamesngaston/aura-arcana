document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('markdown-container');
  
  if (container) {
    const filename = container.getAttribute('data-source');
    
    // Using a cache buster parameter to load local edits since we're using raw.githubusercontent.com
    // Note: To preview strictly local unpushed files in the future without CORS, consider setting up a local web server (e.g. `npx serve .`) and fetching `${filename}`
    const fetchUrl = `https://raw.githubusercontent.com/jamesngaston/aura-arcana/main/${filename}?t=${new Date().getTime()}`;
    
    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(markdownText => {
        container.innerHTML = '';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'glass-panel prose fade-in delay-1';
        
        // Because the Markdown itself is now beautifully structured using Native HTML tags,
        // marked.js handles reading and formatting the <div align="center"> and <table> natively!
        contentDiv.innerHTML = marked.parse(markdownText);
        
        // === CUSTOM CLEANUP FOR WEB DEPLOYMENT ===
        // Remove the redundant "Stay Connected" markdown section since we have a dedicated web HTML footer.
        const allH3s = contentDiv.querySelectorAll('h3');
        allH3s.forEach(h3 => {
            if (h3.textContent.includes('Stay Connected')) {
                // Remove previous <br> spacings
                let prev = h3.previousSibling;
                while (prev && (prev.nodeType === Node.TEXT_NODE || prev.tagName === 'BR')) {
                    let toRemove = prev;
                    prev = prev.previousSibling;
                    toRemove.remove();
                }
                // Remove the h3 and all siblings after it
                let elem = h3;
                while (elem) {
                    let next = elem.nextSibling;
                    elem.remove();
                    elem = next;
                }
            }
        });
        
        container.appendChild(contentDiv);
        
        // Add cascading fade-in animation to top-level elements for flair
        Array.from(contentDiv.children).forEach((child, index) => {
          child.style.opacity = '0';
          child.classList.add('fade-in');
          child.style.animationDelay = `${(index * 0.05).toFixed(2)}s`;
        });
      })
      .catch(error => {
        container.innerHTML = `
          <div style="text-align: center; color: #ff6b6b; padding: 2rem;">
            <h2>Connection Error</h2>
            <p>Could not load the document. Make sure you are connected to the internet!</p>
          </div>
        `;
      });
  }
});
