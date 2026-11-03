const STORAGE_KEY = "entregaya-app-v2";
const LEGACY_STORAGE_KEY = "entregaya-demo-v1";
const OLD_SAMPLE_ORDER_IDS = new Set(["EY-1042", "EY-1038", "EY-1044", "EY-1045", "EY-1031"]);
const DELIVERY_FEE = 5.9;
const API_BASE = window.ENTREGAYA_API_BASE || "http://localhost:8080/api";
let apiAvailable = false;
const CATEGORIES = ["Todos", "Comida", "Ropa", "Accesorios", "Hogar"];
const ROLE_DETAILS = {
  cliente: { name: "Cliente", initials: "CL", label: "Cliente" },
  administrador: { name: "Administrador", initials: "AD", label: "Administrador" },
  repartidor: { name: "Repartidor", initials: "RP", label: "Repartidor" },
};
const NAV_ITEMS = {
  cliente: [
    { id: "catalog", label: "Descubrir", icon: "⌕" },
    { id: "orders", label: "Mis pedidos", icon: "▤" },
    { id: "profile", label: "Mi perfil", icon: "◉" },
  ],
  administrador: [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "admin-orders", label: "Pedidos", icon: "▤" },
    { id: "products", label: "Productos", icon: "◇" },
    { id: "couriers", label: "Repartidores", icon: "♙" },
    { id: "incidents", label: "Incidencias", icon: "⚑" },
  ],
  repartidor: [
    { id: "route", label: "Mi hoja de ruta", icon: "⌖" },
    { id: "driver-incidents", label: "Reportar incidencia", icon: "⚑" },
  ],
};
const ROLE_HOME = { cliente: "catalog", administrador: "dashboard", repartidor: "route" };
const VIEW_PATHS = {
  catalog: "inicio",
  orders: "pedidos",
  profile: "perfil",
  dashboard: "resumen",
  "admin-orders": "pedidos",
  products: "productos",
  couriers: "repartidores",
  incidents: "incidencias",
  route: "ruta",
  "driver-incidents": "incidencias",
};
const CUSTOMER_ORDER_FILTERS = [
  { id: "todos", label: "Todos", matches: () => true },
  { id: "activos", label: "En proceso", matches: (status) => ["pendiente", "asignado", "en ruta"].includes(status) },
  { id: "entregado", label: "Entregados", matches: (status) => status === "entregado" },
  { id: "cancelado", label: "Cancelados", matches: (status) => status === "cancelado" },
];
const ADMIN_ORDER_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "pendiente", label: "Pendientes" },
  { id: "asignado", label: "Asignados" },
  { id: "en ruta", label: "En ruta" },
  { id: "entregado", label: "Entregados" },
  { id: "cancelado", label: "Cancelados" },
];

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Sánguche de chicharrón", category: "Comida", price: 18.5, stock: 14, available: true, emoji: "🥪", color: "#f6e6c9", description: "Pan crocante, camote y salsa criolla", rating: "4.9" },
  { id: "p2", name: "Café pasado", category: "Comida", price: 8, stock: 22, available: true, emoji: "☕", color: "#e9ddd2", description: "Café de origen, recién preparado", rating: "4.8" },
  { id: "p3", name: "Polera clásica", category: "Ropa", price: 49.9, stock: 8, available: true, emoji: "👕", color: "#e3e9f1", description: "Algodón suave, varios colores", rating: "4.7" },
  { id: "p4", name: "Tote bag de lona", category: "Accesorios", price: 25, stock: 12, available: true, emoji: "👜", color: "#e4eadc", description: "Resistente y perfecta para el día a día", rating: "4.8" },
  { id: "p5", name: "Taza Buen Día", category: "Hogar", price: 22, stock: 8, available: true, emoji: "🍵", color: "#eee5ed", description: "Cerámica hecha para tus mañanas", rating: "4.6" },
  { id: "p6", name: "Galletas de avena", category: "Comida", price: 12, stock: 16, available: true, emoji: "🍪", color: "#f1e3d4", description: "Horneadas en casa, 6 unidades", rating: "4.9" },
  { id: "p7", name: "Gorra urbana", category: "Accesorios", price: 32, stock: 7, available: true, emoji: "🧢", color: "#e7e6d8", description: "Liviana, ajustable y para todos los días", rating: "4.7" },
  { id: "p8", name: "Polo de algodón", category: "Ropa", price: 39, stock: 11, available: true, emoji: "👚", color: "#f1e6e3", description: "Básico cómodo de algodón peruano", rating: "4.8" },
  { id: "p9", name: "Empanada de pollo", category: "Comida", price: 7.5, stock: 18, available: true, emoji: "🥟", color: "#f3e1c4", description: "Masa dorada, rellena de pollo sazonado", rating: "4.8" },
  { id: "p10", name: "Jugo de naranja", category: "Comida", price: 9, stock: 15, available: true, emoji: "🍊", color: "#f8e7ce", description: "Naranjas frescas, preparado al momento", rating: "4.7" },
  { id: "p11", name: "Brownie de chocolate", category: "Comida", price: 10, stock: 12, available: true, emoji: "🍫", color: "#eadbd1", description: "Porción suave con chocolate", rating: "4.9" },
  { id: "p12", name: "Jean recto", category: "Ropa", price: 79.9, stock: 9, available: true, emoji: "👖", color: "#e1e8f1", description: "Corte clásico para usar todos los días", rating: "4.7" },
  { id: "p13", name: "Casaca ligera", category: "Ropa", price: 89, stock: 6, available: true, emoji: "🧥", color: "#e5e5e2", description: "Cómoda y fácil de combinar", rating: "4.8" },
  { id: "p14", name: "Medias deportivas", category: "Ropa", price: 18, stock: 20, available: true, emoji: "🧦", color: "#eee8e7", description: "Paquete de dos pares de algodón", rating: "4.6" },
  { id: "p15", name: "Mochila urbana", category: "Accesorios", price: 68, stock: 8, available: true, emoji: "🎒", color: "#e2e8df", description: "Espaciosa para llevar lo esencial", rating: "4.8" },
  { id: "p16", name: "Lentes de sol", category: "Accesorios", price: 45, stock: 10, available: true, emoji: "🕶️", color: "#eee5d8", description: "Diseño ligero para días soleados", rating: "4.7" },
  { id: "p17", name: "Reloj casual", category: "Accesorios", price: 95, stock: 5, available: true, emoji: "⌚", color: "#e8e6ef", description: "Diseño sencillo para combinar", rating: "4.8" },
  { id: "p18", name: "Cojín decorativo", category: "Hogar", price: 35, stock: 9, available: true, emoji: "🛋️", color: "#f0e5e2", description: "Suave y fácil de combinar", rating: "4.7" },
  { id: "p19", name: "Botella reutilizable", category: "Hogar", price: 28, stock: 14, available: true, emoji: "🧴", color: "#e2e9e6", description: "Botella práctica para casa o paseo", rating: "4.8" },
  { id: "p20", name: "Lámpara de mesa", category: "Hogar", price: 59, stock: 4, available: true, emoji: "💡", color: "#f4e9d3", description: "Luz cálida para tu espacio", rating: "4.6" },
];

const DEFAULT_ORDERS = [];
const DEFAULT_COURIERS = [];

let storageLoadIssue = false;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return { products: DEFAULT_PRODUCTS, orders: DEFAULT_ORDERS, incidents: [], cart: {}, addresses: [], profile: { name: "", phone: "", email: "" }, couriers: DEFAULT_COURIERS, accounts: [] };
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.incidents) || !parsed.cart || typeof parsed.cart !== "object" || Array.isArray(parsed.cart) || !Array.isArray(parsed.addresses)) {
      throw new Error("El formato de los datos guardados no es válido.");
    }
    parsed.profile = {
      name: typeof parsed.profile?.name === "string" ? parsed.profile.name : "",
      phone: typeof parsed.profile?.phone === "string" ? parsed.profile.phone : "",
      email: typeof parsed.profile?.email === "string" ? parsed.profile.email : "",
    };
    parsed.couriers = Array.isArray(parsed.couriers) ? parsed.couriers : DEFAULT_COURIERS;
    parsed.accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    parsed.orders = parsed.orders.filter((order) => !OLD_SAMPLE_ORDER_IDS.has(order.id));
    parsed.couriers = parsed.couriers.filter((courier) => !["r1", "r2"].includes(courier.id));
    parsed.products = parsed.products.map((product) => product.category === "Tazas" ? { ...product, category: "Hogar" } : product);
    const savedProductIds = new Set(parsed.products.map((product) => product.id));
    parsed.products = [...DEFAULT_PRODUCTS.filter((product) => !savedProductIds.has(product.id)), ...parsed.products];
    parsed.incidents = parsed.incidents.map((incident) => ({ ...incident, resolved: Boolean(incident.resolved) }));
    return parsed;
  } catch (error) {
    storageLoadIssue = true;
    console.error("No se pudieron cargar los datos de EntregaYa.", error);
    return { products: DEFAULT_PRODUCTS, orders: DEFAULT_ORDERS, incidents: [], cart: {}, addresses: [], profile: { name: "", phone: "", email: "" }, couriers: DEFAULT_COURIERS, accounts: [] };
  }
}

let state = loadState();
const activeAccountEmail = sessionStorage.getItem("entregaya-account-email");
let activeAccount = state.accounts.find((account) => account.email === activeAccountEmail) || null;
let role = activeAccount?.role || "cliente";
let isAuthenticated = Boolean(activeAccount);
if (!activeAccountEmail && sessionStorage.getItem("entregaya-demo-authenticated") === "true") {
  sessionStorage.removeItem("entregaya-demo-authenticated");
  sessionStorage.removeItem("entregaya-demo-role");
}
if (!activeAccount && activeAccountEmail) sessionStorage.removeItem("entregaya-account-email");
if (activeAccount) ROLE_DETAILS[role].name = activeAccount.name;
let authView = "login";
let currentView = ROLE_HOME[role];
let activeCategory = "Todos";
let catalogSearch = "";
let orderSearch = "";
let orderStatusFilter = "todos";
let customerOrderFilter = "todos";
let orderDateFrom = "";
let orderDateTo = "";
let toastTimer;
let simulatedPaymentCode = "";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  apiAvailable = true;
  let payload = {};
  try { payload = await response.json(); } catch (_) { /* empty response */ }
  if (!response.ok) throw new Error(payload.error || `API ${response.status}`);
  return payload;
}

async function synchronizeBackend() {
  let synced = false;
  try {
    const products = await apiRequest("/products");
    const productList = Array.isArray(products) ? products : products?.value;
    if (Array.isArray(productList)) {
      state.products = productList.map((product) => ({
        ...product,
        emoji: product.emoji || DEFAULT_PRODUCTS.find((item) => item.name === product.name)?.emoji || "▣",
        color: product.color || DEFAULT_PRODUCTS.find((item) => item.name === product.name)?.color || "#e4eadc",
        rating: product.rating || DEFAULT_PRODUCTS.find((item) => item.name === product.name)?.rating || "5.0",
      }));
      const syncedCart = {};
      Object.entries(state.cart).forEach(([id, quantity]) => {
        const product = state.products.find((item) => String(item.id) === String(id));
        if (product && Number.isInteger(Number(quantity)) && Number(quantity) > 0) {
          syncedCart[String(product.id)] = Number(quantity);
        }
      });
      state.cart = syncedCart;
      synced = true;
    }
  } catch (error) {
    console.warn("No se pudieron sincronizar los productos.", error);
  }
  try {
    const incidents = await apiRequest("/incidents");
    if (Array.isArray(incidents)) state.incidents = incidents;
  } catch (error) {
    console.warn("No se pudieron sincronizar las incidencias.", error);
  }
  if (activeAccount?.email) {
    try {
      const orders = await apiRequest(activeAccount.role === "cliente"
        ? `/orders?customerEmail=${encodeURIComponent(activeAccount.email)}`
        : "/orders");
      if (Array.isArray(orders)) {
        state.orders = orders.map((order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          subtotal: Number(order.subtotal) || 0,
          deliveryFee: Number(order.deliveryFee) || 0,
          total: Number.isFinite(Number(order.total)) ? Number(order.total) : undefined,
        }));
        synced = true;
      }
    } catch (error) {
      console.warn("No se pudieron sincronizar los pedidos.", error);
    }
  }
  if (activeAccount?.role !== "cliente") {
    try {
      const couriers = await apiRequest("/couriers");
      if (Array.isArray(couriers)) state.couriers = couriers;
    } catch (error) {
      console.warn("No se pudieron sincronizar los repartidores.", error);
    }
  }
  if (synced) {
    apiAvailable = true;
    saveState();
    render();
  } else {
    apiAvailable = false;
    showToast("No se pudo sincronizar el catálogo con el servidor.", true);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("No se pudo guardar el cambio en este navegador. Revisa el espacio disponible.", true);
    console.error("No se pudieron guardar los datos de EntregaYa.", error);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function roleFromEmail(email) {
  const domain = email.trim().toLocaleLowerCase("es").split("@").pop();
  const emailRoles = {
    "gmail.com": "cliente",
    "admin.com": "administrador",
    "repartidor.com": "repartidor",
  };
  return emailRoles[domain] || null;
}

async function hashPassword(password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  return {
    passwordSalt: Array.from(salt, (byte) => byte.toString(16).padStart(2, "0")).join(""),
    passwordHash: Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join(""),
  };
}

async function verifyPassword(password, account) {
  if (!account.passwordSalt || !account.passwordHash) return false;
  const salt = Uint8Array.from(account.passwordSalt.match(/.{2}/g) || [], (byte) => Number.parseInt(byte, 16));
  const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const hash = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return hash === account.passwordHash;
}

function money(value) {
  return `S/ ${Number(value).toFixed(2)}`;
}

function validDocumentNumber(type, value) {
  const documentNumber = String(value || "").replace(/\D/g, "");
  return type === "ruc" ? /^\d{11}$/.test(documentNumber) : /^\d{8}$/.test(documentNumber);
}

function updateBillingDocumentField() {
  const type = document.getElementById("billing-type");
  const label = document.getElementById("billing-document-label");
  const input = document.getElementById("billing-document");
  if (!type || !label || !input) return;
  const isRuc = type.value === "ruc";
  const documentName = isRuc ? "RUC" : "DNI";
  const digits = isRuc ? 11 : 8;
  label.textContent = documentName;
  input.setAttribute("maxlength", String(digits));
  input.setAttribute("minlength", String(digits));
  input.setAttribute("pattern", `[0-9]{${digits}}`);
  input.setAttribute("placeholder", `${digits} dígitos`);
  input.setAttribute("aria-label", `${documentName}, ${digits} dígitos`);
  input.value = input.value.replace(/\D/g, "").slice(0, digits);
}

function validCardNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return /^\d{13,19}$/.test(digits);
}

function showInvoiceConfirmation(order) {
  showModal("¡Pedido confirmado!", `<div class="success-summary"><div class="success-icon" aria-hidden="true">✓</div><h3>Tu compra está en proceso</h3><p>Registramos el pedido <strong>${escapeHTML(order.id)}</strong>. Enviaremos el comprobante a <strong>${escapeHTML(order.billing.email)}</strong>.</p><div class="invoice-details"><span>Comprobante</span><strong>${order.billing.documentType === "ruc" ? "Factura electrónica" : "Boleta electrónica"}</strong><span>Total pagado</span><strong>${money(getOrderTotal(order))}</strong><span>Pago</span><strong>${escapeHTML(order.payment.label)} · ${escapeHTML(order.payment.transactionId)}</strong></div></div>
    <div class="modal-actions invoice-actions"><button class="primary-button" type="button" data-print-invoice="${escapeHTML(order.id)}">Imprimir / guardar PDF</button></div><div class="modal-actions"><button class="secondary-button" type="button" data-after-checkout>Ir a mis pedidos</button></div>`);
}

function getOrderTotal(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsTotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  if (items.length && itemsTotal > 0) return itemsTotal + Number(order.deliveryFee || 0);
  const subtotal = Number(order.subtotal);
  if (Number.isFinite(subtotal) && subtotal > 0) return subtotal + Number(order.deliveryFee || 0);
  if (Number.isFinite(Number(order.total)) && Number(order.total) > 0) return Number(order.total);
  return Number(order.deliveryFee || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function dateInputValue(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function statusClass(status) {
  return `status-${String(status).toLowerCase().replaceAll(" ", "-")}`;
}

function statusPill(status) {
  return `<span class="status-pill ${statusClass(status)}">${escapeHTML(status.charAt(0).toUpperCase() + status.slice(1))}</span>`;
}

function totalCartQuantity() {
  return Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
}

function cartSubtotal() {
  return Object.entries(state.cart).reduce((sum, [id, quantity]) => {
    const product = state.products.find((item) => String(item.id) === String(id));
    return sum + (product ? Number(product.price) * Number(quantity) : 0);
  }, 0);
}

function showToast(message, isError = false) {
  const region = document.getElementById("toast-region");
  region.innerHTML = `<div class="toast"${isError ? ' style="border-color:#f1dedb;color:#a4483d"' : ""}>${escapeHTML(message)}</div>`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { region.innerHTML = ""; }, 3600);
}

function persistAccountChanges() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    showToast("No se pudo guardar la cuenta en este navegador.", true);
    console.error("No se pudo guardar la cuenta de EntregaYa.", error);
    return false;
  }
}

function renderNavigation() {
  document.body.classList.toggle("auth-mode", !isAuthenticated);
  if (!isAuthenticated) {
    document.getElementById("breadcrumb-current").textContent = "Iniciar sesión";
    document.getElementById("main-navigation").innerHTML = "";
    document.getElementById("mobile-navigation").innerHTML = "";
    document.getElementById("open-cart").hidden = true;
    return;
  }
  const items = NAV_ITEMS[role];
  const active = items.some((item) => item.id === currentView) ? currentView : items[0].id;
  document.getElementById("main-navigation").innerHTML = items.map((item) => `
    <button class="nav-link${item.id === active ? " is-active" : ""}" type="button" data-view="${item.id}"${item.id === active ? ' aria-current="page"' : ""}>
      <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
      ${item.id === "incidents" && state.incidents.some((incident) => !incident.resolved) ? `<span class="nav-badge">${state.incidents.filter((incident) => !incident.resolved).length}</span>` : ""}
    </button>`).join("");
  const mobileItems = items;
  document.getElementById("mobile-navigation").innerHTML = mobileItems.map((item) => `
    <button class="mobile-nav-link${item.id === active ? " is-active" : ""}" type="button" data-view="${item.id}"${item.id === active ? ' aria-current="page"' : ""}>
      <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
    </button>`).join("");
  document.getElementById("breadcrumb-current").textContent = items.find((item) => item.id === active)?.label || items[0].label;
  const details = ROLE_DETAILS[role];
  document.getElementById("user-name").textContent = details.name;
  document.getElementById("user-role").textContent = details.label;
  document.getElementById("user-avatar").textContent = details.initials;
  document.getElementById("user-avatar").className = `avatar ${role === "administrador" ? "avatar-admin" : role === "repartidor" ? "avatar-driver" : "avatar-customer"}`;
  document.getElementById("mobile-user-avatar").textContent = details.initials;
  document.getElementById("mobile-account-switcher").style.background = role === "administrador" ? "#e9e9f5" : role === "repartidor" ? "#e3eee6" : "#f2e5d8";
  document.getElementById("mobile-account-switcher").style.color = role === "administrador" ? "#66628d" : role === "repartidor" ? "#3d7250" : "#805b41";
  document.getElementById("cart-count").textContent = totalCartQuantity();
  document.getElementById("open-cart").hidden = role !== "cliente";
}

function render() {
  renderNavigation();
  const main = document.getElementById("app-main");
  if (!isAuthenticated) {
    main.scrollTop = 0;
    renderAuth(main);
    main.focus({ preventScroll: true });
    return;
  }
  const renderers = {
    catalog: renderCatalog,
    orders: renderCustomerOrders,
    profile: renderProfile,
    dashboard: renderDashboard,
    "admin-orders": renderAdminOrders,
    products: renderProducts,
    couriers: renderCouriers,
    incidents: renderIncidents,
    route: renderDriverRoute,
    "driver-incidents": renderDriverIncidents,
  };
  (renderers[currentView] || renderers[NAV_ITEMS[role][0].id])(main);
  main.focus({ preventScroll: true });
}

function renderAuth(main) {
  const signup = authView === "signup";
  const recover = authView === "recover";
  main.innerHTML = `<section class="auth-shell">
    <div class="auth-promo"><a class="auth-brand" href="#" aria-label="Inicio EntregaYa"><img class="institution-logo" src="assets/entregaya-logo.png" alt="EntregaYa Perú" /><span class="brand-name">entrega<span>ya</span></span><span class="brand-country">PERÚ</span></a>
      <span class="hero-tag">LIMA, PERÚ · A TU RITMO</span><h1>Lo que necesitas,<br>llega contigo.</h1><p>Haz tus pedidos, sigue tus entregas y descubre todo lo que EntregaYa tiene para ti.</p><div class="auth-promo-footer"><span>Una sola plataforma para comprar y entregar.</span><span>© 2026 EntregaYa Perú</span></div>
    </div>
    <div class="auth-content"><div class="auth-card">
      <p class="eyebrow">${recover ? "RECUPERA TU ACCESO" : signup ? "ÚNETE A ENTREGAYA" : "QUÉ BUENO TENERTE AQUÍ"}</p>
      <h2>${recover ? "Recupera tu acceso" : signup ? "Crea tu cuenta" : "Bienvenido de vuelta"}</h2>
      <p class="auth-subtitle">${recover ? "Indica tu correo para continuar." : signup ? "Regístrate para explorar nuestros productos y hacer tu primer pedido." : "Inicia sesión con el correo de tu cuenta."}</p>
      ${recover ? `<form id="recover-form" class="auth-form"><div class="form-field"><label for="recover-email">Correo electrónico</label><input id="recover-email" name="email" type="email" autocomplete="email" required placeholder="tu@correo.com"></div><div class="form-field"><label for="recover-password">Nueva contraseña</label><input id="recover-password" name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="Al menos 6 caracteres"></div><button class="primary-button auth-submit" type="submit">Actualizar contraseña</button><button class="text-button auth-link" type="button" data-auth-view="login">Volver a iniciar sesión</button></form>` :
      signup ? `<form id="signup-form" class="auth-form"><div class="form-field"><label for="signup-first-name">Nombres</label><input id="signup-first-name" name="firstName" required minlength="2" autocomplete="given-name" placeholder="Tus nombres"></div><div class="form-field"><label for="signup-last-name">Apellidos</label><input id="signup-last-name" name="lastName" required minlength="2" autocomplete="family-name" placeholder="Tus apellidos"></div><div class="form-field"><label for="signup-email">Correo electrónico</label><input id="signup-email" name="email" type="email" autocomplete="email" required placeholder="tu@gmail.com"></div><div class="form-field"><label for="signup-phone">Teléfono</label><input id="signup-phone" name="phone" class="phone-input" autocomplete="tel" inputmode="numeric" maxlength="9" minlength="9" pattern="[0-9]{9}" required placeholder="987654321"></div><div class="form-field"><label for="signup-password">Contraseña</label><input id="signup-password" name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="Al menos 6 caracteres"></div><p class="auth-account-note">Usa @gmail.com para cliente, @admin.com para administración o @repartidor.com para reparto.</p><button class="primary-button auth-submit" type="submit">Crear cuenta</button></form>` :
      `<form id="login-form" class="auth-form"><div class="form-field"><label for="login-email">Correo electrónico</label><input id="login-email" name="email" type="email" autocomplete="username" required placeholder="tu@gmail.com"></div><div class="form-field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></div><button class="text-button auth-forgot" type="button" data-auth-view="recover">¿Olvidaste tu contraseña?</button><button class="primary-button auth-submit" type="submit">Iniciar sesión <span aria-hidden="true">→</span></button></form>
        `}
      ${!recover && !signup ? `<p class="auth-signup-prompt">¿Aún no tienes una cuenta? <button class="text-button" type="button" data-auth-view="signup">Regístrate</button></p>` : !recover ? `<p class="auth-signup-prompt">¿Ya tienes una cuenta? <button class="text-button" type="button" data-auth-view="login">Inicia sesión</button></p>` : ""}
    </div></div>
  </section>`;
}

function startSession(account) {
  activeAccount = account;
  const savedAccount = state.accounts.find((item) => item.email === account.email);
  if (savedAccount) Object.assign(savedAccount, account);
  else state.accounts.push({ ...account, addresses: account.addresses || [] });
  saveState();
  role = account.role;
  ROLE_DETAILS[role].name = account.name;
  isAuthenticated = true;
  sessionStorage.removeItem("entregaya-demo-authenticated");
  sessionStorage.removeItem("entregaya-demo-role");
  sessionStorage.setItem("entregaya-account-email", account.email);
  currentView = ROLE_HOME[role];
  updateRoleAddress();
  render();
  window.scrollTo(0, 0);
}

function updateRoleAddress() {
  const path = VIEW_PATHS[currentView] || VIEW_PATHS[ROLE_HOME[role]];
  const nextHash = `#/${role}/${path}`;
  if (window.location.hash !== nextHash) window.history.replaceState(null, "", nextHash);
}

function restoreRoleAddress() {
  const [, routeRole, routePath] = window.location.hash.match(/^#\/(cliente|administrador|repartidor)\/([^/]+)$/) || [];
  if (!isAuthenticated) {
    if (window.location.hash !== "#/acceso") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/acceso`);
    }
    return;
  }
  if (!routeRole) return;
  if (routeRole !== role) {
    updateRoleAddress();
    return;
  }
  const routeItem = NAV_ITEMS[role].find((item) => VIEW_PATHS[item.id] === routePath);
  if (routeItem) currentView = routeItem.id;
  else updateRoleAddress();
}

function navigateTo(view) {
  if (!NAV_ITEMS[role].some((item) => item.id === view)) return;
  currentView = view;
  if (view === "catalog") catalogSearch = "";
  updateRoleAddress();
  render();
  if (view === "couriers") synchronizeBackend();
}

function logout() {
  sessionStorage.removeItem("entregaya-account-email");
  activeAccount = null;
  isAuthenticated = false;
  authView = "login";
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/acceso`);
  document.getElementById("overlay-root").innerHTML = "";
  render();
}

function renderCatalog(main) {
  const firstName = ROLE_DETAILS.cliente.name.split(" ")[0];
  const filtered = state.products.filter((product) => {
    const inCategory = activeCategory === "Todos" || product.category === activeCategory;
    const term = catalogSearch.trim().toLocaleLowerCase("es");
    const matchesSearch = !term || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase("es").includes(term);
    return inCategory && matchesSearch;
  });
  main.innerHTML = `
    <section class="welcome-row">
      <div><p class="eyebrow">LIMA, PERÚ · PRODUCTOS CON CARIÑO</p><h1>¡Hola, ${escapeHTML(firstName)}! <span aria-hidden="true">✳</span></h1><p class="subtitle">Lo que necesitas, cerquita de ti. Elige tus favoritos y nosotros te los llevamos.</p></div>
      <label class="search-box"><span aria-hidden="true">⌕</span><input id="catalog-search" type="search" placeholder="Busca algo que te guste..." value="${escapeHTML(catalogSearch)}" aria-label="Buscar productos"></label>
    </section>
    <section class="hero-banner" aria-label="Promoción del día">
      <div class="hero-copy"><span class="hero-tag"><span aria-hidden="true">✦</span> LO BUENO LLEGA A TU PUERTA</span><h2>Un antojito o un gustito.<br>Hoy te lo mereces.</h2><p>Encuentra productos ricos y bonitos, hechos para acompañar tu día.</p><button class="hero-button" type="button" data-category="Comida">Ver lo más pedido <span aria-hidden="true">→</span></button></div>
      <div class="hero-illustration" aria-hidden="true"><span class="hero-spark spark-one">✦</span><span class="hero-bag">🥡</span><span class="hero-spark spark-two">✳</span></div>
    </section>
    <section aria-labelledby="category-heading">
      <div class="section-heading"><div><h2 id="category-heading">Explora por categoría</h2><p>Un poquito de todo, para cada momento</p></div></div>
      <div class="category-row" role="group" aria-label="Categorías de productos">${CATEGORIES.map((category) => `<button class="category-chip${category === activeCategory ? " is-active" : ""}" type="button" data-category="${escapeHTML(category)}" aria-pressed="${category === activeCategory}">${escapeHTML(category)}</button>`).join("")}</div>
    </section>
    <section aria-labelledby="products-heading"><div class="section-heading"><div><h2 id="products-heading">${activeCategory === "Todos" ? "Los favoritos de hoy" : escapeHTML(activeCategory)}</h2><p>${filtered.length} ${filtered.length === 1 ? "producto disponible" : "productos para ti"}</p></div><button class="text-button" type="button" data-category="Todos">Ver todo <span aria-hidden="true">→</span></button></div>
      <div class="product-grid">${filtered.length ? filtered.map(renderProductCard).join("") : `<div class="empty-products">No encontramos productos con esa búsqueda. Prueba otro nombre o categoría.</div>`}</div>
    </section>`;
}

function renderProductCard(product) {
  return `<article class="product-card">
    <div class="product-art" style="--art-bg:${escapeHTML(product.color)}"><span class="product-label">${escapeHTML(product.category)}</span><span class="product-art-emoji" aria-hidden="true">${escapeHTML(product.emoji)}</span></div>
    <div class="product-body"><div class="product-title-row"><h3>${escapeHTML(product.name)}</h3><span class="product-rating" aria-label="Calificación ${escapeHTML(product.rating || "5")}">★ ${escapeHTML(product.rating || "5.0")}</span></div>
      <p class="product-description">${escapeHTML(product.description)}</p><div class="product-bottom"><span class="product-price">${money(product.price)} <small>/ unidad</small></span>
        <button class="add-button" type="button" data-add="${escapeHTML(product.id)}" aria-label="Agregar ${escapeHTML(product.name)} al carrito" ${!product.available || product.stock < 1 ? "disabled" : ""}>${product.available && product.stock > 0 ? "+" : "−"}</button></div>
    </div>
  </article>`;
}

function renderCustomerOrders(main) {
  const allOrders = state.orders.filter((order) => order.customerEmail === activeAccount?.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const orders = allOrders.filter((order) => CUSTOMER_ORDER_FILTERS.find((filter) => filter.id === customerOrderFilter).matches(order.status));
  const filters = CUSTOMER_ORDER_FILTERS.map((filter) => ({
    ...filter,
    count: allOrders.filter((order) => filter.matches(order.status)).length,
  }));
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">TU HISTORIAL</p><h1>Mis pedidos</h1><p class="subtitle">Consulta por separado tus compras en curso, entregadas y canceladas.</p></header>
    ${renderOrderTabs(filters, customerOrderFilter, "data-customer-order-status")}
    <div class="orders-list">${orders.length ? orders.map(renderCustomerOrderCard).join("") : emptyState("▤", customerOrderFilter === "todos" ? "Aún no tienes pedidos" : "No hay pedidos en esta sección", customerOrderFilter === "todos" ? "Cuando hagas tu primera compra, podrás seguirla desde aquí." : "Prueba otra sección para consultar tus pedidos.")}</div>`;
}

function renderCustomerOrderCard(order) {
  const steps = ["pendiente", "asignado", "en ruta", "entregado"];
  const progress = order.status === "cancelado" ? 0 : steps.indexOf(order.status);
  return `<article class="order-card"><div class="order-card-top"><div><strong>Pedido #${escapeHTML(order.id)}</strong><p>${formatDate(order.createdAt)}${order.courier ? ` · Repartidor: ${escapeHTML(order.courier)}` : ""}</p></div>${statusPill(order.status)}</div>
    <div class="order-lines">${order.items.length ? order.items.map((item) => `<div class="order-line"><span>${escapeHTML(item.emoji || "▣")} &nbsp;${item.quantity} × ${escapeHTML(item.name)}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("") : `<div class="order-line"><span>Detalle histórico no disponible</span><strong>${money(order.subtotal)}</strong></div>`}
      <div class="order-line"><span>Envío</span><span>${money(order.deliveryFee || 0)}</span></div></div>
    <div class="order-card-bottom"><span class="order-meta"><span>Entrega en</span><strong>${escapeHTML(order.address)}</strong></span><span class="order-total">${money(getOrderTotal(order))}</span>${order.status === "pendiente" ? `<button class="table-action" type="button" data-cancel-order="${escapeHTML(order.id)}">Cancelar</button>` : ""}</div>
    ${order.status !== "cancelado" ? `<div class="order-progress" aria-label="Progreso del pedido">${steps.map((step, index) => `<span class="progress-step${index <= progress ? " is-done" : ""}" title="${step}"></span>`).join("")}</div>` : ""}
  </article>`;
}

function emptyState(icon, title, description) {
  return `<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">${icon}</span><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div>`;
}

function renderProfile(main) {
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">TU CUENTA</p><h1>Mi perfil</h1><p class="subtitle">Tus datos de contacto y dirección para recibir tus pedidos.</p></header>
    <section class="panel"><div class="panel-header"><div><h2>Información personal</h2><p>Actualiza el contacto y la dirección asociados a tu cuenta.</p></div></div>
      <div class="panel-content"><form id="profile-form" class="form-grid">
        <div class="form-field"><label for="profile-name">Nombre completo</label><input id="profile-name" name="name" required value="${escapeHTML(ROLE_DETAILS.cliente.name)}"></div>
        <div class="form-field"><label for="profile-phone">Teléfono</label><input id="profile-phone" name="phone" class="phone-input" required inputmode="numeric" maxlength="9" minlength="9" pattern="[0-9]{9}" value="${escapeHTML(activeAccount.phone || "")}"></div>
        <div class="form-field full"><label for="profile-email">Correo electrónico</label><input id="profile-email" type="email" value="${escapeHTML(activeAccount.email)}" readonly aria-describedby="profile-email-note"><small id="profile-email-note">El correo de acceso no se puede modificar.</small></div>
        <div class="form-field full"><label for="profile-address">Dirección principal</label><input id="profile-address" name="address" required value="${escapeHTML(activeAccount.addresses?.[0] || "")}"></div>
        <div class="form-field full"><button class="primary-button" type="submit">Guardar mis datos</button></div>
      </form></div></section>
      `;
}

function renderCouriers(main) {
  const assigned = state.orders.filter((order) => ["asignado", "en ruta"].includes(order.status)).length;
  main.innerHTML = `<header class="page-heading with-action"><div><p class="eyebrow">EQUIPO DE REPARTO</p><h1>Repartidores</h1><p class="subtitle">Administra las personas que llevan cada pedido a su destino.</p></div><button class="primary-button" type="button" data-open-modal="courier">＋ Agregar repartidor</button></header>
    <section class="stats-grid courier-stats"><article class="stat-card"><div><p class="stat-label">Repartidores activos</p><p class="stat-value">${state.couriers.filter((courier) => courier.active).length}</p><span class="stat-foot">Listos para recibir asignaciones</span></div><span class="stat-icon" aria-hidden="true">♙</span></article><article class="stat-card"><div><p class="stat-label">Pedidos asignados o en ruta</p><p class="stat-value">${assigned}</p><span class="stat-foot">Entregas en curso</span></div><span class="stat-icon blue" aria-hidden="true">⌖</span></article></section>
    <section class="panel"><div class="panel-header"><div><h2>Personal de reparto</h2><p>${state.couriers.length} ${state.couriers.length === 1 ? "perfil registrado" : "perfiles registrados"}</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Repartidor</th><th>Teléfono</th><th>Pedidos activos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${state.couriers.length ? state.couriers.map((courier) => {
    const activeOrders = state.orders.filter((order) => order.courier === courier.name && ["asignado", "en ruta"].includes(order.status)).length;
    return `<tr><td><span class="table-primary">${escapeHTML(courier.name)}</span><span class="table-secondary">Personal de reparto</span></td><td>${escapeHTML(courier.phone)}</td><td>${activeOrders}</td><td>${statusPill(courier.active ? "activo" : "inactivo")}</td><td><button class="table-action" type="button" data-toggle-courier="${escapeHTML(courier.id)}">${courier.active ? "Desactivar" : "Activar"}</button> <button class="table-action danger-action" type="button" data-delete-courier="${escapeHTML(courier.id)}">Eliminar</button></td></tr>`;
  }).join("") : `<tr><td class="empty-row" colspan="5">Aún no hay repartidores registrados.</td></tr>`}</tbody></table></div></section>
    `;
}

function renderAdminOrders(main) {
  const filtered = filterOrders();
  const counts = ADMIN_ORDER_FILTERS.map((filter) => ({
    ...filter,
    count: state.orders.filter((order) => filter.id === "todos" || order.status === filter.id).length,
  }));
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">CENTRO DE OPERACIONES</p><h1>Gestión de pedidos</h1><p class="subtitle">Cada etapa del pedido tiene su propia sección. Asigna repartidores y revisa el avance.</p></header>
    ${renderOrderTabs(counts, orderStatusFilter, "data-order-status")}
    <div class="filter-bar"><label class="search-box"><span aria-hidden="true">⌕</span><input id="orders-search" type="search" placeholder="Buscar cliente o pedido..." value="${escapeHTML(orderSearch)}" aria-label="Buscar pedidos"></label><label class="date-filter"><span>Desde</span><input id="orders-date-from" type="date" aria-label="Fecha desde" value="${escapeHTML(orderDateFrom)}"></label><label class="date-filter"><span>Hasta</span><input id="orders-date-to" type="date" aria-label="Fecha hasta" value="${escapeHTML(orderDateTo)}"></label></div>
    ${renderOrdersTable(filtered, true)}`;
}

function renderOrderTabs(filters, selected, dataAttribute) {
  return `<nav class="order-tabs" aria-label="Secciones de pedidos">${filters.map((filter) => `<button class="order-tab${filter.id === selected ? " is-active" : ""}" type="button" ${dataAttribute}="${escapeHTML(filter.id)}" aria-pressed="${filter.id === selected}">${escapeHTML(filter.label)}<span>${filter.count}</span></button>`).join("")}</nav>`;
}

function filterOrders() {
  const term = orderSearch.trim().toLocaleLowerCase("es");
  return [...state.orders].filter((order) => {
    const matchesStatus = orderStatusFilter === "todos" || order.status === orderStatusFilter;
    const matchesSearch = !term || `${order.id} ${order.customer} ${order.phone} ${order.address}`.toLocaleLowerCase("es").includes(term);
    const date = dateInputValue(order.createdAt);
    const matchesDateFrom = !orderDateFrom || date >= orderDateFrom;
    const matchesDateTo = !orderDateTo || date <= orderDateTo;
    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderOrdersTable(orders, admin) {
  const statusHeadings = { pendiente: "Pedidos pendientes", asignado: "Pedidos asignados", "en ruta": "Pedidos en ruta", entregado: "Pedidos entregados", cancelado: "Pedidos cancelados" };
  const heading = admin ? statusHeadings[orderStatusFilter] || "Todos los pedidos" : "Pedidos recientes";
  return `<section class="panel"><div class="panel-header"><div><h2>${heading}</h2><p>${orders.length} ${orders.length === 1 ? "resultado" : "resultados"}</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th>${admin ? "<th>Repartidor</th>" : ""}</tr></thead><tbody>
    ${orders.length ? orders.map((order) => `<tr><td><span class="table-primary">#${escapeHTML(order.id)}</span><span class="table-secondary">${order.items.reduce((sum, item) => sum + item.quantity, 0)} producto(s)</span></td><td><span class="table-primary">${escapeHTML(order.customer)}</span><span class="table-secondary">${escapeHTML(order.phone || "")}</span></td><td>${formatDate(order.createdAt)}</td><td>${money(getOrderTotal(order))}</td><td>${statusPill(order.status)}</td>${admin ? `<td>${order.status === "pendiente" || order.status === "asignado" ? `<select class="inline-select" data-assign="${escapeHTML(order.id)}" aria-label="Asignar repartidor para ${escapeHTML(order.id)}"><option value="">Sin asignar</option>${state.couriers.filter((courier) => courier.active).map((courier) => `<option value="${escapeHTML(courier.email)}"${order.courierEmail === courier.email ? " selected" : ""}>${escapeHTML(courier.name)}</option>`).join("")}</select>` : escapeHTML(order.courier || "—")}</td>` : ""}</tr>`).join("") : `<tr><td class="empty-row" colspan="${admin ? 6 : 5}">No hay pedidos que coincidan con el filtro.</td></tr>`}
    </tbody></table></div><div class="table-footer"><span>Mostrando ${orders.length} pedidos</span></div></section>`;
}

function renderDashboard(main) {
  const today = new Date().toDateString();
  const todayOrders = state.orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const stats = [
    { label: "Pedidos de hoy", value: todayOrders.length, note: "Solicitudes registradas", icon: "▤", color: "" },
    { label: "Pendientes", value: todayOrders.filter((order) => order.status === "pendiente").length, note: "Esperan asignación", icon: "◷", color: "orange" },
    { label: "En ruta", value: todayOrders.filter((order) => order.status === "en ruta").length, note: "Entregas en camino", icon: "⌖", color: "blue" },
    { label: "Entregados", value: todayOrders.filter((order) => order.status === "entregado").length, note: "Pedidos completados hoy", icon: "✓", color: "purple" },
    { label: "Incidencias", value: state.incidents.filter((incident) => !incident.resolved).length, note: "Reportes por revisar", icon: "⚑", color: "orange" },
  ];
  const recentOrders = [...state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const lowStock = state.products.filter((product) => product.available && product.stock <= 5);
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">LUNES A VIERNES · LIMA, PERÚ</p><h1>Un buen día, equipo <span aria-hidden="true">✳</span></h1><p class="subtitle">Aquí tienes el resumen de las operaciones de EntregaYa.</p></header>
    <section class="stats-grid" aria-label="Indicadores del día">${stats.map((stat) => `<article class="stat-card"><div><p class="stat-label">${stat.label}</p><p class="stat-value">${stat.value}</p><span class="stat-foot">${stat.note}</span></div><span class="stat-icon ${stat.color}" aria-hidden="true">${stat.icon}</span></article>`).join("")}</section>
    <div class="admin-layout"><section class="panel"><div class="panel-header"><div><h2>Pedidos recientes</h2><p>Pedidos registrados en la plataforma</p></div><button class="text-button" type="button" data-view="admin-orders">Ver todos →</button></div>${renderOrdersTable(recentOrders, false)}</section>
    <div class="stack"><section class="panel"><div class="panel-header"><div><h2>Stock por revisar</h2><p>Productos con pocas unidades</p></div><button class="text-button" type="button" data-view="products">Catálogo →</button></div><div class="panel-content"><div class="simple-list">${lowStock.length ? lowStock.map((product) => `<div class="list-row"><span class="mini-avatar" aria-hidden="true">${escapeHTML(product.emoji)}</span><span class="list-copy"><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.category)}</span></span><span class="stock-number stock-low">${product.stock} uds.</span></div>`).join("") : `<p class="subtitle">No hay productos con stock bajo.</p>`}</div></div></section>
    <section class="panel"><div class="panel-header"><div><h2>Incidencias recientes</h2><p>Reportes enviados por repartidores</p></div><button class="text-button" type="button" data-view="incidents">Ver →</button></div><div class="panel-content">${state.incidents.length ? renderIncidentCards(state.incidents.slice(-2).reverse(), false) : `<p class="subtitle">Todo tranquilo. Aún no hay incidencias.</p>`}</div></section></div></div>`;
}

function renderProducts(main) {
  const products = state.products;
  main.innerHTML = `<header class="page-heading with-action"><div><p class="eyebrow">CATÁLOGO ENTREGAYA</p><h1>Productos</h1><p class="subtitle">Mantén al día los productos, precios y disponibilidad.</p></div><button class="primary-button" type="button" data-open-modal="product"><span aria-hidden="true">＋</span> Agregar producto</button></header>
    <div class="filter-bar"><label class="search-box"><span aria-hidden="true">⌕</span><input id="products-search" type="search" placeholder="Buscar en el catálogo..." aria-label="Buscar productos"></label><select class="filter-select" id="products-category" aria-label="Filtrar por categoría"><option value="todas">Todas las categorías</option>${CATEGORIES.slice(1).map((category) => `<option>${category}</option>`).join("")}</select></div>
    <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Disponibilidad</th><th>Acciones</th></tr></thead><tbody id="products-table-body">${renderProductRows(products)}</tbody></table></div><div class="table-footer"><span>${products.length} productos en catálogo</span><span>Los cambios se guardan en este navegador</span></div></section>`;
}

function renderProductRows(products) {
  return products.length ? products.map((product) => `<tr><td><span class="table-primary">${escapeHTML(product.emoji)} &nbsp;${escapeHTML(product.name)}</span><span class="table-secondary">${escapeHTML(product.description)}</span></td><td>${escapeHTML(product.category)}</td><td>${money(product.price)}</td><td><span class="${product.stock <= 5 ? "stock-number stock-low" : "stock-number"}">${product.stock} uds.</span></td><td>${statusPill(product.available && product.stock > 0 ? "disponible" : "sin stock")}</td><td><button class="table-action" type="button" data-edit-product="${escapeHTML(product.id)}">Editar</button> <button class="table-action" type="button" data-toggle-product="${escapeHTML(product.id)}">${product.available ? "Desactivar" : "Activar"}</button> <button class="table-action danger-action" type="button" data-delete-product="${escapeHTML(product.id)}">Eliminar</button></td></tr>`).join("") : `<tr><td class="empty-row" colspan="6">No hay productos que coincidan.</td></tr>`;
}

function renderIncidentCards(incidents) {
  return incidents.map((incident) => `<article class="issue-card${incident.resolved ? " issue-resolved" : ""}"><div class="issue-card-heading"><strong>${escapeHTML(incident.reason)} · Pedido #${escapeHTML(incident.orderId)}</strong>${statusPill(incident.resolved ? "atendida" : "incidencia")}</div><p>${escapeHTML(incident.description)}</p><div class="issue-card-footer"><span>${escapeHTML(incident.courier)} · ${formatDate(incident.createdAt)}</span>${!incident.resolved ? `<button class="table-action" type="button" data-resolve-incident="${escapeHTML(incident.id)}">Marcar atendida</button>` : `<span class="resolved-note">Atendida</span>`}</div></article>`).join("");
}

function renderIncidents(main) {
  const pending = state.incidents.filter((incident) => !incident.resolved);
  const resolved = state.incidents.filter((incident) => incident.resolved);
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">SEGUIMIENTO OPERATIVO</p><h1>Incidencias</h1><p class="subtitle">Revisa los reportes y marca los casos atendidos.</p></header>
    <section class="panel"><div class="panel-header"><div><h2>Pendientes de atención</h2><p>${pending.length} ${pending.length === 1 ? "reporte requiere" : "reportes requieren"} seguimiento</p></div></div><div class="panel-content">${pending.length ? renderIncidentCards([...pending].reverse()) : emptyState("✓", "Todo al día", "No hay incidencias pendientes de atención.")}</div></section>
    ${resolved.length ? `<section class="panel incident-history"><div class="panel-header"><div><h2>Atendidas</h2><p>${resolved.length} reporte(s) cerrado(s)</p></div></div><div class="panel-content">${renderIncidentCards([...resolved].reverse())}</div></section>` : ""}`;
}

function renderDriverRoute(main) {
  const currentCourier = state.couriers.find((courier) => courier.email === activeAccount?.email);
  const orders = state.orders.filter((order) => {
    const assignedToAccount = order.courierEmail === activeAccount?.email;
    const legacyAssignment = currentCourier && order.courier === currentCourier.name;
    return (assignedToAccount || legacyAssignment) && ["asignado", "en ruta"].includes(order.status);
  }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstName = ROLE_DETAILS.repartidor.name.split(" ")[0];
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">REPARTO · LIMA, PERÚ</p><h1>Hola, ${escapeHTML(firstName)} <span aria-hidden="true">✳</span></h1><p class="subtitle">Tu hoja de ruta de hoy. Un pedido a la vez y con calma.</p></header>
    <section class="driver-summary"><span class="driver-summary-icon" aria-hidden="true">⌖</span><div><h2>${orders.length} ${orders.length === 1 ? "entrega pendiente" : "entregas pendientes"}</h2><p>La dirección está a la vista y las acciones son grandes para que puedas usarlas desde el celular.</p></div></section>
    <section class="route-list">${orders.length ? orders.map(renderRouteCard).join("") : emptyState("✓", "¡Ruta completada!", "No tienes entregas pendientes asignadas en este momento.")}</section>
    <div class="alert-banner"><span aria-hidden="true">ⓘ</span><span>Usa el sistema solo cuando estés detenido en un lugar seguro. Aquí no se comparte tu ubicación en tiempo real.</span></div>`;
}

function openAccountModal() {
  showModal("Mi cuenta", `<p class="form-note">${escapeHTML(activeAccount.name)}<br>${escapeHTML(activeAccount.email)}<br>${ROLE_DETAILS[role].label}</p><div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>Volver</button><button class="danger-button" type="button" data-logout>Cerrar sesión</button></div>`);
}

function renderRouteCard(order) {
  return `<article class="route-card"><div class="route-top"><div><span class="route-id">PEDIDO #${escapeHTML(order.id)}</span><h3>${escapeHTML(order.customer)}</h3><p>${escapeHTML(order.phone || "Sin teléfono registrado")}</p></div>${statusPill(order.status)}</div>
    <div class="route-address"><span aria-hidden="true">⌖</span><span>${escapeHTML(order.address)}</span></div>
    <p class="route-products">Pedido: ${order.items.map((item) => `${item.quantity} × ${escapeHTML(item.name)}`).join(", ")} · Cobrar ${money(getOrderTotal(order))}</p>
    <div class="route-actions">${order.status === "asignado" ? `<button class="primary-button driver-action" type="button" data-route-status="${escapeHTML(order.id)}" data-next-status="en ruta">▶ &nbsp; Iniciar entrega</button>` : `<button class="primary-button driver-action" type="button" data-route-status="${escapeHTML(order.id)}" data-next-status="entregado">✓ &nbsp; Marcar como entregado</button>`}<button class="secondary-button driver-action" type="button" data-report-for="${escapeHTML(order.id)}">⚑ &nbsp; Reportar incidencia</button></div>
  </article>`;
}

function renderDriverIncidents(main) {
  const currentCourier = state.couriers.find((courier) => courier.email === activeAccount?.email);
  const assignedOrders = state.orders.filter((order) => (order.courierEmail === activeAccount?.email || (currentCourier && order.courier === currentCourier.name)) && ["asignado", "en ruta"].includes(order.status));
  main.innerHTML = `<header class="page-heading"><p class="eyebrow">AYUDA EN TU ENTREGA</p><h1>Reportar incidencia</h1><p class="subtitle">Cuéntale al administrador si necesitas apoyo con un pedido.</p></header>
    <section class="panel"><div class="panel-header"><div><h2>Nuevo reporte</h2><p>Describe lo ocurrido para que el equipo pueda ayudarte.</p></div></div><div class="panel-content">
      <form id="incident-form" class="form-grid"><div class="form-field"><label for="incident-order">Pedido relacionado</label><select id="incident-order" name="orderId" required>${assignedOrders.map((order) => `<option value="${escapeHTML(order.id)}">#${escapeHTML(order.id)} · ${escapeHTML(order.customer)}</option>`).join("")}${assignedOrders.length ? "" : `<option value="">Sin pedido activo</option>`}</select></div>
        <div class="form-field"><label for="incident-reason">Motivo</label><select id="incident-reason" name="reason" required><option value="">Selecciona un motivo</option><option>Cliente no se encuentra</option><option>Dirección incorrecta</option><option>Problema con el producto</option><option>Retraso en la entrega</option><option>Otro inconveniente</option></select></div>
        <div class="form-field full"><label for="incident-description">¿Qué ocurrió?</label><textarea id="incident-description" name="description" required minlength="8" placeholder="Describe brevemente lo que sucede y qué ayuda necesitas."></textarea></div>
        <div class="form-field full"><button class="primary-button" type="submit">Enviar reporte al administrador</button></div>
      </form></div></section>
      <div class="alert-banner"><span aria-hidden="true">ⓘ</span><span>Si es una emergencia, primero detente en un lugar seguro y contacta al equipo de operaciones.</span></div>`;
}

function updateCart(productId, change) {
  const key = String(productId);
  const product = state.products.find((item) => String(item.id) === key);
  if (!product) {
    showToast("No encontramos ese producto. Actualiza la página y vuelve a intentarlo.", true);
    return;
  }
  const quantity = (state.cart[key] || 0) + change;
  if (quantity > product.stock) {
    showToast(`Solo quedan ${product.stock} unidades de ${product.name}.`, true);
    return;
  }
  if (quantity <= 0) delete state.cart[key];
  else state.cart[key] = quantity;
  saveState();
  renderNavigation();
  if (document.getElementById("cart-drawer")) renderCartDrawer();
  if (currentView === "catalog") renderCatalog(document.getElementById("app-main"));
}

function renderCartDrawer() {
  const overlay = document.getElementById("overlay-root");
  const entries = Object.entries(state.cart).filter(([id, quantity]) => quantity > 0 && state.products.some((product) => String(product.id) === String(id)));
  const subtotal = cartSubtotal();
  overlay.innerHTML = `<div class="drawer-backdrop" id="cart-drawer" role="presentation"><aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><header class="drawer-head"><div><h2 id="cart-title">Mi carrito</h2><p>${totalCartQuantity()} productos seleccionados</p></div><button class="close-button" type="button" data-close-overlay aria-label="Cerrar carrito">×</button></header>
    ${entries.length ? `<div class="cart-items">${entries.map(([id, quantity]) => { const product = state.products.find((item) => String(item.id) === String(id)); return `<article class="cart-item"><span class="cart-art" style="--art-bg:${escapeHTML(product.color)}" aria-hidden="true">${escapeHTML(product.emoji)}</span><span class="cart-item-copy"><strong>${escapeHTML(product.name)}</strong><span>${money(product.price)} · ${escapeHTML(product.category)}</span></span><span class="quantity-control"><button type="button" data-cart-change="${escapeHTML(id)}" data-change="-1" aria-label="Quitar uno">−</button><strong>${quantity}</strong><button type="button" data-cart-change="${escapeHTML(id)}" data-change="1" aria-label="Agregar uno">+</button></span></article>`; }).join("")}</div>
    <footer class="cart-summary"><div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Envío</span><span>${money(DELIVERY_FEE)}</span></div><div class="summary-row total"><span>Total</span><strong>${money(subtotal + DELIVERY_FEE)}</strong></div><button class="primary-button" type="button" data-open-modal="checkout">Continuar con mi pedido <span aria-hidden="true">→</span></button></footer>`
    : `<div class="drawer-empty"><span aria-hidden="true">🛍️</span>Tu carrito todavía está vacío.<br>Encuentra algo rico o bonito para agregar.</div>`}</aside></div>`;
}

function showModal(title, content) {
  const overlay = document.getElementById("overlay-root");
  const drawer = document.getElementById("cart-drawer");
  const drawerHTML = drawer ? drawer.outerHTML : "";
  overlay.innerHTML = `${drawerHTML}<div class="modal-backdrop" id="active-modal" role="presentation"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="drawer-head"><div><h2 id="modal-title">${escapeHTML(title)}</h2></div><button class="close-button" type="button" data-close-modal aria-label="Cerrar ventana">×</button></header><div class="modal-content">${content}</div></section></div>`;
  const input = overlay.querySelector("#delivery-address, #product-name, #incident-description");
  input?.focus();
}

function checkoutMarkup() {
  const addresses = [...new Set(activeAccount.addresses || [])];
  const profileName = activeAccount.name || "";
  simulatedPaymentCode = "";
  return `<div class="checkout-progress" aria-label="Pasos de facturación"><span class="is-current">1 Datos</span><span>2 Pago</span><span>3 Confirmación</span></div><p class="form-note">Completa tus datos fiscales y de pago. Nunca almacenamos los datos completos de tu tarjeta.</p>
    <form id="checkout-form"><div class="form-grid">
      <div class="form-field full"><label for="billing-type">Tipo de comprobante</label><select id="billing-type" name="documentType" onchange="updateBillingDocumentField()"><option value="boleta">Boleta electrónica (DNI)</option><option value="ruc">Factura electrónica (RUC)</option></select></div>
      <div class="form-field"><label id="billing-document-label" for="billing-document">DNI</label><input id="billing-document" name="documentNumber" required inputmode="numeric" maxlength="8" minlength="8" pattern="[0-9]{8}" placeholder="8 dígitos"></div>
      <div class="form-field"><label for="billing-name">Nombre o razón social</label><input id="billing-name" name="billingName" required minlength="2" maxlength="100" value="${escapeHTML(profileName)}"></div>
      <div class="form-field full"><label for="billing-email">Correo para el comprobante</label><input id="billing-email" name="billingEmail" type="email" required value="${escapeHTML(activeAccount.email)}"></div>
      <div class="form-field full"><label for="delivery-address">Dirección de entrega</label><input id="delivery-address" name="address" required minlength="6" list="saved-addresses" placeholder="Calle, número y distrito" value="${escapeHTML(addresses[0] || "")}"><datalist id="saved-addresses">${addresses.map((address) => `<option value="${escapeHTML(address)}">`).join("")}</datalist></div>
      <div class="form-field full"><label for="delivery-reference">Referencia (opcional)</label><input id="delivery-reference" name="reference" placeholder="Ej. edificio azul, frente al parque"></div>
      <div class="form-field full"><span class="form-label">Método de pago</span><div class="payment-methods"><label class="payment-option"><input type="radio" name="paymentMethod" value="card" checked><span><strong>Tarjeta</strong><small>Procesamiento seguro y tokenizado</small></span></label><label class="payment-option"><input type="radio" name="paymentMethod" value="yape"><span><strong>Yape / Plin</strong><small>Confirma desde tu billetera</small></span></label></div></div>
      <div class="form-field full payment-card-fields"><label for="card-bank">Banco emisor</label><select id="card-bank" name="cardBank"><option value="">Selecciona tu banco</option><option>BCP</option><option>BBVA</option><option>Interbank</option><option>Scotiabank</option><option>BanBif</option><option>Otro banco</option></select></div>
      <div class="form-field full payment-card-fields"><label for="card-holder">Titular de la tarjeta</label><input id="card-holder" name="cardHolder" autocomplete="cc-name" maxlength="100" placeholder="Como aparece en la tarjeta"></div>
      <div class="form-field full payment-card-fields"><label for="card-number">Número de tarjeta</label><input id="card-number" name="cardNumber" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="4242 4242 4242 4242"><div class="form-grid"><div class="form-field"><label for="card-expiry">Vencimiento</label><input id="card-expiry" name="cardExpiry" inputmode="numeric" maxlength="5" autocomplete="cc-exp" placeholder="MM/AA"></div><div class="form-field"><label for="card-cvv">CVV</label><input id="card-cvv" name="cardCvv" inputmode="numeric" maxlength="3" minlength="3" pattern="[0-9]{3}" autocomplete="cc-csc" placeholder="123"></div></div><small>La pasarela real debe solicitar autenticación 3-D Secure del banco.</small></div>
      <div class="form-field full payment-wallet-fields" hidden><label for="wallet-provider">Billetera digital</label><select id="wallet-provider" name="walletProvider"><option value="">Selecciona una billetera</option><option value="Yape">Yape</option><option value="Plin">Plin</option></select><label for="payment-phone">Celular de la billetera</label><input id="payment-phone" name="paymentPhone" class="phone-input" inputmode="numeric" maxlength="9" minlength="9" pattern="[0-9]{9}" placeholder="999999999"><label for="payment-otp">Código de verificación de prueba</label><div class="verification-row"><input id="payment-otp" name="paymentOtp" inputmode="numeric" maxlength="6" minlength="6" pattern="[0-9]{6}" placeholder="Genera un código"><button class="secondary-button" type="button" data-generate-payment-code>Generar código</button></div><small id="payment-code-hint">Modo demo: genera un código local para confirmar la compra. No se envía por SMS.</small></div>
    </div><div class="checkout-total"><span>Total con envío e IGV</span><strong>${money(cartSubtotal() + DELIVERY_FEE)}</strong></div>
    <div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>Cancelar</button><button class="primary-button" type="submit">Pagar y confirmar pedido</button></div></form>`;
}

function openProductModal(product = null) {
  const categories = CATEGORIES.slice(1);
  showModal(product ? "Editar producto" : "Agregar producto", `<p class="form-note">Los productos forman parte del catálogo propio de EntregaYa.</p>
    <form id="product-form" data-product-id="${product ? escapeHTML(product.id) : ""}"><div class="form-grid">
      <div class="form-field full"><label for="product-name">Nombre del producto</label><input id="product-name" name="name" required maxlength="60" value="${escapeHTML(product?.name || "")}" placeholder="Ej. Taza Buen Día"></div>
      <div class="form-field"><label for="product-category">Categoría</label><select id="product-category" name="category" required>${categories.map((category) => `<option${product?.category === category ? " selected" : ""}>${category}</option>`).join("")}</select></div>
      <div class="form-field"><label for="product-emoji">Ícono</label><select id="product-emoji" name="emoji">${["🥪", "☕", "🍪", "👕", "👚", "👜", "🧢", "🍵", "🎁", "🌼"].map((emoji) => `<option${product?.emoji === emoji ? " selected" : ""}>${emoji}</option>`).join("")}</select></div>
      <div class="form-field"><label for="product-price">Precio (S/)</label><input id="product-price" name="price" required type="number" min="0.1" step="0.1" value="${escapeHTML(product?.price ?? "")}"></div>
      <div class="form-field"><label for="product-stock">Unidades disponibles</label><input id="product-stock" name="stock" required type="number" min="0" step="1" value="${escapeHTML(product?.stock ?? "1")}"></div>
      <div class="form-field full"><label for="product-description">Descripción</label><input id="product-description" name="description" required maxlength="100" value="${escapeHTML(product?.description || "")}" placeholder="Describe brevemente el producto"></div>
    </div><div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>Cancelar</button><button class="primary-button" type="submit">${product ? "Guardar cambios" : "Agregar producto"}</button></div></form>`);
}

function openCourierModal() {
  showModal("Agregar repartidor", `<p class="form-note">Crea una cuenta de reparto para que pueda iniciar sesión y recibir pedidos.</p><form id="courier-form"><div class="form-grid"><div class="form-field"><label for="courier-first-name">Nombres</label><input id="courier-first-name" name="firstName" required minlength="2" maxlength="100" placeholder="Ej. Lucía"></div><div class="form-field"><label for="courier-last-name">Apellidos</label><input id="courier-last-name" name="lastName" required minlength="2" maxlength="100" placeholder="Ej. Mendoza"></div><div class="form-field full"><label for="courier-email">Correo electrónico</label><input id="courier-email" name="email" type="email" required placeholder="repartidor@repartidor.com"><small>Debe terminar en @repartidor.com.</small></div><div class="form-field"><label for="courier-phone">Teléfono</label><input id="courier-phone" name="phone" class="phone-input" required inputmode="numeric" maxlength="9" minlength="9" pattern="[0-9]{9}" placeholder="987654321"></div><div class="form-field"><label for="courier-password">Contraseña</label><input id="courier-password" name="password" type="password" required minlength="6" placeholder="Al menos 6 caracteres"></div></div><div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>Cancelar</button><button class="primary-button" type="submit">Crear cuenta</button></div></form>`);
}

async function completeCheckout(form) {
  if (!Object.keys(state.cart).length) {
    showToast("Agrega al menos un producto antes de confirmar el pedido.", true);
    return;
  }
  const formData = new FormData(form);
  const address = String(formData.get("address") || "").trim();
  const reference = String(formData.get("reference") || "").trim();
  const documentType = String(formData.get("documentType") || "boleta");
  const documentNumber = String(formData.get("documentNumber") || "").replace(/\D/g, "");
  const billingName = String(formData.get("billingName") || "").trim();
  const billingEmail = String(formData.get("billingEmail") || "").trim();
  const paymentMethod = String(formData.get("paymentMethod") || "card");
  if (!validDocumentNumber(documentType, documentNumber)) {
    throw new Error(documentType === "ruc" ? "El RUC debe tener 11 dígitos." : "El DNI debe tener 8 dígitos.");
  }
  if (!billingName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
    throw new Error("Completa un nombre válido y un correo para emitir el comprobante.");
  }
  if (paymentMethod === "card") {
    if (!String(formData.get("cardBank") || "").trim()) throw new Error("Selecciona el banco emisor de tu tarjeta.");
    if (!String(formData.get("cardHolder") || "").trim()) throw new Error("Ingresa el nombre del titular de la tarjeta.");
    if (!validCardNumber(formData.get("cardNumber"))) throw new Error("Ingresa entre 13 y 19 dígitos para la tarjeta.");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(formData.get("cardExpiry") || ""))) throw new Error("El vencimiento debe tener el formato MM/AA.");
    if (!/^\d{3}$/.test(String(formData.get("cardCvv") || ""))) throw new Error("El CVV debe tener exactamente 3 dígitos.");
  } else {
    if (!/^\d{9}$/.test(String(formData.get("paymentPhone") || "").replace(/\D/g, ""))) {
      throw new Error("Ingresa el celular de tu billetera (9 dígitos).");
    }
    if (!String(formData.get("walletProvider") || "").trim()) {
      throw new Error("Selecciona Yape o Plin.");
    }
    if (!/^\d{6}$/.test(String(formData.get("paymentOtp") || "").replace(/\D/g, "")) || String(formData.get("paymentOtp")) !== simulatedPaymentCode) {
      throw new Error("Genera e ingresa el código de prueba mostrado para confirmar el pago.");
    }
  }
  const products = Object.entries(state.cart).map(([id, rawQuantity]) => {
    const quantity = Number(rawQuantity);
    const product = state.products.find((item) => String(item.id) === String(id));
    if (!product || !/^\d+$/.test(String(product.id))) throw new Error("El carrito contiene un producto que ya no existe en la base de datos. Actualiza la página.");
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`La cantidad de ${product.name} no es válida.`);
    if (!product.available || product.stock < quantity) throw new Error(`El producto ${product.name} ya no tiene unidades suficientes.`);
    return { product, quantity };
  });
  const items = products.map(({ product, quantity }) => ({ productId: Number(product.id), name: product.name, emoji: product.emoji, quantity, price: Number(product.price) }));
  const grossSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = grossSubtotal - grossSubtotal / 1.18;
  const subtotal = grossSubtotal - tax;
  const payment = {
    method: paymentMethod,
    label: paymentMethod === "card" ? `${String(formData.get("cardBank"))} · Tarjeta terminada en ${String(formData.get("cardNumber")).replace(/\D/g, "").slice(-4)}` : `${String(formData.get("walletProvider"))} verificado`,
    transactionId: `TRX-${Date.now().toString(36).toUpperCase()}`,
  };
  let savedOrderId = "";
  try {
    const saved = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        customerEmail: activeAccount.email,
        address: reference ? `${address} · Ref.: ${reference}` : address,
        deliveryFee: DELIVERY_FEE,
        items,
        billingDocument: documentType,
      }),
    });
    savedOrderId = saved.id;
  } catch (error) {
    showToast(`No se pudo registrar el pedido en el servidor: ${error.message}`, true);
    throw error;
  }
  for (const { product, quantity } of products) product.stock -= quantity;
  const idNumber = Math.max(1045, ...state.orders.map((order) => Number(order.id.replace(/\D/g, "")) || 0)) + 1;
  const order = { id: savedOrderId || `EY-${idNumber}`, customer: billingName, customerEmail: activeAccount.email, phone: activeAccount.phone || "", address: reference ? `${address} · Ref.: ${reference}` : address, createdAt: new Date().toISOString(), status: "pendiente", courier: "", items, deliveryFee: DELIVERY_FEE, subtotal: grossSubtotal, total: grossSubtotal + DELIVERY_FEE, tax, billing: { documentType, documentNumber, name: billingName, email: billingEmail }, payment };
  state.orders.unshift(order);
  activeAccount.addresses = activeAccount.addresses || [];
  if (!activeAccount.addresses.includes(address)) activeAccount.addresses.unshift(address);
  state.cart = {};
  saveState();
  orderSearch = "";
  orderStatusFilter = "todos";
  showInvoiceConfirmation(order);
}

async function assignCourier(orderId, courier) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const previous = { courier: order.courier, courierEmail: order.courierEmail, status: order.status };
  const courierAccount = state.couriers.find((item) => item.email === courier);
  order.courier = courierAccount?.name || "";
  order.courierEmail = courierAccount?.email || "";
  if (courier && order.status === "pendiente") order.status = "asignado";
  else if (!courier && order.status === "asignado") order.status = "pendiente";
  try {
    await apiRequest(`/orders/${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ courier, status: order.status }) });
    await synchronizeBackend();
    showToast(courierAccount ? `Pedido ${orderId} asignado a ${courierAccount.name}.` : `Se quitó la asignación del pedido ${orderId}.`);
  } catch (error) {
    Object.assign(order, previous);
    render();
    showToast(`No se sincronizó la asignación: ${error.message}`, true);
  }
}

async function setRouteStatus(orderId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || !["en ruta", "entregado"].includes(status)) return;
  try {
    await apiRequest(`/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    order.status = status;
    saveState();
    await synchronizeBackend();
    showToast(status === "entregado" ? `¡Pedido ${orderId} marcado como entregado!` : `Pedido ${orderId} marcado en ruta.`);
  } catch (error) {
    showToast(`No se pudo actualizar el estado del pedido: ${error.message}`, true);
  }
}

function cancelOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || order.status !== "pendiente") {
    showToast("Solo puedes cancelar un pedido que todavía esté pendiente.", true);
    return;
  }
  if (!window.confirm(`¿Quieres cancelar el pedido ${orderId}?`)) return;
  (async () => {
    try {
      await apiRequest(`/orders/${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ status: "cancelado" }) });
      await synchronizeBackend();
      showToast(`El pedido ${orderId} fue cancelado.`);
    } catch (error) {
      showToast(`No se pudo cancelar el pedido en el servidor: ${error.message}`, true);
    }
  })();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) {
    if (event.target.id === "cart-drawer" || event.target.id === "active-modal") document.getElementById("overlay-root").innerHTML = "";
    return;
  }
  if (target.classList.contains("notification-button")) return showToast("No tienes notificaciones nuevas por ahora.");
  if (target.dataset.authView) {
    authView = target.dataset.authView;
    render();
    return;
  }
  if (target.id === "account-switcher" || target.id === "mobile-account-switcher") return openAccountModal();
  if (target.hasAttribute("data-logout")) return logout();
  if (target.id === "open-cart") return renderCartDrawer();
  if (target.hasAttribute("data-generate-payment-code")) {
    simulatedPaymentCode = String(Math.floor(100000 + Math.random() * 900000));
    const codeInput = document.getElementById("payment-otp");
    const hint = document.getElementById("payment-code-hint");
    if (codeInput) codeInput.value = simulatedPaymentCode;
    if (hint) hint.textContent = `Modo demo: tu código de prueba es ${simulatedPaymentCode}. En producción lo generaría y validaría la pasarela.`;
    showToast("Código de prueba generado. Úsalo para confirmar el pago.");
    return;
  }
  if (target.dataset.printInvoice) {
    const order = state.orders.find((item) => item.id === target.dataset.printInvoice);
    if (!order) return;
    const printable = window.open("", "_blank");
    if (!printable) {
      showToast("Permite las ventanas emergentes para imprimir el comprobante.", true);
      return;
    }
    const isInvoice = order.billing.documentType === "ruc";
    const documentTitle = isInvoice ? "FACTURA ELECTRÓNICA" : "BOLETA DE VENTA ELECTRÓNICA";
    const issueDate = new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt));
    const customerDocument = isInvoice ? `RUC: ${escapeHTML(order.billing.documentNumber)}` : `DNI: ${escapeHTML(order.billing.documentNumber)}`;
    const customerLabel = isInvoice ? "Razón social" : "Cliente";
    const taxNote = isInvoice
      ? "Este comprobante permite sustentar costos o gastos y utilizar el crédito fiscal del IGV, según corresponda."
      : "Este comprobante se emite a consumidor final y no permite sustentar gastos ni utilizar crédito fiscal del IGV.";
    printable.document.write(`<title>${documentTitle} ${escapeHTML(order.id)}</title><style>
      *{box-sizing:border-box}body{margin:0;background:#f3f3f3;color:#202020;font-family:Arial,Helvetica,sans-serif;font-size:12px}
      .sheet{width:210mm;min-height:297mm;margin:20px auto;padding:18mm;background:#fff;box-shadow:0 2px 12px #0002}
      .head{display:flex;justify-content:space-between;gap:24px;margin-bottom:22px}.brand h1{margin:0;color:#c91f2d;font-size:25px}.brand p{margin:5px 0;color:#555;line-height:1.45}
      .document-box{width:245px;border:1px solid #222;border-radius:4px;padding:13px;text-align:center}.document-box strong{display:block;font-size:15px}.document-box span{display:block;margin-top:8px;font-size:16px;font-weight:bold}
      .rule{border-top:2px solid #c91f2d;margin:12px 0 18px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;margin-bottom:20px}.info-grid p{margin:0;line-height:1.5}.label{color:#666;font-size:10px;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin:15px 0 18px}th{background:#f3f3f3;text-align:left;text-transform:uppercase;font-size:10px}td,th{padding:10px 8px;border:1px solid #d6d6d6}td:nth-child(2),td:nth-child(3),td:nth-child(4),th:nth-child(2),th:nth-child(3),th:nth-child(4){text-align:right}
      .totals{display:flex;justify-content:flex-end}.totals table{width:310px;margin:0}.totals td{border:0;border-bottom:1px solid #ddd;padding:7px}.totals tr:last-child td{border-top:2px solid #222;border-bottom:0;font-size:16px;font-weight:bold}
      .footer{margin-top:32px;padding-top:14px;border-top:1px solid #bbb;color:#555;line-height:1.5}.legal{margin-top:16px;padding:10px;background:#fafafa;border:1px solid #ddd;font-size:10px}
      @media print{body{background:#fff}.sheet{width:auto;min-height:0;margin:0;padding:0;box-shadow:none}}
    </style><main class="sheet"><header class="head"><div class="brand"><h1>EntregaYa Perú</h1><p>Servicios de entrega y comercio electrónico<br>Av. Lima 123, Lima, Perú<br>RUC: 20600000001</p></div><div class="document-box"><strong>${documentTitle}</strong><span>EY01-${escapeHTML(order.id.replace("EY-", ""))}</span></div></header>
      <div class="rule"></div><section class="info-grid"><p><span class="label">Fecha de emisión</span><br>${escapeHTML(issueDate)}</p><p><span class="label">${customerLabel}</span><br>${escapeHTML(order.billing.name)}</p><p><span class="label">Documento de identidad</span><br>${customerDocument}</p><p><span class="label">Correo electrónico</span><br>${escapeHTML(order.billing.email)}</p><p><span class="label">Dirección de entrega</span><br>${escapeHTML(order.address)}</p><p><span class="label">Forma de pago</span><br>${escapeHTML(order.payment.label)}</p></section>
      <table><thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio unitario</th><th>Importe</th></tr></thead><tbody>${order.items.map((item) => `<tr><td>${escapeHTML(item.name)}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td></tr>`).join("")}</tbody></table>
      <div class="totals"><table><tr><td>Operación gravada</td><td>${money(order.subtotal)}</td></tr><tr><td>IGV (18%)</td><td>${money(order.tax)}</td></tr><tr><td>Envío</td><td>${money(order.deliveryFee)}</td></tr><tr><td>TOTAL</td><td>${money(getOrderTotal(order))}</td></tr></table></div>
      <footer class="footer"><strong>Representación impresa del comprobante electrónico</strong><br>${taxNote}<div class="legal">Comprobante generado por EntregaYa Perú para fines demostrativos. En producción, la numeración, firma digital y validación deben ser emitidas por un proveedor autorizado y comunicadas a SUNAT.</div></footer>
    </main>`);
    printable.document.close();
    printable.focus();
    printable.print();
    return;
  }
  if (target.dataset.afterCheckout) {
    document.getElementById("overlay-root").innerHTML = "";
    navigateTo("orders");
    return;
  }
  if (target.hasAttribute("data-close-overlay") || target.hasAttribute("data-close-modal")) return document.getElementById("overlay-root").innerHTML = "";
  if (target.dataset.category) {
    activeCategory = target.dataset.category;
    document.getElementById("app-main").scrollTop = 0;
    render();
    return;
  }
  if (target.dataset.view) {
    event.preventDefault();
    navigateTo(target.dataset.view);
    if (storageLoadIssue) showToast("No se pudieron leer los datos guardados. Se cargó el catálogo inicial.", true);
    return;
  }
  if (target.dataset.customerOrderStatus) {
    customerOrderFilter = target.dataset.customerOrderStatus;
    renderCustomerOrders(document.getElementById("app-main"));
    return;
  }
  if (target.dataset.orderStatus) {
    orderStatusFilter = target.dataset.orderStatus;
    renderAdminOrders(document.getElementById("app-main"));
    return;
  }
  if (target.dataset.add) return updateCart(target.dataset.add, 1);
  if (target.dataset.cartChange) return updateCart(target.dataset.cartChange, Number(target.dataset.change));
  if (target.dataset.openModal === "checkout") {
    showModal("Facturación y pago", checkoutMarkup());
    updateBillingDocumentField();
    return;
  }
  if (target.dataset.openModal === "product") return openProductModal();
  if (target.dataset.openModal === "courier") return openCourierModal();
  if (target.dataset.editProduct) {
    const product = state.products.find((item) => String(item.id) === target.dataset.editProduct);
    if (product) openProductModal(product);
    return;
  }
  if (target.dataset.toggleProduct) {
    const product = state.products.find((item) => String(item.id) === target.dataset.toggleProduct);
    if (product) {
      const nextAvailable = !product.available;
      try {
        await apiRequest(`/products/${encodeURIComponent(product.id)}/availability`, {
          method: "PATCH",
          body: JSON.stringify({ available: nextAvailable }),
        });
        product.available = nextAvailable;
        saveState();
        render();
        showToast(`${product.name} ${product.available ? "ahora está disponible." : "ya no está disponible."}`);
      } catch (error) {
        showToast(`No se pudo cambiar la disponibilidad: ${error.message}`, true);
      }
    }
    return;
  }
  if (target.dataset.deleteProduct) {
    const product = state.products.find((item) => String(item.id) === target.dataset.deleteProduct);
    if (!product || !window.confirm(`¿Quieres eliminar "${product.name}" del catálogo?`)) return;
    try {
      if (!/^\d+$/.test(String(product.id))) {
        await synchronizeBackend();
        const syncedProduct = state.products.find((item) => item.name === product.name && /^\d+$/.test(String(item.id)));
        if (syncedProduct) product.id = syncedProduct.id;
      }
      if (!/^\d+$/.test(String(product.id))) throw new Error("Actualiza la página para cargar el producto desde la base de datos.");
      await apiRequest(`/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      state.products = state.products.filter((item) => String(item.id) !== target.dataset.deleteProduct);
      saveState();
      render();
      showToast(`${product.name} fue eliminado del catálogo.`);
    } catch (error) {
      showToast(`No se pudo eliminar el producto: ${error.message}`, true);
    }
    return;
  }
  if (target.dataset.deleteCourier) {
    const courier = state.couriers.find((item) => String(item.id) === target.dataset.deleteCourier);
    if (!courier || !window.confirm(`¿Quieres eliminar la cuenta de ${courier.name}?`)) return;
    const activeOrders = state.orders.filter((order) => order.courier === courier.name && ["asignado", "en ruta"].includes(order.status));
    if (activeOrders.length) {
      showToast("No puedes eliminar un repartidor con pedidos asignados. Reasigna sus entregas primero.", true);
      return;
    }
    try {
      if (!/^\d+$/.test(String(courier.id))) {
        throw new Error("La cuenta no tiene un identificador válido en la base de datos.");
      }
      if (/^\d+$/.test(String(courier.id))) {
        await apiRequest(`/couriers/${encodeURIComponent(courier.id)}`, { method: "DELETE" });
      }
      state.orders.forEach((order) => {
        if (order.courier === courier.name) order.courier = "";
      });
      state.couriers = state.couriers.filter((item) => String(item.id) !== target.dataset.deleteCourier);
      saveState();
      render();
      showToast(`La cuenta de ${courier.name} fue eliminada.`);
    } catch (error) {
      showToast(`No se pudo eliminar la cuenta: ${error.message}`, true);
    }
    return;
  }
  if (target.dataset.toggleCourier) {
    const courier = state.couriers.find((item) => String(item.id) === target.dataset.toggleCourier);
    if (!courier) return;
    const nextActive = !courier.active;
    try {
      if (!/^\d+$/.test(String(courier.id))) {
        throw new Error("La cuenta no tiene un identificador válido en la base de datos.");
      }
      await apiRequest(`/couriers/${encodeURIComponent(courier.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: nextActive }),
      });
      courier.active = nextActive;
      saveState();
      render();
      showToast(`${courier.name} ${nextActive ? "se activó." : "se desactivó."}`);
    } catch (error) {
      showToast(`No se pudo cambiar el estado: ${error.message}`, true);
    }
    return;
  }
  if (target.dataset.resolveIncident) {
    const incident = state.incidents.find((item) => item.id === target.dataset.resolveIncident);
    if (!incident || incident.resolved) return;
    try {
      await apiRequest(`/incidents/${encodeURIComponent(incident.id)}`, { method: "PATCH" });
      await synchronizeBackend();
      showToast(`La incidencia del pedido ${incident.orderId} se marcó como atendida.`);
    } catch (error) {
      showToast(`No se pudo resolver la incidencia: ${error.message}`, true);
    }
    return;
  }
  if (target.dataset.cancelOrder) return cancelOrder(target.dataset.cancelOrder);
  if (target.dataset.routeStatus) return setRouteStatus(target.dataset.routeStatus, target.dataset.nextStatus);
  if (target.dataset.reportFor) {
    navigateTo("driver-incidents");
    const selector = document.getElementById("incident-order");
    if (selector) selector.value = target.dataset.reportFor;
    document.getElementById("incident-description")?.focus();
    return;
  }
  if (target.dataset.category) {
    activeCategory = target.dataset.category;
    render();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "billing-type") {
    updateBillingDocumentField();
    const documentInput = document.getElementById("billing-document");
    documentInput?.focus();
    return;
  }
  if (!event.target.matches('input[name="paymentMethod"]')) return;
  const isCard = event.target.value === "card";
  document.querySelectorAll(".payment-card-fields").forEach((field) => { field.hidden = !isCard; });
  document.querySelectorAll(".payment-wallet-fields").forEach((field) => { field.hidden = isCard; });
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".phone-input")) {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 9);
  }
  if (event.target.id === "billing-document") {
    const type = document.getElementById("billing-type");
    const limit = type?.value === "ruc" ? 11 : 8;
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, limit);
  }
  if (event.target.id === "card-number") {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  if (event.target.id === "card-expiry") {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }
  if (event.target.id === "card-cvv" || event.target.id === "payment-otp") {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, event.target.id === "card-cvv" ? 3 : 6);
  }
  if (event.target.id === "catalog-search") {
    const cursor = event.target.selectionStart;
    catalogSearch = event.target.value;
    renderCatalog(document.getElementById("app-main"));
    const input = document.getElementById("catalog-search");
    input?.focus();
    input?.setSelectionRange(cursor, cursor);
  }
  if (event.target.id === "orders-search") {
    const cursor = event.target.selectionStart;
    orderSearch = event.target.value;
    renderAdminOrders(document.getElementById("app-main"));
    const input = document.getElementById("orders-search");
    input?.focus();
    input?.setSelectionRange(cursor, cursor);
  }
  if (event.target.id === "products-search") {
    const term = event.target.value.toLocaleLowerCase("es");
    const selectedCategory = document.getElementById("products-category").value;
    const filtered = state.products.filter((product) => `${product.name} ${product.category}`.toLocaleLowerCase("es").includes(term) && (selectedCategory === "todas" || product.category === selectedCategory));
    document.getElementById("products-table-body").innerHTML = renderProductRows(filtered);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "orders-date-from" || event.target.id === "orders-date-to") {
    orderDateFrom = document.getElementById("orders-date-from").value;
    orderDateTo = document.getElementById("orders-date-to").value;
    if (orderDateFrom && orderDateTo && orderDateFrom > orderDateTo) {
      showToast("La fecha inicial no puede ser posterior a la fecha final.", true);
      return;
    }
    renderAdminOrders(document.getElementById("app-main"));
  }
  if (event.target.id === "products-category") {
    const term = document.getElementById("products-search").value.toLocaleLowerCase("es");
    const filtered = state.products.filter((product) => `${product.name} ${product.category}`.toLocaleLowerCase("es").includes(term) && (event.target.value === "todas" || product.category === event.target.value));
    document.getElementById("products-table-body").innerHTML = renderProductRows(filtered);
  }
  if (event.target.matches("[data-assign]")) assignCourier(event.target.dataset.assign, event.target.value);
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "login-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const email = String(form.get("email")).trim().toLocaleLowerCase("es");
    try {
      const account = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password: String(form.get("password")) }) });
      startSession({ ...account, role: account.role.toLowerCase() });
      synchronizeBackend();
      return;
    } catch (error) {
      if (apiAvailable) {
        showToast(error.message || "No se pudo iniciar sesión.", true);
        return;
      }
    }
    const account = state.accounts.find((item) => item.email === email);
    if (!account || account.role !== roleFromEmail(email)) {
      showToast("No encontramos una cuenta con ese correo. Revisa tus datos o regístrate.", true);
      return;
    }
    try {
      if (!await verifyPassword(String(form.get("password")), account)) {
        showToast("La contraseña no es correcta.", true);
        return;
      }
      startSession(account);
    } catch (error) {
      showToast("No se pudo verificar la contraseña en este navegador.", true);
      console.error("No se pudo verificar la contraseña de la cuenta.", error);
    }
  }
  if (event.target.id === "signup-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const email = String(form.get("email")).trim().toLocaleLowerCase("es");
    const phone = String(form.get("phone")).replace(/\D/g, "");
    if (phone.length !== 9) {
      showToast("El teléfono debe tener exactamente 9 dígitos.", true);
      return;
    }
    const nextRole = roleFromEmail(email);
    if (!nextRole) {
      showToast("Usa @gmail.com, @admin.com o @repartidor.com para crear la cuenta.", true);
      return;
    }
    try {
      const account = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: String(form.get("firstName")).trim(),
          lastName: String(form.get("lastName")).trim(),
          email, phone,
          password: String(form.get("password")),
        }),
      });
      authView = "login";
      render();
      showToast("Cuenta creada correctamente. Inicia sesión para continuar.");
      return;
    } catch (error) {
      if (apiAvailable) {
        showToast(error.message || "No se pudo crear la cuenta.", true);
        return;
      }
      showToast("No se pudo conectar con la base de datos. Inicia el backend e inténtalo nuevamente.", true);
      return;
    }
  }
  if (event.target.id === "recover-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const email = String(form.get("email")).trim().toLocaleLowerCase("es");
    const account = state.accounts.find((item) => item.email === email && item.role === roleFromEmail(email));
    try {
      await apiRequest("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ email, password: String(form.get("password")) }),
      });
      authView = "login";
      render();
      showToast("Contraseña actualizada. Ya puedes iniciar sesión.");
      return;
    } catch (error) {
      if (apiAvailable) {
        showToast(error.message || "No se pudo actualizar la contraseña.", true);
        return;
      }
    }
    if (!account) {
      showToast("No encontramos una cuenta con ese correo.", true);
      return;
    }
    try {
      const previousHash = account.passwordHash;
      const previousSalt = account.passwordSalt;
      Object.assign(account, await hashPassword(String(form.get("password"))));
      if (!persistAccountChanges()) {
        account.passwordHash = previousHash;
        account.passwordSalt = previousSalt;
        return;
      }
      authView = "login";
      render();
      showToast("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (error) {
      showToast("No se pudo actualizar la contraseña. Inténtalo de nuevo.", true);
      console.error("No se pudo actualizar la contraseña de la cuenta.", error);
    }
  }
  if (event.target.id === "courier-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const firstName = String(form.get("firstName")).trim();
    const lastName = String(form.get("lastName")).trim();
    const email = String(form.get("email")).trim().toLocaleLowerCase("es");
    const phone = String(form.get("phone")).replace(/\D/g, "");
    const password = String(form.get("password"));
    if (phone.length !== 9) {
      showToast("El teléfono debe tener exactamente 9 dígitos.", true);
      return;
    }
    if (!email.endsWith("@repartidor.com")) {
      showToast("El correo debe terminar en @repartidor.com.", true);
      return;
    }
    if (password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres.", true);
      return;
    }
    try {
      const account = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
      });
      state.couriers = await apiRequest("/couriers");
      saveState();
      document.getElementById("overlay-root").innerHTML = "";
      render();
      showToast(`${account.name} se agregó al equipo de reparto.`);
    } catch (error) {
      showToast(`No se pudo crear la cuenta: ${error.message}`, true);
    }
  }
  if (event.target.id === "checkout-form") {
    event.preventDefault();
    try {
      await completeCheckout(event.target);
    } catch (error) {
      showToast(error.message, true);
      console.error("No se pudo completar el pedido.", error);
    }
  }
  if (event.target.id === "product-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const id = event.target.dataset.productId;
    const product = {
      id: id || `p-${Date.now()}`,
      name: String(form.get("name")).trim(),
      category: String(form.get("category")),
      emoji: String(form.get("emoji")),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
      available: Number(form.get("stock")) > 0,
      color: id ? state.products.find((item) => item.id === id)?.color || "#e4eadc" : "#e4eadc",
      description: String(form.get("description")).trim(),
      rating: "5.0",
    };
    try {
      const payload = {
        category: product.category,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        available: product.available,
      };
      const saved = id
        ? await apiRequest(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiRequest("/products", { method: "POST", body: JSON.stringify(payload) });
      if (!id && saved.id) product.id = saved.id;
    } catch (error) {
      showToast(`No se pudo guardar el producto en el servidor: ${error.message}`, true);
      return;
    }
    const existingIndex = state.products.findIndex((item) => String(item.id) === String(id));
    if (existingIndex >= 0) state.products[existingIndex] = { ...state.products[existingIndex], ...product };
    else state.products.unshift(product);
    saveState();
    document.getElementById("overlay-root").innerHTML = "";
    render();
    showToast(id ? "Producto actualizado." : "Producto agregado al catálogo.");
  }
  if (event.target.id === "incident-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const orderId = String(form.get("orderId") || "");
    if (!orderId) {
      showToast("No tienes un pedido asignado para asociar a la incidencia.", true);
      return;
    }
    const incident = {
      id: "",
      orderId,
      courier: ROLE_DETAILS.repartidor.name,
      reason: String(form.get("reason")),
      description: String(form.get("description")).trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      const saved = await apiRequest("/incidents", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          reason: incident.reason,
          description: incident.description,
        }),
      });
      incident.id = saved.id;
    } catch (error) {
      showToast(`No se pudo registrar la incidencia: ${error.message}`, true);
      return;
    }
    state.incidents.push(incident);
    saveState();
    navigateTo("route");
    showToast("Incidencia enviada. El administrador podrá revisarla.");
  }
  if (event.target.id === "profile-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    const name = String(form.get("name")).trim();
    if (!name) return showToast("Ingresa tu nombre para guardar el perfil.", true);
    const phone = String(form.get("phone")).replace(/\D/g, "");
    if (phone.length !== 9) return showToast("El teléfono debe tener exactamente 9 dígitos.", true);
    const address = String(form.get("address")).trim();
    const previousAccount = { name: activeAccount.name, phone: activeAccount.phone, addresses: [...(activeAccount.addresses || [])] };
    const previousOrders = state.orders.filter((order) => order.customerEmail === activeAccount.email).map((order) => ({ order, customer: order.customer, phone: order.phone }));
    activeAccount.name = name;
    activeAccount.phone = phone;
    activeAccount.addresses = [address, ...(activeAccount.addresses || []).filter((item) => item !== address)];
    ROLE_DETAILS.cliente.name = name;
    state.orders.filter((order) => order.customerEmail === activeAccount.email).forEach((order) => { order.customer = name; order.phone = phone; });
    state.profile = { name, phone, email: activeAccount.email };
    try {
      const updated = await apiRequest("/auth/account", {
        method: "PATCH",
        body: JSON.stringify({ email: activeAccount.email, name, phone }),
      });
      Object.assign(activeAccount, updated);
    } catch (error) {
      showToast(`No se sincronizaron tus datos: ${error.message}`, true);
      return;
    }
    if (!persistAccountChanges()) {
      Object.assign(activeAccount, previousAccount);
      ROLE_DETAILS.cliente.name = previousAccount.name;
      previousOrders.forEach(({ order, customer, phone: previousPhone }) => Object.assign(order, { customer, phone: previousPhone }));
      return;
    }
    render();
    showToast("Tus datos se guardaron.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.getElementById("overlay-root").innerHTML) document.getElementById("overlay-root").innerHTML = "";
});

window.addEventListener("hashchange", () => {
  restoreRoleAddress();
  render();
  synchronizeBackend();
});

restoreRoleAddress();
render();
synchronizeBackend();
