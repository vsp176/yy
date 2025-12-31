/* ===============================
   HELPER STORAGE
================================ */
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    const id = localStorage.getItem("currentUser");
    if (!id) return null;
    return getUsers().find(u => u.id === id) || null;
}

function formatRupiah(n) {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

/* ===============================
   RULE PLAN & TUGAS
================================ */
const PLAN_RULES = {
    BASIC:  { tugasPerHari: 0 },
    MAGANG: { tugasPerHari: 3 },
    V1:     { tugasPerHari: 3 },
    V2:     { tugasPerHari: 5 },
    V3:     { tugasPerHari: 8 },
    V4:     { tugasPerHari: 12 },
    V5:     { tugasPerHari: 20 },
    V6:     { tugasPerHari: 30 },
    V7:     { tugasPerHari: 45 }
};

/* ===============================
   PROTEKSI HALAMAN
================================ */
const user = getCurrentUser();
if (!user) {
    window.location.href = "daftar.html?action=login";
}

/* ===============================
   INIT STRUKTUR (AMAN)
================================ */
user.saldo = user.saldo || {
    deposit: 0,
    tersedia: 0,
    totalPendapatan: 0,
    pendapatanHariIni: 0
};

user.tugas = user.tugas || {
    hariIni: 0,
    limit: 0,
    terakhirReset: new Date().toDateString(),
    riwayat: []
};

user.catatan = user.catatan || [];
user.planAktif = user.planAktif || "BASIC";

/* ===============================
   SYNC PLAN → LIMIT TUGAS
================================ */
const rule = PLAN_RULES[user.planAktif] || { tugasPerHari: 0 };

if (user.tugas.limit !== rule.tugasPerHari) {
    user.tugas.limit = rule.tugasPerHari;
    user.tugas.hariIni = 0; // reset progres saat ganti plan

    const users = getUsers().map(u => u.id === user.id ? user : u);
    saveUsers(users);
}

/* ===============================
   RESET HARIAN
================================ */
function resetHarian(user) {
    const today = new Date().toDateString();
    if (user.tugas.terakhirReset !== today) {
        user.tugas.hariIni = 0;
        user.saldo.pendapatanHariIni = 0;
        user.tugas.terakhirReset = today;

        const users = getUsers().map(u => u.id === user.id ? user : u);
        saveUsers(users);
    }
}
resetHarian(user);

/* ===============================
   RENDER PROFIL
================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* Avatar & Info */
    document.querySelector(".avatar-initials span").innerText =
        user.username.substring(0, 2).toUpperCase();

    document.querySelector(".user-info h2").innerText = user.username;

    document.querySelector(".user-info div").innerHTML =
        `ID <span class="id-badge">${user.id.slice(-6)}</span> • ${user.phone}`;

    /* Plan */
    document.querySelector(".level-tag span").innerText =
        user.planAktif.toUpperCase();

    /* Wallet atas */
    const stats = document.querySelectorAll(".stat-item h3");
    stats[0].innerText = formatRupiah(user.saldo.deposit);
    stats[1].innerText = formatRupiah(user.saldo.tersedia);
    stats[2].innerText = `${user.tugas.hariIni}/${user.tugas.limit}`;

    /* Income */
    const income = document.querySelectorAll(".income-item h4");

    income[0].innerText = formatRupiah(user.saldo.totalPendapatan);

    income[1].innerText = formatRupiah(
        user.catatan
            .filter(c => c.tipe === "penarikan")
            .reduce((t, c) => t + (c.jumlah || 0), 0)
    );

    income[2].innerText = formatRupiah(user.saldo.tersedia);
    income[3].innerText = formatRupiah(user.saldo.pendapatanHariIni);
});

/* ===============================
   LOGOUT
================================ */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "daftar.html?action=login";
}