// Schema Exact Order 
const schemaMealbox = [
    'no_cust', 'no_order', 'nama', 'no_wa', 'tipe_customer', 'kategori',
    'pesanan', 'status', 'jenis_paket', 'jumlah', 'alamat', 'area', 
    'tanggal', 'jam_kirim', 'harga', 'ongkir', 'total', 'terbilang_total', 'catatan', 'invoice'
];

const schemaCatering = [
    'no_cust', 'no_order', 'nama', 'no_wa', 'tipe_customer', 'kategori', 'jenis_paket', 'status', 'level_pedas',
    'durasi_katering', 'alamat', 'area', 'sesi_makan', 'tanggal', 'harga', 'ongkir', 'total', 'terbilang_total', 'catatan', 'porsi_katering', 'kategori_porsi', 'invoice', 'lokasi_titip'
];

const schemaTumpeng = [
    'no_cust', 'no_order', 'nama', 'no_wa', 'tipe_customer', 'status', 'alamat', 'area', 
    'tanggal', 'jam_kirim', 'pesanan', 'jumlah', 'harga', 'ongkir', 'total', 'terbilang_total', 
    'kartu_ucapan', 'catatan', 'invoice'
];

let currentMode = 'Mealbox';
let parsedData = {};

function init() {
    renderResults();
}

function setMode(mode) {
    currentMode = mode;
    
    // UI Update Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + mode).classList.add('active');
    
    // Clear
    let txtArea = document.getElementById('inputText');
    txtArea.value = '';
    txtArea.placeholder = `Paste order text ${mode} here...`;
    
    // Kembalikan ke tampilan fokus di tengah saat form kosong
    document.getElementById('mainContainer').classList.add('initial-view');
    
    document.getElementById('parseBtn').innerText = `Parse Data ${mode}`;
    document.getElementById('resultTitle').innerText = `Hasil ${mode}`;
    
    parsedData = {};
    renderResults();
}

function renderResults() {
    const list = document.getElementById('resultsList');
    list.innerHTML = '';
    
    let activeSchema = schemaMealbox;
    if (currentMode === 'Catering') activeSchema = schemaCatering;
    else if (currentMode === 'Tumpeng') activeSchema = schemaTumpeng;

    // Kita pisahkan urutan Tampilan UI (Visual) agar tidak merusak urutan Copy Format Spreadsheet!
    let displayKeys = [...activeSchema];
    if (currentMode === 'Catering') {
        const sesiIndex = displayKeys.indexOf('sesi_makan');
        if (sesiIndex !== -1) displayKeys.splice(sesiIndex, 1); // Extract sesi_makan
        
        const lokIndex = displayKeys.indexOf('lokasi_titip');
        if (lokIndex !== -1) displayKeys.splice(lokIndex, 1); // Extract lokasi_titip
        
        // 1. Masukkan lokasi_titip tepat di Bawah Catatan
        const catIndex = displayKeys.indexOf('catatan');
        if (catIndex !== -1) displayKeys.splice(catIndex + 1, 0, 'lokasi_titip');
        
        // 2. Masukkan sesi_makan tepat di Atas invoice (biar kumpul di bawah bareng highlight)
        const invIndex = displayKeys.indexOf('invoice');
        if (invIndex !== -1) displayKeys.splice(invIndex, 0, 'sesi_makan');
    }

    displayKeys.forEach((key, index) => {
        const val = parsedData[key] || '';
        const item = document.createElement('div');
        item.className = 'result-item';
        
        // Block yang di-highlight di bagian bawah Catering
        if (key === 'invoice' || key === 'sesi_makan' || key === 'porsi_katering' || key === 'kategori_porsi') {
            item.classList.add('highlight-important');
        }
        
        if (key === 'porsi_katering' || key === 'kategori_porsi') {
            item.classList.add('half-width');
        }
        
        // Clean key
        let labelStr = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (key === 'jam_kirim') {
            labelStr = 'Slot Durasi Tiba Pengiriman 1,2,3,4';
        }
        if (currentMode === 'Mealbox' && key === 'tipe_customer') {
            labelStr = 'Nama Perusahaan';
        }
        if (currentMode === 'Mealbox' && key === 'jenis_paket') {
            labelStr = 'Meal Box Value/Reguler/Sultan';
        }
        if (currentMode === 'Tumpeng' && key === 'catatan') {
            labelStr = 'Note Tambahan';
        }

        item.innerHTML = `
            <div class="head-row">
                <div class="item-label">[${labelStr}]</div>
                <button class="btn-copy" onclick="copyToClipboard('${key}', this)">Copy</button>
            </div>
            <div class="item-value" id="val-${key}">${val}</div>
        `;
        
        // Stagger Animation (Kartu muncul efek domino)
        item.style.animationDelay = `${index * 0.05}s`;
        list.appendChild(item);
    });
}

function notCapslock(str) {
    if (!str) return str;
    let lower = str.toLowerCase();
    
    // Normalisasi awalan 'pt' agar selalu ada spasi setelahnya misal 'pt.bca' -> 'pt. bca'
    lower = lower.replace(/\bpt\b\.?\s*/g, 'pt. ');
    
    let result = lower.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').trim();
    
    // Kembalikan pt yg sudah diawali kapital menjadi singkatan baku PT.
    result = result.replace(/\bPt\.\s*/g, 'PT. ');
    
    // Hapus dobel spasi jika ada
    return result.replace(/\s+/g, ' ').trim();
}

function terbilang(angka) {
    const b = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (angka < 12) return b[angka];
    if (angka < 20) return terbilang(angka - 10) + " Belas";
    if (angka < 100) return terbilang(Math.floor(angka / 10)) + " Puluh " + terbilang(angka % 10);
    if (angka < 200) return "Seratus " + terbilang(angka - 100);
    if (angka < 1000) return terbilang(Math.floor(angka / 100)) + " Ratus " + terbilang(angka % 100);
    if (angka < 2000) return "Seribu " + terbilang(angka - 1000);
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " Ribu " + terbilang(angka % 1000);
    if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " Juta " + terbilang(angka % 1000000);
    return "";
}

function copyToClipboard(key, btnRef) {
    const val = parsedData[key] || '';
    navigator.clipboard.writeText(val).then(() => {
        const originalText = btnRef.innerText;
        btnRef.innerText = 'Copied!';
        btnRef.classList.add('copied');
        setTimeout(() => {
            btnRef.innerText = originalText;
            btnRef.classList.remove('copied');
        }, 2000);
    }).catch(err => console.error(err));
}

function copyAll() {
    let activeSchema = schemaMealbox;
    if (currentMode === 'Catering') activeSchema = schemaCatering;
    else if (currentMode === 'Tumpeng') activeSchema = schemaTumpeng;

    let textToCopy = '';
    activeSchema.forEach(key => {
        const val = parsedData[key] || '';
        textToCopy += `${val}\t`;
    });
    
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        alert(`Data ${currentMode} berhasil di-copy ke clipboard (Tab-separated).\nSilahkan paste ke Spreadsheet.`);
    }).catch(err => console.error(err));
}

function copyFormatWA() {
    let output = '';
    
    // Check missing fields gracefully
    const getVal = (key) => parsedData[key] || '';
    
    if (currentMode === 'Mealbox') {
        output = `Mealbox:
${getVal('no_order')}/${getVal('no_cust')}
Form Order Meal Box (mohon di copy, paste dan isi)

Nama Penerima: ${getVal('nama')}

Nama Perusahaan: ${getVal('tipe_customer') === 'Pribadi' ? '-' : getVal('tipe_customer')}

No Wa: ${getVal('no_wa')}

Apakah pernah Order sebelumnya Ya/Tdk: ${getVal('status') === 'Repeater' ? 'ya' : 'tidak'}

Alamat pengiriman: ${getVal('alamat')}

Tanggal Pengiriman : ${getVal('tanggal')}

Slot Durasi Tiba Pengiriman 1,2,3,4: ${getVal('jam_kirim')}

Meal Box Value/Reguler/Sultan: ${getVal('jenis_paket')}

Nama Paket : ${getVal('pesanan')}

Jumlah Pesanan : ${getVal('jumlah')}

Harga: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}

Ongkir: ${getVal('ongkir') ? 'Rp. ' + getVal('ongkir') : ''}

Jumlah: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}

Catatan tambahan apabila ada: ${getVal('catatan')}

Apakah perlu Invoice/Kwitansi : ${getVal('invoice') ? 'ya' : 'tidak'}`;

    } else if (currentMode === 'Catering') {
        output = `Catering:
${getVal('no_order')}/${getVal('no_cust')}
Form Order Daily Home Catering (mohon di copy, paste dan isi)

Nama Penerima: ${getVal('nama')}

No Wa: ${getVal('no_wa')}

Apakah pernah order sebelumnya ya/tdk: ${getVal('status') === 'Repeater' ? 'ya' : 'tidak'}

Alamat Pengiriman: ${getVal('alamat')}

Makan Siang/Makan Malam: ${getVal('sesi_makan')}

Paket Antar 7/14/21: ${getVal('durasi_katering').replace('x','')}

Size | 1 | 2-4 | 3-5 | 4-6 |orang: ${getVal('porsi_katering')}

Pilihan Pedas/Non pedas: ${getVal('level_pedas')}

Tanggal mulai pengiriman: ${getVal('tanggal')}

Harga paket: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}

Ongkir: ${getVal('ongkir') ? 'Rp. ' + getVal('ongkir') : ''}

Total Harga: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}

Catatan tambahan: ${getVal('catatan')}

Apakah perlu Invoice/Kwitansi : ${getVal('invoice') ? 'ya' : 'tidak'}

Lokasi titip di lobby apartemen/office ada/tdk? : ${getVal('lokasi_titip')}`;

    } else if (currentMode === 'Tumpeng') {
        output = `Tumpeng:
${getVal('no_order')}/${getVal('no_cust')}
Form Order Tumpeng (mohon di copy, paste dan isi)

Nama Penerima: ${getVal('nama')}

Nama perusahaan: ${getVal('tipe_customer') === 'Pribadi' ? '-' : getVal('tipe_customer')}

No Wa penerima: ${getVal('no_wa')}

Apakah pernah order sebelumnya Ya/Tdk: ${getVal('status') === 'Repeater' ? 'ya' : 'tdk'}

Alamat pengiriman: ${getVal('alamat')}

Tanggal Pengiriman: ${getVal('tanggal')}

Slot durasi tiba 1,2,3,4: ${getVal('jam_kirim')}

Jenis Tumpeng Premium/Standart/Mini/Tart: ${getVal('pesanan')}

Jumlah Pesanan : ${getVal('jumlah')}

Harga: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}

Ongkir: ${getVal('ongkir') ? 'Rp. ' + getVal('ongkir') : ''}

Jumlah: ${getVal('total') ? 'Rp. ' + getVal('total') : ''}
${getVal('kartu_ucapan') || 'Isi Kartu Ucapan (apabila ada): -'}

Note Tambahan (apabila ada): ${getVal('catatan')}

Apakah perlu Invoice/Kwitansi : ${getVal('invoice') ? 'ya' : 'tdk'}`;
    }
    
    // Text area is not overwritten to maintain original text format
    
    navigator.clipboard.writeText(output).then(() => {
        alert("Formulir dengan format rapih WhatsApp berhasil di-copy!");
    }).catch(err => console.error(err));
}

function smartGroupText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lower = line.toLowerCase();
        
        // Pisahkan 2 baris awal (ID Order dan Judul Formulir) dari isi data
        if (i === 1 && result.length > 0) {
            result.push(line);
            result.push(''); 
            continue;
        }
        
        // Deteksi pergantian section agar dikelompokkan dengan cantik
        let isSectionBreak = 
            lower.startsWith('alamat') ||
            lower.startsWith('makan siang') || lower.startsWith('pesanan') || lower.startsWith('jenis') || lower.startsWith('meal box') ||
            lower.startsWith('harga') || lower.startsWith('ongkir') ||
            lower.startsWith('catatan') || lower.startsWith('note') || lower.startsWith('isi kartu') || lower.startsWith('apakah perlu invoice');
            
        // Masukkan jarak kosong JIKA ini section baru dan atasnya bukan baris kosong
        if (isSectionBreak && result.length > 0 && result[result.length - 1] !== '') {
            result.push('');
        }
        
        result.push(line);
    }
    return result.join('\n');
}

// Core init
document.addEventListener('DOMContentLoaded', () => {
    
    // Cek preferensi tema sebelumnya
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeBtn').innerHTML = sunSvg;
    }
    init();
});

function parseText() {
    const txtArea = document.getElementById('inputText');
    const text = txtArea.value;
    if (!text.trim()) return;

    // Format & kelompokkan bagian text tanpa menghilangkan huruf agar nyaman di mata
    const tidiedText = smartGroupText(text);
    txtArea.value = tidiedText;

    // Trigger Pergeseran CSS (Expand ke side-by-side)
    const mainCont = document.getElementById('mainContainer');
    if (mainCont && mainCont.classList.contains('initial-view')) {
        mainCont.classList.remove('initial-view');
    }

    parsedData = extractOrderInfo(tidiedText);
    renderResults();
}

function extractOrderInfo(text) {
    const data = {};
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const textLower = text.toLowerCase();

    let activeSchema = schemaMealbox;
    if (currentMode === 'Catering') activeSchema = schemaCatering;
    if (currentMode === 'Tumpeng') activeSchema = schemaTumpeng;
    
    activeSchema.forEach(k => { data[k] = ''; });
    if (currentMode === 'Mealbox') data.kategori = 'Mealbox';

    const orderCustMatch = text.match(/([a-zA-Z0-9-\s]+)\/\s*(\d+)/);
    if (orderCustMatch) {
        data.no_order = orderCustMatch[1].replace(/\s+/g, '').toUpperCase();
        data.no_cust = orderCustMatch[2];
    }
    
    const explicitWaMatch = text.match(/(?:wa|phone|hp|telepon|whatsapp)[^:]*:\s*([0-9\-\+\s]+)/i);
    let wa = explicitWaMatch ? explicitWaMatch[1].replace(/\D/g, '') : '';
    if (!wa) {
        const anyNumber = text.match(/((?:08|628)\d{8,12})/);
        if (anyNumber) wa = anyNumber[1];
    }
    data.no_wa = formatPhone(wa);
    
    const namaMatch = text.match(/(?:nama penerima \d+|nama penerima|nama|atas nama)[^:]*:\s*([^\d\n]+)/i);
    if (namaMatch) {
        let rawN = namaMatch[1].replace(/(?:08|628)\d+/, ''); 
        data.nama = notCapslock(rawN.replace(/[^a-zA-Z\s\-]/g, '').trim()); 
    }

    if (currentMode === 'Mealbox' || currentMode === 'Tumpeng' || currentMode === 'Catering') {
        const perusahaanMatch = text.match(/(?:perusahaan|company)[^:]*:\s*(.*)/i);
        let namaPerusahaan = perusahaanMatch ? perusahaanMatch[1].trim() : '';
        data.tipe_customer = (!namaPerusahaan || namaPerusahaan === '-') ? 'Pribadi' : notCapslock(namaPerusahaan);
    }
    
    if (currentMode === 'Catering') {
        data.kategori = 'Home Catering';
        
        const formTitleMatch = text.match(/Form Order Daily Home Catering/i);
        if (formTitleMatch) data.jenis_paket = 'Homecatering';
    }
    
    if (currentMode === 'Mealbox' || currentMode === 'Catering' || currentMode === 'Tumpeng') {
        const statusMatch = text.match(/(?:status|pernah|order sebelumnya)[^:]*:\s*(.*)/i);
        let statusRaw = statusMatch ? statusMatch[1].toLowerCase().trim() : '';
        
        // Logika Status: Cek yg mengarah ke "New" TERLEBIH DAHULU agar frasa "blm pernah" tertangkap sebagai New.
        if (/(belum|blm|tdk|tidak|no|never|ngga|engga)/i.test(statusRaw)) {
            data.status = 'New';
        } else if (/(sudah|sdh|pernah|\bya\b|\byes\b|\by\b)/i.test(statusRaw)) {
            data.status = 'Repeater';
        } else {
            data.status = 'New'; // Default
        }
    }

    let alamatIndex = lines.findIndex(l => l.toLowerCase().startsWith('alamat'));
    if (alamatIndex !== -1) {
        let alamatLines = [];
        let firstA = lines[alamatIndex].replace(/^alamat.*?:\s*/i, '').trim();
        if (firstA) alamatLines.push(firstA);
        
        let i = alamatIndex + 1;
        while (i < lines.length && !/^(?:tanggal|jam|slot|makan siang|makan malam|paket antar|size|pilihan|jenis|meal box|nama paket|pesanan|jumlah|total|ongkir|harga|catatan)/i.test(lines[i])) {
            alamatLines.push(lines[i]);
            i++;
        }
        data.alamat = notCapslock(alamatLines.join(' ').replace(/\s+/g, ' ').trim());
    } else {
        const alamatMatch = text.match(/(?:alamat|address)[^:]*:\s*(.+)/i);
        if (alamatMatch) data.alamat = notCapslock(alamatMatch[1].trim());
    }
    
    data.area = notCapslock(detectArea(data.alamat || text));

    if (currentMode === 'Catering') {
        const pktAntarMatch = text.match(/paket antar[^:]*:\s*(\d+)/i);
        if (pktAntarMatch) data.durasi_katering = pktAntarMatch[1] + 'x';

        const sizeMatch = text.match(/size[^\n:]*:\s*([0-9a-zA-Z\- ]+)/i);
        if (sizeMatch) {
            let porsi = sizeMatch[1].trim().replace(/orang/i, '').trim();
            data.porsi_katering = porsi + ' Orang';
            
            // Kategori Porsi Logic
            if (porsi === '1') {
                data.kategori_porsi = 'Personal';
            } else if (porsi === '2-4') {
                data.kategori_porsi = 'Reguler';
            } else if (porsi === '3-5') {
                data.kategori_porsi = 'Upsize';
            } else if (porsi === '4-6') {
                data.kategori_porsi = 'Jumbo';
            } else {
                data.kategori_porsi = 'Reguler'; // Fallback
            }
        }

        const pedasMatch = text.match(/(?:pilihan )?pedas.*:\s*(.*)/i);
        if (pedasMatch) data.level_pedas = notCapslock(pedasMatch[1].trim());

        const sesiMatch = text.match(/(?:makan siang|makan malam)[^:]*:[^\n\S]*(.*)/i);
        if (sesiMatch) {
            let rawSesi = sesiMatch[1].trim().replace(/[\(\)]/g, '');
            // Pastikan singkatan mlm jadi malam
            rawSesi = rawSesi.replace(/\bmlm\b/gi, 'Malam');
            data.sesi_makan = notCapslock(rawSesi);
        }

        const lokasiMatch = text.match(/lokasi titip[^:]*:\s*(.*)/i);
        if (lokasiMatch) data.lokasi_titip = notCapslock(lokasiMatch[1].trim());

    } else if (currentMode === 'Tumpeng') {
        const jenisMatch = text.match(/jenis tumpeng[^:]*:\s*(.*)/i);
        if (jenisMatch) data.pesanan = notCapslock(`Tumpeng ${jenisMatch[1].trim()}`);
        const kartuMatch = text.match(/isi kartu ucapan[^:]*:\s*(.*)/i);
        if (kartuMatch) {
            let ucp = kartuMatch[1].trim();
            if (ucp && ucp.toLowerCase().indexOf('di isi') === -1) {
                data.kartu_ucapan = `Isi Kartu Ucapan (apabila ada): ${notCapslock(ucp)}`;
            } else {
                data.kartu_ucapan = `Isi Kartu Ucapan (apabila ada): -`;
            }
        }
        
        const jamTibaMatch = text.match(/(?:jam tiba|slot)[^:]*:\s*(.*)/i);
        if (jamTibaMatch) data.jam_kirim = notCapslock(jamTibaMatch[1].replace(/sampai/i, '').trim());

    } else {
        let pesananIndex = lines.findIndex(l => l.toLowerCase().startsWith('pesanan') || l.toLowerCase().startsWith('nama paket'));
        if (pesananIndex !== -1) {
            let pesananLines = [];
            let firstP = lines[pesananIndex].replace(/^(?:pesanan|nama paket).*?:/i, '').trim();
            if (firstP) pesananLines.push(firstP);
            let i = pesananIndex + 1;
            while (i < lines.length && !/^(?:jumlah|qty|harga|ongkir|total|catatan|slot|tanggal)/i.test(lines[i])) {
                pesananLines.push(lines[i]); i++;
            }
            data.pesanan = notCapslock(pesananLines.join(', ').replace(/\s+/g, ' ').trim());
        } else {
            const pesananMatch = text.match(/(?:pesanan|order)[^:]*:\s*(.+)/i);
            if (pesananMatch) data.pesanan = notCapslock(pesananMatch[1].trim());
        }

        const jpMatch = text.match(/(?:jenis paket|paket|meal box.*?value|value\s*\/?\s*reguler\s*\/?\s*sultan)[^:]*:\s*(.+)/i);
        if (jpMatch) data.jenis_paket = notCapslock(jpMatch[1].trim());
        
        const slotMatch = text.match(/(?:slot|durasi tiba)[^:]*:\s*(.*)/i);
        if (slotMatch) {
            let sVal = slotMatch[1].trim();
            // Jika hanya diisi angka saja (misal "2"), tambahkan "Slot " di depannya
            if (/^\d+$/.test(sVal)) {
                data.jam_kirim = `Slot ${sVal}`;
            } else {
                data.jam_kirim = notCapslock(sVal);
            }
        }
    }

    if (currentMode === 'Mealbox' || currentMode === 'Tumpeng') {
        const paxMatch = text.match(/(?:jumlah pesanan|jumlah pax|qty|jumlah)[^:]*:\s*.*?(\d+)/i);
        if (paxMatch) data.jumlah = paxMatch[1]; 
    }

    // HARGA ASLI (Harga / Harga Paket per pax)
    let hargaVal = '';
    for (let l of lines) {
        let match = l.match(/^harga(?: paket)?[^:]*:\s*(.*)/i);
        if (match) {
            hargaVal = match[1].trim();
            break; // Ambil yang pertama (karena biasanya Harga Asli di atas)
        }
    }
    if (hargaVal && hargaVal.toLowerCase().indexOf('di isi') === -1) {
        let cleanedHarga = notCapslock(hargaVal);
        data.harga = cleanedHarga.replace(/rp\s*\.?\s*/gi, '').replace(/\./g, ',');
    }

    let finalStr = '';
    
    // Cari "Total Harga" atau "Total" terlebih dahulu (scan dari bawah supaya dapat total akhir)
    for (let i = lines.length - 1; i >= 0; i--) {
        let l = lines[i];
        let match = l.match(/(?:total harga|total)[^:]*:\s*(.*)/i);
        if (match && match[1].toLowerCase().indexOf('di isi') === -1) {
            finalStr = match[1].trim();
            break;
        }
    }
    
    // Jika tidak ada "Total Harga", cari kata "Jumlah:" tapi di-scan dari BAWAH.
    // Hal ini agar jika ada 2 kata "Jumlah:" (satu untuk porsi makanan, satu untuk uang total),
    // kita akan selalu dapat yang uang total (karena posisi uang selalu di bawah).
    if (!finalStr) {
        for (let i = lines.length - 1; i >= 0; i--) {
            let l = lines[i];
            let match = l.match(/^jumlah[^:]*:\s*(.*)/i);
            if (match && match[1].toLowerCase().indexOf('di isi') === -1) {
                let val = match[1].trim();
                let nums = val.match(/\d[\d\.,]*/g);
                if (nums) {
                    let checkVal = parseInt(nums[nums.length-1].replace(/\D/g, ''), 10);
                    // Pastikan nilainya adalah Nominal Uang (contoh >= 1000)
                    if (checkVal >= 1000) {
                        finalStr = val;
                        break;
                    }
                }
            }
        }
    }
    
    // Fallback terakhir: jika sama sekali tidak ada Total / Jumlah,
    // total = harga.
    if (!finalStr) {
        if (hargaVal && hargaVal.toLowerCase().indexOf('di isi') === -1) {
            finalStr = hargaVal;
        }
    }

    if (finalStr) {
        // Hapus 'Rp', 'Rp.', dsb, dan ubah semua titik (.) jadi koma (,) agar mudah di spreadsheet
        let cleanedTotal = notCapslock(finalStr.trim());
        data.total = cleanedTotal.replace(/rp\s*\.?\s*/gi, '').replace(/\./g, ',');
        
        // Pengecekan cerdas untuk terbilang: kalau ada angka besar di akhir string
        let nums = finalStr.match(/\d[\d\.,]*/g);
        if (nums && nums.length > 0) {
            let cleanTotalCheck = nums[nums.length - 1].replace(/\D/g, '');
            if (cleanTotalCheck) {
                let numValue = parseInt(cleanTotalCheck, 10);
                if (numValue >= 1000) {
                    data.terbilang_total = notCapslock(terbilang(numValue).trim() + ' Rupiah');
                }
            }
        }
    }

    const ongkirMatchText = text.match(/ongkir[^:]*:\s*(.*)/i);
    if (ongkirMatchText && ongkirMatchText[1].trim() !== '-' && ongkirMatchText[1].toLowerCase().indexOf('di isi') === -1) {
        let cleanedOngkir = notCapslock(ongkirMatchText[1].trim());
        data.ongkir = cleanedOngkir.replace(/rp\s*\.?\s*/gi, '').replace(/\./g, ',');
    }

    const catatanMatch = text.match(/(?:catatan|note|notes)[^:]*:\s*([\s\S]*?)(?:apakah perlu|invoice|kwitansi|$)/i);
    let catatan = catatanMatch ? catatanMatch[1].trim() : '';
    
    if (catatan) {
        catatan = formatCatatan(catatan);
    } else {
        if (data.pesanan && data.pesanan.toLowerCase().includes('pakai nasi liwet')) {
            catatan = 'nasi diganti nasi liwet';
            data.pesanan = data.pesanan.replace(/,? pakai nasi liwet/gi, '').trim();
        }
    }
    data.catatan = notCapslock(catatan);
    if (data.pesanan && currentMode === 'Mealbox') {
        data.pesanan = notCapslock(formatCatatan(data.pesanan));
    }

    const invMatch = text.match(/(?:invoice|kwitansi)[^:]*:\s*(.+)/i);
    if (invMatch) {
        let res = invMatch[1].toLowerCase().trim();
        let isNegative = res.includes('tdk') || res.includes('tidak') || res.includes('ga') || res.includes('ngga') || res.includes('kosong') || res === '-' || res === 'no';
        let isPositive = res.includes('ya') || res.includes('yes') || res.includes('perlu') || res.includes('iya') || res.includes('mau') || res.includes('invoice') || res.includes('kwitansi') || res.includes('boleh') || res.includes('butuh');
        
        if (!isNegative && isPositive) {
            data.invoice = 'Perlu (Softcopy)';
        }
    }

    const tanggalMatch = text.match(/(?:tanggal|tgl)[^:]*:\s*(.+)/i);
    data.tanggal = formatDate(tanggalMatch ? tanggalMatch[1] : null);

    Object.keys(data).forEach(k => {
        if(data[k] === undefined || data[k] === null) data[k] = '';
        data[k] = String(data[k]).trim();
    });

    return data;
}

function formatPhone(phone) {
    if (!phone) return '';
    phone = phone.replace(/\D/g, '');
    if (phone.startsWith('08')) return '628' + phone.substring(2);
    return phone;
}

function formatCatatan(textVal) {
    return textVal.replace(/pakai nasi liwet/gi, 'nasi diganti nasi liwet');
}

function detectArea(text) {
    if (!text) return '';
    const txt = text.toLowerCase();
    const areas = ['jakarta barat', 'jakarta timur', 'jakarta selatan', 'jakarta utara', 'jakarta pusat', 'bekasi', 'tangerang', 'depok', 'bogor'];
    for (const area of areas) {
        if (txt.includes(area)) return area;
    }
    return '';
}

const BLN = {
    'januari': 1, 'jan': 1, 'februari': 2, 'feb': 2, 'maret': 3, 'mar': 3,
    'april': 4, 'apr': 4, 'mei': 5, 'juni': 6, 'jun': 6, 'juli': 7, 'jul': 7,
    'agustus': 8, 'agu': 8, 'september': 9, 'sep': 9, 'oktober': 10, 'okt': 10,
    'november': 11, 'nov': 11, 'desember': 12, 'des': 12
};

function formatDate(dateInputStr) {
    if (!dateInputStr) return '';
    
    let d = new Date(); 
    let parts = dateInputStr.toLowerCase().replace(/,/g, '').split(' ')
        .filter(p => !['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].includes(p) && p.trim() !== '');
    
    let parsedSuccessfully = false;
    
    if (parts.length >= 2) {
        let dayNum = parseInt(parts[0].replace(/\D/g, ''));
        let validMonth = BLN[parts[1]] !== undefined ? BLN[parts[1]] - 1 : false;
        
        if(validMonth !== false && !isNaN(dayNum)) {
            let yearStr = parts[2] ? parts[2].replace(/\D/g, '') : '';
            let yearNum = (yearStr && yearStr.length === 4) ? parseInt(yearStr) : new Date().getFullYear();
            d = new Date(yearNum, validMonth, dayNum);
            parsedSuccessfully = true;
        }
    }
    
    if (!parsedSuccessfully) {
        let fd = new Date(dateInputStr);
        if (!isNaN(fd.getTime())) {
            d = fd;
            parsedSuccessfully = true;
        }
    }
    
    if (parsedSuccessfully) {
        const monthsStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const year = d.getFullYear();
        const monthTxt = monthsStr[d.getMonth()];
        const day = String(d.getDate()).padStart(2, '0');
        return `${day} ${monthTxt} ${year}`;
    } else {
        // Jika gagal mengubahnya ke format YYYY-MM-DD, setidaknya kembalikan string aslinya
        return notCapslock(dateInputStr);
    }
}

// Logic untuk Toggle Tema (Dark/Light)
const sunSvg = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
const moonSvg = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.getElementById('themeBtn').innerHTML = isDark ? sunSvg : moonSvg;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', () => {
    // Cek preferensi tema sebelumnya
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeBtn').innerHTML = sunSvg;
    }
    init();
});
