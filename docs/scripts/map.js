let countries = [];
let featuredDish = null;

let currentPage = 0;
const itemsPerPage = 25;
const itemsPerColumn = 5;

const tooltip = document.getElementById("map-tooltip");
const tooltipImg = document.getElementById("tooltip-img");
const tooltipTitle = document.getElementById("tooltip-title");

function scrollToDish(code) {
  const target = document.getElementById(`dish-${code}`);
  if (target) {
    scrollWithOffset(`dish-${code}`);
    target.classList.add("highlight-scroll");
    setTimeout(() => target.classList.remove("highlight-scroll"), 1500);
  }
}

function renderCountryList() {
  const container = document.getElementById("country-columns");
  container.innerHTML = "";

  const sorted = [...countries].sort((a, b) => a.country.localeCompare(b.country));
  const start = currentPage * itemsPerPage;
  const pageItems = sorted.slice(start, start + itemsPerPage);

  container.className = pageItems.length <= 5
    ? "country-columns small-row"
    : "country-columns";

  for (let i = 0; i < pageItems.length; i += itemsPerColumn) {
    const group = pageItems.slice(i, i + itemsPerColumn);
    const column = document.createElement("div");
    column.classList.add("country-column");

    group.forEach(entry => {
      const li = createListItem(entry);
      column.appendChild(li);
    });

    container.appendChild(column);
  }

  const pagination = document.querySelector(".pagination-controls");
  if (countries.length <= itemsPerPage) {
    pagination.style.display = "none";
  } else {
    pagination.style.display = "flex";
    const totalPages = Math.ceil(countries.length / itemsPerPage);
    document.getElementById("page-indicator").textContent = `Page ${currentPage + 1} of ${totalPages}`;
    document.getElementById("prev-page").disabled = currentPage === 0;
    document.getElementById("next-page").disabled = currentPage >= totalPages - 1;
  }
}

function createListItem(entry) {
  const li = document.createElement("div");
  li.classList.add("country-item");
  li.textContent = entry.country;
  li.dataset.code = entry.code;

  li.addEventListener("mouseenter", () => {
    const svgEl = document.getElementById(entry.code) || document.querySelector(`.country.${entry.code}`);
    if (svgEl) svgEl.classList.add("highlight");

    tooltipImg.src = entry.image;
    tooltipTitle.textContent = `${entry.country} – ${entry.dish}`;

    const rect = svgEl?.getBoundingClientRect() || li.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top + window.scrollY - 10 + "px";
    tooltip.classList.remove("hidden");
  });

  li.addEventListener("mouseleave", () => {
    const svgEl = document.getElementById(entry.code) || document.querySelector(`.country.${entry.code}`);
    if (svgEl) svgEl.classList.remove("highlight");
    tooltip.classList.add("hidden");
  });

  li.addEventListener("click", () => {
    scrollToDish(entry.code);
  });

  return li;
}

function setupPagination() {
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderCountryList();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    const maxPage = Math.floor((countries.length - 1) / itemsPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      renderCountryList();
    }
  });
}

function loadSVGMap(dishes) {
  return fetch("images/world.svg")
    .then(res => res.text())
    .then(svg => {
      const mapContainer = document.getElementById("map-svg-container");
      mapContainer.innerHTML = svg;

      dishes.forEach(entry => {
        const el = document.getElementById(entry.code) || document.querySelector(`.country.${entry.code}`);
        if (!el) return;

        el.classList.add("country", "completed");
        el.style.cursor = "pointer";

        el.addEventListener("mouseenter", () => {
          tooltipImg.src = entry.image;
          tooltipTitle.textContent = `${entry.country} – ${entry.dish}`;
          tooltip.classList.remove("hidden");

          const rect = el.getBoundingClientRect();
          tooltip.style.left = rect.left + rect.width / 2 + "px";
          tooltip.style.top = rect.top + window.scrollY - 10 + "px";
        });

        el.addEventListener("mouseleave", () => {
          tooltip.classList.add("hidden");
        });

        el.addEventListener("click", () => {
          scrollToDish(entry.code);
        });
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  fetch('data/meals.json')
    .then(res => res.json())
    .then(data => {
      countries = data;
      featuredDish = data.reduce((latest, current) =>
        new Date(current.cooked) > new Date(latest.cooked) ? current : latest
      );

      setupPagination();

      loadSVGMap(data).then(() => {
        renderCountryList();
      });
    });
});

function showTooltip(x, y, entry) {
  tooltipImg.src = entry.image;
  tooltipText.textContent = `${entry.country} – ${entry.dish}`;

  const link = document.getElementById("tooltip-view-link");
  link.href = "#country-detail";
  link.onclick = (e) => {
    e.preventDefault();
    showDish(entry);
  };

  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.classList.remove("hidden");
}

