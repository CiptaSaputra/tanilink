CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy',
]

assert len(CLASS_NAMES) == 38


def split_plant_disease(class_name):
    """
    Memecah nama kelas mentah menjadi (nama_tanaman, nama_penyakit).
    Contoh: 'Tomato___Early_blight' -> ('Tomato', 'Early_blight')
            'Apple___healthy'       -> ('Apple', 'healthy')
    """
    plant, _, disease = class_name.partition("___")
    return plant, disease


def normalize_disease_key(disease_raw):
    """
    Menormalkan nama penyakit mentah supaya penyakit yang sama pada tanaman
    berbeda bisa dikenali sebagai kelompok yang sama.
    Contoh: 'Common_rust_' -> 'Common_rust' (buang trailing underscore),
            'Cercospora_leaf_spot Gray_leaf_spot' -> tetap (nama gabungan resmi).
    """
    key = disease_raw.strip().rstrip("_")
    return key


def disease_display_name(disease_key):
    """Ubah key jadi teks yang enak dibaca, mis. 'Early_blight' -> 'Early blight'."""
    if disease_key.lower() == "healthy":
        return "Sehat (tidak ada penyakit terdeteksi)"
    return disease_key.replace("_", " ").replace("  ", " / ")


DISEASE_SOLUTIONS = {
    "healthy": "Tanaman dalam kondisi sangat baik dan bebas dari gejala infeksi patogen. Lanjutkan perawatan rutin Anda. Pastikan penyiraman dilakukan secara merata pada area akar (hindari daun yang terlalu basah), berikan paparan sinar matahari yang sesuai dengan kebutuhan spesifik tanaman, dan lakukan pemupukan berimbang secara berkala untuk menjaga kekebalan alami tanaman terhadap penyakit di masa depan.",
    "Apple_scab": "Penyakit kudis apel (Apple Scab) disebabkan oleh jamur Venturia inaequalis. Solusi: Segera pangkas dan musnahkan daun, buah, atau ranting yang menunjukkan bercak zaitun hingga hitam. Sangat penting untuk menjaga daun tetap kering, jadi hindari penyiraman dari atas (overhead watering) dan pastikan jarak tanam cukup untuk sirkulasi udara. Pada tahap infeksi lanjut, semprotkan fungisida berbahan aktif tembaga, kapur belerang, atau fungisida sistemik sesuai dosis yang dianjurkan pada awal musim semi.",
    "Black_rot": "Busuk Hitam (Black Rot) adalah infeksi jamur yang sangat merusak. Solusi: Langkah pertama yang paling krusial adalah membuang dan membakar (atau membuang jauh) semua bagian tanaman yang membusuk, termasuk buah yang mengerut (mumi) agar spora tidak menyebar. Pastikan sirkulasi udara sangat baik dengan memangkas kanopi yang terlalu rimbun. Aplikasikan fungisida protektif berbahan aktif mancozeb atau kaptan secara rutin, terutama saat cuaca hangat dan basah.",
    "Cedar_apple_rust": "Karat Apel (Cedar Apple Rust) membutuhkan dua inang untuk bertahan hidup (apel dan pohon juniper/cedar). Solusi: Pangkas daun yang memiliki bercak kuning-oranye berkarat. Langkah pencegahan terbaik adalah menyingkirkan atau menghindari penanaman pohon juniper di sekitar area kebun. Aplikasikan fungisida sistemik berbahan aktif myclobutanil atau triadimefon pada saat kuncup daun mulai mekar untuk memutus siklus infeksi spora.",
    "Powdery_mildew": "Embun Tepung (Powdery mildew) tampak seperti lapisan bedak putih pada permukaan daun. Solusi: Penyakit ini berkembang pesat di lingkungan yang lembap namun dengan dedaunan yang kering. Tingkatkan sirkulasi udara dengan memangkas daun yang berdesakan. Semprotkan fungisida organik seperti minyak neem (neem oil) atau larutan baking soda (campurkan 1 sendok makan baking soda, 1 liter air, dan beberapa tetes sabun cair bayi) secara merata ke seluruh permukaan daun setiap 7-14 hari hingga gejala hilang.",
    "Cercospora_leaf_spot Gray_leaf_spot": "Bercak Daun Cercospora / Kelabu umumnya menyerang saat kelembapan tinggi. Solusi: Segera singkirkan dan hancurkan sisa-sisa daun tua yang gugur di atas tanah karena jamur bertahan hidup di sana. Gunakan mulsa plastik atau jerami untuk mencegah percikan air dari tanah ke daun bawah. Aplikasikan fungisida berbahan aktif azoxystrobin, pyraclostrobin, atau chlorothalonil pada tahap awal munculnya bercak untuk menghentikan penyebaran jamur.",
    "Common_rust": "Karat Daun (Common rust) ditandai dengan bintik-bintik oranye kemerahan (pustula spora) pada permukaan daun. Solusi: Pangkas dan buang daun bagian bawah yang terinfeksi paling parah. Pastikan area penanaman memiliki drainase yang baik dan tidak ada air yang menggenang. Jika infeksi mulai menyebar cepat ke daun bagian atas, segera semprotkan fungisida berbahan dasar tembaga atau sulfur secara merata, ulangi penyemprotan setiap minggu sesuai instruksi label.",
    "Northern_Leaf_Blight": "Hawar Daun Utara (Northern Leaf Blight) menyebabkan luka panjang berbentuk cerutu pada daun. Solusi: Penyakit ini sangat bertahan pada sisa tanaman yang mati. Bersihkan seluruh sisa tanaman terdahulu dari lahan dan lakukan pembajakan tanah (tillage) untuk mengubur sisa jamur. Terapkan rotasi tanaman dengan spesies yang tidak rentan. Semprotkan fungisida foliar pelindung ketika lesi (bercak bercelah) pertama kali terlihat pada daun bawah.",
    "Esca_(Black_Measles)": "Penyakit Esca (Black Measles) menyerang jaringan pembuluh kayu di dalam batang. Solusi: Ini adalah penyakit internal yang cukup sulit disembuhkan secara total. Pencegahan terbaik adalah memangkas kayu yang mati atau terinfeksi hanya pada saat musim kemarau. Sangat penting untuk segera menutupi setiap luka bekas pangkasan dengan cat penutup luka tanaman (pruning sealer) untuk mencegah masuknya jamur baru. Jaga kesehatan akar dan pastikan drainase tanah berfungsi maksimal.",
    "Leaf_blight_(Isariopsis_Leaf_Spot)": "Hawar Daun Isariopsis menyebabkan bercak cokelat hingga mengeringnya daun. Solusi: Menjaga sanitasi atau kebersihan kebun adalah kunci utama. Bersihkan area perakaran dari tumpukan gulma atau sisa daun yang membusuk untuk memutus siklus hidup patogen. Pastikan jarak antar tanaman tidak terlalu rapat. Semprotkan fungisida berbahan aktif tembaga hidroksida atau mancozeb secara teratur sebagai langkah preventif, terutama di musim hujan.",
    "Haunglongbing_(Citrus_greening)": "Huanglongbing (CVPD / Citrus greening) adalah penyakit bakteri sistemik fatal yang disebarkan oleh serangga kutu loncat jeruk (psyllid). Solusi: Penyakit ini belum ada obat yang sepenuhnya menyembuhkan. Kendalikan populasi serangga vektor secara agresif menggunakan insektisida sistemik atau minyak hortikultura. Berikan dukungan nutrisi ekstra pada tanaman melalui pupuk daun yang mengandung seng (Zn) dan besi (Fe). Pohon yang sudah terinfeksi sangat parah dan tidak produktif sebaiknya ditebang agar tidak menular ke pohon sehat lainnya.",
    "Bacterial_spot": "Bercak Bakteri (Bacterial spot) menyebar sangat cepat dalam kondisi basah. Solusi: Segera pangkas area yang menunjukkan gejala bercak berair. Semprotkan secara rutin bakterisida berbahan aktif tembaga yang dikombinasikan dengan mancozeb untuk hasil maksimal. Hindari sama sekali menyentuh tanaman saat daun sedang basah, dan gunakan sistem irigasi tetes (drip irrigation) alih-alih penyiraman semprot untuk menjaga permukaan daun tetap kering.",
    "Early_blight": "Hawar Daun Awal (Early blight) disebabkan jamur Alternaria yang menyerang daun tertua (bawah) terlebih dahulu. Solusi: Segera potong daun bagian bawah yang menunjukkan bercak cokelat konsentris (berbentuk cincin). Pasang mulsa organik atau plastik di permukaan tanah untuk mencegah spora jamur terpercik naik ke daun saat hujan. Aplikasikan fungisida berbahan aktif chlorothalonil, mancozeb, atau produk berbasis tembaga setiap 7 hingga 10 hari sejak gejala awal.",
    "Late_blight": "Hawar Daun Busuk (Late blight) adalah penyakit sangat mematikan (seperti yang memicu wabah kelaparan Irlandia). Solusi: Bertindaklah cepat! Segera isolasi, potong, dan musnahkan dengan cara dibakar atau dimasukkan kantong plastik tertutup seluruh bagian tanaman yang menghitam dan membusuk basah. Jangan masukkan ke tumpukan kompos. Semprotkan fungisida kuat berbahan tembaga oksiklorida atau mefenoxam secepatnya pada tanaman yang masih sehat di sekitarnya.",
    "Leaf_Mold": "Jamur Daun (Leaf Mold) berkembang pada kondisi kelembapan udara sangat tinggi dan ventilasi buruk (sering di rumah kaca). Solusi: Secara drastis tingkatkan sirkulasi udara dengan memangkas daun-daun yang terlalu rimbun, terutama di bagian bawah batang. Gunakan kipas jika menanam di dalam ruangan atau green house. Turunkan kelembapan lingkungan hingga di bawah 85%. Aplikasikan fungisida preventif berbahan dasar belerang atau tembaga untuk menghambat pertumbuhan spora.",
    "Septoria_leaf_spot": "Bercak Daun Septoria menimbulkan banyak bintik abu-abu/cokelat kecil dengan tepi gelap. Solusi: Penyakit ini sangat menular melalui percikan air. Buang semua daun bawah yang terinfeksi parah dan pastikan sirkulasi udara baik. Berikan lapisan mulsa yang cukup tebal di bawah batang tanaman untuk menghalangi naiknya spora dari tanah. Lakukan penyemprotan rutin dengan fungisida berbahan aktif chlorothalonil atau fungisida bio berbasis Bacillus subtilis.",
    "Spider_mites Two-spotted_spider_mite": "Serangan Tungau Laba-Laba (Spider mites) ditandai dengan jaring halus dan daun berbintik kuning pudar. Solusi: Tungau berkembang biak subur di cuaca panas dan kering. Semprotkan air bertekanan kencang langsung ke bagian bawah daun (tempat mereka bersembunyi) secara berkala untuk merusak sarang dan mencuci tungau. Untuk penanganan tuntas, aplikasikan minyak neem, sabun insektisida, atau cairan akarisida/mitisida khusus dengan interval 3-5 hari hingga siklus hidupnya terputus.",
    "Target_Spot": "Bercak Target (Target Spot) membentuk lesi melingkar seperti papan target. Solusi: Kelembapan yang terperangkap dalam kanopi tanaman memicu penyakit ini. Pangkas cabang dan daun bagian bawah secara signifikan agar udara mengalir bebas menembus bagian dalam tanaman. Jaga kebersihan area lahan dan terapkan rotasi tanaman. Aplikasikan fungisida broad-spectrum (seperti chlorothalonil atau mancozeb) segera setelah terlihat bercak awal.",
    "Tomato_Yellow_Leaf_Curl_Virus": "Virus Daun Kuning Keriting (TYLCV) disebarkan oleh gigitan serangga kutu putih (whitefly). Solusi: Setelah terinfeksi virus, tanaman tidak dapat disembuhkan. Fokus utama adalah mengendalikan vektor penyebarnya. Pasang perangkap kuning berperekat (yellow sticky traps) di sekitar tanaman, semprot insektisida organik atau sabun hortikultura secara teratur, dan pasang jaring serangga halus untuk melindungi tanaman muda. Segera cabut tanaman yang terinfeksi parah untuk melindungi yang lain.",
    "Tomato_mosaic_virus": "Virus Mosaik ditandai dengan daun belang-belang, berkerut, dan melengkung. Solusi: Penyakit ini sangat menular melalui cairan mekanis (sentuhan tangan, alat pangkas, atau bahkan pakaian). Selalu sterilkan tangan dan alat perkebunan Anda menggunakan alkohol 70% atau larutan pemutih sebelum berpindah antar tanaman. Segera musnahkan tanaman yang terinfeksi parah dengan membakarnya. Hindari merokok di sekitar tanaman (karena virus bisa berasal dari tembakau).",
    "Leaf_scorch": "Daun Hangus (Leaf scorch) adalah kondisi fisiologis, bukan infeksi, biasanya akibat stres lingkungan ekstrim. Solusi: Memperbaiki kondisi lingkungan adalah satu-satunya cara. Jaga kelembapan tanah agar tidak mengalami kekeringan tiba-tiba, terutama di musim kemarau. Berikan jaring naungan (paranet) untuk melindungi tanaman dari intensitas cahaya matahari dan suhu ekstrem. Aplikasikan pupuk kalium secukupnya untuk memperkuat dinding sel tanaman terhadap stres air."
}


def get_disease_solution(disease_key):
    """Mengembalikan teks solusi penanganan untuk jenis penyakit tertentu."""
    return DISEASE_SOLUTIONS.get(
        disease_key,
        "Potong dan buang bagian daun yang menunjukkan gejala sakit, jaga kebersihan area tanaman, serta semprotkan fungisida/bakterisida umum bila bercak menyebar."
    )


# Peta: index kelas -> (plant, disease_key)
PLANT_DISEASE_MAP = []
for _cname in CLASS_NAMES:
    _plant, _disease_raw = split_plant_disease(_cname)
    _disease_key = normalize_disease_key(_disease_raw)
    PLANT_DISEASE_MAP.append((_plant, _disease_key))
