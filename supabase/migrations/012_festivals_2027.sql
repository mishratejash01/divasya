-- ============================================================================
--  DIVASYA migration 012 — Festival calendar 2027 (bilingual)
--  Dates computed by our own panchang engine (scripts/find-festivals.ts), whose
--  method was validated by reproducing all 12 seeded 2026 dates exactly, using
--  each festival's correct observance kaal (sunrise / madhyahna / aparahna /
--  pradosh) and a kshaya-tithi fallback. Idempotent upserts.
-- ============================================================================

insert into public.festivals (id,name,name_hi,date,deva,about,about_hi,muhurat,muhurat_hi,samagri,samagri_hi,vidhi,vidhi_hi,icon) values

('vasant-panchami-2027','Vasant Panchami','वसंत पंचमी','2027-02-11','वसंत पंचमी',
 'The worship of Maa Saraswati, goddess of knowledge and music, as spring begins. Children are often taught their first letters today.',
 'ज्ञान और संगीत की देवी माँ सरस्वती का पूजन, वसंत के आगमन पर। आज प्रायः बच्चों को पहला अक्षर सिखाया जाता है।',
 'Purvahna, morning puja','पूर्वाह्न, प्रातःकालीन पूजा',
 '["Yellow flowers","Books or instruments","Kesar and yellow sweets","Diya"]','["पीले फूल","पुस्तकें या वाद्य","केसर और पीली मिठाई","दीया"]','[]','[]','flower'),

('shivratri-2027','Maha Shivaratri','महाशिवरात्रि','2027-03-06','महाशिवरात्रि',
 'The great night of Shiva, kept with fasting, night vigil and the repetition of Om Namah Shivaya.',
 'शिव की महान रात्रि, उपवास, रात्रि जागरण और ॐ नमः शिवाय के जप के साथ मनाई जाती है।',
 'Nishita kaal, all four praharas of the night','निशीथ काल, रात्रि के चारों प्रहर',
 '["Bel leaves","Milk and water","Dhatura and bhang","White flowers","Diya and dhoop"]','["बेलपत्र","दूध और जल","धतूरा और भांग","श्वेत फूल","दीया और धूप"]',
 '["Keep a light fast through the day.","Bathe the Shiva lingam with water, milk and bel leaves.","Offer white flowers and chant Om Namah Shivaya.","Stay awake through the night, worshipping at each of the four praharas.","Break the fast the next morning after puja."]',
 '["दिन भर हल्का उपवास रखें।","शिवलिंग पर जल, दूध और बेलपत्र चढ़ाएँ।","श्वेत फूल अर्पित करें और ॐ नमः शिवाय जपें।","रात्रि भर जागकर चारों प्रहर में पूजा करें।","अगली प्रातः पूजा के बाद उपवास खोलें।"]','flame'),

('holi-2027','Holi','होली','2027-03-23','होली',
 'The festival of colour and forgiveness. The night before is Holika Dahan, and the next day the streets fill with gulal, song and sweets.',
 'रंग और क्षमा का पर्व। एक रात पूर्व होलिका दहन होता है, और अगले दिन गलियाँ गुलाल, गीत और मिठाई से भर जाती हैं।',
 'Play through the morning','प्रातःकाल भर उत्सव',
 '["Gulal, natural colours","Sweets, gujiya","Thandai","Water colours"]','["गुलाल, प्राकृतिक रंग","मिठाई, गुजिया","ठंडाई","रंग"]','[]','[]','flower'),

('ram-navami-2027','Ram Navami','राम नवमी','2027-04-15','राम नवमी',
 'The birth of Shri Ram, celebrated at midday with recitation of the Ramayana and the Ram Raksha Stotra.',
 'श्री राम का जन्मोत्सव, मध्याह्न में रामायण और राम रक्षा स्तोत्र के पाठ के साथ मनाया जाता है।',
 'Madhyahna, midday muhurat','मध्याह्न मुहूर्त',
 '["Ram idol or photo","Tulsi and flowers","Panjiri prasad","Diya and incense"]','["राम की मूर्ति या चित्र","तुलसी और फूल","पंजीरी प्रसाद","दीया और अगरबत्ती"]','[]','[]','sun'),

('hanuman-jayanti-2027','Hanuman Jayanti','हनुमान जयंती','2027-04-20','हनुमान जयंती',
 'The birth of Hanuman Ji, honoured with the Hanuman Chalisa, sindoor and offerings of laddoo.',
 'हनुमान जी का जन्मोत्सव, हनुमान चालीसा, सिंदूर और लड्डू के भोग के साथ मनाया जाता है।',
 'Sunrise, brahma muhurat','सूर्योदय, ब्रह्म मुहूर्त',
 '["Sindoor and chameli oil","Laddoo","Red flowers","Diya"]','["सिंदूर और चमेली का तेल","लड्डू","लाल फूल","दीया"]','[]','[]','shield'),

('akshaya-tritiya-2027','Akshaya Tritiya','अक्षय तृतीया','2027-05-09','अक्षय तृतीया',
 'An ever auspicious day when any good act or purchase is said to bring lasting merit. Buying gold is traditional.',
 'एक सदा शुभ दिन जब कोई भी शुभ कार्य या क्रय अक्षय पुण्य देता है। स्वर्ण खरीदना परंपरा है।',
 'Auspicious all day','पूरे दिन शुभ',
 '["Gold or silver","Yellow sweets","Tulsi","Diya"]','["स्वर्ण या रजत","पीली मिठाई","तुलसी","दीया"]','[]','[]','coins'),

('buddha-purnima-2027','Buddha Purnima','बुद्ध पूर्णिमा','2027-05-20','बुद्ध पूर्णिमा',
 'The full moon marking the birth, enlightenment and nirvana of Gautama Buddha.',
 'गौतम बुद्ध के जन्म, ज्ञानोदय और निर्वाण की पूर्णिमा।',
 'Purnima, moonrise','पूर्णिमा, चंद्रोदय',
 '["White flowers","Diya","Fruits","Incense"]','["श्वेत फूल","दीया","फल","धूप"]','[]','[]','moon'),

('rath-yatra-2027','Jagannath Rath Yatra','जगन्नाथ रथ यात्रा','2027-07-05','रथ यात्रा',
 'The great chariot festival of Puri, when Lord Jagannath, Balabhadra and Subhadra ride out among the people.',
 'पुरी का महान रथ महोत्सव, जब भगवान जगन्नाथ, बलभद्र और सुभद्रा जनसमूह के बीच रथ पर निकलते हैं।',
 'Dwitiya, morning','द्वितीया, प्रातः',
 '["Flowers","Coconut and fruits","Sweets","Diya"]','["फूल","नारियल और फल","मिठाई","दीया"]','[]','[]','landmark'),

('guru-purnima-2027','Guru Purnima','गुरु पूर्णिमा','2027-07-18','गुरु पूर्णिमा',
 'A day to honour the guru, the light that dispels darkness, with gratitude to teachers and spiritual guides.',
 'गुरु के सम्मान का दिन, वह प्रकाश जो अंधकार को दूर करता है, शिक्षकों और गुरुओं के प्रति कृतज्ञता के साथ।',
 'Purnima, from morning through moonrise','पूर्णिमा, प्रातः से चंद्रोदय तक',
 '["Flowers and fruits","Sweets","Chandan","A photo of your guru"]','["फूल और फल","मिठाई","चंदन","अपने गुरु का चित्र"]','[]','[]','sun'),

('nag-panchami-2027','Nag Panchami','नाग पंचमी','2027-08-06','नाग पंचमी',
 'Worship of the serpent devas for protection and the wellbeing of the family.',
 'सर्प देवताओं का पूजन, परिवार की रक्षा और कल्याण के लिए।',
 'Shukla Panchami, morning','शुक्ल पंचमी, प्रातः',
 '["Milk","Flowers","Turmeric and kumkum","Diya"]','["दूध","फूल","हल्दी और कुमकुम","दीया"]','[]','[]','shield'),

('raksha-bandhan-2027','Raksha Bandhan','रक्षा बंधन','2027-08-17','रक्षा बंधन',
 'The festival of the sacred thread. Sisters tie a rakhi for their brothers long life, and brothers vow to protect them.',
 'पवित्र धागे का पर्व। बहनें भाइयों की दीर्घायु के लिए राखी बाँधती हैं, और भाई उनकी रक्षा का वचन देते हैं।',
 'Aparahna, avoid Bhadra','अपराह्न, भद्रा से बचें',
 '["Rakhi","Roli and akshat","Sweets","Diya"]','["राखी","रोली और अक्षत","मिठाई","दीया"]','[]','[]','heart'),

('janmashtami-2027','Krishna Janmashtami','कृष्ण जन्माष्टमी','2027-08-25','कृष्ण जन्माष्टमी',
 'The midnight birth of Bhagwan Shri Krishna, kept with fasting, bhajan and the joy of the makhan chor.',
 'भगवान श्री कृष्ण का मध्यरात्रि अवतरण, उपवास, भजन और माखनचोर के आनंद के साथ।',
 'Nishita puja at midnight','निशीथ पूजा, मध्यरात्रि',
 '["Krishna idol","Makhan and mishri","Tulsi leaves","Panchamrit","Flowers and diya"]','["कृष्ण की मूर्ति","माखन और मिश्री","तुलसी दल","पंचामृत","फूल और दीया"]',
 '["Observe a fast through the day, phalahar is permitted.","Decorate the jhula for Laddoo Gopal.","At midnight, bathe the idol with panchamrit and offer makhan mishri with tulsi.","Sing bhajans and do Krishna aarti.","Break the fast after the midnight puja."]',
 '["दिन भर उपवास रखें, फलाहार की अनुमति है।","लड्डू गोपाल के झूले को सजाएँ।","मध्यरात्रि को मूर्ति को पंचामृत से स्नान कराएँ और तुलसी संग माखन मिश्री अर्पित करें।","भजन गाएँ और कृष्ण आरती करें।","मध्यरात्रि पूजा के बाद उपवास खोलें।"]','flame'),

('ganesh-chaturthi-2027','Ganesh Chaturthi','गणेश चतुर्थी','2027-09-04','गणेश चतुर्थी',
 'Welcoming Ganpati Bappa home for ten days of devotion, modak and celebration.',
 'गणपति बप्पा का घर में स्वागत, दस दिनों की भक्ति, मोदक और उत्सव।',
 'Madhyahna muhurat, midday','मध्याह्न मुहूर्त, दोपहर',
 '["Ganesha idol, eco friendly","Modak","Durva grass","Red flowers","Sindoor"]','["गणेश की मूर्ति, पर्यावरण अनुकूल","मोदक","दूर्वा","लाल फूल","सिंदूर"]',
 '["Install the idol facing east and do pran pratishtha.","Offer durva, red flowers, sindoor and 21 modaks.","Chant Om Gan Ganpataye Namah 108 times.","Perform aarti morning and evening.","On visarjan day, thank Bappa and immerse the idol gently."]',
 '["मूर्ति को पूर्वमुखी स्थापित कर प्राण प्रतिष्ठा करें।","दूर्वा, लाल फूल, सिंदूर और २१ मोदक अर्पित करें।","ॐ गं गणपतये नमः का १०८ बार जप करें।","प्रातः और संध्या आरती करें।","विसर्जन के दिन बप्पा का धन्यवाद कर मूर्ति को कोमलता से विसर्जित करें।"]','landmark'),

('sharad-navratri-2027','Sharad Navratri begins','शरद नवरात्रि आरंभ','2027-09-30','शरद नवरात्रि',
 'Nine nights of the Divine Mother, her nine forms, with fasting, garba and shakti sadhana.',
 'आदिशक्ति माता की नौ रातें, उनके नौ रूप, उपवास, गरबा और शक्ति साधना के साथ।',
 'Ghatasthapana in the morning muhurat','प्रातःकालीन मुहूर्त में घटस्थापना',
 '["Kalash","Barley seeds","Red chunri","Coconut","Akhand jyoti diya"]','["कलश","जौ के बीज","लाल चुनरी","नारियल","अखंड ज्योति दीया"]','[]','[]','flower'),

('dussehra-2027','Dussehra (Vijayadashami)','दशहरा (विजयादशमी)','2027-10-09','विजयादशमी',
 'The victory of dharma, Shri Ram over Ravana and the Devi over Mahishasura.',
 'धर्म की विजय, श्री राम की रावण पर और देवी की महिषासुर पर।',
 'Vijay muhurat, aparahna','विजय मुहूर्त, अपराह्न',
 '["Shami leaves","Aparajita flowers","Sweets"]','["शमी पत्र","अपराजिता के फूल","मिठाई"]','[]','[]','sword'),

('karwa-chauth-2027','Karwa Chauth','करवा चौथ','2027-10-18','करवा चौथ',
 'A day long nirjala vrat by married women for the long life of their husbands, broken after moonrise.',
 'विवाहित स्त्रियों का दिनभर का निर्जला व्रत, पति की दीर्घायु के लिए, चंद्रोदय के बाद खोला जाता है।',
 'Evening puja, moonrise near 8 PM','संध्या पूजा, चंद्रोदय लगभग ८ बजे',
 '["Karwa","Sieve","Mehndi","Sargi items","Diya"]','["करवा","छलनी","मेहंदी","सरगी सामग्री","दीया"]','[]','[]','moon'),

('dhanteras-2027','Dhanteras','धनतेरस','2027-10-27','धनतेरस',
 'The first day of Diwali, worship of Dhanvantari and Kuber. Buying metal is auspicious.',
 'दीपावली का पहला दिन, धन्वंतरि और कुबेर का पूजन। धातु खरीदना शुभ है।',
 'Pradosh kaal, sthir lagna','प्रदोष काल, स्थिर लग्न',
 '["13 diyas","New utensil or metal","Lakshmi Ganesha idols","Sweets"]','["१३ दीये","नया बर्तन या धातु","लक्ष्मी गणेश की मूर्तियाँ","मिठाई"]','[]','[]','coins'),

('diwali-2027','Diwali (Lakshmi Puja)','दीपावली (लक्ष्मी पूजा)','2027-10-29','दीपावली',
 'The festival of light. Maa Lakshmi is welcomed into clean, lamp lit homes on Kartik Amavasya.',
 'प्रकाश का पर्व। कार्तिक अमावस्या पर स्वच्छ, दीपों से जगमगाते घरों में माँ लक्ष्मी का स्वागत।',
 'Pradosh kaal Lakshmi puja, sthir lagna','प्रदोष काल लक्ष्मी पूजा, स्थिर लग्न',
 '["Lakshmi Ganesha idols","Diyas and oil","Rangoli colours","Lotus flowers","Kumkum and akshat"]','["लक्ष्मी गणेश की मूर्तियाँ","दीये और तेल","रंगोली के रंग","कमल के फूल","कुमकुम और अक्षत"]',
 '["Clean and decorate the home, draw a rangoli at the entrance.","At pradosh kaal, place Lakshmi Ganesha on a red cloth chowki.","Offer kumkum, akshat and lotus, then chant Om Shreem Mahalakshmyai Namah 108 times.","Light diyas in every corner of the home.","Perform Lakshmi aarti with the family and share prasad."]',
 '["घर को स्वच्छ कर सजाएँ, द्वार पर रंगोली बनाएँ।","प्रदोष काल में लक्ष्मी गणेश को लाल वस्त्र की चौकी पर रखें।","कुमकुम, अक्षत और कमल अर्पित करें, फिर ॐ श्रीं महालक्ष्म्यै नमः का १०८ बार जप करें।","घर के हर कोने में दीये जलाएँ।","परिवार संग लक्ष्मी आरती करें और प्रसाद बाँटें।"]','sparkles'),

('govardhan-2027','Govardhan Puja','गोवर्धन पूजा','2027-10-30','गोवर्धन पूजा',
 'Honouring the Govardhan hill that Krishna lifted, with annakut, a mountain of food offered in gratitude.',
 'उस गोवर्धन पर्वत का पूजन जिसे कृष्ण ने उठाया, अन्नकूट के साथ, कृतज्ञता में अर्पित भोजन का पर्वत।',
 'Pratipada, morning','प्रतिपदा, प्रातः',
 '["Annakut, varied foods","Cow dung Govardhan","Flowers","Diya"]','["अन्नकूट, विविध भोजन","गोबर का गोवर्धन","फूल","दीया"]','[]','[]','landmark'),

('bhai-dooj-2027','Bhai Dooj','भाई दूज','2027-10-31','भाई दूज',
 'Sisters apply tilak to their brothers, praying for their long life, the loving close of Diwali.',
 'बहनें भाइयों को तिलक लगाती हैं, उनकी दीर्घायु की प्रार्थना करती हैं, दीपावली का स्नेहमय समापन।',
 'Aparahna tilak muhurat','अपराह्न तिलक मुहूर्त',
 '["Roli and akshat","Sweets","Coconut"]','["रोली और अक्षत","मिठाई","नारियल"]','[]','[]','heart'),

('chhath-2027','Chhath Puja','छठ पूजा','2027-11-04','छठ पूजा',
 'A four day vow to Surya Dev and Chhathi Maiya, with arghya offered to the setting and rising sun by the water.',
 'सूर्य देव और छठी मैया को चार दिवसीय व्रत, जल के किनारे अस्त और उदय होते सूर्य को अर्घ्य के साथ।',
 'Arghya at sunset and sunrise','सूर्यास्त और सूर्योदय पर अर्घ्य',
 '["Bamboo soop and basket","Thekua","Fruits, sugarcane","Diya"]','["बाँस का सूप और टोकरी","ठेकुआ","फल, गन्ना","दीया"]','[]','[]','sun'),

('kartik-purnima-2027','Kartik Purnima (Dev Diwali)','कार्तिक पूर्णिमा (देव दीपावली)','2027-11-14','कार्तिक पूर्णिमा',
 'The devas own Diwali, with lamps on the ghats, snan and daan, as the Tulsi Vivah season concludes.',
 'देवताओं की अपनी दीपावली, घाटों पर दीप, स्नान और दान, जब तुलसी विवाह का समय पूर्ण होता है।',
 'Snan at brahma muhurat, deepdaan at pradosh','ब्रह्म मुहूर्त में स्नान, प्रदोष में दीपदान',
 '["Diyas","Tulsi leaves","Ganga jal"]','["दीये","तुलसी दल","गंगा जल"]','[]','[]','flame'),

('gita-jayanti-2027','Gita Jayanti','गीता जयंती','2027-12-09','गीता जयंती',
 'The day the Bhagavad Gita was spoken by Shri Krishna to Arjuna at Kurukshetra, honoured with its recitation.',
 'वह दिन जब श्री कृष्ण ने कुरुक्षेत्र में अर्जुन को भगवद्गीता सुनाई, उसके पाठ के साथ मनाया जाता है।',
 'Shukla Ekadashi, morning','शुक्ल एकादशी, प्रातः',
 '["Bhagavad Gita","Tulsi and flowers","Diya","Yellow sweets"]','["भगवद्गीता","तुलसी और फूल","दीया","पीली मिठाई"]','[]','[]','sun')

on conflict (id) do update set
  name=excluded.name, name_hi=excluded.name_hi, date=excluded.date, deva=excluded.deva,
  about=excluded.about, about_hi=excluded.about_hi, muhurat=excluded.muhurat, muhurat_hi=excluded.muhurat_hi,
  samagri=excluded.samagri, samagri_hi=excluded.samagri_hi, vidhi=excluded.vidhi, vidhi_hi=excluded.vidhi_hi,
  icon=excluded.icon;
