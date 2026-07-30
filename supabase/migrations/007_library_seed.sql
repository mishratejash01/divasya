-- ============================================================================
--  DIVASYA migration 007 — Spiritual Library (bilingual)
--  Full article bodies in English and Hindi, grouped into shelves:
--  deities · festivals · practice · wisdom · jyotish.
--  Idempotent upserts — safe to re-run. No em dashes anywhere.
-- ============================================================================

insert into public.library_articles (id,title,title_hi,sub,sub_hi,read_time,kind,category,tint,sort,content,content_hi) values

-- ------------------------------------------------------------- practice
('l1','What is Meditation?','ध्यान क्या है?','Unlocking inner peace','भीतर की शांति','3 min','read','practice','#5F8657',10,
$s$Meditation, or dhyana, is the seventh limb of yoga. It is the art of resting your attention on one thing until the mind grows quiet. In the Indian tradition it is not about forcing thoughts to stop. It is about noticing them and gently returning to the object of focus, whether that is the breath, a mantra, or the form of your ishta devta.

Begin with five minutes after your morning snan. Sit comfortably, spine tall, and follow the breath. When the mind wanders, and it will, smile and return. The Gita calls this abhyasa, steady practice, and vairagya, quiet letting go.

The benefits arrive softly. A longer pause before anger. Deeper sleep. Clearer choices. As the Katha Upanishad says, when the five senses come to rest along with the mind, that is called the highest state.

Pair your dhyana with japa in the Mala counter. The mantra gives the wandering mind a beautiful home to return to.$s$,
$s$ध्यान, या ध्यान-योग, योग का सातवाँ अंग है। यह अपने चित्त को किसी एक वस्तु पर तब तक टिकाए रखने की कला है जब तक मन शांत न हो जाए। भारतीय परंपरा में इसका अर्थ विचारों को बलपूर्वक रोकना नहीं है। इसका अर्थ है उन्हें देखना और धीरे से अपने केंद्र पर लौट आना, चाहे वह श्वास हो, कोई मंत्र हो, या आपके इष्ट देव का रूप।

प्रातः स्नान के बाद पाँच मिनट से आरंभ करें। आराम से बैठें, रीढ़ सीधी रखें, और श्वास का अनुसरण करें। जब मन भटके, और वह भटकेगा, तो मुस्कुराइए और लौट आइए। गीता इसे अभ्यास और वैराग्य कहती है।

लाभ धीरे-धीरे आते हैं। क्रोध से पहले एक लंबा ठहराव। गहरी नींद। स्पष्ट निर्णय। कठोपनिषद कहता है कि जब पाँचों इंद्रियाँ मन के साथ स्थिर हो जाती हैं, वही परम अवस्था कहलाती है।

अपने ध्यान को माला काउंटर में जप के साथ जोड़िए। मंत्र भटकते मन को लौटने के लिए एक सुंदर घर देता है।$s$),

('l2','The Seven Chakras','सात चक्र','Energy centres of the body','शरीर के ऊर्जा केंद्र','4 min','read','practice','#7D728F',11,
$s$The tantric tradition maps our subtle body through seven chakras, wheels of prana along the spine.

Muladhara, at the root, grounds survival and stability. Svadhisthana, the sacral, carries creativity and desire. Manipura, at the navel, is willpower, the fire of tapas. Anahata, the heart, is love and compassion, where the unstruck sound is heard. Vishuddha, the throat, is truth and expression. Ajna, the third eye, is intuition, where the guru places the tilak. Sahasrara, the crown, is the thousand petalled lotus, union with the divine.

You do not need esoteric rituals to work with them. Grounded routines steady Muladhara. Creative seva opens Svadhisthana. Disciplined practice kindles Manipura. Gratitude softens Anahata. Honest speech clears Vishuddha. Dhyana awakens Ajna.

Treat the chakras as a mirror for self awareness rather than a checklist. Ask yourself where your energy feels stuck today.$s$,
$s$तांत्रिक परंपरा हमारे सूक्ष्म शरीर को सात चक्रों के माध्यम से दर्शाती है, जो रीढ़ के साथ प्राण के पहिए हैं।

मूलाधार, जड़ में, अस्तित्व और स्थिरता को आधार देता है। स्वाधिष्ठान रचनात्मकता और इच्छा को धारण करता है। मणिपुर, नाभि पर, इच्छाशक्ति है, तप की अग्नि। अनाहत, हृदय, प्रेम और करुणा है, जहाँ अनहद नाद सुना जाता है। विशुद्ध, कंठ, सत्य और अभिव्यक्ति है। आज्ञा, तीसरा नेत्र, अंतर्ज्ञान है, जहाँ गुरु तिलक लगाते हैं। सहस्रार, मुकुट, सहस्रदल कमल है, दिव्य से मिलन।

इनके साथ कार्य करने के लिए किसी गूढ़ अनुष्ठान की आवश्यकता नहीं। स्थिर दिनचर्या मूलाधार को दृढ़ करती है। रचनात्मक सेवा स्वाधिष्ठान को खोलती है। अनुशासित साधना मणिपुर को प्रज्वलित करती है। कृतज्ञता अनाहत को कोमल करती है। सच्ची वाणी विशुद्ध को स्वच्छ करती है। ध्यान आज्ञा को जगाता है।

चक्रों को एक जाँच-सूची के बजाय आत्म-जागरूकता का दर्पण मानिए। स्वयं से पूछिए कि आज आपकी ऊर्जा कहाँ अटकी हुई लगती है।$s$),

('l3','Power of Hanuman Chalisa','हनुमान चालीसा की शक्ति','Daily protection','नित्य रक्षा','3 min','read','deities','#B07A4E',12,
$s$Composed by Goswami Tulsidas in Awadhi, the Hanuman Chalisa is forty verses of concentrated courage. Devotees recite it for protection, strength and freedom from fear, for Hanuman Ji is the one before whom even Shani bows.

Each chaupai carries a blessing. "Bhoot pishaach nikat nahin aavai" wards off negativity. "Sankat se Hanuman chhudaavai" releases us from crisis. "Buddhi heen tanu jaanike" begins with humility, the key that opens the whole prayer.

A simple sadhana is to recite it once every morning, or seven times on Tuesdays and Saturdays. Read the meaning once a week so the verses become prayers rather than sounds.

When fear visits, before an interview, a diagnosis, a difficult conversation, the Chalisa is a rope of sound that leads back to your own strength. Bal buddhi vidya dehu mohin, give me strength, wisdom and knowledge.$s$,
$s$गोस्वामी तुलसीदास द्वारा अवधी में रचित, हनुमान चालीसा चालीस चौपाइयों में संचित साहस है। भक्त इसे रक्षा, बल और भय से मुक्ति के लिए पढ़ते हैं, क्योंकि हनुमान जी वही हैं जिनके सामने शनि भी नतमस्तक होते हैं।

हर चौपाई एक आशीर्वाद लिए है। "भूत पिशाच निकट नहिं आवै" नकारात्मकता को दूर करती है। "संकट से हनुमान छुड़ावै" संकट से मुक्त करती है। "बुद्धिहीन तनु जानिके" विनम्रता से आरंभ होती है, वही कुंजी जो पूरी प्रार्थना को खोलती है।

एक सरल साधना है इसे हर प्रातः एक बार पढ़ना, या मंगल और शनिवार को सात बार। सप्ताह में एक बार अर्थ पढ़िए ताकि चौपाइयाँ केवल ध्वनि न रहकर प्रार्थना बन जाएँ।

जब भय आए, किसी साक्षात्कार से पहले, किसी निदान से पहले, किसी कठिन बातचीत से पहले, चालीसा ध्वनि की वह रस्सी है जो आपको आपके अपने बल तक लौटा लाती है। बल बुद्धि विद्या देहु मोहिं।$s$),

('l4','Understanding Karma','कर्म को समझना','The law of cause and effect','कारण और प्रभाव का नियम','4 min','read','wisdom','#9C8544',30,
$s$Karma simply means action, and the deepest teaching of the Gita is about how to act. Every action plants a seed, a bija. Circumstances are the fruit, the phala, of older seeds. This is not fatalism. What you sow now shapes what ripens later.

Krishna's counsel in the second chapter is karmanye vadhikaraste, you have the right to act, never to the fruits. Act with full effort, release the outcome. This is nishkaam karma, and it turns work into worship.

Three kinds of karma are described. Sanchita is the stored heap. Prarabdha is the portion ripening in this life, the part that jyotish reads. Kriyamana is what you are creating right now. Astrology maps the weather of prarabdha. Your free will steers the ship.

So when a dasha period feels heavy, remember that the chart shows the season, not the sentence. Right action in a hard season is the highest tapasya, and it writes a kinder future.$s$,
$s$कर्म का अर्थ है क्रिया, और गीता की गहनतम शिक्षा यही है कि कैसे कर्म किया जाए। हर क्रिया एक बीज बोती है। परिस्थितियाँ पुराने बीजों का फल हैं। यह भाग्यवाद नहीं है। जो आप अभी बोते हैं वही आगे पकता है।

दूसरे अध्याय में कृष्ण का उपदेश है, कर्मण्येवाधिकारस्ते, तुम्हारा अधिकार केवल कर्म पर है, फल पर कभी नहीं। पूरे प्रयास से कर्म करो, फल को छोड़ दो। यही निष्काम कर्म है, और यही कर्म को पूजा बना देता है।

कर्म तीन प्रकार के कहे गए हैं। संचित संचित राशि है। प्रारब्ध इस जीवन में पकने वाला भाग है, वही जिसे ज्योतिष पढ़ता है। क्रियमाण वह है जो आप इसी क्षण रच रहे हैं। ज्योतिष प्रारब्ध का मौसम दिखाता है। आपकी इच्छाशक्ति नाव को दिशा देती है।

इसलिए जब कोई दशा भारी लगे, स्मरण रखिए कि कुंडली ऋतु दिखाती है, दंड नहीं। कठिन ऋतु में सही कर्म ही सर्वोच्च तपस्या है, और वही एक कोमल भविष्य लिखता है।$s$),

('l5','Why We Do Aarti','हम आरती क्यों करते हैं','The circle of light','प्रकाश का वृत्त','3 min','read','practice','#A45E6B',13,
$s$Aarti is the crescendo of Hindu worship, a lit lamp moved in circles before the deity while the family sings. The flame, camphor bright, stands for the soul itself. We offer our own light back to its source.

The circular motion traces Om. The bell clears the mind of chatter. The conch announces auspiciousness. When you cup your palms over the flame and touch them to your eyes, you take the deity's light into your own sight, a wish to see the world as divine today.

Do aarti at home simply. One diya, one bell, one song sung with the heart. Morning aarti opens the day with gratitude. Evening aarti, the sandhya, closes it with surrender.

In the app's My Mandir you can light the diya, ring the bell and play the aarti of your ishta devta, a two minute ritual that changes the texture of an entire day.$s$,
$s$आरती हिंदू पूजा का चरम है, देव के सम्मुख वृत्त में घुमाया गया प्रज्वलित दीप, जबकि परिवार गाता है। कपूर सी उज्ज्वल ज्योति स्वयं आत्मा का प्रतीक है। हम अपना प्रकाश उसके स्रोत को लौटाते हैं।

वृत्ताकार गति ॐ को अंकित करती है। घंटी मन के कोलाहल को हटाती है। शंख मंगल की घोषणा करता है। जब आप ज्योति पर हथेलियाँ रखकर उन्हें अपने नेत्रों से स्पर्श करते हैं, तो देव के प्रकाश को अपनी दृष्टि में ले लेते हैं, यह कामना कि आज संसार को दिव्य रूप में देखूँ।

घर पर आरती सरलता से कीजिए। एक दीया, एक घंटी, हृदय से गाया एक गीत। प्रातः आरती दिन को कृतज्ञता से खोलती है। संध्या आरती उसे समर्पण से समाप्त करती है।

ऐप के माय मंदिर में आप दीया जला सकते हैं, घंटी बजा सकते हैं और अपने इष्ट देव की आरती चला सकते हैं, दो मिनट का एक अनुष्ठान जो पूरे दिन की बुनावट बदल देता है।$s$),

('l6','Fasting with Wisdom','विवेक से उपवास','The science of vrat','व्रत का विज्ञान','3 min','read','practice','#5E7C93',14,
$s$A vrat is a vow, and fasting is its most common form. Ekadashi, Pradosh, Navratri, Karwa Chauth, each fast pairs an inner intention with an outer discipline.

The tradition is flexible and humane. Nirjala, without water, is for the strong and healthy. Phalahar, fruits and milk, is the common middle path. For the unwell, simply giving up one beloved food honours the vow. The Gita warns against extremes, for yuktahara, moderation, is itself yoga.

Why fast? The body lightens, and with it the mind. Hunger, met consciously, becomes a bell of remembrance. Every pang points back to the deity of the day. Ekadashi rests the digestion twice a month in rhythm with the moon, an ancient chronobiology.

Break the fast gently, with gratitude and charity. A vrat completed in anger profits nothing. A simple fast completed in love is worth a hundred rituals.$s$,
$s$व्रत एक संकल्प है, और उपवास उसका सबसे सामान्य रूप है। एकादशी, प्रदोष, नवरात्रि, करवा चौथ, हर उपवास एक भीतरी संकल्प को बाहरी अनुशासन से जोड़ता है।

परंपरा लचीली और मानवीय है। निर्जला, बिना जल के, बलवान और स्वस्थ के लिए है। फलाहार, फल और दूध, सामान्य मध्य मार्ग है। अस्वस्थ के लिए, केवल एक प्रिय भोजन का त्याग ही संकल्प का सम्मान है। गीता अति से सावधान करती है, क्योंकि युक्ताहार, संयम, स्वयं योग है।

उपवास क्यों? शरीर हल्का होता है, और उसके साथ मन भी। भूख, सचेत रूप से सही जाए, तो स्मरण की घंटी बन जाती है। हर पीड़ा उस दिन के देव की ओर संकेत करती है। एकादशी माह में दो बार चंद्र की लय में पाचन को विश्राम देती है, एक प्राचीन जैव-घड़ी।

उपवास को कृतज्ञता और दान के साथ कोमलता से खोलिए। क्रोध में पूरा किया व्रत कुछ नहीं देता। प्रेम में पूरा किया सरल उपवास सौ अनुष्ठानों के बराबर है।$s$),

-- ------------------------------------------------------------- deities
('dei-krishna','Who is Shri Krishna','श्री कृष्ण कौन हैं','The playful teacher of the Gita','गीता के लीलामय गुरु','4 min','read','deities','#5E7C93',20,
$s$Shri Krishna is the eighth avatar of Vishnu, and perhaps the most beloved face of the divine in India. He is the butter thief of Gokul, the flute player of Vrindavan, the friend of the Pandavas, and the teacher of the Bhagavad Gita. In one life he holds the whole range of human love, the child, the friend, the beloved, and the guide.

His childhood leelas are not just sweet stories. They teach that the divine is near, playful, and reachable through love rather than fear. His raas with the gopis is read by saints as the soul's longing for God.

On the battlefield of Kurukshetra, when Arjuna's courage failed, Krishna spoke the Gita. Do your duty, he said, without attachment to the fruit. Offer your actions to me, and be free of sorrow. This one teaching has steadied countless lives.

To keep Krishna close, chant the Hare Krishna maha mantra, offer makhan and tulsi, and read a few verses of the Gita each week. He asks not for grand ritual but for a heart turned toward him.$s$,
$s$श्री कृष्ण विष्णु के आठवें अवतार हैं, और संभवतः भारत में दिव्य का सबसे प्रिय रूप। वे गोकुल के माखनचोर हैं, वृंदावन के मुरलीधर, पांडवों के सखा, और भगवद्गीता के उपदेष्टा। एक ही जीवन में वे मानव प्रेम की समूची विविधता समेटे हैं, बालक, सखा, प्रियतम, और मार्गदर्शक।

उनकी बाल-लीलाएँ केवल मधुर कथाएँ नहीं हैं। वे सिखाती हैं कि दिव्य निकट है, लीलामय है, और भय से नहीं बल्कि प्रेम से सुलभ है। संतजन गोपियों संग उनके रास को आत्मा की ईश्वर के प्रति तड़प के रूप में पढ़ते हैं।

कुरुक्षेत्र के रणक्षेत्र में, जब अर्जुन का साहस डगमगाया, कृष्ण ने गीता कही। अपना कर्तव्य करो, उन्होंने कहा, फल की आसक्ति के बिना। अपने कर्म मुझे अर्पित करो, और शोक से मुक्त हो जाओ। इसी एक शिक्षा ने असंख्य जीवनों को स्थिर किया है।

कृष्ण को निकट रखने के लिए हरे कृष्ण महामंत्र का जप कीजिए, माखन और तुलसी अर्पित कीजिए, और सप्ताह में गीता के कुछ श्लोक पढ़िए। वे भव्य कर्मकांड नहीं, बस अपनी ओर मुड़ा हुआ हृदय माँगते हैं।$s$),

('dei-shiva','Who is Mahadev','महादेव कौन हैं','The stillness at the centre of all','सबके केंद्र की परम शांति','4 min','read','deities','#7D728F',21,
$s$Shiva is Mahadev, the great god, and the most paradoxical face of the divine. He is the ascetic seated in silence on Mount Kailash, and he is the dancer whose tandava turns the wheel of creation and dissolution. He is auspiciousness itself, for the very word Shiva means the kind one.

He wears ash and a crescent moon, holds the Ganga in his hair, and carries the trishul of the three gunas. The serpent around his neck is fear itself, tamed and worn as an ornament. His third eye is the vision that burns illusion away.

Shiva teaches the hardest and simplest lesson, that peace is found not in getting more but in wanting less. He drank the poison of the churning ocean to save the world and held it in his throat, which is why he is Neelkanth, the blue throated one. The one who can hold pain without passing it on is truly divine.

To honour him, offer water or milk on the lingam on Mondays, chant Om Namah Shivaya, and sit for a few minutes in his stillness. He is quickest to please and asks for almost nothing.$s$,
$s$शिव महादेव हैं, देवों के देव, और दिव्य का सबसे विरोधाभासी रूप। वे कैलास पर मौन में बैठे तपस्वी हैं, और वे वह नर्तक हैं जिनका तांडव सृष्टि और प्रलय का चक्र घुमाता है। वे स्वयं मंगल हैं, क्योंकि शिव शब्द का अर्थ ही है कल्याणकारी।

वे भस्म और अर्धचंद्र धारण करते हैं, अपनी जटाओं में गंगा को थामे हैं, और तीन गुणों का त्रिशूल लिए हैं। गले का सर्प स्वयं भय है, जो वश में किया गया और आभूषण की तरह पहना गया। उनका तीसरा नेत्र वह दृष्टि है जो भ्रम को भस्म कर देती है।

शिव सबसे कठिन और सबसे सरल पाठ सिखाते हैं, कि शांति अधिक पाने में नहीं बल्कि कम चाहने में है। उन्होंने समुद्र मंथन का विष संसार की रक्षा हेतु पिया और उसे कंठ में धारण किया, इसीलिए वे नीलकंठ हैं। जो पीड़ा को बिना आगे बढ़ाए धारण कर सके, वही सच्चा दिव्य है।

उन्हें प्रसन्न करने के लिए सोमवार को लिंग पर जल या दूध चढ़ाइए, ॐ नमः शिवाय का जप कीजिए, और कुछ क्षण उनकी शांति में बैठिए। वे शीघ्र प्रसन्न होते हैं और लगभग कुछ नहीं माँगते।$s$),

('dei-durga','Who is Maa Durga','माँ दुर्गा कौन हैं','The fierce and tender mother','प्रचंड और वात्सल्यमयी माँ','4 min','read','deities','#A45E6B',22,
$s$Durga is the Divine Mother in her form of power, Shakti made visible. She was born from the combined light of all the gods when no single deva could defeat the buffalo demon Mahishasura. Riding a lion, bearing a weapon in each of her many arms, she is strength gathered for the protection of the good.

Yet the same goddess who slays demons is infinitely tender to her children. This is the heart of the Indian idea of the divine feminine. Fierceness and love are not opposites. A mother is gentle with her child and fearless before anything that threatens it.

During Navratri her nine forms are worshipped across nine nights, from Shailaputri to Siddhidatri, each a stage of the soul's journey from the mountain to fulfilment. Devotees fast, light the akhand jyoti, and dance the garba in her joy.

Call on Durga when you feel small before a difficulty. Chant Om Dum Durgayai Namah, or read the Durga Saptashati. She gives not just protection but the courage to protect yourself.$s$,
$s$दुर्गा शक्ति के रूप में आदिशक्ति माता हैं, शक्ति का साकार रूप। उनका जन्म तब हुआ जब कोई अकेला देव महिषासुर को पराजित न कर सका, और समस्त देवों के संयुक्त तेज से वे प्रकट हुईं। सिंह पर सवार, अपनी अनेक भुजाओं में एक-एक शस्त्र धारण किए, वे सज्जनों की रक्षा हेतु एकत्रित शक्ति हैं।

फिर भी वही देवी जो असुरों का संहार करती हैं, अपने बच्चों के प्रति असीम वात्सल्यमयी हैं। यही भारतीय दिव्य नारीत्व का मर्म है। प्रचंडता और प्रेम विरोधी नहीं हैं। माँ अपने शिशु के प्रति कोमल होती है और उसे संकट में डालने वाली हर वस्तु के सामने निर्भय।

नवरात्रि में उनके नौ रूप नौ रातों में पूजे जाते हैं, शैलपुत्री से सिद्धिदात्री तक, हर एक आत्मा की यात्रा का एक सोपान। भक्त उपवास रखते हैं, अखंड ज्योति जलाते हैं, और उनके आनंद में गरबा करते हैं।

जब किसी कठिनाई के सामने आप स्वयं को छोटा अनुभव करें, दुर्गा को पुकारिए। ॐ दुं दुर्गायै नमः का जप कीजिए, या दुर्गा सप्तशती पढ़िए। वे केवल रक्षा नहीं, बल्कि स्वयं की रक्षा का साहस भी देती हैं।$s$),

('dei-ganesha','Who is Ganpati Bappa','गणपति बप्पा कौन हैं','The remover of obstacles','विघ्नहर्ता','3 min','read','deities','#B8954F',23,
$s$Ganesha is worshipped first, before any other deity and before any new beginning. He is Vighnaharta, the remover of obstacles, and Buddhi Vinayak, the lord of wisdom. No wedding, no business, no journey begins without first remembering him.

His form is a lesson in itself. The large head reminds us to think big and listen well. The small eyes teach concentration. The large ears take in much and the small mouth speaks little. The single tusk tells us to hold to the one truth and let the rest go. He rides a humble mouse, showing that even the greatest can move through the smallest doors.

The story of how he circled his parents Shiva and Parvati, saying they were his whole world, and so won the race against his swift brother, teaches that devotion and love outrun mere speed.

Welcome Ganesha before anything new. Offer durva grass and modak, chant Om Gan Ganpataye Namah, and begin your work with a calm and clear mind. Ganpati Bappa Morya.$s$,
$s$गणेश सबसे पहले पूजे जाते हैं, हर अन्य देव से पहले और हर नए आरंभ से पहले। वे विघ्नहर्ता हैं, और बुद्धि विनायक, ज्ञान के स्वामी। कोई विवाह, कोई व्यापार, कोई यात्रा उन्हें स्मरण किए बिना आरंभ नहीं होती।

उनका स्वरूप स्वयं एक शिक्षा है। बड़ा मस्तक हमें विशाल सोचने और ध्यान से सुनने की सीख देता है। छोटे नेत्र एकाग्रता सिखाते हैं। बड़े कान बहुत ग्रहण करते हैं और छोटा मुख कम बोलता है। एकदंत हमें एक सत्य को थामे रहने और शेष को छोड़ने को कहता है। वे विनम्र मूषक की सवारी करते हैं, यह दर्शाते हुए कि महानतम भी छोटे से छोटे द्वार से निकल सकते हैं।

यह कथा कि कैसे उन्होंने अपने माता-पिता शिव और पार्वती की परिक्रमा की, यह कहकर कि वही उनका समस्त संसार हैं, और इस प्रकार अपने वेगवान भाई से दौड़ जीत ली, सिखाती है कि भक्ति और प्रेम केवल गति से आगे निकल जाते हैं।

हर नए कार्य से पहले गणेश का स्वागत कीजिए। दूर्वा और मोदक अर्पित कीजिए, ॐ गं गणपतये नमः का जप कीजिए, और शांत तथा स्पष्ट मन से अपना कार्य आरंभ कीजिए। गणपति बप्पा मोरया।$s$),

('dei-lakshmi','Who is Maa Lakshmi','माँ लक्ष्मी कौन हैं','Abundance, grace and dignity','समृद्धि, कृपा और गरिमा','3 min','read','deities','#C2A868',24,
$s$Lakshmi is the goddess of wealth, but the tradition means something far richer than money. She is Shri, the quality of auspiciousness, grace, and dignity that makes a life feel whole. She is seated on a lotus, which grows in muddy water yet stays untouched, a picture of purity in the midst of the world.

She is the consort of Vishnu, the preserver, which tells us that true wealth serves and sustains rather than merely accumulates. Where there is cleanliness, gratitude, and honest effort, there Lakshmi chooses to stay. Where there is greed, waste, and quarrel, she quietly leaves.

At Diwali she is welcomed into homes that have been cleaned and lit with rows of diyas. The lamps say to her that this heart and this home are ready to receive light.

To invite her grace, keep your space clean, give a portion of what you earn, and chant Om Shreem Mahalakshmyai Namah. Ask not only for money but for the wisdom to hold it well.$s$,
$s$लक्ष्मी धन की देवी हैं, पर परंपरा का अर्थ केवल धन से कहीं अधिक समृद्ध है। वे श्री हैं, वह मंगल, कृपा और गरिमा का गुण जो जीवन को पूर्ण बनाता है। वे कमल पर विराजमान हैं, जो कीचड़ में उगता है फिर भी अछूता रहता है, संसार के बीच पवित्रता का चित्र।

वे पालनकर्ता विष्णु की संगिनी हैं, जो बताता है कि सच्चा धन संचय मात्र नहीं करता, बल्कि सेवा और पोषण करता है। जहाँ स्वच्छता, कृतज्ञता और सच्चा परिश्रम है, वहाँ लक्ष्मी रहना चुनती हैं। जहाँ लोभ, अपव्यय और कलह है, वहाँ से वे चुपचाप चली जाती हैं।

दीपावली पर उनका स्वागत उन घरों में होता है जो स्वच्छ किए गए हों और दीयों की पंक्तियों से जगमगाते हों। दीप उनसे कहते हैं कि यह हृदय और यह घर प्रकाश ग्रहण करने को तैयार हैं।

उनकी कृपा को आमंत्रित करने के लिए अपना स्थान स्वच्छ रखिए, अपनी कमाई का एक अंश दान कीजिए, और ॐ श्रीं महालक्ष्म्यै नमः का जप कीजिए। केवल धन नहीं, उसे भली भाँति संभालने का विवेक भी माँगिए।$s$),

('dei-ram','Who is Shri Ram','श्री राम कौन हैं','The ideal of dharma','धर्म का आदर्श','4 min','read','deities','#CF924A',25,
$s$Shri Ram is the seventh avatar of Vishnu and the very model of dharma, right conduct lived under pressure. Where Krishna teaches the inner freedom of the wise, Ram shows the quiet strength of the good person who keeps their word whatever the cost. He is called Maryada Purushottam, the perfect man of noble limits.

His life is the Ramayana. Exiled for fourteen years on the eve of his coronation, he accepted it without bitterness to honour his father's word. When Sita was taken by Ravana, he crossed an ocean with an army of vanaras and the boundless devotion of Hanuman to bring her home. Every relationship in the story, son, brother, husband, king, is held to its highest ideal.

Ram teaches that greatness is not in never suffering but in never abandoning your values while you suffer. His name itself is a mantra. Saints say Ram Naam carries the soul across the ocean of the world.

Chant Shri Ram Jai Ram Jai Jai Ram, read a little of the Ramayana, and let his steadiness become a quiet standard for your own choices.$s$,
$s$श्री राम विष्णु के सातवें अवतार हैं और धर्म के साक्षात् आदर्श, दबाव में जिया गया सदाचार। जहाँ कृष्ण ज्ञानी की भीतरी स्वतंत्रता सिखाते हैं, वहीं राम उस सज्जन का शांत बल दिखाते हैं जो हर मूल्य चुकाकर भी अपना वचन निभाता है। वे मर्यादा पुरुषोत्तम कहलाते हैं।

उनका जीवन रामायण है। राज्याभिषेक की पूर्व संध्या पर चौदह वर्ष का वनवास, जिसे उन्होंने अपने पिता के वचन के सम्मान हेतु बिना कटुता के स्वीकार किया। जब सीता को रावण ने हर लिया, उन्होंने वानरों की सेना और हनुमान की असीम भक्ति के साथ समुद्र पार कर उन्हें लौटाया। कथा का हर संबंध, पुत्र, भ्राता, पति, राजा, अपने उच्चतम आदर्श पर टिका है।

राम सिखाते हैं कि महानता कभी दुख न सहने में नहीं, बल्कि दुख सहते हुए भी अपने मूल्यों को कभी न त्यागने में है। उनका नाम स्वयं एक मंत्र है। संत कहते हैं कि राम नाम आत्मा को संसार सागर से पार ले जाता है।

श्री राम जय राम जय जय राम का जप कीजिए, रामायण थोड़ी पढ़िए, और उनकी दृढ़ता को अपने निर्णयों का एक शांत मानदंड बनने दीजिए।$s$)

on conflict (id) do update set
  title=excluded.title, title_hi=excluded.title_hi, sub=excluded.sub, sub_hi=excluded.sub_hi,
  read_time=excluded.read_time, kind=excluded.kind, category=excluded.category, tint=excluded.tint,
  sort=excluded.sort, content=excluded.content, content_hi=excluded.content_hi;

-- ============================================================================
--  Batch 3 — Wisdom shelf + Jyotish shelf
-- ============================================================================
insert into public.library_articles (id,title,title_hi,sub,sub_hi,read_time,kind,category,tint,sort,content,content_hi) values

('wis-dharma','What is Dharma','धर्म क्या है','The path of right living','सही जीवन का मार्ग','4 min','read','wisdom','#9C8544',31,
$s$Dharma is one of the hardest words to translate, because it means several things at once, all of them true. It is duty, righteousness, natural law, and the way of living that upholds both the person and the world. The root means that which holds together. Dharma is whatever keeps life from falling into chaos.

There is a universal dharma, sanatana dharma, made of qualities every good life shares, truthfulness, non violence, patience, cleanliness, and self control. And there is svadharma, your own particular dharma, shaped by your nature, your stage of life, and your responsibilities. The Gita says a striking thing, that it is better to do your own dharma imperfectly than another's dharma perfectly.

Dharma is not a rigid rulebook. It asks you to weigh the situation and choose the action that causes the least harm and the most good. Sometimes the dharmic choice is difficult and unpopular. That is exactly when it matters most.

To live in dharma is to keep asking a simple question in every decision, not what do I want, but what is right here. The answer is not always easy, but the habit of asking slowly builds a life of integrity.$s$,
$s$धर्म का अनुवाद करना सबसे कठिन शब्दों में से एक है, क्योंकि इसका एक साथ कई अर्थ है, और सभी सत्य। यह कर्तव्य है, सदाचार, प्राकृतिक नियम, और वह जीवन-शैली जो व्यक्ति और संसार दोनों को धारण करती है। मूल का अर्थ है जो धारण करता है। धर्म वही है जो जीवन को अराजकता में गिरने से रोकता है।

एक सार्वभौमिक धर्म है, सनातन धर्म, उन गुणों से बना जो हर अच्छे जीवन में समान हैं, सत्य, अहिंसा, धैर्य, शुचिता, और आत्मसंयम। और एक स्वधर्म है, आपका अपना विशेष धर्म, जो आपके स्वभाव, जीवन की अवस्था, और उत्तरदायित्वों से बनता है। गीता एक विलक्षण बात कहती है, कि दूसरे के धर्म को पूर्णता से करने की अपेक्षा अपने धर्म को अपूर्ण रूप से करना श्रेष्ठ है।

धर्म कोई कठोर नियम-पुस्तिका नहीं है। यह आपसे परिस्थिति को तौलने और वह कर्म चुनने को कहता है जो कम से कम हानि और अधिक से अधिक भला करे। कभी-कभी धार्मिक चुनाव कठिन और अलोकप्रिय होता है। ठीक तभी वह सबसे अधिक महत्व रखता है।

धर्म में जीना हर निर्णय में एक सरल प्रश्न पूछते रहना है, यह नहीं कि मैं क्या चाहता हूँ, बल्कि यहाँ क्या सही है। उत्तर सदा सरल नहीं होता, पर पूछने की आदत धीरे-धीरे सत्यनिष्ठा का जीवन गढ़ती है।$s$),

('wis-yugas','The Four Yugas','चार युग','The great cycle of time','काल का महाचक्र','3 min','read','wisdom','#B07A4E',32,
$s$Indian thought does not see time as a straight line but as a great wheel that turns through four ages, the yugas, again and again. Each is named after a throw of dice, from the perfect throw to the worst, because each age holds a little less dharma than the one before.

Satya Yuga is the age of truth, when dharma stands firm on all four legs and virtue is natural. Treta Yuga, the age of Ram, sees dharma on three legs, still strong but now requiring effort. Dvapara Yuga, the age of Krishna, stands on two, and the world grows more divided. Kali Yuga, our own age, stands on a single leg, an age of noise, haste and forgetting.

This can sound bleak, but the tradition offers a gift hidden inside it. In Kali Yuga alone, the simplest practice carries the greatest reward. What took years of tapas in earlier ages can now be reached by the sincere chanting of the divine name. The darker the age, the brighter a small lamp shines.

The lesson is not despair but perspective. Times decline and rise in vast cycles far beyond us. Our task is only to keep our own small portion of dharma alive, and to chant the name that lights the dark.$s$,
$s$भारतीय चिंतन काल को सरल रेखा के रूप में नहीं, बल्कि एक महाचक्र के रूप में देखता है जो चार युगों में बार-बार घूमता है। हर एक का नाम पासे के एक दांव पर है, पूर्ण दांव से लेकर निकृष्टतम तक, क्योंकि हर युग अपने से पूर्व युग से थोड़ा कम धर्म धारण करता है।

सत्य युग सत्य का युग है, जब धर्म चारों पैरों पर दृढ़ खड़ा होता है और सद्गुण स्वाभाविक होता है। त्रेता युग, राम का युग, धर्म को तीन पैरों पर देखता है, अब भी सशक्त पर अब प्रयास की अपेक्षा रखता। द्वापर युग, कृष्ण का युग, दो पर खड़ा है, और संसार अधिक विभाजित होता है। कलि युग, हमारा अपना युग, एक ही पैर पर खड़ा है, कोलाहल, उतावली और विस्मृति का युग।

यह निराशाजनक लग सकता है, पर परंपरा इसमें छिपा एक उपहार देती है। केवल कलि युग में सबसे सरल साधना सबसे बड़ा फल देती है। जो पूर्व युगों में वर्षों की तपस्या से मिलता था, वह अब दिव्य नाम के सच्चे जप से पाया जा सकता है। युग जितना अँधेरा, एक छोटा दीप उतना उज्ज्वल चमकता है।

शिक्षा निराशा नहीं बल्कि दृष्टिकोण है। काल विशाल चक्रों में हमसे कहीं परे घटता-बढ़ता है। हमारा कार्य केवल अपने धर्म के छोटे अंश को जीवित रखना है, और वह नाम जपना है जो अंधकार को प्रकाशित करता है।$s$),

('wis-moksha','What is Moksha','मोक्ष क्या है','The final freedom','अंतिम मुक्ति','3 min','read','wisdom','#7D728F',33,
$s$Of the four aims of human life, dharma, artha, kama and moksha, the last is the highest. Artha is prosperity, kama is enjoyment, dharma is right living, and moksha is liberation, the release of the soul from the long cycle of birth and death.

The tradition says we have lived countless lives, driven from one to the next by our unfinished desires and karma. Moksha is the end of that wandering, not as annihilation but as awakening. The soul, the atman, realises that it was never the small, anxious self it took itself to be. It was always part of the infinite, the way a wave is never separate from the ocean.

The paths to it differ. Some reach it through knowledge, seeing clearly what they truly are. Some through devotion, loving God so completely that the small self dissolves. Some through selfless action, and some through disciplined meditation. All arrive at the same freedom.

You do not need to renounce the world to walk toward moksha. Every act done without selfishness, every hour of sincere practice, every moment of remembering the divine loosens one more knot. Liberation is not a place you go. It is what remains when the knots are gone.$s$,
$s$मानव जीवन के चार पुरुषार्थों, धर्म, अर्थ, काम और मोक्ष में, अंतिम सर्वोच्च है। अर्थ समृद्धि है, काम भोग है, धर्म सदाचार है, और मोक्ष मुक्ति है, आत्मा की जन्म-मृत्यु के लंबे चक्र से मुक्ति।

परंपरा कहती है कि हमने असंख्य जीवन जिए हैं, अपनी अधूरी इच्छाओं और कर्म से एक से दूसरे की ओर प्रेरित। मोक्ष उस भटकन का अंत है, विनाश के रूप में नहीं बल्कि जागरण के रूप में। आत्मा जान लेती है कि वह कभी वह छोटा, चिंतित स्व था ही नहीं जो उसने स्वयं को समझा। वह सदा अनंत का अंश था, जैसे लहर कभी सागर से अलग नहीं होती।

इसके मार्ग भिन्न हैं। कुछ ज्ञान से पहुँचते हैं, स्पष्ट देखकर कि वे वास्तव में क्या हैं। कुछ भक्ति से, ईश्वर को इतना पूर्ण प्रेम करके कि छोटा स्व विलीन हो जाए। कुछ निष्काम कर्म से, और कुछ अनुशासित ध्यान से। सब उसी मुक्ति पर पहुँचते हैं।

मोक्ष की ओर चलने के लिए संसार त्यागने की आवश्यकता नहीं। बिना स्वार्थ किया हर कर्म, सच्ची साधना का हर घंटा, दिव्य के स्मरण का हर क्षण एक और गाँठ ढीली करता है। मुक्ति कोई स्थान नहीं जहाँ आप जाते हैं। वह वही है जो गाँठों के जाने पर शेष रहता है।$s$),

('wis-gunas','The Three Gunas','तीन गुण','The threads of nature','प्रकृति के तीन धागे','3 min','read','wisdom','#5F8657',34,
$s$All of nature, and every mood and choice within us, is woven from three qualities called the gunas. Sattva is clarity, harmony and light. Rajas is energy, passion and restlessness. Tamas is heaviness, inertia and darkness. Everything is a shifting blend of the three, and understanding them is a practical map of the inner life.

You can watch them in a single day. Waking clear and calm is sattva. Rushing, craving, and reacting is rajas. Feeling dull, low and unable to move is tamas. Even food carries them, fresh and light food is sattvic, spicy and stimulating food is rajasic, and stale or heavy food is tamasic.

The aim is not to destroy rajas and tamas, for we need energy to act and rest to recover. The aim is to let sattva lead, to rise from dullness into activity and from restless activity into calm clarity. And in time, the sage rises even beyond sattva into pure awareness, gunatita, untouched by all three.

Notice which guna is running you right now. That noticing is itself sattva beginning to lead. A short walk, clean food, or a few minutes of chanting can gently lift the whole system toward the light.$s$,
$s$समस्त प्रकृति, और हमारे भीतर का हर भाव और चुनाव, तीन गुणों नामक तीन गुणों से बुना है। सत्त्व स्पष्टता, सामंजस्य और प्रकाश है। रजस ऊर्जा, आवेग और बेचैनी है। तमस भारीपन, जड़ता और अंधकार है। हर वस्तु इन तीनों का बदलता मिश्रण है, और इन्हें समझना भीतरी जीवन का एक व्यावहारिक मानचित्र है।

आप इन्हें एक ही दिन में देख सकते हैं। स्पष्ट और शांत जागना सत्त्व है। दौड़ना, तृष्णा, और प्रतिक्रिया रजस है। सुस्त, उदास और चलने में असमर्थ अनुभव करना तमस है। भोजन भी इन्हें धारण करता है, ताज़ा और हल्का भोजन सात्त्विक है, तीखा और उत्तेजक भोजन राजसिक है, और बासी या भारी भोजन तामसिक है।

लक्ष्य रजस और तमस को नष्ट करना नहीं है, क्योंकि कर्म के लिए हमें ऊर्जा और पुनः स्वस्थ होने के लिए विश्राम चाहिए। लक्ष्य है सत्त्व को अग्रणी होने देना, जड़ता से क्रिया की ओर और बेचैन क्रिया से शांत स्पष्टता की ओर उठना। और समय के साथ ऋषि सत्त्व से भी परे शुद्ध चेतना, गुणातीत, में उठ जाता है, तीनों से अछूता।

देखिए कि इस क्षण कौन सा गुण आपको चला रहा है। वह देखना ही सत्त्व का अग्रणी होना आरंभ है। एक छोटी सैर, स्वच्छ भोजन, या कुछ मिनट का जप पूरे तंत्र को धीरे से प्रकाश की ओर उठा सकता है।$s$),

('wis-yoga-paths','The Four Paths of Yoga','योग के चार मार्ग','Many roads, one summit','अनेक राह, एक शिखर','3 min','read','wisdom','#C2A868',35,
$s$Yoga means union, the joining of the small self with the divine. The tradition is generous, and it offers four great paths to that one summit, suited to four kinds of temperament. No path is higher than another. The best path is simply the one that fits your nature.

Karma Yoga is the path of action, for those who must be busy in the world. Its practice is to work with full effort while offering the results to God, turning ordinary duty into worship. Bhakti Yoga is the path of devotion, for the loving heart. Its practice is prayer, chanting, and surrender, until love for God fills every corner of life.

Jnana Yoga is the path of knowledge, for the sharp mind. Its practice is deep inquiry into the question who am I, cutting through every false identity until only the truth remains. Raja Yoga is the path of meditation, for the disciplined will. Its practice is the eight limbs of Patanjali, a careful training of body, breath and mind toward stillness.

Most lives blend all four in their own proportions. Work offered up, a heart that loves, a mind that questions, and a little daily stillness. Choose the path that draws you most, and let it carry the others along.$s$,
$s$योग का अर्थ है मिलन, छोटे स्व का दिव्य से जुड़ना। परंपरा उदार है, और वह उस एक शिखर तक चार महान मार्ग देती है, चार प्रकार के स्वभावों के अनुरूप। कोई मार्ग दूसरे से ऊँचा नहीं। श्रेष्ठ मार्ग बस वही है जो आपके स्वभाव के अनुकूल हो।

कर्म योग कर्म का मार्ग है, उनके लिए जिन्हें संसार में व्यस्त रहना है। इसकी साधना है पूरे प्रयास से कर्म करना और फल ईश्वर को अर्पित करना, सामान्य कर्तव्य को पूजा में बदलना। भक्ति योग भक्ति का मार्ग है, प्रेममय हृदय के लिए। इसकी साधना है प्रार्थना, कीर्तन, और समर्पण, जब तक ईश्वर के प्रति प्रेम जीवन के हर कोने को न भर दे।

ज्ञान योग ज्ञान का मार्ग है, तीक्ष्ण बुद्धि के लिए। इसकी साधना है इस प्रश्न में गहन विचार कि मैं कौन हूँ, हर मिथ्या पहचान को काटते हुए जब तक केवल सत्य शेष न रहे। राज योग ध्यान का मार्ग है, अनुशासित संकल्प के लिए। इसकी साधना है पतंजलि के अष्टांग, शरीर, श्वास और मन का स्थिरता की ओर सावधान प्रशिक्षण।

अधिकांश जीवन इन चारों को अपने-अपने अनुपात में मिलाते हैं। अर्पित किया कर्म, प्रेम करता हृदय, प्रश्न करता मन, और थोड़ी नित्य स्थिरता। वह मार्ग चुनिए जो आपको सबसे अधिक खींचता है, और उसे शेष को साथ ले चलने दीजिए।$s$),

('jyo-kundli','What is a Kundli','कुंडली क्या है','Your map of the sky at birth','जन्म के समय आकाश का नक्शा','4 min','read','jyotish','#5E7C93',50,
$s$A kundli, or birth chart, is a map of the sky at the exact moment and place you were born. Jyotish, the science of light, reads that map as a picture of the karma you have brought into this life, the tendencies, timing and lessons woven into your journey. It does not decide your fate. It describes the field on which your free will plays.

The chart is drawn from three things, the date, the time, and the place of birth. The time matters most, because the ascendant, the lagna, changes roughly every two hours, and it sets the entire frame of the chart. This is why an accurate birth time is so important, and why our engine computes planetary positions to arc second precision from the birth details you give.

A kundli shows the twelve signs, the twelve houses of life, and the nine grahas placed among them. From this arrangement a jyotishi reads strengths and challenges, and the timing of life through the dasha system.

Think of your kundli not as a verdict but as an honest weather map. It tells you the season you are walking through, so you can carry an umbrella or plant in the sun, and meet your life with wisdom rather than surprise.$s$,
$s$कुंडली, या जन्म-पत्रिका, उस ठीक क्षण और स्थान के आकाश का नक्शा है जहाँ आपका जन्म हुआ। ज्योतिष, प्रकाश का विज्ञान, उस नक्शे को उस कर्म के चित्र के रूप में पढ़ता है जिसे आप इस जीवन में लाए हैं, वे प्रवृत्तियाँ, समय और पाठ जो आपकी यात्रा में बुने हैं। यह आपका भाग्य तय नहीं करता। यह उस क्षेत्र का वर्णन करता है जिस पर आपकी स्वतंत्र इच्छा खेलती है।

कुंडली तीन बातों से बनती है, जन्म की तिथि, समय, और स्थान। समय सबसे अधिक महत्व रखता है, क्योंकि लग्न लगभग हर दो घंटे में बदलता है, और वही पूरी कुंडली की रूपरेखा तय करता है। इसीलिए सही जन्म-समय इतना महत्वपूर्ण है, और इसीलिए हमारा इंजन आपके दिए जन्म-विवरण से ग्रहों की स्थिति चाप-सेकंड की सटीकता तक गणना करता है।

कुंडली बारह राशियाँ, जीवन के बारह भाव, और उनमें स्थित नौ ग्रह दिखाती है। इस विन्यास से एक ज्योतिषी बल और चुनौतियाँ, और दशा पद्धति के माध्यम से जीवन का समय पढ़ता है।

अपनी कुंडली को निर्णय के रूप में नहीं बल्कि एक सच्चे मौसम-नक्शे के रूप में देखिए। यह आपको वह ऋतु बताती है जिससे आप गुज़र रहे हैं, ताकि आप छाता ले जाएँ या धूप में पौधा लगाएँ, और अपने जीवन से आश्चर्य के बजाय विवेक से मिलें।$s$),

('jyo-grahas','The Nine Grahas','नौ ग्रह','The planets of Jyotish','ज्योतिष के ग्रह','4 min','read','jyotish','#CF924A',51,
$s$Jyotish works with nine grahas, the nine moving points whose positions shape the chart. Seven are the classical planets, and two are the lunar nodes, the invisible but powerful Rahu and Ketu.

The Sun, Surya, is the soul, the father, and authority. The Moon, Chandra, is the mind, the mother, and emotion, and in Vedic astrology it is second in importance only to the ascendant. Mars, Mangal, is energy, courage and drive. Mercury, Budh, is intellect, speech and commerce. Jupiter, Guru, is wisdom, fortune and grace, the great benefic. Venus, Shukra, is love, beauty and comfort. Saturn, Shani, is discipline, time and hard earned reward, the strict but fair teacher.

Rahu and Ketu are not physical bodies but the two points where the paths of the Sun and Moon cross. Rahu is worldly desire, ambition and the unknown. Ketu is detachment, spirituality and the past. Together they carry the story of what the soul is reaching for and what it is letting go.

No graha is simply good or bad. Each gives according to its nature and its placement, and each responds to remedy and awareness. The grahas are not rulers over you. They are the weather, and you are the one learning to sail.$s$,
$s$ज्योतिष नौ ग्रहों के साथ कार्य करता है, वे नौ गतिमान बिंदु जिनकी स्थिति कुंडली को आकार देती है। सात शास्त्रीय ग्रह हैं, और दो चंद्र-बिंदु, अदृश्य पर शक्तिशाली राहु और केतु।

सूर्य आत्मा, पिता, और अधिकार है। चंद्र मन, माता, और भाव है, और वैदिक ज्योतिष में यह महत्व में केवल लग्न के बाद दूसरा है। मंगल ऊर्जा, साहस और वेग है। बुध बुद्धि, वाणी और वाणिज्य है। गुरु ज्ञान, भाग्य और कृपा है, महान शुभ ग्रह। शुक्र प्रेम, सौंदर्य और सुख है। शनि अनुशासन, काल और परिश्रम से अर्जित फल है, कठोर पर न्यायप्रिय गुरु।

राहु और केतु भौतिक पिंड नहीं बल्कि वे दो बिंदु हैं जहाँ सूर्य और चंद्र के मार्ग मिलते हैं। राहु सांसारिक इच्छा, महत्वाकांक्षा और अज्ञात है। केतु वैराग्य, आध्यात्मिकता और अतीत है। साथ मिलकर वे यह कथा धारण करते हैं कि आत्मा किसकी ओर बढ़ रही है और किसे छोड़ रही है।

कोई ग्रह केवल शुभ या अशुभ नहीं होता। हर एक अपने स्वभाव और स्थिति के अनुसार फल देता है, और हर एक उपाय तथा जागरूकता का उत्तर देता है। ग्रह आप पर शासक नहीं हैं। वे मौसम हैं, और आप वह हैं जो नाव चलाना सीख रहा है।$s$),

('jyo-houses','The Twelve Houses','बारह भाव','The rooms of your life','आपके जीवन के कक्ष','3 min','read','jyotish','#9C8544',52,
$s$If the signs are the sky and the grahas are the actors, the twelve houses, the bhavas, are the stage, the twelve areas of life where everything plays out. The chart begins from the first house, the lagna, and moves around in order.

The first house is the self, body and personality. The second is wealth, family and speech. The third is courage, siblings and effort. The fourth is home, mother and inner peace. The fifth is children, creativity and past life merit. The sixth is health, enemies and daily work.

The seventh is marriage and partnership. The eighth is transformation, longevity and hidden things. The ninth is fortune, dharma, the father and the guru. The tenth is career, status and action in the world. The eleventh is gains, friendships and hopes fulfilled. The twelfth is loss, letting go, foreign lands and liberation.

A graha gives its results through the house it sits in and the houses it rules. This is why two people with the same Moon sign can live such different lives. Reading a chart is really reading how these twelve rooms are lit, and by whom.$s$,
$s$यदि राशियाँ आकाश हैं और ग्रह अभिनेता, तो बारह भाव वह मंच हैं, जीवन के बारह क्षेत्र जहाँ सब कुछ घटित होता है। कुंडली पहले भाव, लग्न, से आरंभ होती है और क्रम में आगे बढ़ती है।

पहला भाव स्वयं, शरीर और व्यक्तित्व है। दूसरा धन, परिवार और वाणी है। तीसरा साहस, भाई-बहन और प्रयास है। चौथा घर, माता और भीतरी शांति है। पाँचवाँ संतान, रचनात्मकता और पूर्वजन्म का पुण्य है। छठा स्वास्थ्य, शत्रु और नित्य कर्म है।

सातवाँ विवाह और साझेदारी है। आठवाँ रूपांतरण, आयु और गुप्त बातें है। नौवाँ भाग्य, धर्म, पिता और गुरु है। दसवाँ कर्म, प्रतिष्ठा और संसार में क्रिया है। ग्यारहवाँ लाभ, मित्रता और पूर्ण हुई आशाएँ है। बारहवाँ हानि, त्याग, विदेश और मुक्ति है।

ग्रह अपने फल उस भाव के माध्यम से देता है जिसमें वह बैठा है और जिन भावों का वह स्वामी है। इसीलिए एक ही चंद्र राशि वाले दो व्यक्ति इतने भिन्न जीवन जी सकते हैं। कुंडली पढ़ना वास्तव में यह पढ़ना है कि ये बारह कक्ष कैसे और किसके द्वारा प्रकाशित हैं।$s$),

('jyo-nakshatras','The 27 Nakshatras','सत्ताईस नक्षत्र','The lunar mansions','चंद्र के भवन','3 min','read','jyotish','#A45E6B',53,
$s$Older even than the twelve signs is the system of the 27 nakshatras, the lunar mansions. The Moon travels through the whole zodiac in about 27 days, resting one night in each nakshatra, so each is roughly a day of the Moon's journey and a slice of sky just over thirteen degrees wide.

The nakshatra the Moon occupies at your birth is your janma nakshatra, and it says something intimate about your nature, often more finely than your sign alone. Each has a presiding deity, a ruling graha, a symbol and a temperament. Ashwini, the first, is swift and healing. Rohini is beautiful and fertile. Pushya is nourishing and devoted. Magha is regal and honours the ancestors. Revati, the last, is gentle and protective of travellers.

The nakshatras run the whole of Vedic life. They fix the muhurat for weddings and beginnings, they give the first syllable for a baby's name in the naamkaran, and they carry the Vimshottari dasha that times the unfolding of a life.

Find your own nakshatra in your kundli and read its nature. It is one of the most personal keys the tradition offers, the exact patch of sky the Moon was lighting on the night you arrived.$s$,
$s$बारह राशियों से भी प्राचीन सत्ताईस नक्षत्रों की पद्धति है, चंद्र के भवन। चंद्रमा लगभग २७ दिनों में पूरे राशिचक्र में यात्रा करता है, हर नक्षत्र में एक रात विश्राम करता, इसलिए हर एक चंद्र की यात्रा का लगभग एक दिन और आकाश का एक टुकड़ा है जो तेरह अंश से कुछ अधिक चौड़ा है।

जन्म के समय चंद्र जिस नक्षत्र में हो वह आपका जन्म नक्षत्र है, और वह आपके स्वभाव के विषय में कुछ अंतरंग कहता है, प्रायः केवल राशि से अधिक सूक्ष्मता से। हर एक का एक अधिष्ठाता देव, स्वामी ग्रह, प्रतीक और स्वभाव है। अश्विनी, पहला, वेगवान और आरोग्यकारी है। रोहिणी सुंदर और उर्वर है। पुष्य पोषक और भक्तिमय है। मघा राजसी है और पितरों का सम्मान करता है। रेवती, अंतिम, कोमल और यात्रियों की रक्षक है।

नक्षत्र समूचे वैदिक जीवन को चलाते हैं। वे विवाह और आरंभ का मुहूर्त तय करते हैं, वे नामकरण में शिशु के नाम का पहला अक्षर देते हैं, और वे विंशोत्तरी दशा धारण करते हैं जो जीवन के प्रकट होने का समय तय करती है।

अपनी कुंडली में अपना नक्षत्र खोजिए और उसका स्वभाव पढ़िए। यह परंपरा द्वारा दी सबसे व्यक्तिगत कुंजियों में से एक है, आकाश का वह ठीक टुकड़ा जिसे चंद्र आपके आगमन की रात प्रकाशित कर रहा था।$s$),

('jyo-dasha','Understanding Dashas','दशा को समझना','How Jyotish tells time','ज्योतिष समय कैसे बताता है','3 min','read','jyotish','#7D728F',54,
$s$A birth chart shows the whole map of a life at once, but life unfolds in time, and jyotish tells that time through the dasha system. A dasha is a planetary period, a stretch of years ruled by one graha, during which that graha's themes come forward and its results ripen.

The most used system is the Vimshottari dasha, a cycle of 120 years divided among the nine grahas, each ruling for a set span, from Ketu's seven years to Venus's twenty. The graha whose period you are in colours the whole chapter. A Jupiter period tends to bring growth, learning and grace. A Saturn period asks for patience and hard work but pays in lasting results. Which dasha you are born into depends on your janma nakshatra.

Each large period, the mahadasha, is divided again into sub periods, the antardashas, so the timing can be read down to months. This is how a jyotishi can say not only what a chart promises but roughly when.

Knowing your dasha turns astrology from a fixed verdict into a living calendar. It tells you which season you are in, so you can act boldly when the weather favours it, and build patiently when it asks you to wait.$s$,
$s$जन्म-कुंडली एक साथ जीवन का पूरा नक्शा दिखाती है, पर जीवन समय में प्रकट होता है, और ज्योतिष उस समय को दशा पद्धति से बताता है। दशा एक ग्रह-काल है, वर्षों का एक विस्तार जिस पर एक ग्रह का शासन होता है, जिसके दौरान उस ग्रह के विषय आगे आते हैं और उसके फल पकते हैं।

सबसे प्रयुक्त पद्धति विंशोत्तरी दशा है, १२० वर्षों का एक चक्र जो नौ ग्रहों में बँटा है, हर एक एक निश्चित अवधि तक शासन करता, केतु के सात वर्षों से लेकर शुक्र के बीस तक। जिस ग्रह की दशा में आप हैं वह पूरे अध्याय को रंग देता है। गुरु की दशा प्रायः वृद्धि, विद्या और कृपा लाती है। शनि की दशा धैर्य और परिश्रम माँगती है पर स्थायी फल में चुकाती है। आप किस दशा में जन्म लेते हैं यह आपके जन्म नक्षत्र पर निर्भर है।

हर बड़ी अवधि, महादशा, फिर उप-अवधियों, अंतर्दशाओं में बँटी होती है, ताकि समय को महीनों तक पढ़ा जा सके। इसी प्रकार एक ज्योतिषी न केवल यह बता सकता है कि कुंडली क्या वचन देती है बल्कि लगभग कब भी।

अपनी दशा जानना ज्योतिष को एक स्थिर निर्णय से जीवंत पंचांग में बदल देता है। यह बताता है कि आप किस ऋतु में हैं, ताकि मौसम अनुकूल हो तो आप साहस से कर्म करें, और जब वह प्रतीक्षा कहे तो धैर्य से निर्माण करें।$s$),

('jyo-rashi','Your Moon Sign, the Rashi','आपकी चंद्र राशि','Why the Moon matters most','चंद्र सबसे अधिक क्यों','3 min','read','jyotish','#5E7C93',55,
$s$Ask most people their sign and they will tell you their Sun sign. Vedic astrology quietly disagrees. Here the sign that matters most is the rashi, the sign the Moon occupied at your birth, because the Moon rules the mind, and it is through the mind that we actually experience our lives.

The Sun shows the soul and the outer identity, but the Moon shows how you feel, react, and find comfort. Two people may share a Sun sign and yet live in completely different inner worlds because their Moons, their rashis, are different. This is why a Vedic jyotishi reads the whole chart from the Moon as well as from the ascendant.

Your rashi also governs practical things in daily jyotish. It sets your chandra bala, the strength of the Moon on any given day, it shapes your daily and monthly predictions, and it is the sign used for the sade sati of Saturn, the well known seven and a half year transit.

In the app, your rashi is computed from your exact birth details, not guessed from your birthday. Knowing it is the beginning of reading yourself honestly, from the mind outward rather than the label inward.$s$,
$s$अधिकांश लोगों से उनकी राशि पूछिए और वे अपनी सूर्य राशि बताएँगे। वैदिक ज्योतिष चुपचाप असहमत है। यहाँ जो राशि सबसे अधिक महत्व रखती है वह चंद्र राशि है, वह राशि जिसमें जन्म के समय चंद्र था, क्योंकि चंद्र मन का स्वामी है, और मन के माध्यम से ही हम वास्तव में अपने जीवन का अनुभव करते हैं।

सूर्य आत्मा और बाहरी पहचान दिखाता है, पर चंद्र दिखाता है कि आप कैसा अनुभव करते हैं, प्रतिक्रिया देते हैं, और सुख कहाँ पाते हैं। दो व्यक्ति एक ही सूर्य राशि साझा कर सकते हैं फिर भी पूर्णतः भिन्न भीतरी संसारों में जी सकते हैं क्योंकि उनके चंद्र, उनकी राशियाँ, भिन्न हैं। इसीलिए एक वैदिक ज्योतिषी पूरी कुंडली लग्न के साथ-साथ चंद्र से भी पढ़ता है।

आपकी राशि नित्य ज्योतिष में व्यावहारिक बातें भी तय करती है। यह आपका चंद्र बल तय करती है, किसी दिन चंद्र की शक्ति, यह आपकी दैनिक और मासिक भविष्यवाणियाँ गढ़ती है, और यही वह राशि है जो शनि की साढ़े साती में प्रयुक्त होती है, वह प्रसिद्ध साढ़े सात वर्ष का गोचर।

ऐप में आपकी राशि आपके ठीक जन्म-विवरण से गणना की जाती है, आपके जन्मदिन से अनुमानित नहीं। इसे जानना स्वयं को सच्चाई से पढ़ने का आरंभ है, लेबल से भीतर की ओर नहीं बल्कि मन से बाहर की ओर।$s$)

on conflict (id) do update set
  title=excluded.title, title_hi=excluded.title_hi, sub=excluded.sub, sub_hi=excluded.sub_hi,
  read_time=excluded.read_time, kind=excluded.kind, category=excluded.category, tint=excluded.tint,
  sort=excluded.sort, content=excluded.content, content_hi=excluded.content_hi;

-- ============================================================================
--  Batch 2 — Deities (Hanuman, Saraswati), Festivals shelf, Practice
-- ============================================================================
insert into public.library_articles (id,title,title_hi,sub,sub_hi,read_time,kind,category,tint,sort,content,content_hi) values

('dei-hanuman','Who is Hanuman Ji','हनुमान जी कौन हैं','Devotion that becomes strength','भक्ति जो बल बन जाए','3 min','read','deities','#B07A4E',26,
$s$Hanuman is the greatest of devotees, and because of that, the strongest of the strong. He is the son of the wind, Pavanputra, and a chiranjivi, one who lives on through the ages wherever the Ramayana is sung. His power is real, but it is powered by something simpler, an undivided love for Shri Ram.

As a child he leapt at the sun, mistaking it for a fruit. Grown, he crossed an ocean in a single bound, carried a mountain for a healing herb, and set Lanka alight, yet he never once boasted. When asked who he was, he said only, I am a servant of Ram. That humility is the secret of his strength.

Hanuman teaches that ego shrinks us and devotion expands us. The same person who forgets his own greatness until it is needed can do the impossible when it serves something higher than himself.

Turn to Hanuman when you feel weak or afraid. Recite the Hanuman Chalisa, especially on Tuesdays and Saturdays, and remember his words, that there is nothing you cannot do with Ram in your heart.$s$,
$s$हनुमान भक्तों में श्रेष्ठ हैं, और इसीलिए बलवानों में बलवान। वे पवनपुत्र हैं, और चिरंजीवी, जो युगों तक वहाँ जीवित रहते हैं जहाँ रामायण गाई जाती है। उनकी शक्ति वास्तविक है, पर वह किसी सरल वस्तु से संचालित है, श्री राम के प्रति अखंड प्रेम से।

बालपन में उन्होंने सूर्य को फल समझकर उसकी ओर छलांग लगाई। बड़े होकर उन्होंने एक ही छलांग में समुद्र लाँघा, संजीवनी हेतु पर्वत उठा लाए, और लंका को अग्नि दे दी, फिर भी उन्होंने कभी अभिमान नहीं किया। जब पूछा गया कि वे कौन हैं, उन्होंने केवल कहा, मैं राम का दास हूँ। यही विनम्रता उनके बल का रहस्य है।

हनुमान सिखाते हैं कि अहंकार हमें छोटा करता है और भक्ति हमें विस्तृत। वही व्यक्ति जो आवश्यकता पड़ने तक अपनी महानता भुलाए रहता है, जब कोई कार्य स्वयं से ऊँचे उद्देश्य की सेवा करता है, तब असंभव कर दिखाता है।

जब आप दुर्बल या भयभीत अनुभव करें, हनुमान की ओर मुड़िए। हनुमान चालीसा पढ़िए, विशेषकर मंगल और शनिवार को, और उनके भाव को स्मरण रखिए, कि राम को हृदय में रखकर कुछ भी असंभव नहीं।$s$),

('dei-saraswati','Who is Maa Saraswati','माँ सरस्वती कौन हैं','Knowledge, music and speech','ज्ञान, संगीत और वाणी','3 min','read','deities','#5F8657',27,
$s$Saraswati is the goddess of knowledge, music, art and speech. She is dressed in simple white, seated on a white lotus, holding a veena and a book, with a swan at her side. Unlike Lakshmi, she carries no gold, for the wealth she gives cannot be stored in a vault. It can only be shared, and it grows in the sharing.

The swan is said to separate milk from water, a picture of the discernment true knowledge brings, the ability to take the essence and leave the rest. Her veena reminds us that learning is not dry. Real knowledge has music in it, a harmony between the mind and the heart.

Students honour her especially on Vasant Panchami, when children are often taught to write their first letters. But she is not only for exams. Anyone who seeks clarity, creativity, or the right word at the right moment is asking for her grace.

Keep your books and instruments with respect, never on the floor, and chant Om Aim Saraswatyai Namah before study or creative work. She favours the sincere seeker over the merely clever one.$s$,
$s$सरस्वती ज्ञान, संगीत, कला और वाणी की देवी हैं। वे सादे श्वेत वस्त्र में, श्वेत कमल पर विराजमान, वीणा और पुस्तक धारण किए, अपने पास हंस लिए हैं। लक्ष्मी के विपरीत वे स्वर्ण नहीं रखतीं, क्योंकि जो धन वे देती हैं उसे तिजोरी में नहीं रखा जा सकता। उसे केवल बाँटा जा सकता है, और बाँटने में वह बढ़ता है।

कहा जाता है कि हंस दूध को जल से अलग कर देता है, सच्चे ज्ञान से आने वाले विवेक का चित्र, सार को ग्रहण करने और शेष को छोड़ने की क्षमता। उनकी वीणा हमें स्मरण कराती है कि विद्या शुष्क नहीं है। सच्चे ज्ञान में संगीत होता है, मन और हृदय के बीच एक सामंजस्य।

विद्यार्थी विशेषकर वसंत पंचमी पर उनका पूजन करते हैं, जब बच्चों को प्रायः पहला अक्षर लिखना सिखाया जाता है। पर वे केवल परीक्षा के लिए नहीं हैं। जो भी स्पष्टता, रचनात्मकता, या सही समय पर सही शब्द चाहता है, वह उनकी कृपा माँग रहा है।

अपनी पुस्तकों और वाद्यों को सम्मान से रखिए, कभी भूमि पर नहीं, और अध्ययन या रचनात्मक कार्य से पहले ॐ ऐं सरस्वत्यै नमः का जप कीजिए। वे केवल चतुर के बजाय सच्चे साधक पर कृपा करती हैं।$s$),

('fes-diwali','Diwali, the Festival of Light','दीपावली, प्रकाश का पर्व','Why we light the lamps','हम दीप क्यों जलाते हैं','4 min','read','festivals','#CF924A',40,
$s$Diwali is the best loved festival of the year, five days of light that fall on the Kartik Amavasya, the darkest night of the month. Into that darkness we place rows of lamps, which is the whole meaning of the festival. Light is most needed, and most beautiful, exactly where the dark is deepest.

The festival gathers many stories into one glow. In the north it marks the return of Shri Ram to Ayodhya after fourteen years, when the citizens lit the whole city to welcome him home. It is also the night Maa Lakshmi walks the earth and enters homes that are clean, bright and welcoming. In Jainism it marks the moksha of Mahavira.

The days move gently. Dhanteras for auspicious buying, Naraka Chaturdashi, Lakshmi Puja on the main night, Govardhan Puja, and Bhai Dooj for brothers and sisters.

Clean your home, draw a rangoli at the door, light diyas in every corner, and do a simple Lakshmi puja at dusk. Then share sweets, forgive old quarrels, and let the year begin lighter than it ended.$s$,
$s$दीपावली वर्ष का सबसे प्रिय पर्व है, प्रकाश के पाँच दिन जो कार्तिक अमावस्या पर आते हैं, माह की सबसे अँधेरी रात। उस अंधकार में हम दीपों की पंक्तियाँ रखते हैं, और यही पर्व का समूचा अर्थ है। प्रकाश की सबसे अधिक आवश्यकता, और सबसे अधिक सौंदर्य, ठीक वहीं होता है जहाँ अँधेरा सबसे गहरा हो।

यह पर्व अनेक कथाओं को एक आभा में समेट लेता है। उत्तर में यह चौदह वर्ष बाद श्री राम की अयोध्या वापसी का स्मरण है, जब नगरवासियों ने उनके स्वागत में पूरा नगर जगमगा दिया। यह वह रात भी है जब माँ लक्ष्मी पृथ्वी पर विचरती हैं और स्वच्छ, उज्ज्वल तथा स्वागतमय घरों में प्रवेश करती हैं। जैन परंपरा में यह महावीर के मोक्ष का पर्व है।

दिन धीरे-धीरे बढ़ते हैं। शुभ क्रय हेतु धनतेरस, नरक चतुर्दशी, मुख्य रात्रि को लक्ष्मी पूजा, गोवर्धन पूजा, और भाई-बहन के लिए भाई दूज।

अपना घर स्वच्छ कीजिए, द्वार पर रंगोली बनाइए, हर कोने में दीये जलाइए, और संध्या को एक सरल लक्ष्मी पूजा कीजिए। फिर मिठाई बाँटिए, पुराने कलह क्षमा कीजिए, और वर्ष को उससे हल्का आरंभ होने दीजिए जितना भारी वह समाप्त हुआ।$s$),

('fes-holi','Holi, the Festival of Colour','होली, रंगों का पर्व','Joy that dissolves difference','आनंद जो भेद मिटा दे','3 min','read','festivals','#A45E6B',41,
$s$Holi is the spring festival of colour and forgiveness, celebrated on the Phalguna Purnima. The night before, a bonfire is lit for Holika Dahan, recalling how the devotee Prahlad was saved from the fire by his faith in Vishnu, while Holika, who meant him harm, was consumed. The lesson is old and clear. Devotion protects, and cruelty consumes itself.

The next morning the streets fill with colour. People throw gulal, drench each other in water, sing, dance and share sweets. For one day the usual walls come down. Rich and poor, old and young, stranger and friend all wear the same many coloured skin. Krishna is at the heart of it, for it was he who began the play of colours with Radha and the gopis in Vrindavan.

Holi is also permission to repair. There is a saying that on Holi even enemies embrace. Old grudges are meant to burn in Holika's fire and wash away in the colour.

Play gently and with consent, use natural colours, protect the eyes and skin, and let the day do its quiet work, softening the heart and starting friendships fresh.$s$,
$s$होली रंग और क्षमा का वसंत पर्व है, जो फाल्गुन पूर्णिमा पर मनाया जाता है। एक रात पूर्व होलिका दहन के लिए अग्नि जलाई जाती है, यह स्मरण करते हुए कि कैसे भक्त प्रह्लाद विष्णु में अपनी श्रद्धा से अग्नि से बच गए, जबकि उसका अहित चाहने वाली होलिका भस्म हो गई। शिक्षा पुरानी और स्पष्ट है। भक्ति रक्षा करती है, और क्रूरता स्वयं को भस्म कर देती है।

अगली प्रातः गलियाँ रंग से भर जाती हैं। लोग गुलाल उड़ाते हैं, एक-दूसरे को जल में भिगोते हैं, गाते, नाचते और मिठाई बाँटते हैं। एक दिन के लिए सामान्य दीवारें गिर जाती हैं। धनी और निर्धन, वृद्ध और युवा, अपरिचित और मित्र, सब एक ही रंग-बिरंगी त्वचा पहन लेते हैं। इसके केंद्र में कृष्ण हैं, क्योंकि उन्होंने ही वृंदावन में राधा और गोपियों संग रंगों की लीला आरंभ की।

होली सुधार की अनुमति भी है। कहावत है कि होली पर शत्रु भी गले मिल जाते हैं। पुराने बैर होलिका की अग्नि में जलकर रंग में धुल जाने चाहिए।

कोमलता और सहमति से खेलिए, प्राकृतिक रंग प्रयोग कीजिए, नेत्र और त्वचा की रक्षा कीजिए, और दिन को अपना शांत कार्य करने दीजिए, हृदय को कोमल करना और मित्रता को नए सिरे से आरंभ करना।$s$),

('fes-navratri','Navratri, the Nine Nights','नवरात्रि, नौ रातें','Nine forms of the Mother','माँ के नौ रूप','3 min','read','festivals','#A45E6B',42,
$s$Navratri means nine nights, and across them the Divine Mother is worshipped in nine forms, one for each night. From Shailaputri, the daughter of the mountain, to Siddhidatri, the giver of perfection, the sequence is a map of the soul climbing from the earth to fulfilment.

Twice a year the festival falls at the turning of the seasons, in Chaitra in spring and Sharad in autumn, times when the body and the mind are naturally more open. Many keep a light fast of fruit and milk, light an akhand jyoti that burns unbroken for nine days, and read the Durga Saptashati. In Gujarat the nights fill with garba and dandiya, danced in circles around the lamp.

The tenth day is Vijayadashami, Dussehra, the victory that follows the nine nights of preparation. The Devi defeats Mahishasura, and Ram defeats Ravana. The message is that real victory is earned by inner work first.

Use Navratri as a gentle reset. Eat simply, sleep early, chant the Mother's name, and clean out one habit that no longer serves you. Let the tenth day find you a little lighter.$s$,
$s$नवरात्रि का अर्थ है नौ रातें, और इनमें आदिशक्ति माता के नौ रूपों की पूजा होती है, हर रात एक। शैलपुत्री, पर्वत की पुत्री, से लेकर सिद्धिदात्री, सिद्धि की दात्री तक, यह क्रम पृथ्वी से पूर्णता की ओर चढ़ती आत्मा का मानचित्र है।

वर्ष में दो बार यह पर्व ऋतु परिवर्तन पर आता है, वसंत में चैत्र और शरद में, वे समय जब शरीर और मन स्वाभाविक रूप से अधिक खुले होते हैं। बहुत से लोग फल और दूध का हल्का उपवास रखते हैं, नौ दिन अखंड रूप से जलने वाली अखंड ज्योति जलाते हैं, और दुर्गा सप्तशती पढ़ते हैं। गुजरात में रातें गरबा और डांडिया से भर जाती हैं, दीप के चारों ओर वृत्त में नाचा जाता है।

दसवाँ दिन विजयादशमी, दशहरा है, वह विजय जो नौ रातों की तैयारी के पश्चात आती है। देवी महिषासुर को पराजित करती हैं, और राम रावण को। संदेश यह है कि सच्ची विजय पहले भीतरी साधना से अर्जित होती है।

नवरात्रि को एक कोमल पुनरारंभ की तरह प्रयोग कीजिए। सादा भोजन कीजिए, जल्दी सोइए, माँ के नाम का जप कीजिए, और एक ऐसी आदत साफ कीजिए जो अब आपके काम की नहीं। दसवाँ दिन आपको थोड़ा हल्का पाए।$s$),

('fes-janmashtami','Krishna Janmashtami','कृष्ण जन्माष्टमी','The midnight birth of Krishna','कृष्ण का मध्यरात्रि अवतरण','3 min','read','festivals','#5E7C93',43,
$s$Janmashtami marks the birth of Shri Krishna, who was born at midnight in a prison in Mathura, on the Ashtami of Krishna paksha in Bhadrapada. Even his birth carries a teaching. The divine arrives in the darkest hour and the most locked place, which is exactly where hope is needed most.

Devotees fast through the day and keep vigil until midnight, the moment of his appearance. The mandir is decorated, and a small cradle is set for Laddoo Gopal, the infant Krishna. At midnight the idol is bathed in panchamrit, dressed in new clothes, and offered makhan and mishri with tulsi, the butter and sweetness he loved as a child. Bhajans fill the night and the fast is broken after his puja.

In Maharashtra the next day brings Dahi Handi, where human pyramids reach for a pot of curd hung high, a joyful echo of the butter thief who would not be kept from what he loved.

Celebrate simply. Clean a small space for Laddoo Gopal, offer makhan and tulsi at midnight, sing a bhajan, and read the verse where Krishna promises that whenever dharma declines, he returns.$s$,
$s$जन्माष्टमी श्री कृष्ण के जन्म का पर्व है, जिनका अवतरण भाद्रपद के कृष्ण पक्ष की अष्टमी को मथुरा के कारागार में मध्यरात्रि हुआ। उनका जन्म भी एक शिक्षा लिए है। दिव्य सबसे अँधेरे पहर और सबसे बंद स्थान पर आता है, ठीक वहीं जहाँ आशा की सबसे अधिक आवश्यकता होती है।

भक्त दिन भर उपवास रखते हैं और मध्यरात्रि तक जागरण करते हैं, उनके प्रकट होने का क्षण। मंदिर सजाया जाता है, और लड्डू गोपाल, शिशु कृष्ण, के लिए एक छोटा झूला रखा जाता है। मध्यरात्रि को मूर्ति को पंचामृत से स्नान कराया जाता है, नए वस्त्र पहनाए जाते हैं, और तुलसी संग माखन-मिश्री अर्पित की जाती है, वह मक्खन और मिठास जो उन्हें बालपन में प्रिय थी। भजन रात भर गूँजते हैं और उनकी पूजा के बाद उपवास खोला जाता है।

महाराष्ट्र में अगला दिन दही हांडी लाता है, जहाँ मानव पिरामिड ऊँचे बँधे दही के मटके तक पहुँचते हैं, उस माखनचोर की आनंदमय प्रतिध्वनि जिसे उसके प्रिय से दूर नहीं रखा जा सकता था।

सरलता से मनाइए। लड्डू गोपाल के लिए एक छोटा स्थान स्वच्छ कीजिए, मध्यरात्रि को माखन और तुलसी अर्पित कीजिए, एक भजन गाइए, और वह श्लोक पढ़िए जहाँ कृष्ण वचन देते हैं कि जब-जब धर्म की हानि होती है, वे लौट आते हैं।$s$),

('fes-shivratri','Maha Shivaratri','महाशिवरात्रि','The great night of Shiva','शिव की महान रात्रि','3 min','read','festivals','#7D728F',44,
$s$Maha Shivaratri, the great night of Shiva, falls on the Chaturdashi of Krishna paksha in Phalguna. Where most festivals are bright and social, this one is inward and still. It is a night of wakefulness, kept not with feasting but with fasting, silence and the repetition of the name.

Many stories are told of this night. It is said to be the night Shiva performed the tandava, the night of his marriage to Parvati, and the night he drank the poison of the churning ocean to save creation. Each points to the same truth, that Shiva is the stillness that holds even destruction without being shaken.

Traditionally devotees stay awake through four praharas, four watches of the night, offering water, milk and bel leaves to the lingam at each, and chanting Om Namah Shivaya. Staying awake is itself the practice, a symbol of spiritual alertness, of not sleeping through your own life.

You do not need an elaborate ritual. Keep a light fast, offer water and a bel leaf if you can, sit for longer than usual in quiet, and let the great night teach you the value of simply being still and awake.$s$,
$s$महाशिवरात्रि, शिव की महान रात्रि, फाल्गुन के कृष्ण पक्ष की चतुर्दशी को आती है। जहाँ अधिकांश पर्व उज्ज्वल और सामाजिक होते हैं, यह भीतरी और शांत है। यह जागरण की रात है, जो भोज से नहीं बल्कि उपवास, मौन और नाम के जप से मनाई जाती है।

इस रात की अनेक कथाएँ कही जाती हैं। कहा जाता है यह वह रात है जब शिव ने तांडव किया, पार्वती से उनके विवाह की रात, और वह रात जब उन्होंने सृष्टि की रक्षा हेतु समुद्र मंथन का विष पिया। हर कथा उसी सत्य की ओर संकेत करती है, कि शिव वह परम शांति हैं जो विनाश को भी बिना विचलित हुए धारण करती है।

परंपरा से भक्त रात के चार प्रहर जागते हैं, हर प्रहर में लिंग पर जल, दूध और बेलपत्र अर्पित करते हैं, और ॐ नमः शिवाय का जप करते हैं। जागना स्वयं ही साधना है, आध्यात्मिक सजगता का प्रतीक, अपने ही जीवन में सोए न रहने का।

आपको किसी विस्तृत अनुष्ठान की आवश्यकता नहीं। हल्का उपवास रखिए, यदि संभव हो तो जल और बेलपत्र अर्पित कीजिए, सामान्य से अधिक देर मौन में बैठिए, और महान रात्रि को यह सिखाने दीजिए कि केवल स्थिर और जाग्रत रहने का क्या मूल्य है।$s$),

('fes-ganesh','Ganesh Chaturthi','गणेश चतुर्थी','Welcoming Bappa home','बप्पा का स्वागत','3 min','read','festivals','#B8954F',45,
$s$Ganesh Chaturthi welcomes Ganpati Bappa into homes and neighbourhoods for ten joyful days, beginning on the Shukla Chaturthi of Bhadrapada. Clay idols of Ganesha are installed with love, worshipped morning and evening, and offered his favourite modak, until the final day, when they are carried in singing processions to the water and gently immersed.

The immersion, visarjan, is the deepest part of the festival, and often the most moving. We spend days growing attached to the beautiful form, and then we let it dissolve back into the water. Bappa himself teaches the hardest lesson of love, that everything we cherish is given for a time and then released, and that the letting go can be done with music rather than grief.

Made famous as a public festival by Lokmanya Tilak to bring people together, it remains a festival of community. Whole streets share one Ganpati, one aarti, one plate of prasad.

At home, install a small eco friendly idol, offer durva and modak, do the aarti twice a day, and when the days are done, immerse it in a bucket or tank with a full heart. Ganpati Bappa Morya, pudhchya varshi lavkar ya.$s$,
$s$गणेश चतुर्थी गणपति बप्पा का घरों और मोहल्लों में दस आनंदमय दिनों के लिए स्वागत करती है, जो भाद्रपद की शुक्ल चतुर्थी से आरंभ होते हैं। गणेश की मिट्टी की मूर्तियाँ प्रेम से स्थापित की जाती हैं, प्रातः-संध्या पूजी जाती हैं, और उनका प्रिय मोदक अर्पित किया जाता है, अंतिम दिन तक, जब उन्हें गाते हुए जुलूसों में जल तक ले जाकर कोमलता से विसर्जित किया जाता है।

विसर्जन पर्व का सबसे गहरा भाग है, और प्रायः सबसे भावुक। हम दिनों तक उस सुंदर रूप से जुड़ते हैं, और फिर उसे जल में विलीन होने देते हैं। बप्पा स्वयं प्रेम का सबसे कठिन पाठ सिखाते हैं, कि जो कुछ हमें प्रिय है वह कुछ समय के लिए दिया जाता है और फिर छोड़ना होता है, और यह त्याग शोक के बजाय संगीत के साथ किया जा सकता है।

लोकमान्य तिलक द्वारा लोगों को जोड़ने हेतु सार्वजनिक पर्व के रूप में प्रसिद्ध, यह आज भी समुदाय का पर्व है। पूरी गलियाँ एक गणपति, एक आरती, एक प्रसाद की थाली साझा करती हैं।

घर पर एक छोटी पर्यावरण-अनुकूल मूर्ति स्थापित कीजिए, दूर्वा और मोदक अर्पित कीजिए, दिन में दो बार आरती कीजिए, और जब दिन पूरे हों, उसे भरे हृदय से एक बाल्टी या टंकी में विसर्जित कीजिए। गणपति बप्पा मोरया, पुढच्या वर्षी लवकर या।$s$),

('prc-puja','How to Do a Simple Puja at Home','घर पर सरल पूजा कैसे करें','A five minute daily practice','पाँच मिनट की नित्य साधना','4 min','read','practice','#9C8544',15,
$s$A daily puja does not need a priest, a long ritual, or Sanskrit you do not understand. At its heart, puja is simply hospitality offered to the divine, treating God as an honoured guest in your home. Everything else is detail.

Begin with a clean space and a clean self, ideally after a morning bath. Sit before your mandir or a single picture. The traditional sequence, the upacharas, can be as short or as full as you like. Light a lamp, this is offering light. Light an incense stick, this is offering fragrance. Offer a flower, a little water, and something sweet, even a piece of sugar or fruit. Ring a small bell to gather your attention.

Then do the part that matters most, which costs nothing. Say the name of your ishta devta, chant a mantra a few times, and speak to them plainly, in gratitude and in need. Finish with a short aarti and take a moment of silence before you rise.

Consistency matters more than grandeur. Five sincere minutes every morning will change you far more than an elaborate puja done once a year.$s$,
$s$नित्य पूजा के लिए किसी पुरोहित, लंबे अनुष्ठान, या ऐसे संस्कृत की आवश्यकता नहीं जिसे आप समझते न हों। मूल रूप में पूजा केवल दिव्य को दी गई आतिथ्य-सेवा है, ईश्वर को अपने घर का सम्मानित अतिथि मानना। शेष सब विवरण है।

एक स्वच्छ स्थान और स्वच्छ शरीर से आरंभ कीजिए, आदर्श रूप से प्रातः स्नान के बाद। अपने मंदिर या किसी एक चित्र के सम्मुख बैठिए। पारंपरिक क्रम, उपचार, जितना छोटा या पूर्ण चाहें उतना हो सकता है। दीप जलाइए, यह प्रकाश का अर्पण है। अगरबत्ती जलाइए, यह सुगंध का अर्पण है। एक फूल, थोड़ा जल, और कुछ मीठा अर्पित कीजिए, चाहे शक्कर या फल का एक टुकड़ा। ध्यान एकत्र करने के लिए एक छोटी घंटी बजाइए।

फिर वह भाग कीजिए जो सबसे अधिक महत्व रखता है, और जिसका कोई मूल्य नहीं। अपने इष्ट देव का नाम लीजिए, कुछ बार मंत्र जपिए, और उनसे सरल भाव से बात कीजिए, कृतज्ञता में और आवश्यकता में। एक छोटी आरती से समाप्त कीजिए और उठने से पहले एक क्षण मौन लीजिए।

भव्यता से अधिक नियमितता महत्व रखती है। हर प्रातः पाँच सच्चे मिनट आपको उस विस्तृत पूजा से कहीं अधिक बदल देंगे जो वर्ष में एक बार की जाती है।$s$),

('prc-japa','Japa, the Art of the Mala','जप, माला की कला','Chanting on the 108 beads','१०८ मनकों पर जप','3 min','read','practice','#5F8657',16,
$s$Japa is the repetition of a mantra or a divine name, and the mala is the simple tool that carries it. A mala has 108 beads and one larger bead, the Meru or Sumeru. The number 108 is woven through the tradition, in the distance of the sun and moon in their own diameters, in the marma points of the body, in the names of the deities. For the seeker it means one full round of steady remembrance.

Hold the mala in the right hand, and move the beads one at a time with the thumb and middle finger, letting each bead carry one repetition of the mantra. The index finger, which represents the ego, is kept away from the beads. When you reach the Meru bead, do not cross it. Turn the mala around and go back the other way. That single rule is itself a teaching in humility.

Begin with one round, a mala, of your chosen mantra, perhaps Om Namah Shivaya or the Hare Krishna maha mantra. The mind will wander. Each time it does, the next bead is waiting to bring it home.

In the app, the Mala counter keeps your count and your daily streak, so your attention can stay on the name rather than the number.$s$,
$s$जप किसी मंत्र या दिव्य नाम की पुनरावृत्ति है, और माला वह सरल साधन है जो उसे धारण करती है। माला में १०८ मनके और एक बड़ा मनका, मेरु या सुमेरु, होता है। १०८ की संख्या परंपरा में बुनी हुई है, सूर्य और चंद्र की उनके अपने व्यास में दूरी में, शरीर के मर्म बिंदुओं में, देवों के नामों में। साधक के लिए इसका अर्थ है स्थिर स्मरण का एक पूर्ण चक्र।

माला दाहिने हाथ में लीजिए, और मनकों को अंगूठे तथा मध्यमा से एक-एक कर सरकाइए, हर मनके को मंत्र की एक पुनरावृत्ति धारण करने दीजिए। तर्जनी, जो अहंकार का प्रतीक है, मनकों से दूर रखी जाती है। जब मेरु मनके पर पहुँचें, उसे लाँघिए मत। माला घुमाकर दूसरी ओर से लौटिए। यही एक नियम स्वयं विनम्रता की शिक्षा है।

अपने चुने मंत्र का एक चक्र, एक माला, से आरंभ कीजिए, शायद ॐ नमः शिवाय या हरे कृष्ण महामंत्र। मन भटकेगा। हर बार जब वह भटके, अगला मनका उसे घर लाने को प्रतीक्षारत है।

ऐप में माला काउंटर आपकी गणना और नित्य श्रृंखला रखता है, ताकि आपका ध्यान संख्या के बजाय नाम पर टिका रहे।$s$),

('prc-surya','Surya Namaskar','सूर्य नमस्कार','Salutation to the sun','सूर्य को प्रणाम','3 min','read','practice','#CF924A',17,
$s$Surya Namaskar, the salutation to the sun, is a flowing sequence of twelve postures that greets the source of all light and life. It is at once exercise, breath practice and worship. The body bends, folds and opens through the round while the breath leads each movement, and a mantra for the sun can be added at each of the twelve steps.

The sun has always been honoured in this land as Surya, the visible face of the divine, the giver of health, vitality and clarity. To offer this sequence at sunrise, facing the east, is to begin the day by aligning body, breath and gratitude toward the light.

Beyond the devotion, the physical gift is real. The round warms the spine, opens the chest and hips, steadies the breath and settles the mind. A few rounds are worth far more than their few minutes.

Start slowly, with two or three rounds, moving with the breath rather than rushing. Inhale as you open, exhale as you fold. If the full posture is hard, do a gentler version. The sun does not ask for perfection, only for the turning of your face toward it.$s$,
$s$सूर्य नमस्कार, सूर्य को प्रणाम, बारह आसनों का एक प्रवाहमय क्रम है जो समस्त प्रकाश और जीवन के स्रोत का अभिवादन करता है। यह एक साथ व्यायाम, श्वास-साधना और उपासना है। शरीर पूरे चक्र में झुकता, मुड़ता और खुलता है जबकि श्वास हर गति का नेतृत्व करती है, और बारह में से हर सोपान पर सूर्य का एक मंत्र जोड़ा जा सकता है।

इस भूमि में सूर्य को सदा सूर्यदेव के रूप में पूजा गया है, दिव्य का दृश्य रूप, स्वास्थ्य, ओज और स्पष्टता के दाता। इस क्रम को सूर्योदय पर, पूर्व की ओर मुख करके अर्पित करना, दिन को शरीर, श्वास और कृतज्ञता को प्रकाश की ओर संरेखित करके आरंभ करना है।

भक्ति से परे, शारीरिक उपहार भी वास्तविक है। यह चक्र रीढ़ को गर्म करता है, छाती और कूल्हों को खोलता है, श्वास को स्थिर करता है और मन को शांत करता है। कुछ चक्र अपने कुछ मिनटों से कहीं अधिक मूल्यवान हैं।

धीरे आरंभ कीजिए, दो या तीन चक्रों से, दौड़ने के बजाय श्वास के साथ चलते हुए। खुलते समय श्वास लीजिए, मुड़ते समय छोड़िए। यदि पूर्ण आसन कठिन हो, कोमल रूप कीजिए। सूर्य पूर्णता नहीं माँगता, केवल अपनी ओर आपके मुख का मुड़ना।$s$)

on conflict (id) do update set
  title=excluded.title, title_hi=excluded.title_hi, sub=excluded.sub, sub_hi=excluded.sub_hi,
  read_time=excluded.read_time, kind=excluded.kind, category=excluded.category, tint=excluded.tint,
  sort=excluded.sort, content=excluded.content, content_hi=excluded.content_hi;
