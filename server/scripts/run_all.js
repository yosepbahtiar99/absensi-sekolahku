const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scripts = [
  'seed_smp_tunas_baru.js',
  'alter-activity-clockout.js',
  'alter-activity-corporate.js',
  'alter-activity-final.js',
  'sync-daily-attendance.js',
  'update_admin_controller.js',
  'update_admin_controller_v2.js',
  'migrate-photo.js'
];

console.log('🏁 Memulai eksekusi semua script secara berurutan...\n');

scripts.forEach((scriptFile, index) => {
  const scriptPath = path.join(__dirname, scriptFile);
  console.log(`[${index + 1}/${scripts.length}] Menjalankan: node ${scriptFile}...`);

  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ File ${scriptFile} tidak ditemukan di path: ${scriptPath}\n`);
    return;
  }

  try {
    const output = execSync(`node "${scriptPath}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log(`✅ Selesai: node ${scriptFile}\n`);
  } catch (error) {
    console.error(`❌ Gagal menjalankan: node ${scriptFile}`);
    console.error(`Detail Error: ${error.message}\n`);
  }
});

console.log('🎉 Semua script telah selesai diproses.');
