function renderDishGrid(dishes) {
  const dishList = document.getElementById("dish-list");
  if (!dishList) return;

  const featuredDish = dishes.reduce((latest, current) =>
    new Date(current.cooked) > new Date(latest.cooked) ? current : latest
  );

  const remainingDishes = dishes
    .filter(d => d !== featuredDish)
    .sort((a, b) => a.country.localeCompare(b.country));

  dishList.innerHTML = "";

  remainingDishes.forEach(dish => {
    const card = document.createElement("article");
    card.classList.add("dish-card");
    card.id = `dish-${dish.code}`; // ✅ Add scroll target ID

    const starHtml = "★".repeat(dish.rating) + "☆".repeat(5 - dish.rating);
    const cookedDate = new Date(dish.cooked).toLocaleDateString();
    const reviewHtml = (dish.review || []).map(p => `<p>${p}</p>`).join("");

    const recipeLinks = (dish.recipe || [])
      .map((link, index) => `
        <a href="${link.url}" class="latest-recipe-url ${index > 0 ? 'alt-link' : ''}" target="_blank" rel="noopener noreferrer">
          ${link.label || new URL(link.url).hostname}
        </a>
      `)
      .join("");

    card.innerHTML = `
    <div class="latest-img-container">
      <img src="${dish.image}" alt="${dish.dish}" class="dish-img" />
      </div>
      <div class="dish-card-body">
        <div class="dish-heading">
          <h3 class="dish-title">${dish.country} – ${dish.dish}</h3>
          <div class="latest-rating" aria-label="${dish.rating} out of 5 stars">
            ${starHtml.split("").map(char => `<span class="star ${char === "★" ? "filled" : ""}">${char}</span>`).join("")}
          </div>
        </div>

        <div class="latest-meta">
          <p class="latest-date">Cooked on: ${cookedDate}</p>
          <div class="latest-link-group">
            <span class="latest-recipe-label">Recipe From →</span>
            ${recipeLinks}
          </div>
        </div>

        <button class="dish-toggle" aria-expanded="false">Read More ↓</button>
        <div class="dish-review hidden">${reviewHtml}</div>
      </div>
    `;

    const toggle = card.querySelector(".dish-toggle");
    const review = card.querySelector(".dish-review");
    toggle.addEventListener("click", () => {
      const isOpen = review.classList.toggle("hidden") === false;
      toggle.textContent = isOpen ? "Hide Review ↑" : "Read More ↓";
      toggle.setAttribute("aria-expanded", isOpen);
    });

      const imgContainer = card.querySelector(".latest-img-container");
if (imgContainer) {
  imgContainer.style.setProperty('--bg-img', `url(${dish.image})`);
}

    dishList.appendChild(card);
  });

}

function renderFeaturedDish(dishes) {
  const latestSection = document.querySelector("#latest .latest-card");
  if (!latestSection) return;

  const featured = dishes.reduce((latest, current) =>
    new Date(current.cooked) > new Date(latest.cooked) ? current : latest
  );

  latestSection.id = `dish-${featured.code}`; // ✅ Give featured section a scroll ID

  const stars = "★".repeat(featured.rating) + "☆".repeat(5 - featured.rating);
  const cookedDate = new Date(featured.cooked).toLocaleDateString();

  latestSection.querySelector(".latest-img").src = featured.image;
  latestSection.querySelector(".latest-img").alt = featured.dish;
  latestSection.querySelector(".latest-title").textContent = `${featured.country} – ${featured.dish}`;

  latestSection.querySelector(".latest-rating").innerHTML = stars
    .split("")
    .map(char => `<span class="star ${char === "★" ? "filled" : ""}">${char}</span>`)
    .join("");

  latestSection.querySelector(".latest-date").textContent = `Cooked on: ${cookedDate}`;

  const linkGroup = latestSection.querySelector(".latest-link-group");
  linkGroup.innerHTML = "";

  const labelEl = document.createElement("span");
  labelEl.className = "latest-recipe-label";
  labelEl.textContent = "Recipe From →";
  linkGroup.appendChild(labelEl);

  (featured.recipe || []).forEach(link => {
    const a = document.createElement("a");
    a.href = link.url;
    a.className = "latest-recipe-url";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.label || new URL(link.url).hostname;
    linkGroup.appendChild(a);
  });

  const reviewContainer = latestSection.querySelector(".latest-review");
  if (featured.review && Array.isArray(featured.review)) {
    reviewContainer.innerHTML = featured.review.map(p => `<p>${p}</p>`).join("<br>");
  }

  const imgContainer = latestSection.querySelector(".latest-img").closest(".latest-img-container");
if (imgContainer) {
  imgContainer.style.setProperty('--bg-img', `url(${featured.image})`);
}

}

// Only fetch if not already done in another script
if (!window.__mealsDataLoaded) {
  document.addEventListener("DOMContentLoaded", () => {
    fetch('data/meals.json')
      .then(res => res.json())
      .then(data => {
        window.__mealsDataLoaded = true;
        renderFeaturedDish(data);
        renderDishGrid(data);
      });
  });
}
