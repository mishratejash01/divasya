// ============================================================================
//  THE HIDDEN SACRED — lesser-known temples, state by state.
//  Source: the Divasya "The Hidden Sacred" state documents. This index (names,
//  places, one-line essences) ships with the app; each state's full essays
//  live in /public/hidden-sacred/<state>.json and load when a state opens.
// ============================================================================

export type SacredTempleRef = { id: string; name: string; place: string; essence: string };
export type SacredStateRef = { id: string; name: string; tagline: string; tint: [string, string]; temples: SacredTempleRef[] };

export type SacredBlock = { h?: string; p?: string };
export type SacredTemple = SacredTempleRef & { body: SacredBlock[] };
export type SacredState = {
  id: string; name: string; tagline: string;
  intro: string[]; temples: SacredTemple[]; thread: string[];
};

export const SACRED_STATES: SacredStateRef[] = [
 {
  "id": "uttar-pradesh",
  "name": "Uttar Pradesh",
  "tagline": "Where the Mother, the river and the forest keep their old prayers",
  "temples": [
   {
    "id": "vindhyavasini-devi-temple-mirzapur",
    "name": "Vindhyavasini Devi Temple",
    "place": "Mirzapur",
    "essence": "Where the Mother Lives in the Vindhyas"
   },
   {
    "id": "lalita-devi-temple-prayagraj",
    "name": "Lalita Devi Temple",
    "place": "Prayagraj",
    "essence": "Where the Goddess Becomes the Heart of the Sangam"
   },
   {
    "id": "devipatan-temple-tulsipur",
    "name": "Devipatan Temple",
    "place": "Tulsipur",
    "essence": "Where Shakti Is Remembered at the Edge of the Himalayas"
   },
   {
    "id": "bateshwar-temple-complex-agra",
    "name": "Bateshwar Temple Complex",
    "place": "Agra",
    "essence": "Where Shiva Sits Beside the Yamuna"
   },
   {
    "id": "chitrakoot-ramghat-and-hanuman-dhara",
    "name": "Chitrakoot Ramghat and Hanuman Dhara",
    "place": "",
    "essence": "Where the Forest Remembers Rama"
   },
   {
    "id": "garhmukteshwar-mukteshwar-mahadev",
    "name": "Garhmukteshwar Mukteshwar Mahadev",
    "place": "",
    "essence": "Where the Ganga Carries the Prayer Away"
   },
   {
    "id": "naimisharanya",
    "name": "Naimisharanya",
    "place": "",
    "essence": "Where the Forest Became a Place of Sacred Listening"
   },
   {
    "id": "jangamwadi-math-varanasi",
    "name": "Jangamwadi Math",
    "place": "Varanasi",
    "essence": "Where the Lingayat Tradition Finds a Home in Kashi"
   },
   {
    "id": "patalpuri-temple-and-akshayavat-prayagraj",
    "name": "Patalpuri Temple and Akshayavat",
    "place": "Prayagraj",
    "essence": "Where the Sacred Tree Refuses to Disappear"
   },
   {
    "id": "dudhwa-nearby-gaura-devi-forest-shrines-of-the-terai",
    "name": "Dudhwa-Nearby Gaura Devi / Forest Shrines of the Terai",
    "place": "",
    "essence": "Where the Goddess Belongs to the Forest"
   }
  ],
  "tint": [
   "#7E1D2E",
   "#430D19"
  ]
 },
 {
  "id": "rajasthan",
  "name": "Rajasthan",
  "tagline": "Where faith is woven into desert winds, sacred hills and old wells",
  "temples": [
   {
    "id": "kiradu-temples-barmer",
    "name": "Kiradu Temples",
    "place": "Barmer",
    "essence": "Where Shiva Still Breathes in the Desert Stone"
   },
   {
    "id": "harshnath-temple-sikar",
    "name": "Harshnath Temple",
    "place": "Sikar",
    "essence": "Where Shiva Watches from the Aravalli Hills"
   },
   {
    "id": "sachiya-mata-temple-osian",
    "name": "Sachiya Mata Temple",
    "place": "Osian",
    "essence": "Where the Mother Became a Guardian of Many Communities"
   },
   {
    "id": "khatu-shyamji",
    "name": "Khatu Shyamji",
    "place": "",
    "essence": "Where a Warrior's Head Became a Deity of Hope"
   },
   {
    "id": "tilasvan-mahadev-bijolia",
    "name": "Tilasvan Mahadev",
    "place": "Bijolia",
    "essence": "Where Shiva Lives Among Ancient Water and Stone"
   },
   {
    "id": "gogaji-temple-goga-medi",
    "name": "Gogaji Temple",
    "place": "Goga Medi",
    "essence": "Where the Snake Guardian Protects the People"
   },
   {
    "id": "unhel-parshvanath-temple",
    "name": "Unhel Parshvanath Temple",
    "place": "",
    "essence": "Where Silence Becomes the Prayer"
   },
   {
    "id": "tripura-sundari-temple-banswara",
    "name": "Tripura Sundari Temple",
    "place": "Banswara",
    "essence": "Where the Mother Holds Many Powers"
   },
   {
    "id": "karneshwar-mahadev-kota",
    "name": "Karneshwar Mahadev",
    "place": "Kota",
    "essence": "Where Shiva Meets the Monsoon"
   },
   {
    "id": "ranakpur-surya-narayan-temple",
    "name": "Ranakpur Surya Narayan Temple",
    "place": "",
    "essence": "Where the Sun Becomes a Living Presence"
   }
  ],
  "tint": [
   "#9D4C14",
   "#4E1E08"
  ]
 },
 {
  "id": "gujarat",
  "name": "Gujarat",
  "tagline": "Where the sea, the sun and the Mother keep watch",
  "temples": [
   {
    "id": "modheshwari-mata-temple-modhera",
    "name": "Modheshwari Mata Temple",
    "place": "Modhera",
    "essence": "The Mother Who Rose from Fire"
   },
   {
    "id": "shamlaji-temple",
    "name": "Shamlaji Temple",
    "place": "",
    "essence": "Where Vishnu Watches Over the River"
   },
   {
    "id": "koteshwar-mahadev-kutch",
    "name": "Koteshwar Mahadev",
    "place": "Kutch",
    "essence": "Where Shiva Faces the Infinite Sea"
   },
   {
    "id": "narayan-sarovar",
    "name": "Narayan Sarovar",
    "place": "",
    "essence": "Where Water Becomes a Sacred Memory"
   },
   {
    "id": "baleshwar-mahadev-somnath-coast",
    "name": "Baleshwar Mahadev",
    "place": "Somnath Coast",
    "essence": "Where Shiva Meets the Sound of Waves"
   },
   {
    "id": "harsiddhi-mata-temple-gondal",
    "name": "Harsiddhi Mata Temple",
    "place": "Gondal",
    "essence": "The Mother of Protection and Power"
   },
   {
    "id": "bahucharaji-temple",
    "name": "Bahucharaji Temple",
    "place": "",
    "essence": "Where the Goddess Became a Place of Belonging"
   },
   {
    "id": "sun-temple-modhera",
    "name": "Sun Temple",
    "place": "Modhera",
    "essence": "Where Light Was Turned into Architecture"
   },
   {
    "id": "siddhpur-rudra-mahalaya",
    "name": "Siddhpur Rudra Mahalaya",
    "place": "",
    "essence": "Where the Ruins Still Remember Shiva"
   },
   {
    "id": "gopnath-mahadev",
    "name": "Gopnath Mahadev",
    "place": "",
    "essence": "Where Shiva Looks Out to the Arabian Sea"
   }
  ],
  "tint": [
   "#0F4F49",
   "#062B27"
  ]
 },
 {
  "id": "madhya-pradesh",
  "name": "Madhya Pradesh",
  "tagline": "Where the unfinished still feels eternal",
  "temples": [
   {
    "id": "bhojeshwar-temple-bhojpur",
    "name": "Bhojeshwar Temple",
    "place": "Bhojpur",
    "essence": "Where the Unfinished Still Feels Eternal"
   },
   {
    "id": "chausath-yogini-temple-mitawali",
    "name": "Chausath Yogini Temple",
    "place": "Mitawali",
    "essence": "Where the Sacred Circle Holds the Sky"
   },
   {
    "id": "chausath-yogini-temple-bhedaghat",
    "name": "Chausath Yogini Temple",
    "place": "Bhedaghat",
    "essence": "Where the Mother Watches Over the Narmada"
   },
   {
    "id": "salkanpur-maa-vijayasana",
    "name": "Salkanpur Maa Vijayasana",
    "place": "",
    "essence": "The Goddess Who Is Reached One Step at a Time"
   },
   {
    "id": "pashupatinath-temple-mandsaur",
    "name": "Pashupatinath Temple",
    "place": "Mandsaur",
    "essence": "Where Shiva Looks in Eight Directions"
   },
   {
    "id": "jatashankar-pachmarhi",
    "name": "Jatashankar",
    "place": "Pachmarhi",
    "essence": "Where Shiva Hides Inside the Mountain"
   },
   {
    "id": "kakanmath-temple-sihoniya",
    "name": "Kakanmath Temple",
    "place": "Sihoniya",
    "essence": "The Shiva Temple That Refuses to Disappear"
   },
   {
    "id": "bawangaja",
    "name": "Bawangaja",
    "place": "",
    "essence": "Where the Mountain Becomes a Path to Liberation"
   },
   {
    "id": "shanka-shyamji-narsinghgarh",
    "name": "Shanka Shyamji",
    "place": "Narsinghgarh",
    "essence": "Where Krishna's Quiet Presence Meets the Hills"
   },
   {
    "id": "nemawar-siddheshwar",
    "name": "Nemawar Siddheshwar",
    "place": "",
    "essence": "Where the Narmada Becomes a Pilgrim"
   }
  ],
  "tint": [
   "#4A2472",
   "#241141"
  ]
 },
 {
  "id": "maharashtra",
  "name": "Maharashtra",
  "tagline": "Where ancient belief lives in hills, rivers, forests, caves, coastlines and stories",
  "temples": [
   {
    "id": "bhuleshwar-temple",
    "name": "Bhuleshwar Temple",
    "place": "",
    "essence": "The Shiva Temple Hidden on the Hill"
   },
   {
    "id": "amruteshwar-temple-ratanwadi",
    "name": "Amruteshwar Temple",
    "place": "Ratanwadi",
    "essence": "Where Shiva Lives Among the Sahyadris"
   },
   {
    "id": "kedareshwar-cave-harishchandragad",
    "name": "Kedareshwar Cave",
    "place": "Harishchandragad",
    "essence": "The Shiva Linga Surrounded by Ice-Cold Water"
   },
   {
    "id": "kamalja-devi-temple-lonar",
    "name": "Kamalja Devi Temple",
    "place": "Lonar",
    "essence": "The Goddess Beside a Crater Born from the Sky"
   },
   {
    "id": "kunkeshwar-temple",
    "name": "Kunkeshwar Temple",
    "place": "",
    "essence": "The God of the Sea"
   },
   {
    "id": "shani-shingnapur",
    "name": "Shani Shingnapur",
    "place": "",
    "essence": "Where Faith Leaves the Doors Open"
   },
   {
    "id": "kanakeshwar-temple",
    "name": "Kanakeshwar Temple",
    "place": "",
    "essence": "The Forest Temple Above the Konkan Coast"
   },
   {
    "id": "gondeshwar-temple-sinnar",
    "name": "Gondeshwar Temple",
    "place": "Sinnar",
    "essence": "Where an Entire Sacred World Was Carved in Stone"
   },
   {
    "id": "gorakhnath-temple-toranmal",
    "name": "Gorakhnath Temple",
    "place": "Toranmal",
    "essence": "Where the Nath Tradition Meets the Mountains"
   },
   {
    "id": "sangameshwar-and-trimbakeshwar-temples-parner",
    "name": "Sangameshwar and Trimbakeshwar Temples",
    "place": "Parner",
    "essence": "Where Two Rivers Become One Prayer"
   }
  ],
  "tint": [
   "#8A3B08",
   "#4E1F03"
  ]
 },
 {
  "id": "punjab",
  "name": "Punjab",
  "tagline": "Where devotion becomes service, memory and community",
  "temples": [
   {
    "id": "gurdwara-ber-sahib-sultanpur-lodhi",
    "name": "Gurdwara Ber Sahib",
    "place": "Sultanpur Lodhi",
    "essence": "Where a Riverbank Became the Beginning of a New Life"
   },
   {
    "id": "gurdwara-nanaksar-jagraon",
    "name": "Gurdwara Nanaksar Jagraon",
    "place": "",
    "essence": "Where Devotion Became a Quiet Discipline"
   },
   {
    "id": "gurdwara-shri-manji-sahib-kartarpur",
    "name": "Gurdwara Shri Manji Sahib",
    "place": "Kartarpur",
    "essence": "Where the Guru's Presence Became a Place of Community"
   },
   {
    "id": "durgiana-temple-amritsar",
    "name": "Durgiana Temple",
    "place": "Amritsar",
    "essence": "Where a Temple Became a Mirror of Sacred Memory"
   },
   {
    "id": "mukteshwar-mahadev-temple-mukerian",
    "name": "Mukteshwar Mahadev Temple",
    "place": "Mukerian",
    "essence": "Where Shiva Rests Above the Ravi"
   },
   {
    "id": "gurdwara-shri-dukh-niwaran-sahib-patiala",
    "name": "Gurdwara Shri Dukh Niwaran Sahib",
    "place": "Patiala",
    "essence": "Where Pain Is Believed to Find Relief"
   },
   {
    "id": "gurdwara-shri-manji-sahib-ambala",
    "name": "Gurdwara Shri Manji Sahib",
    "place": "Ambala",
    "essence": "Where Memory Lives in the Everyday"
   },
   {
    "id": "gurdwara-shri-nanakiana-sahib-sangrur",
    "name": "Gurdwara Shri Nanakiana Sahib",
    "place": "Sangrur",
    "essence": "Where the Guru's Journey Remains Alive"
   },
   {
    "id": "mata-kaushalya-temple-ropar",
    "name": "Mata Kaushalya Temple",
    "place": "Ropar",
    "essence": "Where the Mother Is Remembered Through the Ramayana"
   },
   {
    "id": "shiv-mandir-nangal-bhakra-sacred-landscape",
    "name": "Shiv Mandir",
    "place": "Nangal / Bhakra Sacred Landscape",
    "essence": "Where Shiva Meets the River and the Hills"
   }
  ],
  "tint": [
   "#A87A1E",
   "#5E3F08"
  ]
 },
 {
  "id": "karnataka",
  "name": "Karnataka",
  "tagline": "Where ancient belief lives in forests, rivers, hills, caves, stones and silence",
  "temples": [
   {
    "id": "yana-cave-temple",
    "name": "Yana Cave Temple",
    "place": "",
    "essence": "Where Shiva Lives Beneath the Black Monoliths"
   },
   {
    "id": "devarayanadurga-yoga-narasimha-temple",
    "name": "Devarayanadurga Yoga Narasimha Temple",
    "place": "",
    "essence": "Where the Climb Becomes a Prayer"
   },
   {
    "id": "mahakuta-mahakuteshwara-temple",
    "name": "Mahakuta Mahakuteshwara Temple",
    "place": "",
    "essence": "Where Shiva Rests Beside a Living Spring"
   },
   {
    "id": "talakadu-vaidyanatheshwara-temple",
    "name": "Talakadu Vaidyanatheshwara Temple",
    "place": "",
    "essence": "Where Temples Disappear Beneath the Sand"
   },
   {
    "id": "chandragutti-renuka-devi-temple",
    "name": "Chandragutti Renuka Devi Temple",
    "place": "",
    "essence": "The Goddess in the Cave and the Forest"
   },
   {
    "id": "sri-malahanikareshwara-temple-kigga",
    "name": "Sri Malahanikareshwara Temple",
    "place": "Kigga",
    "essence": "The Quiet Shiva Temple in the Western Ghats"
   },
   {
    "id": "ghati-subramanya-temple",
    "name": "Ghati Subramanya Temple",
    "place": "",
    "essence": "Where Two Deities Face Each Other"
   },
   {
    "id": "nimishamba-temple-srirangapatna",
    "name": "Nimishamba Temple",
    "place": "Srirangapatna",
    "essence": "The Goddess Who Answers in a Moment"
   },
   {
    "id": "kedareshwara-temple-halebidu",
    "name": "Kedareshwara Temple",
    "place": "Halebidu",
    "essence": "The Quiet Temple Beside the Famous Masterpiece"
   },
   {
    "id": "navagraha-jain-temple-varur",
    "name": "Navagraha Jain Temple",
    "place": "Varur",
    "essence": "Where the Nine Planets Meet Jain Spirituality"
   }
  ],
  "tint": [
   "#153C6B",
   "#081F3B"
  ]
 },
 {
  "id": "kerala",
  "name": "Kerala",
  "tagline": "Where belief lives in forests, lakes, sacred groves, stones and stories",
  "temples": [
   {
    "id": "ananthapura-lake-temple",
    "name": "Ananthapura Lake Temple",
    "place": "",
    "essence": "The Divine Island in the Middle of the Water"
   },
   {
    "id": "kottiyoor-temple",
    "name": "Kottiyoor Temple",
    "place": "",
    "essence": "Shiva in the Sacred Forest"
   },
   {
    "id": "mannarasala-sree-nagaraja-temple",
    "name": "Mannarasala Sree Nagaraja Temple",
    "place": "",
    "essence": "Where the Serpent Becomes Guardian"
   },
   {
    "id": "panachikkadu-saraswathi-temple",
    "name": "Panachikkadu Saraswathi Temple",
    "place": "",
    "essence": "The Goddess of Knowledge Hidden in Greenery"
   },
   {
    "id": "chengannur-mahadeva-temple",
    "name": "Chengannur Mahadeva Temple",
    "place": "",
    "essence": "Where Shiva and Shakti Share One Sacred Space"
   },
   {
    "id": "cherukunnu-annapoorneshwari-temple",
    "name": "Cherukunnu Annapoorneshwari Temple",
    "place": "",
    "essence": "Where Feeding Becomes Worship"
   },
   {
    "id": "kaviyoor-mahadeva-temple",
    "name": "Kaviyoor Mahadeva Temple",
    "place": "",
    "essence": "The Ancient Shiva Shrine in Stone"
   },
   {
    "id": "kottukal-rock-cut-cave-temple",
    "name": "Kottukal Rock-cut Cave Temple",
    "place": "",
    "essence": "The Divine Emerging from Living Rock"
   },
   {
    "id": "kodumon-chilanthiyambalam",
    "name": "Kodumon Chilanthiyambalam",
    "place": "",
    "essence": "The Shrine Where People Come Seeking Healing"
   },
   {
    "id": "thiruvegappura-sankaranarayana-temple",
    "name": "Thiruvegappura Sankaranarayana Temple",
    "place": "",
    "essence": "Where Three Divine Forms Share One Sacred Space"
   }
  ],
  "tint": [
   "#1F5A3A",
   "#0C2E1C"
  ]
 },
 {
  "id": "tamil-nadu",
  "name": "Tamil Nadu",
  "tagline": "Where the divine emerges from living rock",
  "temples": [
   {
    "id": "malayadipatti-pudukkottai",
    "name": "Malayadipatti",
    "place": "Pudukkottai",
    "essence": "The Hill of the Holy"
   },
   {
    "id": "thirumayam-thirumayam-pudukkottai",
    "name": "Thirumayam",
    "place": "Thirumayam, Pudukkottai",
    "essence": "The Sacred Hill of Shiva and Vishnu"
   },
   {
    "id": "kunnandarkoil-kunnandarkoil-pudukkottai",
    "name": "Kunnandarkoil",
    "place": "Kunnandarkoil, Pudukkottai",
    "essence": "Temple of the Lord of the Hill"
   },
   {
    "id": "sri-satchinatheswarar-temple-tiruppurambiyam-near-kumbakonam",
    "name": "Sri Satchinatheswarar Temple",
    "place": "Tiruppurambiyam, near Kumbakonam",
    "essence": "The God Who Became a Witness"
   },
   {
    "id": "sri-pushpavaneswarar-temple-thiruppuvanam-sivaganga-near-madurai",
    "name": "Sri Pushpavaneswarar Temple",
    "place": "Thiruppuvanam, Sivaganga, near Madurai",
    "essence": "Where Devotion Takes Many Forms"
   },
   {
    "id": "kailasanathar-temple-kancheepuram",
    "name": "Kailasanathar Temple",
    "place": "Kancheepuram",
    "essence": "The Kailasanathar Temple is one of the finest surviving Pallava-era examples of classical Dravidian architecture."
   },
   {
    "id": "gangaikonda-cholapuram-ariyalur",
    "name": "Gangaikonda Cholapuram",
    "place": "Ariyalur",
    "essence": "The Temple of the Chola Vision"
   },
   {
    "id": "sri-aiyarappar-temple-thiruvaiyaru-thanjavur",
    "name": "Sri Aiyarappar Temple",
    "place": "Thiruvaiyaru, Thanjavur",
    "essence": "Thiruvaiyaru is one of the most spiritually layered temple landscapes in the supplied material."
   }
  ],
  "tint": [
   "#5B2160",
   "#2E0F32"
  ]
 },
 {
  "id": "andhra-pradesh",
  "name": "Andhra Pradesh",
  "tagline": "Where ancient belief lives in rivers, hills, stones, villages and stories",
  "temples": [
   {
    "id": "srikurmam-temple",
    "name": "Srikurmam Temple",
    "place": "",
    "essence": "Where Vishnu Appears as the Tortoise"
   },
   {
    "id": "pushpagiri",
    "name": "Pushpagiri",
    "place": "",
    "essence": "Where Shiva and Vishnu Meet in a Sacred Landscape"
   },
   {
    "id": "penchalakona-narasimha-temple",
    "name": "Penchalakona Narasimha Temple",
    "place": "",
    "essence": "Where Narasimha Finds Stillness"
   },
   {
    "id": "mallam-subramanya-swamy-temple",
    "name": "Mallam Subramanya Swamy Temple",
    "place": "",
    "essence": "The Shrine of the Wounded Deity"
   },
   {
    "id": "pallikondeswara-temple-surutupalle",
    "name": "Pallikondeswara Temple",
    "place": "Surutupalle",
    "essence": "Where Shiva Rests in the Lap of Parvathi"
   },
   {
    "id": "sri-pydithalli-ammavari-temple",
    "name": "Sri Pydithalli Ammavari Temple",
    "place": "",
    "essence": "The Goddess Who Belongs to Her People"
   },
   {
    "id": "talpagiri-ranganatha-swamy-temple",
    "name": "Talpagiri Ranganatha Swamy Temple",
    "place": "",
    "essence": "Where the Serpent Becomes the Lord's Resting Place"
   },
   {
    "id": "pennahobilam-lakshmi-narasimha-temple",
    "name": "Pennahobilam Lakshmi Narasimha Temple",
    "place": "",
    "essence": "The Narasimha Shrine Hidden on a Hill"
   },
   {
    "id": "sri-kanaka-mahalakshmi-temple",
    "name": "Sri Kanaka Mahalakshmi Temple",
    "place": "",
    "essence": "The Goddess Beneath the Open Sky"
   },
   {
    "id": "jagannatha-gattu-temple",
    "name": "Jagannatha Gattu Temple",
    "place": "",
    "essence": "The Shiva Shrine on the Hill"
   }
  ],
  "tint": [
   "#B4461C",
   "#6E1F0C"
  ]
 },
 {
  "id": "telangana",
  "name": "Telangana",
  "tagline": "Where ancient belief lives in hills, rivers, stones, villages and stories",
  "temples": [
   {
    "id": "nainpaka-temple",
    "name": "Nainpaka Temple",
    "place": "",
    "essence": "The Gods Carved into the Living Rock"
   },
   {
    "id": "chaya-someswara-temple",
    "name": "Chaya Someswara Temple",
    "place": "",
    "essence": "Where the Shadow Becomes Part of the Sacred"
   },
   {
    "id": "pillalamarri-temples",
    "name": "Pillalamarri Temples",
    "place": "",
    "essence": "Where Ancient Shiva Worship Lives Beside the Musi"
   },
   {
    "id": "ghanpur-group-of-temples",
    "name": "Ghanpur Group of Temples",
    "place": "",
    "essence": "The Kakatiya Stories Hidden in Stone"
   },
   {
    "id": "dharmapuri-lakshmi-narasimha-temple",
    "name": "Dharmapuri Lakshmi Narasimha Temple",
    "place": "",
    "essence": "Where the Fierce Protector Becomes the Healer"
   },
   {
    "id": "beechupally-anjaneya-temple",
    "name": "Beechupally Anjaneya Temple",
    "place": "",
    "essence": "The Guardian Beside the Krishna"
   },
   {
    "id": "somasila-sangameswara-temple",
    "name": "Somasila Sangameswara Temple",
    "place": "",
    "essence": "Where Rivers Meet and Shiva Receives the Journey"
   },
   {
    "id": "edupayala-durga-bhavani-temple",
    "name": "Edupayala Durga Bhavani Temple",
    "place": "",
    "essence": "Where Seven Streams Become One Sacred Story"
   },
   {
    "id": "kondagattu-anjaneya-temple",
    "name": "Kondagattu Anjaneya Temple",
    "place": "",
    "essence": "The Hill of Hanuman and Protection"
   },
   {
    "id": "kaleshwara-mukteswara-swamy-temple",
    "name": "Kaleshwara Mukteswara Swamy Temple",
    "place": "",
    "essence": "Where Shiva and Yama Share One Sacred Pedestal"
   }
  ],
  "tint": [
   "#275E79",
   "#0D2A3C"
  ]
 }
];

const cache = new Map<string, Promise<SacredState>>();

/** The full essays for one state, fetched once and kept. */
export function loadSacredState(id: string): Promise<SacredState> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/hidden-sacred/${id}.json`).then((r) => {
      if (!r.ok) throw new Error(`hidden-sacred ${id}: ${r.status}`);
      return r.json() as Promise<SacredState>;
    });
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return p;
}
