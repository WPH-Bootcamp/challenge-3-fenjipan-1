// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Derik (WPH-056)
// KELAS: WPH-REP
// TANGGAL: 9 november 2025
// ============================================

// ============================================
// TAHAP 1: SETUP PROJECT
// ============================================

// Import module yang diperlukan
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Definisikan konstanta
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 detik
const DAYS_IN_WEEK = 7;

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// TAHAP 2: BUAT USER PROFILE OBJECT
// ============================================

const userProfile = {
  name: '',
  joinDate: new Date().toISOString(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Method untuk update statistik berdasarkan habits
  updateStats: function (habits) {
    // Hitung total habits
    this.totalHabits = habits.length;

    // Hitung total completed this week
    let total = 0;
    for (let i = 0; i < habits.length; i++) {
      total = total + habits[i].getThisWeekCompletions();
    }
    this.completedThisWeek = total;
  },

  // Method untuk menghitung berapa hari sejak bergabung
  getDaysJoined: function () {
    const now = new Date();
    const joined = new Date(this.joinDate);

    // Hitung selisih waktu dalam milidetik
    const diffTime = now - joined;

    // Konversi ke hari
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },
};

// ============================================
// TAHAP 3: BUAT HABIT CLASS
// ============================================

class Habit {
  constructor(name, targetFrequency) {
    // Generate ID unik
    this.id = Date.now().toString() + Math.random();
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = []; // Array kosong untuk menyimpan tanggal selesai
    this.createdAt = new Date().toISOString();
  }

  // Tandai habit sebagai selesai hari ini
  markComplete() {
    const now = new Date().toISOString();
    this.completions.push(now);
    console.log(`\n✅ Habit "${this.name}" berhasil diselesaikan!`);
  }

  // Hitung berapa kali habit diselesaikan dalam 7 hari terakhir
  getThisWeekCompletions() {
    // Buat tanggal 7 hari yang lalu
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - DAYS_IN_WEEK);

    // Filter completions yang lebih baru dari 7 hari lalu
    let count = 0;
    for (let i = 0; i < this.completions.length; i++) {
      const completionDate = new Date(this.completions[i]);
      if (completionDate >= oneWeekAgo) {
        count = count + 1;
      }
    }

    return count;
  }

  // Cek apakah habit sudah mencapai target minggu ini
  isCompletedThisWeek() {
    const completed = this.getThisWeekCompletions();
    if (completed >= this.targetFrequency) {
      return true;
    } else {
      return false;
    }
  }

  // Hitung persentase progress minggu ini
  getProgressPercentage() {
    const completed = this.getThisWeekCompletions();
    const target = this.targetFrequency;

    // Hitung persentase
    let percentage = (completed / target) * 100;

    // Maksimal 100%
    if (percentage > 100) {
      percentage = 100;
    }

    return percentage;
  }

  // Dapatkan status habit
  getStatus() {
    if (this.isCompletedThisWeek()) {
      return 'Selesai';
    } else {
      return 'Aktif';
    }
  }
}

// ============================================
// TAHAP 4: BUAT HABIT TRACKER CLASS
// ============================================

class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminderInterval = null;
  }

  // ========== CRUD OPERATIONS ==========

  // Tambah habit baru
  addHabit(name, frequency) {
    // Buat habit baru
    const newHabit = new Habit(name, frequency);

    // Tambahkan ke array habits
    this.habits.push(newHabit);

    // Update statistik user
    userProfile.updateStats(this.habits);

    console.log(`\n✅ Kebiasaan "${name}" berhasil ditambahkan!`);
    console.log(`   Target: ${frequency}x per minggu\n`);
  }

  // Tandai habit tertentu sebagai selesai
  completeHabit(habitIndex) {
    // Cek apakah index valid (gunakan nullish coalescing)
    const habit = this.habits[habitIndex - 1];

    if (!habit) {
      console.log('\n❌ Nomor kebiasaan tidak valid!\n');
      return;
    }

    // Tandai habit selesai
    habit.markComplete();

    // Update statistik
    userProfile.updateStats(this.habits);
  }

  // Hapus habit tertentu
  deleteHabit(habitIndex) {
    // Cek apakah index valid
    const habit = this.habits[habitIndex - 1];

    if (!habit) {
      console.log('\n❌ Nomor kebiasaan tidak valid!\n');
      return;
    }

    // Hapus habit dari array
    const deletedHabit = this.habits.splice(habitIndex - 1, 1)[0];

    // Update statistik
    userProfile.updateStats(this.habits);

    console.log(`\n🗑️  Kebiasaan "${deletedHabit.name}" berhasil dihapus!\n`);
  }

  // ========== DISPLAY METHODS ==========

  // Tampilkan profil pengguna
  displayProfile() {
    console.log('\n==================================================');
    console.log('PROFIL PENGGUNA');
    console.log('==================================================');

    // Gunakan nullish coalescing untuk handle null
    const displayName = userProfile.name || 'Guest';
    console.log(`Nama           : ${displayName}`);
    console.log(
      `Bergabung      : ${userProfile.getDaysJoined()} hari yang lalu`
    );
    console.log(`Total Kebiasaan: ${userProfile.totalHabits}`);
    console.log(`Selesai (7 hari): ${userProfile.completedThisWeek} kali`);
    console.log('==================================================\n');
  }

  // Tampilkan daftar habits dengan format lengkap
  displayHabits(filter) {
    console.log('\n==================================================');

    // Tampilkan judul berdasarkan filter
    if (filter === 'active') {
      console.log('KEBIASAAN AKTIF');
    } else if (filter === 'completed') {
      console.log('KEBIASAAN SELESAI');
    } else {
      console.log('SEMUA KEBIASAAN');
    }

    console.log('==================================================\n');

    // Cek apakah ada habits
    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan yang ditambahkan.\n');
      return;
    }

    // Filter habits sesuai parameter
    let filteredHabits = [];

    if (filter === 'completed') {
      // Ambil hanya yang selesai
      for (let i = 0; i < this.habits.length; i++) {
        if (this.habits[i].isCompletedThisWeek()) {
          filteredHabits.push(this.habits[i]);
        }
      }
    } else if (filter === 'active') {
      // Ambil hanya yang aktif
      for (let i = 0; i < this.habits.length; i++) {
        if (!this.habits[i].isCompletedThisWeek()) {
          filteredHabits.push(this.habits[i]);
        }
      }
    } else {
      // Ambil semua
      filteredHabits = this.habits;
    }

    // Cek apakah ada hasil filter
    if (filteredHabits.length === 0) {
      console.log(`Tidak ada kebiasaan dengan status: ${filter}\n`);
      return;
    }

    // Tampilkan setiap habit
    for (let i = 0; i < filteredHabits.length; i++) {
      const habit = filteredHabits[i];

      // Cari index asli di array habits
      let actualIndex = -1;
      for (let j = 0; j < this.habits.length; j++) {
        if (this.habits[j].id === habit.id) {
          actualIndex = j + 1;
          break;
        }
      }

      const completed = habit.getThisWeekCompletions();
      const target = habit.targetFrequency;
      const progress = habit.getProgressPercentage();
      const status = habit.getStatus();

      console.log(`${actualIndex}. [${status}] ${habit.name}`);
      console.log(`   Target: ${target}x/minggu`);
      console.log(
        `   Progress: ${completed}/${target} (${Math.round(progress)}%)`
      );

      // Buat progress bar
      const filled = Math.round(progress / 10);
      const empty = 10 - filled;

      let progressBar = '   Progress Bar: ';

      // Tambahkan simbol terisi
      for (let j = 0; j < filled; j++) {
        progressBar = progressBar + '█';
      }

      // Tambahkan simbol kosong
      for (let j = 0; j < empty; j++) {
        progressBar = progressBar + '░';
      }

      progressBar = progressBar + ' ' + Math.round(progress) + '%';

      console.log(progressBar);
      console.log('');
    }
  }

  // Tampilkan habits menggunakan WHILE LOOP
  displayHabitsWithWhile() {
    console.log('\n==================================================');
    console.log('DEMO WHILE LOOP');
    console.log('==================================================\n');

    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan yang ditambahkan.\n');
      return;
    }

    // Gunakan while loop
    let i = 0;
    while (i < this.habits.length) {
      const habit = this.habits[i];
      const completed = habit.getThisWeekCompletions();
      const target = habit.targetFrequency;
      const status = habit.getStatus();

      console.log(
        `${i + 1}. ${habit.name} - [${status}] (${completed}/${target})`
      );

      i = i + 1; // increment
    }

    console.log('');
  }

  // Tampilkan habits menggunakan FOR LOOP
  displayHabitsWithFor() {
    console.log('\n==================================================');
    console.log('DEMO FOR LOOP');
    console.log('==================================================\n');

    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan yang ditambahkan.\n');
      return;
    }

    // Gunakan for loop
    for (let i = 0; i < this.habits.length; i++) {
      const habit = this.habits[i];
      const completed = habit.getThisWeekCompletions();
      const target = habit.targetFrequency;
      const status = habit.getStatus();

      console.log(
        `${i + 1}. ${habit.name} - [${status}] (${completed}/${target})`
      );
    }

    console.log('');
  }

  // Tampilkan statistik lengkap
  displayStats() {
    console.log('\n==================================================');
    console.log('STATISTIK KEBIASAAN');
    console.log('==================================================\n');

    if (this.habits.length === 0) {
      console.log('Belum ada data untuk ditampilkan.\n');
      return;
    }

    const totalHabits = this.habits.length;

    // Hitung berapa yang selesai
    let completedCount = 0;
    for (let i = 0; i < this.habits.length; i++) {
      if (this.habits[i].isCompletedThisWeek()) {
        completedCount = completedCount + 1;
      }
    }

    // Hitung berapa yang aktif
    const activeCount = totalHabits - completedCount;

    // Hitung completion rate
    let completionRate = 0;
    if (totalHabits > 0) {
      completionRate = (completedCount / totalHabits) * 100;
    }

    // Hitung total completions
    let totalCompletions = 0;
    for (let i = 0; i < this.habits.length; i++) {
      totalCompletions =
        totalCompletions + this.habits[i].getThisWeekCompletions();
    }

    // Hitung total target
    let totalTarget = 0;
    for (let i = 0; i < this.habits.length; i++) {
      totalTarget = totalTarget + this.habits[i].targetFrequency;
    }

    console.log(`Total Kebiasaan     : ${totalHabits}`);
    console.log(`Kebiasaan Selesai   : ${completedCount}`);
    console.log(`Kebiasaan Aktif     : ${activeCount}`);
    console.log(`Tingkat Penyelesaian: ${completionRate.toFixed(1)}%`);
    console.log(
      `Total Progress      : ${totalCompletions}/${totalTarget} kali\n`
    );

    // Daftar nama habits
    console.log('Daftar Kebiasaan:');
    for (let i = 0; i < this.habits.length; i++) {
      console.log(`  ${i + 1}. ${this.habits[i].name}`);
    }
    console.log('');
  }

  // ========== REMINDER SYSTEM ==========

  // Aktifkan reminder otomatis
  startReminder() {
    // Cek apakah reminder sudah aktif
    if (this.reminderInterval) {
      console.log('\n⏰ Reminder sudah aktif!\n');
      return;
    }

    // Buat tracker variable untuk diakses di dalam setInterval
    const tracker = this;

    // Aktifkan setInterval
    this.reminderInterval = setInterval(function () {
      tracker.showReminder();
    }, REMINDER_INTERVAL);

    const seconds = REMINDER_INTERVAL / 1000;
    console.log(`\n⏰ Reminder diaktifkan! (setiap ${seconds} detik)\n`);
  }

  // Tampilkan reminder untuk habits yang belum selesai
  showReminder() {
    // Cari habits yang belum selesai
    let activeHabits = [];
    for (let i = 0; i < this.habits.length; i++) {
      if (!this.habits[i].isCompletedThisWeek()) {
        activeHabits.push(this.habits[i]);
      }
    }

    // Jika ada habits aktif, tampilkan reminder
    if (activeHabits.length > 0) {
      const firstHabit = activeHabits[0];

      console.log('\n==================================================');
      console.log(`REMINDER: Jangan lupa "${firstHabit.name}"!`);
      console.log('==================================================\n');
    }
  }

  // Matikan reminder
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('\n⏰ Reminder dimatikan!\n');
    } else {
      console.log('\n⏰ Reminder tidak aktif!\n');
    }
  }

  // ========== FILE OPERATIONS ==========

  // Simpan data ke file JSON
  saveToFile() {
    // Buat object data untuk disimpan
    const data = {
      userProfile: userProfile,
      habits: this.habits,
    };

    try {
      // Konversi object ke JSON string
      const jsonData = JSON.stringify(data, null, 2);

      // Tulis ke file
      fs.writeFileSync(DATA_FILE, jsonData);

      console.log('\n💾 Data berhasil disimpan ke file!\n');
    } catch (error) {
      console.log('\n❌ Error menyimpan data:', error.message, '\n');
    }
  }

  // Muat data dari file JSON
  loadFromFile() {
    try {
      // Cek apakah file ada
      if (!fs.existsSync(DATA_FILE)) {
        return false;
      }

      // Baca file
      const jsonData = fs.readFileSync(DATA_FILE, 'utf8');

      // Parse JSON string ke object
      const data = JSON.parse(jsonData);

      // Restore user profile
      if (data.userProfile) {
        userProfile.name = data.userProfile.name || '';
        userProfile.joinDate =
          data.userProfile.joinDate || new Date().toISOString();
        userProfile.totalHabits = data.userProfile.totalHabits || 0;
        userProfile.completedThisWeek = data.userProfile.completedThisWeek || 0;
      }

      // Restore habits
      if (data.habits && data.habits.length > 0) {
        this.habits = [];

        for (let i = 0; i < data.habits.length; i++) {
          const h = data.habits[i];

          // Buat habit baru
          const habitName = h.name || 'Untitled';
          const habitFrequency = h.targetFrequency || 1;
          const habit = new Habit(habitName, habitFrequency);

          // Restore properties
          habit.id = h.id || Date.now().toString();
          habit.completions = h.completions || [];
          habit.createdAt = h.createdAt || new Date().toISOString();

          this.habits.push(habit);
        }
      }

      console.log('\n💾 Data berhasil dimuat dari file!\n');
      return true;
    } catch (error) {
      console.log('\n❌ Error memuat data:', error.message, '\n');
      return false;
    }
  }

  // Hapus semua data
  clearAllData() {
    this.habits = [];
    userProfile.totalHabits = 0;
    userProfile.completedThisWeek = 0;

    // Hapus file jika ada
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }

    console.log('\n🗑️  Semua data berhasil dihapus!\n');
  }
}

// ============================================
// TAHAP 5: BUAT CLI INTERFACE
// ============================================

function askQuestion(question) {
  return new Promise(function (resolve) {
    rl.question(question, function (answer) {
      resolve(answer);
    });
  });
}

// Tampilkan menu utama
function displayMenu() {
  console.log('\n==================================================');
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('==================================================');
}

// Handle pilihan menu dengan switch-case
async function handleMenu(tracker) {
  let running = true;

  // Loop sampai user pilih keluar
  while (running) {
    displayMenu();

    const choice = await askQuestion('\nPilih menu (0-9): ');

    // Handle pilihan dengan switch-case
    switch (choice) {
      case '1':
        // Lihat Profil
        tracker.displayProfile();
        break;

      case '2':
        // Lihat Semua Kebiasaan
        tracker.displayHabits('all');
        break;

      case '3':
        // Lihat Kebiasaan Aktif
        tracker.displayHabits('active');
        break;

      case '4':
        // Lihat Kebiasaan Selesai
        tracker.displayHabits('completed');
        break;

      case '5':
        // Tambah Kebiasaan Baru
        const name = await askQuestion('Nama kebiasaan: ');
        const frequency = await askQuestion('Target per minggu (1-7): ');

        // Parse string ke number
        const freq = parseInt(frequency);

        // Validasi input
        if (freq >= 1 && freq <= 7) {
          tracker.addHabit(name, freq);
        } else {
          console.log('\n❌ Frekuensi harus antara 1-7!\n');
        }
        break;

      case '6':
        // Tandai Kebiasaan Selesai
        tracker.displayHabits('all');

        if (tracker.habits.length > 0) {
          const index = await askQuestion('Nomor kebiasaan yang selesai: ');
          tracker.completeHabit(parseInt(index));
        }
        break;

      case '7':
        // Hapus Kebiasaan
        tracker.displayHabits('all');

        if (tracker.habits.length > 0) {
          const index = await askQuestion(
            'Nomor kebiasaan yang akan dihapus: '
          );
          tracker.deleteHabit(parseInt(index));
        }
        break;

      case '8':
        // Lihat Statistik
        tracker.displayStats();
        break;

      case '9':
        // Demo Loop
        console.log('\n==================================================');
        console.log('DEMO LOOP - PILIH JENIS LOOP');
        console.log('==================================================');
        console.log('1. While Loop');
        console.log('2. For Loop');
        console.log('==================================================');

        const loopChoice = await askQuestion('\nPilih (1-2): ');

        if (loopChoice === '1') {
          tracker.displayHabitsWithWhile();
        } else if (loopChoice === '2') {
          tracker.displayHabitsWithFor();
        } else {
          console.log('\n❌ Pilihan tidak valid!\n');
        }
        break;

      case '0':
        // Keluar & Simpan
        console.log('\n💾 Menyimpan data...');
        tracker.saveToFile();
        tracker.stopReminder();
        console.log(
          '👋 Terima kasih! Semoga konsisten dengan kebiasaan Anda!\n'
        );
        running = false;
        break;

      default:
        console.log('\n❌ Pilihan tidak valid! Pilih 0-9.\n');
    }

    // Tunggu user tekan Enter sebelum lanjut
    if (running) {
      await askQuestion('\nTekan Enter untuk melanjutkan...');
      console.clear();
    }
  }
}

// ============================================
// TAHAP 6: BUAT MAIN FUNCTION
// ============================================

async function main() {
  try {
    console.clear();

    // Tampilkan banner
    console.log('\n==================================================');
    console.log('    🎯 SELAMAT DATANG DI HABIT TRACKER CLI    ');
    console.log('       Bangun Kebiasaan Baik Anda!            ');
    console.log('==================================================\n');

    // Buat instance HabitTracker
    const tracker = new HabitTracker();

    // Coba load data yang sudah ada
    const dataLoaded = tracker.loadFromFile();

    // Jika belum ada data, tanya nama user
    if (!dataLoaded || !userProfile.name) {
      const name = await askQuestion('Masukkan nama Anda: ');
      userProfile.name = name;

      console.log(`\nHalo ${name}! Mari mulai membangun kebiasaan baik! 🚀\n`);

      const enableReminder = await askQuestion(
        'Aktifkan reminder otomatis? (y/n): '
      );

      if (enableReminder === 'y' || enableReminder === 'Y') {
        tracker.startReminder();
      }
    } else {
      console.log(`\nSelamat datang kembali, ${userProfile.name}! 🎉\n`);
    }

    await askQuestion('Tekan Enter untuk melanjutkan...');
    console.clear();

    // Panggil handleMenu untuk mulai aplikasi
    await handleMenu(tracker);
  } catch (error) {
    console.error('\n❌ Terjadi error:', error.message);
  } finally {
    rl.close();
  }
}

// ============================================
// TAHAP 7: JALANKAN APLIKASI
// ============================================

main().catch(function (error) {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
