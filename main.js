/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 */

// -------------------------------------------------------
// DATA & STATE
// -------------------------------------------------------

/** Array utama penyimpan semua transaksi (in-memory) */
let transactions = [];

/** ID transaksi yang sedang diedit; null = mode Tambah */
let editingId = null;

/** Kata kunci pencarian aktif */
let searchKeyword = '';

/**
 * Hasilkan ID unik berbasis timestamp.
 * @returns {number}
 */
function generateId() {
  return +new Date();
}

// -------------------------------------------------------
// LOCAL STORAGE HELPERS
// -------------------------------------------------------

const STORAGE_KEY = 'tracker_transactions';

/** Simpan array transactions ke localStorage */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/** Muat transactions dari localStorage saat halaman dibuka */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      transactions = JSON.parse(raw);
    } catch {
      transactions = [];
    }
  }
}

// -------------------------------------------------------
// CUSTOM EVENT
// -------------------------------------------------------

/**
 * Kirim sinyal 'transaction:updated' setiap kali data berubah.
 * Satu listener di bawah yang menangani semua pembaruan tampilan.
 */
function dispatchUpdate() {
  document.dispatchEvent(new Event('transaction:updated'));
}

document.addEventListener('transaction:updated', () => {
  renderTransactions(searchKeyword);
  updateDashboard();
});

// -------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------

const incomeListEl   = document.getElementById('incomeList');
const expenseListEl  = document.getElementById('expenseList');
const form           = document.getElementById('transactionForm');
const titleInput     = document.getElementById('transactionFormTitleInput');
const amountInput    = document.getElementById('transactionFormAmountInput');
const dateInput      = document.getElementById('transactionFormDateInput');
const typeSelect     = document.getElementById('transactionFormTypeSelect');
const submitBtn      = form.querySelector('[data-testid="transactionFormSubmitButton"]');

const searchForm     = document.getElementById('searchTransactionForm');
const searchInput    = document.getElementById('searchTransactionFormTitleInput');

const balanceEl      = document.querySelector('.tracker-summary__balance-amount');
const incomeStatEl   = document.querySelector('.tracker-summary__stat-amount--income');
const expenseStatEl  = document.querySelector('.tracker-summary__stat-amount--expense');

// -------------------------------------------------------
// FORMAT CURRENCY
// -------------------------------------------------------

/**
 * Format angka ke string Rupiah.
 * @param {number} amount
 * @returns {string}
 */
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// -------------------------------------------------------
// RENDER TRANSACTIONS
// -------------------------------------------------------

/**
 * Render seluruh transaksi ke DOM.
 * Jika keyword diberikan, hanya tampilkan yang cocok.
 * @param {string} keyword
 */
function renderTransactions(keyword = '') {
  // Kosongkan kontainer
  incomeListEl.innerHTML  = '';
  expenseListEl.innerHTML = '';

  const filtered = keyword.trim()
    ? transactions.filter(t =>
        t.title.toLowerCase().includes(keyword.trim().toLowerCase())
      )
    : transactions;

  filtered.forEach(transaction => {
    const card = createTransactionCard(transaction);
    if (transaction.type === 'income') {
      incomeListEl.appendChild(card);
    } else {
      expenseListEl.appendChild(card);
    }
  });
}

/**
 * Buat elemen kartu transaksi menggunakan document.createElement().
 * Struktur data-testid mengikuti rubrik penilaian.
 * @param {Object} transaction
 * @returns {HTMLElement}
 */
function createTransactionCard(transaction) {
  const isIncome = transaction.type === 'income';
  const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
  const iconEmoji = isIncome ? '↑' : '↓';
  const iconClass = isIncome
    ? 'tracker-transaction-item__icon--income'
    : 'tracker-transaction-item__icon--expense';
  const amountClass = isIncome
    ? 'tracker-transaction-item__amount--income'
    : 'tracker-transaction-item__amount--expense';

  // Wrapper item
  const item = document.createElement('div');
  item.setAttribute('data-testid', 'transactionItem');
  item.className = 'tracker-transaction-item';

  // Icon
  const icon = document.createElement('div');
  icon.className = `tracker-transaction-item__icon ${iconClass}`;
  icon.textContent = iconEmoji;

  // Detail kiri
  const detail = document.createElement('div');
  detail.className = 'tracker-transaction-item__detail';

  const titleEl = document.createElement('h3');
  titleEl.setAttribute('data-testid', 'transactionItemTitle');
  titleEl.className = 'tracker-transaction-item__title';
  titleEl.textContent = transaction.title;

  const dateEl = document.createElement('p');
  dateEl.setAttribute('data-testid', 'transactionItemDate');
  dateEl.className = 'tracker-transaction-item__date';
  dateEl.textContent = `Tanggal: ${transaction.date}`;

  detail.appendChild(titleEl);
  detail.appendChild(dateEl);

  // Detail kanan
  const right = document.createElement('div');
  right.className = 'tracker-transaction-item__right';

  const amountEl = document.createElement('p');
  amountEl.setAttribute('data-testid', 'transactionItemAmount');
  amountEl.className = `tracker-transaction-item__amount ${amountClass}`;
  amountEl.textContent = `Nominal: ${formatRupiah(transaction.amount)}`;

  const typeEl = document.createElement('p');
  typeEl.setAttribute('data-testid', 'transactionItemType');
  typeEl.className = 'tracker-transaction-item__date';
  typeEl.textContent = `Tipe: ${typeLabel}`;

  // Tombol aksi
  const actions = document.createElement('div');
  actions.className = 'tracker-transaction-item__actions';

  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'transactionItemEditButton');
  editBtn.className = 'tracker-transaction-item__btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => handleEdit(transaction.id));

  const changeTypeBtn = document.createElement('button');
  changeTypeBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
  changeTypeBtn.className = 'tracker-transaction-item__btn';
  changeTypeBtn.textContent = 'Ubah Tipe';
  changeTypeBtn.addEventListener('click', () => handleChangeType(transaction.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteBtn.className = 'tracker-transaction-item__btn';
  deleteBtn.textContent = 'Hapus';
  deleteBtn.addEventListener('click', () => handleDelete(transaction.id));

  actions.appendChild(editBtn);
  actions.appendChild(changeTypeBtn);
  actions.appendChild(deleteBtn);

  right.appendChild(amountEl);
  right.appendChild(typeEl);
  right.appendChild(actions);

  item.appendChild(icon);
  item.appendChild(detail);
  item.appendChild(right);

  return item;
}

// -------------------------------------------------------
// DASHBOARD UPDATE
// -------------------------------------------------------

/** Hitung dan tampilkan ringkasan keuangan di panel dasbor */
function updateDashboard() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  balanceEl.textContent    = formatRupiah(balance);
  incomeStatEl.textContent = formatRupiah(totalIncome);
  expenseStatEl.textContent= formatRupiah(totalExpense);
}

// -------------------------------------------------------
// FORM: ADD & EDIT
// -------------------------------------------------------

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title  = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date   = dateInput.value;
  const type   = typeSelect.value;

  // Validasi input
  if (!title) {
    alert('Keterangan transaksi tidak boleh kosong.');
    return;
  }
  if (amount < 1) {
    alert('Nominal transaksi minimal Rp 1.');
    return;
  }

  if (editingId !== null) {
    // Mode Edit: perbarui transaksi yang ada
    const idx = transactions.findIndex(t => t.id === editingId);
    if (idx !== -1) {
      transactions[idx] = { id: editingId, title, amount, date, type };
    }
    editingId = null;
    submitBtn.textContent = 'Simpan';
  } else {
    // Mode Tambah: buat transaksi baru
    const newTransaction = {
      id: generateId(),
      title,
      amount,
      date,
      type,
    };
    transactions.push(newTransaction);
  }

  saveToStorage();
  form.reset();
  dispatchUpdate();
});

// -------------------------------------------------------
// HANDLE EDIT
// -------------------------------------------------------

/**
 * Isi form dengan data transaksi yang dipilih untuk diedit.
 * @param {number} id
 */
function handleEdit(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  editingId = id;
  titleInput.value  = transaction.title;
  amountInput.value = transaction.amount;
  dateInput.value   = transaction.date;
  typeSelect.value  = transaction.type;

  submitBtn.textContent = 'Perbarui';
  titleInput.focus();

  // Scroll ke form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// -------------------------------------------------------
// HANDLE CHANGE TYPE
// -------------------------------------------------------

/**
 * Ubah tipe transaksi: income ↔ expense.
 * @param {number} id
 */
function handleChangeType(id) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return;

  transactions[idx].type =
    transactions[idx].type === 'income' ? 'expense' : 'income';

  saveToStorage();
  dispatchUpdate();
}

// -------------------------------------------------------
// HANDLE DELETE
// -------------------------------------------------------

/**
 * Hapus transaksi berdasarkan ID.
 * @param {number} id
 */
function handleDelete(id) {
  transactions = transactions.filter(t => t.id !== id);

  // Jika transaksi yang diedit dihapus, reset form
  if (editingId === id) {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Simpan';
  }

  saveToStorage();
  dispatchUpdate();
}

// -------------------------------------------------------
// SEARCH
// -------------------------------------------------------

// Live search: filter saat pengguna mengetik (input event)
searchInput.addEventListener('input', () => {
  searchKeyword = searchInput.value;
  renderTransactions(searchKeyword);
});

// Submit button pencarian (sebagai fallback)
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchKeyword = searchInput.value;
  renderTransactions(searchKeyword);
});

// -------------------------------------------------------
// INIT
// -------------------------------------------------------

/** Inisialisasi aplikasi saat halaman pertama kali dibuka */
function init() {
  loadFromStorage();
  dispatchUpdate();
}

init();
