// Navbar scroll effect
window.addEventListener("scroll", function () {
  const nav = document.getElementById("navbar");
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#" || !targetId.startsWith("#")) return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Mobile Menu Toggle
const menuIcon = document.querySelector(".mobile-menu-icon");
const navLinks = document.querySelector(".nav-links");

if (menuIcon && navLinks) {
  menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close menu when clicking a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

// Cart Logic
let cart = [];
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountBadge = document.getElementById("cart-count");
const cartTotalValue = document.getElementById("cart-total-value");

// Toggle Cart Modal
cartBtn.addEventListener("click", () => cartModal.classList.add("active"));
closeCart.addEventListener("click", () => cartModal.classList.remove("active"));
window.addEventListener("click", (e) => {
  if (e.target === cartModal) cartModal.classList.remove("active");
});

// Add to Cart
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-name");
    const price = parseFloat(button.getAttribute("data-price"));
    addItemToCart(name, price);
    // cartModal.classList.add('active'); // Removed so it only shows in the badge
  });
});

function addItemToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.innerText = totalItems;
  if (totalItems > 0) {
    cartCountBadge.classList.add("visible");
  } else {
    cartCountBadge.classList.remove("visible");
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-msg">O carrinho está vazio.</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <span class="price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                        </div>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span class="qty-number">${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    `;
      cartItemsContainer.appendChild(itemElement);
    });
  }
  cartTotalValue.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

window.changeQty = function (index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
};

document.getElementById("standard-checkout").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  alert("Pedido finalizado! Preparemos seu café com carinho.");
  cart = [];
  updateCartUI();
  cartModal.classList.remove("active");
});

// Auth Modal Logic
const authBtn = document.getElementById("auth-btn");
const authModal = document.getElementById("auth-modal");
const closeAuth = document.getElementById("close-auth");
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

authBtn.addEventListener("click", () => authModal.classList.add("active"));
closeAuth.addEventListener("click", () => authModal.classList.remove("active"));

window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.classList.remove("active");
});

showRegister.addEventListener("click", () => {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
});

showLogin.addEventListener("click", () => {
  registerBox.style.display = "none";
  loginBox.style.display = "block";
});

let userPoints = 0;
let orderHistory = [];
let isLoggedIn = false;
let currentUserEmail = "";

// Google Login Handler
window.handleCredentialResponse = (response) => {
  const responsePayload = decodeJwtResponse(response.credential);
  handleLogin(
    responsePayload.name,
    responsePayload.picture,
    responsePayload.email,
  );
};

function decodeJwtResponse(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const name = email.split("@")[0];
  handleLogin(
    name,
    "https://ui-avatars.com/api/?name=" + name + "&background=D4A373&color=fff",
    email,
  );
});

document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  handleLogin(
    name,
    "https://ui-avatars.com/api/?name=" + name + "&background=D4A373&color=fff",
    email,
  );
});

function handleLogin(name, picUrl, email = "") {
  isLoggedIn = true;
  currentUserEmail = email;
  authModal.classList.remove("active");
  authBtn.style.display = "none";
  const userProfile = document.getElementById("user-profile");
  document.getElementById("user-pic").src = picUrl;
  document.getElementById("user-name").innerText = name;
  userProfile.style.display = "flex";

  showNotification(`Bem-vindo, ${name}!`);
  document.getElementById("user-name-rank").innerText = name;

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  if (nomeInput) nomeInput.value = name;
  if (emailInput && email) emailInput.value = email;

  updateLoyaltyUI();
}

// Tab System Logic
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(tabId).classList.add("active");

    if (tabId === "tab-ranking") updateRanking();
  });
});

function loadRanking() {
  const rankingList = document.querySelector(".ranking-list");
  // let html = `
  //               <div class="rank-item top">
  //                   <span class="pos">1º</span>
  //                   <span class="name">Ana Silva</span>
  //                   <span class="pts">1240 pts</span>
  //               </div>
  //               <div class="rank-item top">
  //                   <span class="pos">2º</span>
  //                   <span class="name">Marcos Oliveira</span>
  //                   <span class="pts">980 pts</span>
  //               </div>
  //               <div class="rank-item top">
  //                   <span class="pos">3º</span>
  //                   <span class="name">Carla Santos</span>
  //                   <span class="pts">850 pts</span>
  //               </div>
  //           `;

  if (isLoggedIn) {
    html += `
                    <div class="rank-item user-current">
                        <span class="pos">-</span>
                        <span class="name">${document.getElementById("user-name").innerText} (Você)</span>
                        <span class="pts">${userPoints} pts</span>
                    </div>
                `;
  }
  if (rankingList) rankingList.innerHTML = html;
}

window.showReviewModal = () => {
  if (!isLoggedIn) return alert("Faça login para avaliar!");
  const product = prompt(
    "Qual café você quer avaliar? (ex: Espresso, Cappuccino)",
  );
  if (!product) return;
  const rating = prompt("De 1 a 5 estrelas, qual sua nota?");
  const comment = prompt("Deixe um comentário curto:");

  if (product && rating) submitReview(product, rating, comment);
};

function submitReview(product, rating, comment) {
  userPoints += 5;
  showNotification(`Avaliação enviada! +5 pontos.`);
  updateLoyaltyUI();

  // Marca a missão como concluída visualmente
  const mission = document.getElementById("mission-2");
  if (mission) {
    mission.style.opacity = "0.5";
    mission.style.pointerEvents = "none";
    mission.querySelector(".miss-btn").innerText = "Concluído";
  }
}

window.completeMission = (pts, elementId) => {
  if (!isLoggedIn) {
    alert("Faça login para completar missões!");
    return;
  }
  userPoints += pts;
  showNotification(`Missão concluída! +${pts} pontos.`);
  updateLoyaltyUI();

  const item = document.getElementById(elementId) || event.currentTarget;
  item.style.opacity = "0.5";
  item.style.pointerEvents = "none";
  const btn = item.querySelector(".miss-btn");
  if (btn) btn.innerText = "Concluído";
};

window.redeemPoints = (pts, item) => {
  if (userPoints < pts) {
    alert("Você não tem pontos suficientes!");
    return;
  }
  userPoints -= pts;
  document.getElementById("badge-gift").classList.remove("locked");
  showNotification(`Prêmio resgatado: ${item}!`);
  updateLoyaltyUI();
};

// Abre Dashboard ao clicar no perfil
document.getElementById("user-profile").addEventListener("click", (e) => {
  if (e.target.id === "logout-btn" || e.target.closest("#logout-btn")) return;

  loginBox.style.display = "none";
  registerBox.style.display = "none";
  document.getElementById("dashboard-box").style.display = "block";
  authModal.classList.add("active");
});

function updateLoyaltyUI() {
  document.getElementById("user-points").innerText = userPoints;
  document.getElementById("dash-points").innerText = `${userPoints} Pontos`;
  document.getElementById("user-pts-rank").innerText = `${userPoints} pts`;

  // Lógica de Níveis
  let tier = "Bronze";
  let color = "#CD7F32";
  if (userPoints > 500) {
    tier = "Ouro";
    color = "#FFD700";
    document.getElementById("badge-gold").classList.remove("locked");
  } else if (userPoints > 200) {
    tier = "Prata";
    color = "#C0C0C0";
  }

  const tierEl = document.getElementById("user-tier");
  if (tierEl) {
    tierEl.innerText = tier;
    tierEl.style.background = color;
  }

  // Medalhas Automáticas
  if (orderHistory.length > 0)
    document.getElementById("badge-first").classList.remove("locked");
  if (userPoints >= 100)
    document.getElementById("badge-100").classList.remove("locked");

  const progress = userPoints % 100;
  document.getElementById("points-progress").style.width = `${progress}%`;

  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("order-history-list");
  if (orderHistory.length === 0) return;

  list.innerHTML = orderHistory
    .map(
      (order) => `
                <div class="history-item">
                    <div class="hist-info">
                        <strong>Pedido #${order.id}</strong>
                        <span>${order.date}</span>
                    </div>
                    <span class="hist-total">R$ ${order.total.toFixed(2).replace(".", ",")}</span>
                </div>
            `,
    )
    .join("");
}

document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  isLoggedIn = false;
  currentUserEmail = "";
  document.getElementById("user-profile").style.display = "none";
  authBtn.style.display = "flex";

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  if (nomeInput) nomeInput.value = "";
  if (emailInput) emailInput.value = "";

  showNotification("Você saiu da conta.");
});

// Modifica o checkout para salvar histórico e pontos
const originalCheckout = document.getElementById("standard-checkout");
const newCheckout = originalCheckout.cloneNode(true);
originalCheckout.parentNode.replaceChild(newCheckout, originalCheckout);

newCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  if (!isLoggedIn) {
    alert("Você precisa estar logado para finalizar o pedido!");
    cartModal.classList.remove("active");
    registerBox.style.display = "none";
    document.getElementById("dashboard-box").style.display = "none";
    loginBox.style.display = "block";
    authModal.classList.add("active");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const pointsEarned = Math.floor(total);
  userPoints += pointsEarned;

  const newOrder = {
    id: Math.floor(Math.random() * 9000) + 1000,
    date: new Date().toLocaleDateString("pt-BR"),
    total: total,
    points: pointsEarned,
  };

  orderHistory.unshift(newOrder);
  updateLoyaltyUI();
  showNotification(`Você ganhou ${pointsEarned} pontos!`);

  alert("Pedido finalizado! Preparemos seu café com carinho.");
  cart = [];
  updateCartUI();
  cartModal.classList.remove("active");
});

function showNotification(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Formulário de Contato API
const contatoForm = document.getElementById("contato-form");
if (contatoForm) {
  contatoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btn.disabled = true;

    fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        showNotification("Mensagem enviada com sucesso!");
        form.reset();

        if (isLoggedIn) {
          const nomeInput = document.getElementById("nome");
          const emailInput = document.getElementById("email");
          const userName = document.getElementById("user-name").innerText;
          if (nomeInput) nomeInput.value = userName;
          if (emailInput && currentUserEmail)
            emailInput.value = currentUserEmail;
        }
      })
      .catch((error) => {
        showNotification("Erro na conexão. Tente novamente.");
        console.error(error);
      })
      .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
  });
}

// RANKING PONTOS 
/* =====================================================
   RANKING GLOBAL COM LOCALSTORAGE (CÓDIGO ÚNICO)
===================================================== */

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function saveOrUpdateCurrentUser() {
  if (!isLoggedIn || !currentUserEmail) return;

  let users = getUsers();
  const index = users.findIndex(u => u.email === currentUserEmail);

  const userData = {
    name: document.getElementById("user-name").innerText,
    email: currentUserEmail,
    points: userPoints
  };

  if (index !== -1) {
    users[index] = userData;
  } else {
    users.push(userData);
  }

  saveUsers(users);
}

function updateRanking() {
  const rankingList = document.querySelector(".ranking-list");
  if (!rankingList) return;

  let users = getUsers();

  if (users.length === 0) {
    rankingList.innerHTML = "<p>Nenhum usuário cadastrado ainda.</p>";
    return;
  }

  users.sort((a, b) => b.points - a.points);

  rankingList.innerHTML = "";

  users.forEach((user, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");

    if (index < 3) div.classList.add("top");

    if (user.email === currentUserEmail) {
      div.classList.add("user-current");
    }

    div.innerHTML = `
      <span class="pos">${index + 1}º</span>
      <span class="name">${user.name}</span>
      <span class="pts">${user.points || 0} pts</span>
    `;

    rankingList.appendChild(div);
  });
}