const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
}

const currentPage = document.body.dataset.page;
const profileButton = document.querySelector("#profile-button");
const profileDialog = document.querySelector("#profile-dialog");
profileButton?.setAttribute("aria-expanded", "false");
profileButton?.addEventListener("click", () => {
  profileDialog?.showModal();
  profileButton.setAttribute("aria-expanded", "true");
});
document.querySelector("#profile-close")?.addEventListener("click", () => profileDialog?.close());
profileDialog?.addEventListener("close", () => profileButton?.setAttribute("aria-expanded", "false"));
profileDialog?.addEventListener("click", (event) => {
  if (event.target === profileDialog) profileDialog.close();
});
document.querySelectorAll(".profile-drawer-links a").forEach((link) => {
  link.addEventListener("click", () => {
    if (link.getAttribute("href") !== "#drawer-profile-details") profileDialog?.close();
  });
});
const profileName = sessionStorage.getItem("campusName") || localStorage.getItem("campusName");
const profileRole = sessionStorage.getItem("campusRole") || localStorage.getItem("campusRole");
const dialogRole = document.querySelector("#dialog-role");
if (dialogRole && profileRole) {
  dialogRole.textContent = `${profileRole === "staff" ? "Canteen staff" : "Student"} · Delhi Technical Campus`;
}
const dialogAccess = document.querySelector("#dialog-access");
if (dialogAccess && profileRole) {
  dialogAccess.textContent = profileRole === "staff" ? "Canteen staff dashboard" : "Student campus portal";
}
if (profileName) {
  const firstName = profileName.split(/\s+/)[0];
  const initials = firstName.charAt(0).toUpperCase();
  const avatar = document.querySelector("#profile-avatar");
  if (avatar) avatar.textContent = initials;
  const name = document.querySelector("#profile-name");
  if (name) name.textContent = firstName;
  const dialogAvatar = document.querySelector("#dialog-avatar");
  if (dialogAvatar) dialogAvatar.textContent = initials;
  const dialogName = document.querySelector("#dialog-name");
  if (dialogName) dialogName.textContent = `${firstName}.`;
}
document.querySelectorAll(".primary-navigation .nav-link").forEach((link) => {
  if (link.getAttribute("href") === `${currentPage}.html`) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(
  ".section-heading, .welcome-copy, .welcome-image, .section-topline, .path-card, .quote-content, .intro-split > *, .study-card, .study-footnote, .feature-image, .feature-copy, .learning-copy, .moment-card, .clubs-copy, .step-card, .help-photo, .help-content"
);

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  revealItems.forEach((item) => {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });
}

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 6}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const page = document.body.dataset.page;
const readCampusOrders = () => {
  const savedOrders = localStorage.getItem("campusOrders");
  if (!savedOrders) return [];
  const orders = JSON.parse(savedOrders);
  if (!Array.isArray(orders)) throw new TypeError("Saved campus orders are not a list.");
  return orders;
};
const saveCampusOrders = (orders) => localStorage.setItem("campusOrders", JSON.stringify(orders));
const foodPhoto = (id, width = 640) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=78`;

const yaranaMenu = [
  { category: "Beverages", photo: "photo-1556679343-c7306c1976bc", items: [
    ["Tea", 10], ["Milk tea", 20], ["Lemon tea", 15], ["Black tea", 15],
    ["Black coffee", 20], ["Cold coffee", 50], ["Hot chocolate", 60],
    ["Sweet lassi", 35], ["Salted lassi", 30], ["Mineral water", 20], ["Soft drink", 20]
  ] },
  { category: "Sandwiches", photo: "photo-1528735602780-2552fd46c7af", items: [
    ["Veg sandwich", 30], ["Veg cheese sandwich", 50], ["Paneer tikka sandwich", 50],
    ["Chilli paneer sandwich", 40], ["Frozen kulcha", 50]
  ] },
  { category: "Burgers", photo: "photo-1568901346375-23c9450c58cd", items: [
    ["Veg burger", 40], ["Cheese burger", 60], ["Paneer burger", 90], ["Vada pav", 60]
  ] },
  { category: "Puffs", photo: "photo-1555507036-ab1f4038808a", items: [
    ["Aloo puff", 30], ["Paneer puff", 40], ["Samosa", 20], ["Bread pakoda", 20]
  ] },
  { category: "Rolls", photo: "photo-1626700051175-6818013e1d4f", items: [
    ["Egg roll (single)", 80], ["Egg roll (double)", 120], ["Veg roll", 60],
    ["Paneer roll", 80], ["Veg spring roll", 70], ["Paneer spring roll", 90],
    ["Veg kurkure spring roll", 100]
  ] },
  { category: "Noodles", photo: "photo-1569718212165-3a8278d5f624", items: [
    ["Veg noodles", 60], ["Chilli garlic noodles", 70], ["Singapuri noodles", 80],
    ["Hakka noodles", 80], ["Paneer noodles", 80]
  ] },
  { category: "Maggi", photo: "photo-1585032226651-759b368d7246", items: [
    ["Plain Maggi", 50], ["Veg Maggi", 60], ["Paneer Maggi", 70]
  ] },
  { category: "Potato", photo: "photo-1573080496219-bb080dd4f877", items: [
    ["Chilli potato", 70], ["Honey chilli potato", 80], ["French fry", 60]
  ] },
  { category: "Pasta", photo: "photo-1473093295043-cdd812d0e601", items: [
    ["White sauce pasta", 80], ["Red sauce pasta", 80], ["Mix sauce pasta", 100]
  ] },
  { category: "Rice", photo: "photo-1512058564366-18510be2db19", items: [
    ["Veg fried rice", 60], ["Paneer fried rice", 80], ["Manchurian fried rice", 100],
    ["Chilli paneer fried rice", 120]
  ] },
  { category: "Momos", photo: "photo-1563245372-f21724e3856d", items: [
    ["Veg momos (8 pcs)", 50], ["Chilli momos (8 pcs)", 100], ["Fry momos (8 pcs)", 60]
  ] },
  { category: "Paratha", photo: "photo-1626132647523-66f5bf380027", items: [
    ["Aloo paratha", 70], ["Aloo onion paratha", 80], ["Paneer paratha", 90],
    ["Mix paratha", 100], ["Pyaz paratha", 70], ["Gobi paratha", 80]
  ] },
  { category: "Shakes", photo: "photo-1572490122747-3968b75cc699", items: [
    ["Banana shake", 60], ["Mango shake", 60], ["Oreo shake", 70],
    ["Kit Kat shake", 80], ["Brownie shake", 90], ["Sweet lassi", 40]
  ] }
];

const menuCategoryId = (category) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function renderYaranaMenu() {
  const menuRoot = document.querySelector("#canteen-menu");
  const filterRoot = document.querySelector("#menu-filters");
  if (!menuRoot || !filterRoot) return;

  const filters = [
    { category: "All dishes", id: "all", photo: "photo-1546069901-ba9599a7e63c", count: yaranaMenu.reduce((sum, group) => sum + group.items.length, 0) },
    ...yaranaMenu.map(({ category, photo, items }) => ({
      category,
      id: menuCategoryId(category),
      photo,
      count: items.length
    }))
  ];
  filters.forEach(({ category, id, photo, count }, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `menu-filter${index === 0 ? " is-active" : ""}`;
    button.dataset.menuFilter = id;
    button.setAttribute("aria-pressed", String(index === 0));
    button.setAttribute("aria-label", `${category}, ${count} ${count === 1 ? "dish" : "dishes"}`);
    const image = document.createElement("img");
    image.src = foodPhoto(photo, 160);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "menu-filter-label";
    label.textContent = category;
    const total = document.createElement("span");
    total.className = "menu-filter-count";
    total.textContent = String(count);
    button.append(image, label, total);
    filterRoot.append(button);
  });

  yaranaMenu.forEach(({ category, photo, items }) => {
    const section = document.createElement("section");
    const categoryId = menuCategoryId(category);
    section.className = "menu-category";
    section.dataset.menuCategory = categoryId;

    const heading = document.createElement("h2");
    heading.textContent = category;

    const imageFrame = document.createElement("div");
    imageFrame.className = "menu-category-photo";
    const image = document.createElement("img");
    image.src = foodPhoto(photo, 560);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");
    imageFrame.append(image);

    const list = document.createElement("div");
    list.className = "canteen-menu-list";
    items.forEach(([name, price]) => {
      const item = document.createElement("article");
      item.className = "canteen-menu-item";
      item.dataset.menuName = name.toLowerCase();

      const details = document.createElement("div");
      const itemName = document.createElement("h3");
      itemName.textContent = name;
      const itemPrice = document.createElement("strong");
      itemPrice.textContent = `₹${price}`;
      details.append(itemName, itemPrice);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-order";
      addButton.dataset.item = name;
      addButton.dataset.price = String(price);
      addButton.setAttribute("aria-label", `Add ${name} to order`);
      addButton.innerHTML = 'Add <span aria-hidden="true">+</span>';
      const controls = document.createElement("div");
      controls.className = "menu-item-actions";
      controls.append(createQuantityControl(name), addButton);
      item.append(details, controls);
      list.append(item);
    });

    section.append(imageFrame, heading, list);
    menuRoot.append(section);
  });

  let activeCategory = "all";
  const searchInput = document.querySelector("#menu-search");
  const emptyMessage = document.querySelector("#menu-no-results");
  const updateVisibleItems = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    menuRoot.querySelectorAll(".menu-category").forEach((section) => {
      let categoryCount = 0;
      section.querySelectorAll(".canteen-menu-item").forEach((item) => {
        const matches = (activeCategory === "all" || activeCategory === section.dataset.menuCategory)
          && item.dataset.menuName.includes(query);
        item.hidden = !matches;
        if (matches) categoryCount += 1;
      });
      section.hidden = categoryCount === 0;
      visibleCount += categoryCount;
    });
    emptyMessage.hidden = visibleCount > 0;
  };

  filterRoot.addEventListener("click", (event) => {
    const selected = event.target.closest("[data-menu-filter]");
    if (!selected) return;
    activeCategory = selected.dataset.menuFilter;
    filterRoot.querySelectorAll("[data-menu-filter]").forEach((button) => {
      const isActive = button === selected;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    selected.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    updateVisibleItems();
  });
  searchInput.addEventListener("input", updateVisibleItems);
}

function createQuantityControl(label, value = 1, cartControl = false) {
  const control = document.createElement("div");
  control.className = cartControl ? "quantity-control cart-quantity-control" : "quantity-control";
  control.setAttribute("aria-label", `${label} quantity`);
  control.dataset.quantityLabel = label;

  const decrement = document.createElement("button");
  decrement.type = "button";
  decrement.className = "quantity-change";
  decrement.dataset.quantityChange = "-1";
  decrement.setAttribute("aria-label", `Decrease ${label} quantity`);
  decrement.textContent = "−";

  const count = document.createElement("output");
  count.className = "quantity-value";
  count.setAttribute("aria-live", "polite");
  count.textContent = String(value);

  const increment = document.createElement("button");
  increment.type = "button";
  increment.className = "quantity-change";
  increment.dataset.quantityChange = "1";
  increment.setAttribute("aria-label", `Increase ${label} quantity`);
  increment.textContent = "+";

  control.append(decrement, count, increment);
  return control;
}

if (page === "portal" || page === "canteen" || page === "lost-found" || page === "my-orders") {
  const maxOrderItems = 99;
  const role = sessionStorage.getItem("campusRole") || localStorage.getItem("campusRole");
  const name = sessionStorage.getItem("campusName") || localStorage.getItem("campusName");
  if (role === "staff") {
    window.location.replace("canteen-staff.html");
  } else if (!role || !name) {
    const requestedRole = role === "staff" ? "staff" : "student";
    window.location.replace(`login.html?role=${requestedRole}`);
  } else {
    const isStaff = role === "staff";
    const firstName = name.split(/\s+/)[0];
    const roleLabel = document.querySelector("#portal-role-label");
    if (roleLabel) {
      roleLabel.textContent =
        isStaff ? "YOUR CAMPUS, YOUR WAY · STAFF" : "YOUR CAMPUS, YOUR WAY · STUDENT";
      document.querySelector("#portal-greeting").innerHTML =
        `Welcome back,<br><em>${firstName.replace(/[&<>"]/g, "")}.</em>`;
      document.querySelector("#portal-intro").textContent = isStaff
        ? "Your campus day starts here. Find a bite, check what's happening, and get back to what matters."
        : "Your campus day starts here. Find a bite, find your people, and find what you need.";
    }
    document.querySelector("#profile-name").textContent = firstName;
    const profileAvatar = document.querySelector("#profile-avatar");
    if (profileAvatar) profileAvatar.textContent = firstName.charAt(0).toUpperCase();
    document.querySelector("#dialog-avatar").textContent = firstName.charAt(0).toUpperCase();
    document.querySelector("#dialog-name").textContent = `${firstName}.`;
    document.querySelector("#dialog-role").textContent =
      `${isStaff ? "Faculty & staff" : "Student"} · Delhi Technical Campus`;
    document.querySelector("#dialog-access").textContent =
      isStaff ? "Staff campus portal" : "Student campus portal";
    const portalDate = document.querySelector("#portal-date");
    if (portalDate) {
      portalDate.textContent =
        new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
    }

    if (page === "portal" && "IntersectionObserver" in window && !reducedMotion) {
      const revealElements = document.querySelectorAll(
        ".portal-welcome-copy, .portal-stats, .portal-section-heading, .menu-card, .lost-card, .lost-side-note, .portal-footer"
      );
      const portalRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -36px 0px" });

      document.body.classList.add("portal-motion-ready");
      revealElements.forEach((element) => {
        element.classList.add("portal-reveal");
        portalRevealObserver.observe(element);
      });
    }

    const campusScene = document.querySelector(".portal-welcome-scene");
    if (campusScene && !reducedMotion) {
      campusScene.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const bounds = campusScene.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        campusScene.style.setProperty("--scene-rotate-y", `${(x - 0.5) * 4}deg`);
        campusScene.style.setProperty("--scene-rotate-x", `${(0.5 - y) * 3}deg`);
      });
      campusScene.addEventListener("pointerleave", () => {
        campusScene.style.setProperty("--scene-rotate-y", "0deg");
        campusScene.style.setProperty("--scene-rotate-x", "0deg");
      });
    }

    const themeToggle = document.querySelector("#theme-toggle");
    const savedTheme = localStorage.getItem("campusTheme");
    if (savedTheme === "dark") document.body.classList.add("dark-mode");
    const updateThemeButton = () => {
      const dark = document.body.classList.contains("dark-mode");
      themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
    };
    updateThemeButton();
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("campusTheme", document.body.classList.contains("dark-mode") ? "dark" : "light");
      updateThemeButton();
    });

    const reportDialog = document.querySelector("#report-dialog");
    document.querySelectorAll("#report-button, [data-open-report]").forEach((button) => {
      button.addEventListener("click", () => reportDialog.showModal());
    });
    document.querySelector("#report-close")?.addEventListener("click", () => reportDialog.close());
    const toast = document.querySelector("#toast-message");
    let toastTimeout;
    const showToast = (message) => {
      toast.textContent = message;
      toast.classList.add("is-visible");
      window.clearTimeout(toastTimeout);
      toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
    };

    if (document.querySelector("#cart-button")) {
    let cart = [];
    let invalidSavedCart = false;
    let exceededSavedOrder = false;
    const savedCart = sessionStorage.getItem("campusOrder");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) throw new TypeError("Saved order is not a list.");
        const itemsByName = new Map();
        parsedCart.forEach((item) => {
          if (!item || typeof item.name !== "string" || !Number.isFinite(item.price) || item.price <= 0) {
            invalidSavedCart = true;
            return;
          }
          const quantity = item.quantity === undefined ? 1 : item.quantity;
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            invalidSavedCart = true;
            return;
          }
          const existing = itemsByName.get(item.name);
          if (existing && existing.price !== item.price) {
            invalidSavedCart = true;
            return;
          }
          if (existing) {
            if (existing.quantity + quantity > 99) invalidSavedCart = true;
            existing.quantity = Math.min(99, existing.quantity + quantity);
          }
          else itemsByName.set(item.name, { name: item.name, price: item.price, quantity });
        });
        cart = [...itemsByName.values()];
        let remainingItems = maxOrderItems;
        cart = cart.reduce((validItems, item) => {
          const quantity = Math.min(item.quantity, remainingItems);
          if (quantity < item.quantity) exceededSavedOrder = true;
          remainingItems -= quantity;
          if (quantity > 0) validItems.push({ ...item, quantity });
          return validItems;
        }, []);
      } catch (error) {
        console.error("The saved demo order could not be restored; it has been cleared.", error);
        invalidSavedCart = true;
      }
    }
    const saveCart = () => sessionStorage.setItem("campusOrder", JSON.stringify(cart));
    const cartCount = document.querySelector("#cart-count");
    const orderDialog = document.querySelector("#order-dialog");
    const cartLines = document.querySelector("#cart-lines");
    const cartTotal = document.querySelector("#cart-total");
    const renderCart = () => {
      cartLines.replaceChildren();
      if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "cart-empty";
        empty.textContent = "Your order is empty. Add a café favorite to get started.";
        cartLines.append(empty);
      } else {
        cart.forEach((item) => {
          const line = document.createElement("article");
          line.className = "cart-line";
          line.dataset.item = item.name;
          const description = document.createElement("div");
          description.className = "cart-line-details";
          const itemName = document.createElement("h3");
          itemName.textContent = item.name;
          const itemPrice = document.createElement("strong");
          itemPrice.textContent = `₹${(item.price * item.quantity).toLocaleString("en-IN")}`;
          const unitPrice = document.createElement("span");
          unitPrice.textContent = `₹${item.price.toLocaleString("en-IN")} each`;
          description.append(itemName, unitPrice);
          const controls = createQuantityControl(item.name, item.quantity, true);
          controls.querySelector('[data-quantity-change="-1"]').dataset.cartChange = "-1";
          controls.querySelector('[data-quantity-change="1"]').dataset.cartChange = "1";
          controls.querySelectorAll("[data-quantity-change]").forEach((button) => {
            delete button.dataset.quantityChange;
          });
          line.append(description, controls, itemPrice);
          cartLines.append(line);
        });
      }
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cartCount.textContent = String(itemCount);
      cartButton.setAttribute("aria-label", `Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`);
      cartTotal.textContent = `₹${total.toLocaleString("en-IN")}`;
      placeOrder.disabled = cart.length === 0;
      cartLines.querySelectorAll('[data-cart-change="1"]').forEach((button) => {
        button.disabled = itemCount >= maxOrderItems;
      });
    };
    const cartButton = document.querySelector("#cart-button");
    const placeOrder = document.querySelector("#place-order");
    renderCart();
    if (invalidSavedCart || exceededSavedOrder) {
      saveCart();
      showToast(exceededSavedOrder
        ? `Saved order reduced to the ${maxOrderItems}-item limit.`
        : "An invalid saved order was cleared. Please add your items again.");
    }
    if (page === "canteen") renderYaranaMenu();

    document.querySelectorAll(".add-order").forEach((button) => {
      if (button.parentElement.querySelector(".quantity-control")) return;
      button.before(createQuantityControl(button.dataset.item));
      const controls = button.parentElement.querySelector(".quantity-control");
      if (button.parentElement.classList.contains("menu-card-bottom")) controls.classList.add("compact-quantity-control");
    });

    document.addEventListener("click", (event) => {
      const changeButton = event.target.closest("[data-quantity-change]");
      if (!changeButton) return;
      const value = changeButton.parentElement.querySelector(".quantity-value");
      const nextValue = Math.max(1, Math.min(maxOrderItems, Number(value.value || value.textContent) + Number(changeButton.dataset.quantityChange)));
      value.value = String(nextValue);
      value.textContent = String(nextValue);
      changeButton.parentElement.setAttribute("aria-label", `${changeButton.parentElement.dataset.quantityLabel} quantity ${nextValue}`);
    });

    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(".add-order");
      if (!addButton) return;
      const selectedQuantity = Number(addButton.parentElement.querySelector(".quantity-value").value
        || addButton.parentElement.querySelector(".quantity-value").textContent);
      const existing = cart.find((item) => item.name === addButton.dataset.item);
      const currentItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      const remainingItems = maxOrderItems - currentItemCount;
      if (selectedQuantity > remainingItems) {
        showToast(remainingItems > 0
          ? `You can add ${remainingItems} more item${remainingItems === 1 ? "" : "s"} to this order.`
          : `Orders are limited to ${maxOrderItems} items total.`);
        return;
      }
      const quantity = selectedQuantity;
      if (existing) existing.quantity += quantity;
      else cart.push({ name: addButton.dataset.item, price: Number(addButton.dataset.price), quantity });
      saveCart();
      renderCart();
      showToast(`${quantity} × ${addButton.dataset.item} added to your order.`);
    });

    cartLines.addEventListener("click", (event) => {
      const changeButton = event.target.closest("[data-cart-change]");
      if (!changeButton) return;
      const itemName = changeButton.closest(".cart-line").dataset.item;
      const item = cart.find((entry) => entry.name === itemName);
      if (!item) return;
      if (Number(changeButton.dataset.cartChange) > 0
        && cart.reduce((sum, entry) => sum + entry.quantity, 0) >= maxOrderItems) {
        showToast(`Orders are limited to ${maxOrderItems} items total.`);
        return;
      }
      item.quantity += Number(changeButton.dataset.cartChange);
      const removed = item.quantity <= 0;
      if (removed) cart = cart.filter((entry) => entry !== item);
      saveCart();
      renderCart();
      const focusLine = [...cartLines.querySelectorAll(".cart-line")].find((line) => line.dataset.item === itemName);
      (focusLine?.querySelector(`[data-cart-change="${removed ? "-1" : changeButton.dataset.cartChange}"]`) || cartButton).focus();
    });

    cartButton.addEventListener("click", () => orderDialog.showModal());
    document.querySelector("#order-close").addEventListener("click", () => orderDialog.close());
    orderDialog.addEventListener("click", (event) => {
      if (event.target === orderDialog) orderDialog.close();
    });
    orderDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      orderDialog.close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && orderDialog.open) {
        event.preventDefault();
        orderDialog.close();
      }
    }, true);
    document.querySelector("#place-order").addEventListener("click", () => {
      if (cart.length === 0) {
        showToast("Add a canteen favorite before placing a demo order.");
        return;
      }
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("en-IN");
      const currentEmail = sessionStorage.getItem("campusEmail") || localStorage.getItem("campusEmail");
      if (!currentEmail) {
        showToast("Your demo account is missing its college email. Sign in again before ordering.");
        return;
      }
      try {
        const orders = readCampusOrders();
        const orderItems = cart.map((item) => ({ ...item }));
        const lastToken = orders.reduce((maximum, order) => {
          const number = Number(String(order.token || "").replace(/\D/g, ""));
          return Number.isFinite(number) ? Math.max(maximum, number) : maximum;
        }, 1000);
        const order = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          token: `DTC-${lastToken + 1}`,
          studentEmail: currentEmail,
          studentName: sessionStorage.getItem("campusName") || localStorage.getItem("campusName") || "Student",
          items: orderItems,
          total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          status: "pending",
          estimatedMinutes: null,
          readyAt: null,
          createdAt: Date.now()
        };
        saveCampusOrders([...orders, order]);
        cart = [];
        saveCart();
        renderCart();
        orderDialog.close();
        showToast(`Order sent to canteen: ${order.token} · ₹${total}.`);
      } catch (error) {
        console.error("The demo canteen order could not be saved.", error);
        showToast("The order could not be saved on this device. Check browser storage and try again.");
      }
    });
    }

    const recentOrder = document.querySelector("#recent-order");
    const orderHistory = document.querySelector("#order-history");
    const orderTabs = [...document.querySelectorAll("[data-order-tab]")];
    if (orderTabs.length) {
      const selectOrderTab = (selectedTab) => {
        orderTabs.forEach((tab) => {
          const isSelected = tab === selectedTab;
          tab.classList.toggle("is-active", isSelected);
          tab.setAttribute("aria-selected", String(isSelected));
          tab.tabIndex = isSelected ? 0 : -1;
          document.querySelector(`#${tab.getAttribute("aria-controls")}`).hidden = !isSelected;
        });
      };
      orderTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => selectOrderTab(tab));
        tab.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextTab = orderTabs[(index + direction + orderTabs.length) % orderTabs.length];
          selectOrderTab(nextTab);
          nextTab.focus();
        });
      });
    }
    if (recentOrder && orderHistory) {
      const renderOrderHistory = () => {
        try {
          const email = sessionStorage.getItem("campusEmail") || localStorage.getItem("campusEmail");
          const orders = readCampusOrders()
            .filter((order) => order.studentEmail === email)
            .sort((first, second) => second.createdAt - first.createdAt);
          recentOrder.replaceChildren();
          orderHistory.replaceChildren();

          if (orders.length === 0) {
            const empty = document.createElement("p");
            empty.className = "student-orders-empty";
            empty.textContent = "Your recent order and order history will appear here.";
            recentOrder.append(empty);
            const historyEmpty = empty.cloneNode(true);
            historyEmpty.textContent = "No orders have been placed yet.";
            orderHistory.append(historyEmpty);
            return;
          }

          const statusLabel = (status) => status === "pending" ? "Waiting for staff"
            : status === "preparing" ? "Preparing"
              : status === "ready" ? "Ready for pickup"
                : status === "picked_up" ? "Picked up" : "Order update";
          const formatOrderDate = (createdAt) => Number.isFinite(createdAt)
            ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(createdAt))
            : "Date unavailable";
          const formatOrderItems = (items) => Array.isArray(items)
            ? items.map((item) => `${item.quantity} × ${item.name}`).join(" · ")
            : "Order item details unavailable";
          const createOrderCard = (order, recent = false) => {
            const card = document.createElement("article");
            card.className = "student-order-card";
            const heading = document.createElement("div");
            heading.className = "student-order-heading";
            const token = document.createElement("strong");
            token.className = "student-order-token";
            token.textContent = order.token || "Token unavailable";
            const status = document.createElement("span");
            status.className = `order-status order-status-${order.status || "pending"}`;
            status.textContent = statusLabel(order.status);
            heading.append(token, status);
            const items = document.createElement("p");
            items.className = "student-order-items";
            items.textContent = formatOrderItems(order.items);
            const details = document.createElement("p");
            details.className = "order-history-details";
            const total = Number.isFinite(order.total) ? order.total : 0;
            details.textContent = `${formatOrderDate(order.createdAt)} · Total ₹${total.toLocaleString("en-IN")}`;
            card.append(heading, items, details);
            if (!recent) {
              const payment = document.createElement("div");
              payment.className = "order-payment-details";
              const paymentLabel = document.createElement("span");
              paymentLabel.textContent = `Payment history · ${formatOrderDate(order.createdAt)}`;
              const paymentStatus = document.createElement("strong");
              paymentStatus.textContent = `₹${total.toLocaleString("en-IN")} · Not charged (Demo)`;
              payment.append(paymentLabel, paymentStatus);
              card.append(payment);
            }
            if (recent && order.status === "ready") {
              const pickup = document.createElement("p");
              pickup.className = "student-order-countdown";
              pickup.textContent = "Your order is ready. Show this token at the canteen.";
              card.append(pickup);
            } else if (recent && order.status === "preparing" && Number.isFinite(order.readyAt)) {
              const pickup = document.createElement("p");
              pickup.className = "student-order-countdown";
              const remainingSeconds = Math.max(0, Math.ceil((order.readyAt - Date.now()) / 1000));
              pickup.textContent = remainingSeconds > 0
                ? `Estimated pickup in ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`
                : "Pickup time reached. Show this token at the canteen.";
              card.append(pickup);
            }
            return card;
          };

          recentOrder.append(createOrderCard(orders[0], true));
          orders.forEach((order) => orderHistory.append(createOrderCard(order)));
        } catch (error) {
          console.error("The order and payment history could not be loaded.", error);
          recentOrder.textContent = "Recent order details could not be loaded from this browser.";
          orderHistory.textContent = "Order history could not be loaded from this browser.";
        }
      };
      renderOrderHistory();
      window.addEventListener("storage", (event) => {
        if (event.key === "campusOrders") renderOrderHistory();
      });
    }

    const reportStorageKey = "campusLostFoundReports";
    const readReports = () => {
      const saved = localStorage.getItem(reportStorageKey);
      if (!saved) return [];
      const reports = JSON.parse(saved);
      if (!Array.isArray(reports) || reports.some((report) =>
        !report || typeof report.description !== "string" || typeof report.location !== "string"
        || typeof report.email !== "string" || !Number.isFinite(report.createdAt)
      )) {
        throw new TypeError("Saved lost-and-found reports have an invalid format.");
      }
      return reports;
    };
    const createReportCard = (report) => {
      const card = document.createElement("article");
      card.className = "lost-card";
      const icon = document.createElement("span");
      icon.className = "lost-emoji";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "📍";
      const details = document.createElement("div");
      const status = document.createElement("span");
      status.className = "lost-status";
      status.textContent = "REPORTED · DEMO";
      const title = document.createElement("h3");
      title.textContent = report.description;
      const place = document.createElement("p");
      place.textContent = report.location;
      details.append(status, title, place);
      card.append(icon, details);
      return card;
    };
    const myUploadsList = document.querySelector("#my-uploads-list");
    const renderMyUploads = () => {
      if (!myUploadsList) return;
      try {
        const email = sessionStorage.getItem("campusEmail") || localStorage.getItem("campusEmail");
        const reports = readReports()
          .filter((report) => report.email === email)
          .sort((first, second) => second.createdAt - first.createdAt);
        myUploadsList.replaceChildren();
        if (reports.length === 0) {
          const empty = document.createElement("p");
          empty.className = "student-orders-empty";
          empty.textContent = "You haven't reported any items yet.";
          myUploadsList.append(empty);
          return;
        }
        reports.forEach((report) => myUploadsList.append(createReportCard(report)));
      } catch (error) {
        console.error("The student's lost-and-found reports could not be loaded.", error);
        myUploadsList.textContent = "Your reports could not be loaded from this browser.";
      }
    };
    const lostItemsList = document.querySelector("#lost-items");
    if (lostItemsList) {
      try {
        readReports().forEach((report) => lostItemsList.prepend(createReportCard(report)));
      } catch (error) {
        console.error("Saved lost-and-found reports could not be restored.", error);
        if (myUploadsList) myUploadsList.textContent = "Your reports could not be loaded from this browser.";
      }
    }
    renderMyUploads();

    document.querySelector("#report-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const reportForm = event.currentTarget;
      if (!reportForm.reportValidity()) return;
      const description = document.querySelector("#report-description").value.trim();
      const location = document.querySelector("#report-location").value.trim();
      if (!description || !location) return;
      const report = {
        description,
        location,
        email: sessionStorage.getItem("campusEmail") || localStorage.getItem("campusEmail") || "",
        createdAt: Date.now()
      };
      try {
        const reports = readReports();
        reports.push(report);
        localStorage.setItem(reportStorageKey, JSON.stringify(reports));
      } catch (error) {
        console.error("The lost-and-found report could not be saved.", error);
        showToast("Your report could not be saved on this device. Check browser storage and try again.");
        return;
      }
      document.querySelector("#lost-items").prepend(createReportCard(report));
      renderMyUploads();
      reportForm.reset();
      reportDialog.close();
      showToast("Your item was added to this demo list.");
    });

  }
}

if (page === "canteen-staff") {
  const name = sessionStorage.getItem("campusName") || localStorage.getItem("campusName") || "Canteen staff";
  const firstName = name.split(/\s+/)[0];
  document.querySelector("#profile-name").textContent = firstName;
  const profileAvatar = document.querySelector("#profile-avatar");
  if (profileAvatar) profileAvatar.textContent = firstName.charAt(0).toUpperCase();
  document.querySelector("#dialog-avatar").textContent = firstName.charAt(0).toUpperCase();
  document.querySelector("#dialog-name").textContent = `${firstName}.`;
  document.querySelector("#dialog-role").textContent = "Canteen staff · Delhi Technical Campus";
  document.querySelector("#dialog-access").textContent = "Canteen staff dashboard";
  document.querySelector("#portal-date").textContent =
    new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const queue = document.querySelector("#staff-orders");
  const queueCount = document.querySelector("#staff-queue-count");
  const dataNote = document.querySelector("#staff-data-note");
  const updateStaffCountdowns = () => {
    queue.querySelectorAll("[data-staff-countdown]").forEach((time) => {
      const readyAt = Number(time.dataset.readyAt);
      if (!Number.isFinite(readyAt)) return;
      const remaining = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
      time.textContent = remaining > 0
        ? `Pickup estimate · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`
        : "Pickup estimate reached";
    });
  };
  const renderStaffOrders = () => {
    try {
      const orders = readCampusOrders().sort((first, second) => first.createdAt - second.createdAt);
      const activeOrders = orders.filter((order) => order.status !== "picked_up");
      queueCount.textContent = `${activeOrders.length} active`;
      queue.replaceChildren();
      if (activeOrders.length === 0) {
        const empty = document.createElement("p");
        empty.className = "staff-queue-empty";
        empty.textContent = "No orders yet. New student orders will show here.";
        queue.append(empty);
        return;
      }

      activeOrders.forEach((order) => {
        const card = document.createElement("article");
        card.className = "staff-order-card";
        const top = document.createElement("div");
        top.className = "staff-order-top";
        const token = document.createElement("strong");
        token.className = "staff-order-token";
        token.textContent = order.token;
        const status = document.createElement("span");
        status.className = `order-status order-status-${order.status}`;
        status.textContent = order.status === "pending" ? "New order"
          : order.status === "preparing" ? "Preparing"
            : order.status === "ready" ? "Ready" : "Order update";
        top.append(token, status);
        const student = document.createElement("p");
        student.className = "staff-order-student";
        student.textContent = `${order.studentName} · ${order.studentEmail}`;
        const items = document.createElement("p");
        items.className = "staff-order-items";
        items.textContent = order.items.map((item) => `${item.quantity} × ${item.name}`).join(" · ");
        const total = document.createElement("p");
        total.className = "staff-order-total";
        total.textContent = `Total · ₹${Number(order.total).toLocaleString("en-IN")}`;
        const created = document.createElement("p");
        created.className = "staff-order-created";
        created.textContent = `Placed ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(order.createdAt)}`;
        card.append(top, student, items, total, created);

        if (order.status === "pending" || order.status === "preparing") {
          const estimateForm = document.createElement("form");
          estimateForm.className = "staff-estimate-form";
          estimateForm.dataset.orderId = order.id;
          const label = document.createElement("label");
          label.textContent = "Pickup time (minutes)";
          const input = document.createElement("input");
          input.type = "number";
          input.min = "1";
          input.max = "120";
          input.step = "1";
          input.required = true;
          input.inputMode = "numeric";
          input.value = order.estimatedMinutes || "";
          input.setAttribute("aria-label", `Pickup time in minutes for ${order.token}`);
          const submit = document.createElement("button");
          submit.type = "submit";
          submit.className = "button button-dark";
          submit.textContent = order.status === "preparing" ? "Update estimate" : "Set pickup time";
          estimateForm.append(label, input, submit);
          card.append(estimateForm);
        }

        if (order.status === "preparing") {
          const time = document.createElement("p");
          time.className = "staff-order-countdown";
          time.dataset.staffCountdown = "";
          time.dataset.readyAt = String(order.readyAt);
          card.append(time);
        }

        if (order.status === "preparing" || order.status === "ready") {
          const readyButton = document.createElement("button");
          readyButton.type = "button";
          readyButton.className = "staff-ready-button";
          readyButton.dataset.orderAction = order.status === "ready" ? "picked_up" : "ready";
          readyButton.dataset.orderId = order.id;
          readyButton.textContent = order.status === "ready" ? "Mark picked up" : "Mark ready for pickup";
          card.append(readyButton);
        }
        queue.append(card);
      });
      updateStaffCountdowns();
    } catch (error) {
      console.error("The canteen order queue could not be loaded.", error);
      queue.textContent = "Order data could not be loaded from this browser.";
      dataNote.textContent = "Order storage could not be read. Check browser storage and reload this page.";
    }
  };

  queue.addEventListener("submit", (event) => {
    const form = event.target.closest(".staff-estimate-form");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector("input");
    const minutes = Number(input.value);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
      input.setCustomValidity("Enter a pickup estimate from 1 to 120 minutes.");
      input.reportValidity();
      input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
      return;
    }
    try {
      const orders = readCampusOrders();
      const order = orders.find((candidate) => candidate.id === form.dataset.orderId);
      if (!order) throw new Error("The selected order is no longer in the queue.");
      order.estimatedMinutes = minutes;
      order.readyAt = Date.now() + minutes * 60 * 1000;
      order.status = "preparing";
      saveCampusOrders(orders);
      renderStaffOrders();
    } catch (error) {
      console.error("The canteen pickup estimate could not be saved.", error);
      dataNote.textContent = "Pickup time was not saved. Check browser storage and try again.";
    }
  });

  queue.addEventListener("click", (event) => {
    const button = event.target.closest("[data-order-action]");
    if (!button) return;
    try {
      const orders = readCampusOrders();
      const order = orders.find((candidate) => candidate.id === button.dataset.orderId);
      if (!order) throw new Error("The selected order is no longer in the queue.");
      order.status = button.dataset.orderAction;
      if (order.status === "picked_up") order.pickedUpAt = Date.now();
      saveCampusOrders(orders);
      renderStaffOrders();
    } catch (error) {
      console.error("The canteen order status could not be updated.", error);
      dataNote.textContent = "Order status was not updated. Check browser storage and try again.";
    }
  });

  renderStaffOrders();
  window.setInterval(updateStaffCountdowns, 1000);
  window.addEventListener("storage", (event) => {
    if (event.key === "campusOrders") renderStaffOrders();
  });
}
