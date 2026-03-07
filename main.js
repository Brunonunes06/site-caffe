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

// Checkout logic moved to the bottom to handle loyalty integration

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

// Carrega dados iniciais do localStorage para garantir persistência básica
let userPoints = parseInt(localStorage.getItem("userPoints")) || 0;
let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
let isLoggedIn = false;
let currentUserEmail = "";

// Google Login Handler
window.handleCredentialResponse = (response) => {
  console.log("Resposta do Google recebida...");
  try {
    const responsePayload = decodeJwtResponse(response.credential);
    console.log("Login Google bem-sucedido para:", responsePayload.email);
    handleLogin(
      responsePayload.name,
      responsePayload.picture,
      responsePayload.email,
    );
  } catch (error) {
    console.error("Erro ao processar resposta do Google:", error);
    alert("Erro ao processar o login com o Google. Verifique o console do navegador.");
  }
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

function handleLogin(name, picUrl, email = "", isAutoLogin = false) {
  isLoggedIn = true;
  currentUserEmail = email;
  
  localStorage.setItem("loggedInUser", JSON.stringify({ name, picUrl, email }));

  if (isAutoLogin && window.db && email) {
    window.db.collection("ranking").doc(email).get().then(doc => {
      if (doc.exists && doc.data().points) {
        userPoints = doc.data().points;
        updateLoyaltyUI();
      }
    });
  }

  authModal.classList.remove("active");
  authBtn.style.display = "none";
  const userProfile = document.getElementById("user-profile");
  document.getElementById("user-pic").src = picUrl;
  document.getElementById("user-name").innerText = name;
  userProfile.style.display = "flex";

  if (!isAutoLogin) {
    showNotification(`Bem-vindo, ${name}!`);
  }
  document.getElementById("user-name-rank").innerText = name;

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  if (nomeInput) nomeInput.value = name;
  if (emailInput && email) emailInput.value = email;

  updateLoyaltyUI();
  saveOrUpdateCurrentUser();
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

    if (tabId === "tab-ranking") initMultiplayerRanking();
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

const reviewModal = document.getElementById("review-modal");
const closeReview = document.getElementById("close-review");
const starRating = document.getElementById("star-rating");
const stars = starRating ? starRating.querySelectorAll("i") : [];
const reviewScoreInput = document.getElementById("review-score");

window.showReviewModal = () => {
  if (!isLoggedIn) return alert("Faça login para avaliar!");
  
  if (reviewModal) {
    reviewModal.classList.add("active");
    // Reset stars
    stars.forEach(s => s.classList.remove("active"));
    if (reviewScoreInput) reviewScoreInput.value = "";
    document.getElementById("review-form").reset();
  }
};

if (closeReview) {
  closeReview.addEventListener("click", () => reviewModal.classList.remove("active"));
}
window.addEventListener("click", (e) => {
  if (e.target === reviewModal) reviewModal.classList.remove("active");
});

// Star Rating Interaction
if (stars.length > 0) {
  stars.forEach((star) => {
    star.addEventListener("mouseover", function() {
      const rating = this.getAttribute("data-rating");
      stars.forEach(s => {
        if (s.getAttribute("data-rating") <= rating) {
          s.classList.add("hover");
        } else {
          s.classList.remove("hover");
        }
      });
    });

    star.addEventListener("mouseout", function() {
      stars.forEach(s => s.classList.remove("hover"));
    });

    star.addEventListener("click", function() {
      const rating = this.getAttribute("data-rating");
      if (reviewScoreInput) reviewScoreInput.value = rating;
      stars.forEach(s => {
        if (s.getAttribute("data-rating") <= rating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });
}

const reviewForm = document.getElementById("review-form");
if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const product = document.getElementById("review-product").value;
    const rating = reviewScoreInput.value;
    const comment = document.getElementById("review-comment").value;

    if (!rating) {
      alert("Por favor, dê uma nota de 1 a 5 estrelas selecionando-as acima.");
      return;
    }

    submitReview(product, rating, comment);
    reviewModal.classList.remove("active");
  });
}

function submitReview(product, rating, comment) {
  userPoints = Number(userPoints) + 5;
  showNotification(`Avaliação de ${rating} estrelas para ${product} enviada! +5 pontos.`);
  updateLoyaltyUI();
  saveOrUpdateCurrentUser();

  // Marca a missão como concluída visualmente
  const mission = document.getElementById("mission-2");
  if (mission) {
    mission.style.opacity = "0.5";
    mission.style.pointerEvents = "none";
    const missBtn = mission.querySelector(".miss-btn");
    if (missBtn) missBtn.innerText = "Concluído";
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
  saveOrUpdateCurrentUser();

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
  saveOrUpdateCurrentUser();
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
  
  // Persistência e Sincronização
  localStorage.setItem("userPoints", userPoints);
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  saveOrUpdateCurrentUser();

  // Se o Firebase não estiver ativo, força uma atualização local do ranking para o usuário ver
  if (!window.db) {
    const rankingList = document.querySelector(".ranking-list");
    if (rankingList) {
      // Se não houver db, renderiza os competidores offline + usuário atual
      renderOfflineRanking(rankingList);
    }
  }
}

function renderOfflineRanking(container) {
  container.innerHTML = `
    <div class="rank-item rank-header-row">
      <div class="rank-info">
        <span class="pos">Pos</span>
        <span class="name">Nome</span>
      </div>
      <span class="pts">Pontos</span>
    </div>
  `;

  const currUser = {
    name: document.getElementById("user-name")?.innerText || "Você",
    email: currentUserEmail || "local",
    points: userPoints
  };

  let allUsers = [...OFFLINE_COMPETITORS, currUser];
  
  // Remove duplicatas por email
  const seen = new Set();
  allUsers = allUsers.filter(u => {
    const key = u.email || u.name;
    const isDup = seen.has(key);
    seen.add(key);
    return !isDup;
  });

  allUsers.sort((a, b) => b.points - a.points);
  const top10 = allUsers.slice(0, 10);

  top10.forEach((user, index) => renderRankItem(user, index, container));

  // Verifica se o usuário atual ficou fora do top 10
  const isUserInTop10 = top10.some(u => (u.email && u.email === currentUserEmail) || (u.name === currUser.name));
  if (isLoggedIn && !isUserInTop10) {
    const divider = document.createElement("div");
    divider.className = "rank-divider";
    divider.innerText = "...";
    container.appendChild(divider);
    renderRankItem(currUser, "?", container);
  }
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
  userPoints = 0;
  orderHistory = [];
  localStorage.removeItem("loggedInUser");
  
  document.getElementById("user-profile").style.display = "none";
  authBtn.style.display = "flex";

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  if (nomeInput) nomeInput.value = "";
  if (emailInput) emailInput.value = "";

  updateLoyaltyUI();
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
  userPoints = Number(userPoints) + pointsEarned;

  const newOrder = {
    id: Math.floor(Math.random() * 9000) + 1000,
    date: new Date().toLocaleDateString("pt-BR"),
    total: total,
    points: pointsEarned,
  };

  orderHistory.unshift(newOrder);
  
  // LIMPAR CARRINHO LOGO - ANTES DO ALERT
  cart = [];
  updateCartUI();
  cartModal.classList.remove("active");

  updateLoyaltyUI();
  saveOrUpdateCurrentUser();
  showNotification(`Você ganhou ${pointsEarned} pontos!`);

  setTimeout(() => {
    alert("Pedido finalizado! Preparemos seu café com carinho.");
  }, 100);
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
   RANKING GLOBAL MULTIPLAYER COM FIREBASE
===================================================== */

const OFFLINE_COMPETITORS = [
  { name: "João Silva", points: 1250, email: "joao@exemplo.com" },
  { name: "Maria Santos", points: 1080, email: "maria@exemplo.com" },
  { name: "Pedro Oliveira", points: 950, email: "pedro@exemplo.com" },
  { name: "Ana Beatriz", points: 820, email: "ana@exemplo.com" },
];

// IMPORTANTE: Esta é uma configuração de exemplo. 
// Para produção, o usuário deve usar suas próprias chaves do console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyB-EXAMPLE-KEY",
  authDomain: "site-caffe-ranking.firebaseapp.com",
  projectId: "site-caffe-ranking",
  storageBucket: "site-caffe-ranking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializa Firebase (Compat Mode para Vanilla JS)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
} else {
  console.warn("Firebase não carregado. O ranking multiplayer pode não funcionar localmente.");
  window.db = null;
}

function saveOrUpdateCurrentUser() {
  if (!isLoggedIn || !currentUserEmail || !window.db) return;

  const userData = {
    name: document.getElementById("user-name").innerText,
    email: currentUserEmail,
    points: userPoints,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Salva no Firestore
  window.db.collection("ranking").doc(currentUserEmail).set(userData, { merge: true })
    .then(() => console.log("Ranking atualizado globalmente!"))
    .catch(err => console.error("Erro ao salvar no Firebase:", err));
}

// Ouvinte em Tempo Real do Firebase
function initMultiplayerRanking() {
  const rankingList = document.querySelector(".ranking-list");
  if (!rankingList || !window.db) {
    if (rankingList) rankingList.innerHTML = "<p>Firebase não configurado ou indisponível.</p>";
    return;
  }

  // Evita múltiplos listeners
  if (window.rankingListener) window.rankingListener();

  window.rankingListener = window.db.collection("ranking")
    .orderBy("points", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      rankingList.innerHTML = `
        <div class="rank-item rank-header-row">
          <div class="rank-info">
            <span class="pos">Pos</span>
            <span class="name">Nome</span>
          </div>
          <span class="pts">Pontos</span>
        </div>
      `;

      const firebaseUsers = [];
      snapshot.forEach(doc => firebaseUsers.push(doc.data()));

      // Mescla com competidores offline e ordena
      let allUsers = [...firebaseUsers, ...OFFLINE_COMPETITORS];
      
      // Remove duplicatas se o usuário real for um dos mocks (por email)
      const seen = new Set();
      allUsers = allUsers.filter(u => {
        const duplicate = seen.has(u.email);
        seen.add(u.email);
        return !duplicate;
      });

      allUsers.sort((a, b) => b.points - a.points);
      const top10 = allUsers.slice(0, 10);

      // Renderiza os Top 10
      top10.forEach((user, index) => {
        renderRankItem(user, index, rankingList);
      });

      // Se o usuário atual não estiver no top 10 do snapshot, buscamos a posição dele
      if (isLoggedIn && currentUserEmail) {
        const isUserInTop10 = top10.some(u => u.email === currentUserEmail);
        if (!isUserInTop10) {
          window.db.collection("ranking").doc(currentUserEmail).get().then(doc => {
            if (doc.exists) {
              // Como o Firestore não dá a posição exata sem ler tudo, 
              // apenas mostramos ele no final se logado e fora do top 10
              const divider = document.createElement("div");
              divider.className = "rank-divider";
              divider.innerText = "...";
              rankingList.appendChild(divider);
              renderRankItem(doc.data(), "?", rankingList);
            }
          });
        }
      }
    });
}

// Função updateRanking foi substituída por initMultiplayerRanking com onSnapshot

function renderRankItem(user, index, container) {
  const div = document.createElement("div");
  div.classList.add("rank-item");

  let displayPos = index === "?" ? index : (index + 1) + "º";

  // Destaque para o Top 3
  if (index === 0) div.classList.add("top-1");
  else if (index === 1) div.classList.add("top-2");
  else if (index === 2) div.classList.add("top-3");

  // Destaque para o usuário atual
  if (isLoggedIn && user.email === currentUserEmail) {
    div.classList.add("user-current");
  }

  // Ícones especiais para o Top 3
  let medal = "";
  if (index === 0) medal = "🥇 ";
  else if (index === 1) medal = "🥈 ";
  else if (index === 2) medal = "🥉 ";

  div.innerHTML = `
    <div class="rank-info">
      <span class="pos">${medal}${displayPos}</span>
      <span class="name">${user.name}${isLoggedIn && user.email === currentUserEmail ? " (Você)" : ""}</span>
    </div>
    <span class="pts point-pulse">${user.points || 0} pts</span>
  `;

  container.appendChild(div);
}

// Sincronização entre abas (Multiplayer Local Fallback)
window.addEventListener('storage', (e) => {
  if (e.key === "userPoints") {
    userPoints = parseInt(e.newValue) || 0;
    updateLoyaltyUI();
  }
  if (e.key === "orderHistory") {
    orderHistory = JSON.parse(e.newValue) || [];
    updateLoyaltyUI();
  }
  if (e.key === "loggedInUser" && !e.newValue) {
    // Logout em outra aba
    location.reload();
  }
});

// Auto-login on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem("loggedInUser");
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      handleLogin(user.name, user.picUrl, user.email, true);
    } catch (e) {
      console.error("Erro ao restaurar sessão:", e);
    }
  }
});

/* =====================================================
   LÓGICA DO CARROSSEL
===================================================== */
let currentSlideIndex = 0;

function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    // Se não existir o carrossel na página, sair da função
    if (!track) return; 

    // Calcula a nova posição
    currentSlideIndex += direction;

    // Lógica de loop (Se passar da última foto, volta pra primeira)
    if (currentSlideIndex >= totalItems) {
        currentSlideIndex = 0;
    } 
    // Se voltar antes da primeira foto, vai pra última
    else if (currentSlideIndex < 0) {
        currentSlideIndex = totalItems - 1;
    }

    // Move a "esteira" baseando-se na largura real do item
    const itemWidth = items[0].getBoundingClientRect().width;
    const movePx = -(currentSlideIndex * itemWidth);
    track.style.transform = `translateX(${movePx}px)`;
}

// Redimensionar carrossel ao mudar o tamanho da janela
window.addEventListener('resize', () => {
    const track = document.getElementById('carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    if (!track || items.length === 0) return;
    const itemWidth = items[0].getBoundingClientRect().width;
    track.style.transform = `translateX(${-(currentSlideIndex * itemWidth)}px)`;
});

// Opcional: Fazer o carrossel passar sozinho a cada 5 segundos
// setInterval(() => moveCarousel(1), 5000); 
