-- ============================================================================
--  DIVASYA migration 009 — Festivals, bilingual + cleaned
--  Adds Hindi (name, about, muhurat, samagri, vidhi) to the 12 seeded festivals
--  and rewrites the English text to remove em dashes. Dates are unchanged.
--  Idempotent upserts.
-- ============================================================================

insert into public.festivals (id,name,name_hi,date,deva,about,about_hi,muhurat,muhurat_hi,samagri,samagri_hi,vidhi,vidhi_hi,icon) values

('guru-purnima','Guru Purnima','गुरु पूर्णिमा','2026-07-29','गुरु पूर्णिमा',
 'A day to honour the guru, the light that dispels darkness. On Ashadha Purnima devotees offer gratitude to their teachers and spiritual guides.',
 'गुरु के सम्मान का दिन, वह प्रकाश जो अंधकार को दूर करता है। आषाढ़ पूर्णिमा पर भक्त अपने शिक्षकों और आध्यात्मिक गुरुओं के प्रति कृतज्ञता अर्पित करते हैं।',
 'Purnima tithi, puja from early morning through moonrise','पूर्णिमा तिथि, प्रातः से चंद्रोदय तक पूजा',
 '["Fresh flowers","Fruits","Sweets","Incense sticks","Diya and ghee","Chandan","A photo of your guru or Ved Vyasa"]',
 '["ताज़े फूल","फल","मिठाई","अगरबत्ती","दीया और घी","चंदन","अपने गुरु या वेद व्यास का चित्र"]',
 '["Wake early, bathe and wear clean clothes.","Place a picture of your guru or Ved Vyasa and offer chandan, flowers and sweets.","Light a ghee diya and incense.","Chant the Guru Vandana, Gurur Brahma Gurur Vishnu.","Offer gratitude, speak or write what your teachers gave you.","Do 11 or 108 japa of your guru mantra.","Conclude with aarti and share prasad."]',
 '["जल्दी उठकर स्नान करें और स्वच्छ वस्त्र पहनें।","अपने गुरु या वेद व्यास का चित्र रखें और चंदन, फूल तथा मिठाई अर्पित करें।","घी का दीया और अगरबत्ती जलाएँ।","गुरु वंदना का जप करें, गुरुर्ब्रह्मा गुरुर्विष्णु।","कृतज्ञता अर्पित करें, अपने गुरुओं से जो पाया उसे कहें या लिखें।","अपने गुरु मंत्र का ११ या १०८ जप करें।","आरती से समापन करें और प्रसाद बाँटें।"]','sun'),

('nag-panchami','Nag Panchami','नाग पंचमी','2026-08-17','नाग पंचमी',
 'Worship of the serpent devas for protection and the wellbeing of the family.',
 'सर्प देवताओं का पूजन, परिवार की रक्षा और कल्याण के लिए।',
 'Shukla Panchami, morning puja','शुक्ल पंचमी, प्रातःकालीन पूजा',
 '["Milk","Flowers","Turmeric and kumkum","Diya"]','["दूध","फूल","हल्दी और कुमकुम","दीया"]',
 '[]','[]','shield'),

('raksha-bandhan','Raksha Bandhan','रक्षा बंधन','2026-08-28','रक्षा बंधन',
 'The festival of the sacred thread. Sisters tie a rakhi for their brothers long life, and brothers vow to protect them.',
 'पवित्र धागे का पर्व। बहनें अपने भाइयों की दीर्घायु के लिए राखी बाँधती हैं, और भाई उनकी रक्षा का वचन देते हैं।',
 'Aparahna muhurat, avoid Bhadra','अपराह्न मुहूर्त, भद्रा से बचें',
 '["Rakhi","Roli and akshat","Sweets","Diya"]','["राखी","रोली और अक्षत","मिठाई","दीया"]',
 '[]','[]','heart'),

('janmashtami','Krishna Janmashtami','कृष्ण जन्माष्टमी','2026-09-04','कृष्ण जन्माष्टमी',
 'The midnight birth of Bhagwan Shri Krishna, kept with fasting, bhajan and the joy of the makhan chor.',
 'भगवान श्री कृष्ण का मध्यरात्रि अवतरण, उपवास, भजन और माखनचोर के आनंद के साथ मनाया जाता है।',
 'Nishita puja at midnight','निशीथ पूजा, मध्यरात्रि',
 '["Krishna idol or photo","Makhan and mishri","Tulsi leaves","Panchamrit","Flowers and diya","New clothes for Laddoo Gopal"]',
 '["कृष्ण की मूर्ति या चित्र","माखन और मिश्री","तुलसी दल","पंचामृत","फूल और दीया","लड्डू गोपाल के लिए नए वस्त्र"]',
 '["Observe a fast through the day, phalahar is permitted.","Decorate the mandir and the jhula for Laddoo Gopal.","At midnight, bathe the idol with panchamrit.","Dress Laddoo Gopal in new clothes and offer makhan mishri with tulsi.","Sing bhajans and do Krishna aarti.","Break the fast after the midnight puja."]',
 '["दिन भर उपवास रखें, फलाहार की अनुमति है।","मंदिर और लड्डू गोपाल के झूले को सजाएँ।","मध्यरात्रि को मूर्ति को पंचामृत से स्नान कराएँ।","लड्डू गोपाल को नए वस्त्र पहनाएँ और तुलसी संग माखन मिश्री अर्पित करें।","भजन गाएँ और कृष्ण आरती करें।","मध्यरात्रि पूजा के बाद उपवास खोलें।"]','flame'),

('ganesh-chaturthi','Ganesh Chaturthi','गणेश चतुर्थी','2026-09-14','गणेश चतुर्थी',
 'Welcoming Ganpati Bappa home for ten days of devotion, modak and community celebration.',
 'गणपति बप्पा का घर में स्वागत, दस दिनों की भक्ति, मोदक और सामूहिक उत्सव।',
 'Madhyahna muhurat, midday','मध्याह्न मुहूर्त, दोपहर',
 '["Ganesha idol, eco friendly","Modak or laddoo","Durva grass","Red hibiscus flowers","Sindoor","Diya and incense"]',
 '["गणेश की मूर्ति, पर्यावरण अनुकूल","मोदक या लड्डू","दूर्वा","लाल गुड़हल के फूल","सिंदूर","दीया और अगरबत्ती"]',
 '["Install the idol on a raised chowki facing east.","Do pran pratishtha with the Ganesh mantra.","Offer durva, red flowers, sindoor and 21 modaks.","Chant Om Gan Ganpataye Namah 108 times.","Perform aarti morning and evening.","On visarjan day, thank Bappa and immerse the idol gently."]',
 '["मूर्ति को पूर्वमुखी ऊँची चौकी पर स्थापित करें।","गणेश मंत्र से प्राण प्रतिष्ठा करें।","दूर्वा, लाल फूल, सिंदूर और २१ मोदक अर्पित करें।","ॐ गं गणपतये नमः का १०८ बार जप करें।","प्रातः और संध्या आरती करें।","विसर्जन के दिन बप्पा का धन्यवाद कर मूर्ति को कोमलता से विसर्जित करें।"]','landmark'),

('sharad-navratri','Sharad Navratri begins','शरद नवरात्रि आरंभ','2026-10-11','शरद नवरात्रि',
 'Nine nights of the Divine Mother, her nine forms, with fasting, garba and shakti sadhana.',
 'आदिशक्ति माता की नौ रातें, उनके नौ रूप, उपवास, गरबा और शक्ति साधना के साथ।',
 'Ghatasthapana in the morning muhurat','प्रातःकालीन मुहूर्त में घटस्थापना',
 '["Kalash","Barley seeds","Red chunri","Coconut","Flowers","Akhand jyoti diya"]',
 '["कलश","जौ के बीज","लाल चुनरी","नारियल","फूल","अखंड ज्योति दीया"]',
 '[]','[]','flower'),

('dussehra','Dussehra (Vijayadashami)','दशहरा (विजयादशमी)','2026-10-20','विजयादशमी',
 'The victory of dharma, Shri Ram over Ravana and the Devi over Mahishasura.',
 'धर्म की विजय, श्री राम की रावण पर और देवी की महिषासुर पर।',
 'Vijay muhurat, aparahna','विजय मुहूर्त, अपराह्न',
 '["Shami leaves","Aparajita flowers","Sweets"]','["शमी पत्र","अपराजिता के फूल","मिठाई"]',
 '[]','[]','sword'),

('karwa-chauth','Karwa Chauth','करवा चौथ','2026-10-29','करवा चौथ',
 'A day long nirjala vrat by married women for the long life of their husbands, broken after moonrise.',
 'विवाहित स्त्रियों का दिनभर का निर्जला व्रत, पति की दीर्घायु के लिए, चंद्रोदय के बाद खोला जाता है।',
 'Puja in the evening, moonrise near 8 PM','संध्या पूजा, चंद्रोदय लगभग ८ बजे',
 '["Karwa, earthen pot","Sieve","Mehndi","Sargi items","Diya"]','["करवा, मिट्टी का पात्र","छलनी","मेहंदी","सरगी सामग्री","दीया"]',
 '[]','[]','moon'),

('dhanteras','Dhanteras','धनतेरस','2026-11-06','धनतेरस',
 'The first day of Diwali, worship of Dhanvantari and Kuber. Buying metal is considered auspicious.',
 'दीपावली का पहला दिन, धन्वंतरि और कुबेर का पूजन। धातु खरीदना शुभ माना जाता है।',
 'Pradosh kaal, sthir lagna','प्रदोष काल, स्थिर लग्न',
 '["13 diyas","New utensil or metal","Lakshmi Ganesha idols","Sweets"]','["१३ दीये","नया बर्तन या धातु","लक्ष्मी गणेश की मूर्तियाँ","मिठाई"]',
 '[]','[]','coins'),

('diwali','Diwali (Lakshmi Puja)','दीपावली (लक्ष्मी पूजा)','2026-11-08','दीपावली',
 'The festival of light. Maa Lakshmi is welcomed into clean, lamp lit homes on Kartik Amavasya.',
 'प्रकाश का पर्व। कार्तिक अमावस्या पर स्वच्छ, दीपों से जगमगाते घरों में माँ लक्ष्मी का स्वागत।',
 'Pradosh kaal Lakshmi puja, sthir lagna','प्रदोष काल लक्ष्मी पूजा, स्थिर लग्न',
 '["Lakshmi Ganesha idols","Diyas and oil","Rangoli colours","Lotus flowers","Kheel batasha","Coins","Kumkum and akshat"]',
 '["लक्ष्मी गणेश की मूर्तियाँ","दीये और तेल","रंगोली के रंग","कमल के फूल","खील बताशा","सिक्के","कुमकुम और अक्षत"]',
 '["Clean and decorate the home, draw a rangoli at the entrance.","At pradosh kaal, place Lakshmi Ganesha on a red cloth chowki.","Do shodashopachara puja, offer kumkum, akshat and lotus.","Chant Om Shreem Mahalakshmyai Namah 108 times.","Light diyas in every corner of the home.","Perform Lakshmi aarti with the family and share prasad."]',
 '["घर को स्वच्छ कर सजाएँ, द्वार पर रंगोली बनाएँ।","प्रदोष काल में लक्ष्मी गणेश को लाल वस्त्र की चौकी पर रखें।","षोडशोपचार पूजा करें, कुमकुम, अक्षत और कमल अर्पित करें।","ॐ श्रीं महालक्ष्म्यै नमः का १०८ बार जप करें।","घर के हर कोने में दीये जलाएँ।","परिवार संग लक्ष्मी आरती करें और प्रसाद बाँटें।"]','sparkles'),

('bhai-dooj','Bhai Dooj','भाई दूज','2026-11-11','भाई दूज',
 'Sisters apply tilak to their brothers, praying for their long life, the loving close of Diwali.',
 'बहनें अपने भाइयों को तिलक लगाती हैं, उनकी दीर्घायु की प्रार्थना करती हैं, दीपावली का स्नेहमय समापन।',
 'Aparahna tilak muhurat','अपराह्न तिलक मुहूर्त',
 '["Roli and akshat","Sweets","Coconut"]','["रोली और अक्षत","मिठाई","नारियल"]',
 '[]','[]','heart'),

('kartik-purnima','Kartik Purnima (Dev Diwali)','कार्तिक पूर्णिमा (देव दीपावली)','2026-11-24','कार्तिक पूर्णिमा',
 'The devas own Diwali, with lamps on the ghats, snan and daan, as the Tulsi Vivah season concludes.',
 'देवताओं की अपनी दीपावली, घाटों पर दीप, स्नान और दान, जब तुलसी विवाह का समय पूर्ण होता है।',
 'Snan at brahma muhurat, deepdaan at pradosh','ब्रह्म मुहूर्त में स्नान, प्रदोष में दीपदान',
 '["Diyas","Tulsi leaves","Ganga jal"]','["दीये","तुलसी दल","गंगा जल"]',
 '[]','[]','flame')

on conflict (id) do update set
  name=excluded.name, name_hi=excluded.name_hi, date=excluded.date, deva=excluded.deva,
  about=excluded.about, about_hi=excluded.about_hi, muhurat=excluded.muhurat, muhurat_hi=excluded.muhurat_hi,
  samagri=excluded.samagri, samagri_hi=excluded.samagri_hi, vidhi=excluded.vidhi, vidhi_hi=excluded.vidhi_hi,
  icon=excluded.icon;
