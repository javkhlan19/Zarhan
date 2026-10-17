

const STORAGE_KEY = "zarhan_ads";

const grid = document.getElementById("listingGrid");
const form = document.getElementById("listingForm");
const modal = document.getElementById("listingModal");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

let activeCategory = "Бүгд";
let ads = [];

try {
  ads = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
} catch {
  ads = [];
}

function saveAds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

function formatPrice(price) {
  return Number(price).toLocaleString("mn-MN") + " ₮";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function openForm() {
  modal.classList.remove("hidden");
}

function closeForm() {
  modal.classList.add("hidden");
}

document.getElementById("openFormTop").addEventListener("click", openForm);
document.getElementById("openFormBottom").addEventListener("click", openForm);
document.getElementById("closeForm").addEventListener("click", closeForm);
document.getElementById("closeBackdrop").addEventListener("click", closeForm);

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(item =>
      item.classList.remove("active")
    );
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderAds();
  });
});

searchInput.addEventListener("input", renderAds);
sortSelect.addEventListener("change", renderAds);

form.addEventListener("submit", event => {
  event.preventDefault();

  const data = new FormData(form);
  const ad = {
    id: Date.now(),
    title: String(data.get("title") || "").trim(),
    price: Number(data.get("price")),
    category: String(data.get("category") || "Бусад"),
    description: String(data.get("description") || "").trim(),
    image: String(data.get("image") || "").trim(),
    location: String(data.get("location") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    createdAt: Date.now()
  };

  if (!ad.title || !ad.phone || !Number.isFinite(ad.price) || ad.price < 0) {
    showToast("Мэдээллээ зөв оруулна уу.");
    return;
  }

  ads.unshift(ad);

  try {
    saveAds();
  } catch {
    ads.shift();
    showToast("Хадгалах зай хүрэлцэхгүй байна.");
    return;
  }

  form.reset();
  closeForm();
  renderAds();
  showToast("Зар амжилттай нэмэгдлээ!");
});

function renderAds() {
  const query = searchInput.value.trim().toLowerCase();

  let filtered = ads.filter(ad => {
    const matchesCategory =
      activeCategory === "Бүгд" || ad.category === activeCategory;
    const text = `${ad.title} ${ad.description} ${ad.location}`.toLowerCase();
    return matchesCategory && text.includes(query);
  });

  if (sortSelect.value === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  grid.replaceChildren();

  filtered.forEach(ad => {
    const card = document.createElement("article");
    card.className = "listing-card";

    if (ad.image && /^https?:\/\//i.test(ad.image)) {
      const image = document.createElement("img");
      image.src = ad.image;
      image.alt = ad.title;
      image.loading = "lazy";
      image.onerror = () => image.remove();
      card.appendChild(image);
    }

    const content = document.createElement("div");
    content.className = "listing-content";

    const category = document.createElement("p");
    category.className = "eyebrow";
    category.textContent = ad.category;

    const title = document.createElement("h3");
    title.textContent = ad.title;

    const price = document.createElement("p");
    price.className = "listing-price";
    price.textContent = formatPrice(ad.price);

    const description = document.createElement("p");
    description.textContent = ad.description;

    const location = document.createElement("p");
    location.textContent = ad.location ? "📍 " + ad.location : "";

    const phone = document.createElement("p");
    phone.textContent = "Утас: " + ad.phone;

    content.append(category, title, price, description, location, phone);
    card.appendChild(content);
    grid.appendChild(card);
  });

  resultCount.textContent = `${filtered.length} зар`;
  emptyState.classList.toggle("hidden", filtered.length !== 0);
}

renderAds();
