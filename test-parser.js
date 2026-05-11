const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');
code = code.replace("document.addEventListener('DOMContentLoaded'", "//document.addEventListener('DOMContentLoaded'");
const text = `D26-2087/7011/HC03F-2S
Form Order Daily Home Catering (mohon di copy, paste dan isi)

Nama Penerima: Merry
No Wa: 0818886722
Apakah pernah order sebelumnya ya/tdk: tdk
Tahu Rantang Emas dari IG/Tiktok/Teman: IG
Alamat Pengiriman:
Ahmad Yani l / blok A no 4
Komplek golf BCS
Pisangan timur
Jakarta timur
Makan Siang/Makan Malam: (utk bw ktr jm 9 pg)
Paket Antar 7/14/21: 14
Size | 1 | 2-4 | 3-5 | 4-6 |orang: 2-4
Pilihan Pedas/Non pedas: sedang
Tanggal mulai pengiriman: 6 maret ( sabtu & minggu libur )
Harga paket: (di isi RE)
Ongkir: (di isi RE)
Total Harga: (di isi RE)
Catatan tambahan: tanpa nasi
jm 9 sdh sp lokasi
Harga Paket: Rp. 1.750.000
Ongkir: -
Jumlah: Rp. 1.750.000
Apakah perlu Invoice/Kwitansi : ya
Lokasi titip di lobby apartemen/office ada/tdk?:`;

fs.writeFileSync('test.js', code + `\ncurrentMode = 'Catering';\nconsole.log(extractOrderInfo(\`\n${text}\`\n));`);
