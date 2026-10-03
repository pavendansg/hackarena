/* Scheme catalogue — Tamil, English, Hindi, Telugu.

   Document lists come from district government pages (Chennai, Tiruvarur),
   India Post / bank guidance (Sukanya Samriddhi), and scheme guides checked
   on 3 Oct 2026. They can change: every list is shown with a
   "confirm at the office" note. Hindi and Telugu text should be reviewed
   by a native speaker before a public launch. */

   import {
    Flower2, GraduationCap, Baby, Users, Landmark, Accessibility, PiggyBank,
    Bus, Scissors, Heart, Wallet,
  } from "lucide-react";
  
  const L = ["ta", "en", "hi", "te"];
  
  /* ---------- topics ---------- */
  export const CATS = [
    { id: "women", icon: Users, tint: "bg-rose-100 text-rose-800", ta: "பெண்கள்", en: "Women", hi: "महिलाएँ", te: "మహిళలు" },
    { id: "edu", icon: GraduationCap, tint: "bg-sky-100 text-sky-800", ta: "கல்வி", en: "Education", hi: "शिक्षा", te: "విద్య" },
    { id: "preg", icon: Baby, tint: "bg-amber-100 text-amber-800", ta: "கர்ப்பம் & குழந்தைகள்", en: "Pregnancy & Children", hi: "गर्भावस्था और बच्चे", te: "గర్భధారణ & పిల్లలు" },
    { id: "money", icon: Wallet, tint: "bg-green-100 text-green-800", ta: "நிதி உதவி", en: "Financial Assistance", hi: "आर्थिक सहायता", te: "ఆర్థిక సహాయం" },
    { id: "pension", icon: Heart, tint: "bg-orange-100 text-orange-800", ta: "ஓய்வூதியம்", en: "Pension", hi: "पेंशन", te: "పింఛను" },
    { id: "disab", icon: Accessibility, tint: "bg-violet-100 text-violet-800", ta: "மாற்றுத்திறனாளிகள்", en: "Disability", hi: "दिव्यांग", te: "దివ్యాంగులు" },
  ];
  
  /* ---------- shared phrases ---------- */
  const OFFICE = {
    ta: "e-Sevai மையம் அல்லது அருகிலுள்ள அரசு அலுவலகம்.",
    en: "e-Sevai centre or the nearest government office.",
    hi: "ई-सेवा केंद्र या नज़दीकी सरकारी कार्यालय।",
    te: "e-Sevai కేంద్రం లేదా సమీపంలోని ప్రభుత్వ కార్యాలయం.",
  };
  const CHECK = {
    ta: "இறுதி தகுதியை அரசு அலுவலகத்தில் உறுதி செய்யுங்கள்.",
    en: "Confirm final eligibility at the government office.",
    hi: "अंतिम पात्रता सरकारी कार्यालय में पक्की कर लें।",
    te: "తుది అర్హతను ప్రభుత్వ కార్యాలయంలో నిర్ధారించుకోండి.",
  };
  const AMT = {
    ta: "மாதாந்திர ஓய்வூதியம். தொகையை அலுவலகத்தில் உறுதி செய்யுங்கள்.",
    en: "Monthly pension. Confirm the amount at the office.",
    hi: "मासिक पेंशन। राशि कार्यालय में पक्की कर लें।",
    te: "నెలవారీ పింఛను. మొత్తాన్ని కార్యాలయంలో నిర్ధారించుకోండి.",
  };
  const SOC = {
    ta: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.",
    en: "Tamil Nadu social security scheme.",
    hi: "तमिलनाडु सरकार की सामाजिक सुरक्षा योजना।",
    te: "తమిళనాడు ప్రభుత్వ సామాజిక భద్రతా పథకం.",
  };
  
  /* pension-style schemes share most wording */
  const std = (title, who) =>
    Object.fromEntries(
      L.map((l) => [l, { title: title[l], desc: SOC[l], benefit: AMT[l], who: who[l], where: OFFICE[l], next: CHECK[l] }])
    );
  
  /* ---------- documents (referenced by key) ---------- */
  const DOC = {
    ration: { ta: "குடும்ப அட்டை (ரேஷன் அட்டை)", en: "Family ration card", hi: "राशन कार्ड (परिवार कार्ड)", te: "రేషన్ కార్డు (కుటుంబ కార్డు)" },
    aadhaar: { ta: "ஆதார் அட்டை", en: "Aadhaar card", hi: "आधार कार्ड", te: "ఆధార్ కార్డు" },
    bankLinked: { ta: "ஆதாருடன் இணைந்த, உங்கள் பெயரில் உள்ள வங்கிக் கணக்குப் புத்தகம்", en: "Bank passbook linked to Aadhaar, in your name", hi: "आधार से जुड़ी, आपके नाम की बैंक पासबुक", te: "ఆధార్‌తో అనుసంధానమైన, మీ పేరుపై ఉన్న బ్యాంకు పాస్‌బుక్" },
    bankPost: { ta: "ஆதாருடன் இணைந்த வங்கி அல்லது அஞ்சலக கணக்கு", en: "Bank or post office account linked to Aadhaar", hi: "आधार से जुड़ा बैंक या डाकघर खाता", te: "ఆధార్‌తో అనుసంధానమైన బ్యాంకు లేదా పోస్టాఫీసు ఖాతా" },
    mobile: { ta: "கைபேசி எண்", en: "Mobile number", hi: "मोबाइल नंबर", te: "మొబైల్ నంబర్" },
    motherChild: { ta: "தாய்-சேய் நல அட்டை", en: "Mother-child protection card", hi: "मदर-चाइल्ड प्रोटेक्शन कार्ड", te: "మదర్-చైల్డ్ ప్రొటెక్షన్ కార్డు" },
    schoolCert: { ta: "6 முதல் 12 வரை அரசுப் பள்ளியில் படித்ததற்கான சான்றிதழ் (மாற்றுச் சான்றிதழ்)", en: "School certificate (TC) showing you studied Classes 6 to 12 in a government school", hi: "कक्षा 6 से 12 तक सरकारी स्कूल में पढ़ने का प्रमाणपत्र (टीसी)", te: "6 నుండి 12వ తరగతి వరకు ప్రభుత్వ పాఠశాలలో చదివినట్లు సర్టిఫికెట్ (టీసీ)" },
    admission: { ta: "கல்லூரி சேர்க்கை அட்டை அல்லது கல்லூரி சான்றிதழ்", en: "College admission proof or bonafide certificate", hi: "कॉलेज में प्रवेश का प्रमाण या बोनाफाइड प्रमाणपत्र", te: "కళాశాల ప్రవేశ రుజువు లేదా బోనఫైడ్ సర్టిఫికెట్" },
    deathCert: { ta: "கணவரின் இறப்புச் சான்றிதழ்", en: "Husband's death certificate", hi: "पति का मृत्यु प्रमाणपत्र", te: "భర్త మరణ ధృవీకరణ పత్రం" },
    widowCert: { ta: "விதவைச் சான்றிதழ் (தாசில்தார் வழங்குவது)", en: "Widow certificate (issued by the Tahsildar)", hi: "विधवा प्रमाणपत्र (तहसीलदार द्वारा जारी)", te: "వితంతు ధృవీకరణ పత్రం (తహసీల్దార్ జారీ చేసేది)" },
    desertCert: { ta: "கணவர் கைவிட்டதற்கான அல்லது சட்டப்படி பிரிந்ததற்கான சான்றிதழ்", en: "Certificate of desertion or legal separation", hi: "पति द्वारा छोड़े जाने या कानूनी अलगाव का प्रमाणपत्र", te: "భర్త విడిచిపెట్టినట్లు లేదా చట్టబద్ధంగా విడిపోయినట్లు ధృవీకరణ పత్రం" },
    udid: { ta: "மாற்றுத்திறனாளி அடையாள அட்டை (UDID) அல்லது மாற்றுத்திறனாளி சான்றிதழ்", en: "Disability identity card (UDID) or disability certificate", hi: "दिव्यांग पहचान पत्र (UDID) या दिव्यांगता प्रमाणपत्र", te: "దివ్యాంగుల గుర్తింపు కార్డు (UDID) లేదా వైకల్య ధృవీకరణ పత్రం" },
    birthGirl: { ta: "பெண் குழந்தையின் பிறப்புச் சான்றிதழ்", en: "Birth certificate of the girl child", hi: "बालिका का जन्म प्रमाणपत्र", te: "ఆడపిల్ల జనన ధృవీకరణ పత్రం" },
    idGuardian: { ta: "பெற்றோர் அல்லது பாதுகாவலரின் அடையாளச் சான்று (ஆதார் போன்றவை)", en: "Identity proof of the parent or guardian (such as Aadhaar)", hi: "माता-पिता या अभिभावक का पहचान प्रमाण (जैसे आधार)", te: "తల్లిదండ్రులు లేదా సంరక్షకుల గుర్తింపు రుజువు (ఆధార్ వంటివి)" },
    addrGuardian: { ta: "பெற்றோர் அல்லது பாதுகாவலரின் முகவரிச் சான்று", en: "Address proof of the parent or guardian", hi: "माता-पिता या अभिभावक का पते का प्रमाण", te: "తల్లిదండ్రులు లేదా సంరక్షకుల చిరునామా రుజువు" },
    photos: { ta: "பாஸ்போர்ட் அளவு புகைப்படங்கள்", en: "Passport-size photographs", hi: "पासपोर्ट साइज़ फ़ोटो", te: "పాస్‌పోర్ట్ సైజు ఫోటోలు" },
    picme: { ta: "PICME / RCH எண் (கர்ப்பப் பதிவின்போது கிடைக்கும் 12 இலக்க எண்)", en: "PICME / RCH ID (the 12-digit number from pregnancy registration)", hi: "PICME / RCH आईडी (गर्भावस्था पंजीकरण में मिलने वाला 12 अंकों का नंबर)", te: "PICME / RCH ఐడీ (గర్భధారణ నమోదులో వచ్చే 12 అంకెల నంబర్)" },
    otherAsked: { ta: "அலுவலகம் அல்லது சுகாதார நிலையம் கேட்கும் பிற ஆவணங்கள்", en: "Any other documents the office or health centre asks for", hi: "कार्यालय या स्वास्थ्य केंद्र जो अन्य दस्तावेज़ माँगे", te: "కార్యాలయం లేదా ఆరోగ్య కేంద్రం అడిగే ఇతర పత్రాలు" },
    parentAge: { ta: "பெற்றோரின் வயதுச் சான்று (பிறப்பு அல்லது பள்ளிச் சான்றிதழ்)", en: "Age proof of the parents (birth or school certificate)", hi: "माता-पिता की आयु का प्रमाण (जन्म या स्कूल प्रमाणपत्र)", te: "తల్లిదండ్రుల వయస్సు రుజువు (జనన లేదా పాఠశాల సర్టిఫికెట్)" },
    income: { ta: "வருமானச் சான்றிதழ்", en: "Income certificate", hi: "आय प्रमाणपत्र", te: "ఆదాయ ధృవీకరణ పత్రం" },
    community: { ta: "சாதிச் சான்றிதழ்", en: "Community certificate", hi: "जाति प्रमाणपत्र", te: "కుల ధృవీకరణ పత్రం" },
    nativity: { ta: "வசிப்பிடச் சான்றிதழ் (நேட்டிவிட்டி)", en: "Nativity certificate", hi: "मूल निवास प्रमाणपत्र", te: "స్థానికత ధృవీకరణ పత్రం" },
    sterilization: { ta: "கருத்தடைச் சான்றிதழ்", en: "Sterilisation certificate", hi: "नसबंदी प्रमाणपत्र", te: "కుటుంబ నియంత్రణ శస్త్రచికిత్స ధృవీకరణ పత్రం" },
    noMale: { ta: "ஆண் குழந்தை இல்லை என்பதற்கான சான்றிதழ்", en: "Certificate that the family has no male child", hi: "परिवार में कोई बेटा नहीं होने का प्रमाणपत्र", te: "కుటుంబంలో మగపిల్లవాడు లేడని ధృవీకరణ పత్రం" },
    familyIncome: { ta: "குடும்ப வருமானச் சான்றிதழ்", en: "Family income certificate", hi: "पारिवारिक आय प्रमाणपत्र", te: "కుటుంబ ఆదాయ ధృవీకరణ పత్రం" },
    ageProof: { ta: "வயதுச் சான்று", en: "Age proof", hi: "आयु का प्रमाण", te: "వయస్సు రుజువు" },
    categoryCert: { ta: "உங்கள் பிரிவுக்கான சான்றிதழ் (விதவை, கைவிடப்பட்டவர், மாற்றுத்திறனாளி), கேட்டால்", en: "Certificate for your category (widow, deserted wife or disability), if asked", hi: "आपकी श्रेणी का प्रमाणपत्र (विधवा, परित्यक्ता या दिव्यांग), माँगे जाने पर", te: "మీ వర్గానికి చెందిన ధృవీకరణ పత్రం (వితంతు, విడిచిపెట్టబడిన, దివ్యాంగ), అడిగితే" },
    idIfAsked: { ta: "நடத்துநர் கேட்டால் காட்ட ஆதார் அட்டை அல்லது வேறு அடையாள அட்டை", en: "Aadhaar card or another ID, in case the conductor asks", hi: "आधार कार्ड या कोई अन्य पहचान पत्र, कंडक्टर के माँगने पर", te: "కండక్టర్ అడిగితే చూపించడానికి ఆధార్ కార్డు లేదా ఇతర గుర్తింపు కార్డు" },
  };
  
  /* ---------- schemes ---------- */
  const RAW = [
    {
      id: "kmut", icon: Flower2, cats: ["women", "money"], status: "change", url: "https://www.tnesevai.tn.gov.in/",
      docs: ["ration", "aadhaar", "bankLinked", "mobile"],
      kw: ["பெண்", "மகளிர்", "மாதம்", "பணம்", "உரிமை", "தலைவி", "women", "woman", "monthly", "money", "financial", "cash", "help", "urimai", "महिला", "हर महीने", "पैसे", "अधिकार", "मुखिया", "మహిళ", "నెలకు", "డబ్బు", "హక్కు"],
      ta: { title: "கலைஞர் மகளிர் உரிமைத் தொகை", desc: "தமிழ்நாடு அரசின் மாதாந்திர நிதி உதவித் திட்டம்.", benefit: "மாதம் 1,000 ரூபாய் வங்கிக் கணக்கில்.", who: "தகுதியுள்ள குடும்பங்களின் பெண் தலைவிகளுக்கு.", where: OFFICE.ta, next: "இந்தத் திட்டத்தில் மாற்றங்கள் நடந்து வருகின்றன. இப்போதைய தொகை 1,000 ரூபாய். சமீபத்திய விதிகளை அலுவலகத்தில் கேளுங்கள்." },
      en: { title: "Kalaignar Magalir Urimai Thittam", desc: "Tamil Nadu government's monthly financial assistance for women.", benefit: "Rs 1,000 per month to the bank account.", who: "Women heads of eligible families.", where: OFFICE.en, next: "The scheme is being changed. The current amount is Rs 1,000. Ask for the latest rules at the office." },
      hi: { title: "कलैगनार महिला उरिमै थोगई (KMUT)", desc: "तमिलनाडु सरकार की महिलाओं के लिए मासिक आर्थिक सहायता योजना।", benefit: "हर महीने 1,000 रुपये बैंक खाते में।", who: "पात्र परिवारों की महिला मुखिया को।", where: OFFICE.hi, next: "योजना में बदलाव चल रहा है। अभी राशि 1,000 रुपये है। ताज़ा नियम कार्यालय में पूछें।" },
      te: { title: "కలైంజర్ మహిళా ఉరిమై తొగై (KMUT)", desc: "తమిళనాడు ప్రభుత్వం మహిళలకు ఇచ్చే నెలవారీ ఆర్థిక సహాయ పథకం.", benefit: "ప్రతి నెల బ్యాంకు ఖాతాలో 1,000 రూపాయలు.", who: "అర్హత గల కుటుంబాల్లోని మహిళా పెద్దకు.", where: OFFICE.te, next: "పథకంలో మార్పులు జరుగుతున్నాయి. ప్రస్తుత మొత్తం 1,000 రూపాయలు. తాజా నియమాలను కార్యాలయంలో అడగండి." },
    },
    {
      id: "pudhumai", icon: GraduationCap, cats: ["women", "edu", "money"], status: "active", url: "https://www.tnesevai.tn.gov.in/",
      docs: ["schoolCert", "aadhaar", "bankLinked", "admission"],
      kw: ["கல்லூரி", "படிக்க", "படிப்பு", "மாணவி", "கல்வி", "புதுமை", "college", "student", "study", "studying", "education", "pudhumai", "कॉलेज", "छात्रा", "पढ़", "शिक्षा", "పుదుమై", "కళాశాల", "విద్యార్థిని", "చదువు", "విద్య"],
      ta: { title: "புதுமைப் பெண் திட்டம்", desc: "உயர்கல்வி படிக்கும் மாணவிகளுக்கான உதவித்தொகை.", benefit: "மாதம் 1,000 ரூபாய்.", who: "அரசுப் பள்ளியில் 6 முதல் 12 வரை படித்து, உயர்கல்வியில் சேர்ந்த மாணவிகளுக்கு.", where: "உங்கள் கல்லூரி அலுவலகம்.", next: "கல்லூரி அலுவலகத்தில் விண்ணப்ப முறையைக் கேளுங்கள்." },
      en: { title: "Pudhumai Penn Scheme", desc: "Monthly support for girls pursuing higher education.", benefit: "Rs 1,000 per month.", who: "Girls who studied Classes 6 to 12 in government schools and joined higher education.", where: "Your college office.", next: "Ask your college office how to apply." },
      hi: { title: "पुदुमै पेण योजना", desc: "उच्च शिक्षा पढ़ रही छात्राओं के लिए मासिक सहायता।", benefit: "हर महीने 1,000 रुपये।", who: "जिन छात्राओं ने कक्षा 6 से 12 तक सरकारी स्कूल में पढ़ाई की और उच्च शिक्षा में प्रवेश लिया।", where: "आपके कॉलेज का कार्यालय।", next: "कॉलेज कार्यालय में आवेदन की प्रक्रिया पूछें।" },
      te: { title: "పుదుమై పెణ్ పథకం", desc: "ఉన్నత విద్య చదువుతున్న విద్యార్థినులకు నెలవారీ సహాయం.", benefit: "ప్రతి నెల 1,000 రూపాయలు.", who: "6 నుండి 12వ తరగతి వరకు ప్రభుత్వ పాఠశాలలో చదివి ఉన్నత విద్యలో చేరిన విద్యార్థినులకు.", where: "మీ కళాశాల కార్యాలయం.", next: "దరఖాస్తు విధానం గురించి కళాశాల కార్యాలయంలో అడగండి." },
    },
    {
      id: "pmmvy", icon: Baby, cats: ["women", "preg", "money"], voice: true, url: "https://spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs",
      docs: ["aadhaar", "bankPost", "mobile", "motherChild"],
      kw: ["கர்ப்ப", "குழந்தை", "பிரசவ", "மகப்பேறு", "தாய்", "மாத்ரு", "pregnant", "pregnancy", "baby", "child", "maternity", "mother", "delivery", "गर्भ", "बच्चा", "प्रसव", "मातृ", "माँ", "గర్భ", "బిడ్డ", "ప్రసవ", "తల్లి"],
      ta: { title: "மாத்ரு வந்தனா யோஜனா (PMMVY)", desc: "கர்ப்பிணி மற்றும் பாலூட்டும் தாய்மார்களுக்கான மத்திய அரசு உதவி.", benefit: "முதல் குழந்தைக்கு 5,000 ரூபாய் இரண்டு தவணையில்.", who: "குரலில் உங்கள் தகுதியை சரிபார்க்கலாம்.", where: "அருகிலுள்ள அங்கன்வாடி நிலையம்.", next: "குரல் சரிபார்ப்பைத் தொடங்குங்கள்." },
      en: { title: "PM Matru Vandana Yojana (PMMVY)", desc: "Central government support for pregnant and nursing mothers.", benefit: "Rs 5,000 in two instalments for the first child.", who: "You can check your eligibility by voice.", where: "Nearest Anganwadi centre.", next: "Start the voice eligibility check." },
      hi: { title: "मातृ वंदना योजना (PMMVY)", desc: "गर्भवती और स्तनपान कराने वाली माताओं के लिए केंद्र सरकार की सहायता।", benefit: "पहले बच्चे के लिए दो किस्तों में 5,000 रुपये।", who: "गर्भवती या नई माताओं के लिए। पात्रता के नियम आंगनवाड़ी में पूछें।", where: "नज़दीकी आंगनवाड़ी केंद्र।", next: "आवेदन के बारे में नज़दीकी आंगनवाड़ी में पूछें।" },
      te: { title: "మాతృ వందన యోజన (PMMVY)", desc: "గర్భిణీలు మరియు పాలిచ్చే తల్లులకు కేంద్ర ప్రభుత్వ సహాయం.", benefit: "మొదటి బిడ్డకు రెండు విడతల్లో 5,000 రూపాయలు.", who: "గర్భిణీలు లేదా కొత్త తల్లులకు. అర్హత నియమాలను అంగన్‌వాడీలో అడగండి.", where: "సమీపంలోని అంగన్‌వాడీ కేంద్రం.", next: "దరఖాస్తు గురించి సమీప అంగన్‌వాడీలో అడగండి." },
    },
    {
      id: "widow", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
      docs: ["ration", "aadhaar", "deathCert", "widowCert"],
      kw: ["விதவை", "கணவர் இறந்த", "கணவன் இறந்த", "ஓய்வூதியம்", "பென்ஷன்", "widow", "husband died", "pension", "विधवा", "पति की मृत्यु", "पेंशन", "వితంతు", "భర్త మరణ", "పింఛను"],
      ...std(
        { ta: "ஆதரவற்ற விதவை ஓய்வூதியம்", en: "Destitute Widow Pension", hi: "निराश्रित विधवा पेंशन", te: "నిరాధార వితంతు పింఛను" },
        { ta: "ஆதரவற்ற விதவைகளுக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் கேளுங்கள்.", en: "Destitute widows. Ask about age and income rules at the office.", hi: "निराश्रित विधवाओं के लिए। आयु और आय के नियम कार्यालय में पूछें।", te: "నిరాధార వితంతువులకు. వయస్సు, ఆదాయ నియమాలను కార్యాలయంలో అడగండి." }
      ),
    },
    {
      id: "deserted", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
      docs: ["ration", "aadhaar", "desertCert"],
      kw: ["கைவிடப்பட்ட", "விவாகரத்து", "ஓய்வூதியம்", "பென்ஷன்", "deserted", "divorce", "divorced", "pension", "परित्यक्ता", "तलाक", "पेंशन", "విడిచిపెట్ట", "విడాకులు", "పింఛను"],
      ...std(
        { ta: "ஆதரவற்ற / கைவிடப்பட்ட பெண்கள் ஓய்வூதியம்", en: "Destitute / Deserted Women Pension", hi: "निराश्रित / परित्यक्ता महिला पेंशन", te: "నిరాధార / విడిచిపెట్టబడిన మహిళల పింఛను" },
        { ta: "கைவிடப்பட்ட அல்லது விவாகரத்தான பெண்களுக்கு. நிபந்தனைகளை அலுவலகத்தில் கேளுங்கள்.", en: "Deserted or divorced women. Ask about the conditions at the office.", hi: "परित्यक्ता या तलाकशुदा महिलाओं के लिए। शर्तें कार्यालय में पूछें।", te: "భర్త విడిచిపెట్టిన లేదా విడాకులు తీసుకున్న మహిళలకు. షరతులను కార్యాలయంలో అడగండి." }
      ),
    },
    {
      id: "unmarried", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
      docs: ["ration", "aadhaar"],
      kw: ["திருமணமாகாத", "ஓய்வூதியம்", "பென்ஷன்", "unmarried", "single", "pension", "अविवाहित", "पेंशन", "పెళ్లికాని", "పింఛను"],
      ...std(
        { ta: "திருமணமாகாத ஏழைப் பெண்கள் ஓய்வூதியம்", en: "Unmarried Poor Women Pension", hi: "अविवाहित निर्धन महिला पेंशन", te: "పెళ్లికాని పేద మహిళల పింఛను" },
        { ta: "ஏழ்மையில் உள்ள திருமணமாகாத மூத்த பெண்களுக்கு. வயது விதியை அலுவலகத்தில் கேளுங்கள்.", en: "Poor unmarried older women. Ask about the age rule at the office.", hi: "निर्धन अविवाहित बुज़ुर्ग महिलाओं के लिए। आयु का नियम कार्यालय में पूछें।", te: "పేదరికంలో ఉన్న పెళ్లికాని వృద్ధ మహిళలకు. వయస్సు నియమాన్ని కార్యాలయంలో అడగండి." }
      ),
    },
    {
      id: "oldage", icon: Landmark, cats: ["pension", "money"], url: "https://cra.tn.gov.in/",
      docs: ["ration", "aadhaar"],
      kw: ["முதியோர்", "வயதான", "மூத்த", "ஓய்வூதியம்", "பென்ஷன்", "old age", "elderly", "senior", "pension", "बुज़ुर्ग", "वृद्ध", "पेंशन", "వృద్ధ", "పింఛను"],
      ...std(
        { ta: "முதியோர் ஓய்வூதியம்", en: "Old Age Pension", hi: "वृद्धावस्था पेंशन", te: "వృద్ధాప్య పింఛను" },
        { ta: "ஆதரவு தேவைப்படும் முதியோருக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் கேளுங்கள்.", en: "Elderly people in need. Ask about age and income rules at the office.", hi: "सहारे की ज़रूरत वाले बुज़ुर्गों के लिए। आयु और आय के नियम कार्यालय में पूछें।", te: "ఆసరా అవసరమైన వృద్ధులకు. వయస్సు, ఆదాయ నియమాలను కార్యాలయంలో అడగండి." }
      ),
    },
    {
      id: "disab", icon: Accessibility, cats: ["disab", "pension", "money"], url: "https://cra.tn.gov.in/",
      docs: ["udid", "ration", "aadhaar"],
      kw: ["மாற்றுத்திறன", "ஊனம்", "ஓய்வூதியம்", "disabled", "disability", "differently", "pension", "दिव्यांग", "विकलांग", "पेंशन", "దివ్యాంగ", "వైకల్య", "పింఛను"],
      ta: { title: "மாற்றுத்திறனாளி ஓய்வூதியம்", desc: "மாற்றுத்திறனாளிகளுக்கான சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT.ta, who: "தகுதியுள்ள மாற்றுத்திறனாளிகளுக்கு.", where: OFFICE.ta, next: CHECK.ta },
      en: { title: "Differently-Abled Pension", desc: "Social security scheme for persons with disabilities.", benefit: AMT.en, who: "Eligible differently-abled persons.", where: OFFICE.en, next: CHECK.en },
      hi: { title: "दिव्यांग पेंशन", desc: "दिव्यांगजनों के लिए सामाजिक सुरक्षा योजना।", benefit: AMT.hi, who: "पात्र दिव्यांगजनों के लिए।", where: OFFICE.hi, next: CHECK.hi },
      te: { title: "దివ్యాంగుల పింఛను", desc: "దివ్యాంగుల కోసం సామాజిక భద్రతా పథకం.", benefit: AMT.te, who: "అర్హులైన దివ్యాంగులకు.", where: OFFICE.te, next: CHECK.te },
    },
    {
      id: "ssy", icon: PiggyBank, cats: ["women", "money"], url: null,
      docs: ["birthGirl", "idGuardian", "addrGuardian", "photos"],
      kw: ["பெண் குழந்தை", "சேமிப்பு", "செல்வமகள்", "மகள்", "girl child", "daughter", "savings", "sukanya", "बेटी", "बचत", "सुकन्या", "ఆడపిల్ల", "పొదుపు", "సుకన్య", "కూతురు"],
      ta: { title: "செல்வமகள் சேமிப்புத் திட்டம்", desc: "பெண் குழந்தையின் எதிர்காலத்துக்கான மத்திய அரசு சேமிப்புத் திட்டம்.", benefit: "பெண் குழந்தையின் பெயரில் சிறு சேமிப்புக் கணக்கு.", who: "பெண் குழந்தையின் பெற்றோர் அல்லது பாதுகாவலருக்கு.", where: "அஞ்சலகம் அல்லது வங்கி.", next: "வட்டி விகிதம், விதிகளை அங்கே கேளுங்கள்." },
      en: { title: "Sukanya Samriddhi Scheme", desc: "Central government savings scheme for a girl child's future.", benefit: "A small savings account in the girl child's name.", who: "Parents or guardians of a girl child.", where: "Post office or bank.", next: "Ask about interest rates and rules there." },
      hi: { title: "सुकन्या समृद्धि योजना", desc: "बालिका के भविष्य के लिए केंद्र सरकार की बचत योजना।", benefit: "बालिका के नाम पर छोटी बचत खाता।", who: "बालिका के माता-पिता या अभिभावक के लिए।", where: "डाकघर या बैंक।", next: "ब्याज दर और नियम वहीं पूछें।" },
      te: { title: "సుకన్య సమృద్ధి పథకం", desc: "ఆడపిల్ల భవిష్యత్తు కోసం కేంద్ర ప్రభుత్వ పొదుపు పథకం.", benefit: "ఆడపిల్ల పేరుపై చిన్న పొదుపు ఖాతా.", who: "ఆడపిల్ల తల్లిదండ్రులు లేదా సంరక్షకులకు.", where: "పోస్టాఫీసు లేదా బ్యాంకు.", next: "వడ్డీ రేటు, నియమాల గురించి అక్కడే అడగండి." },
    },
    {
      // Vidiyal Payanam was expanded and renamed Vettri Payanam on 2 Oct 2026
      id: "payanam", icon: Bus, cats: ["women", "money"], status: "new", url: null,
      docs: ["idIfAsked"],
      kw: ["பேருந்து", "பஸ்", "பயணம்", "இலவசப் பயணம்", "விடியல்", "வெற்றி", "bus", "travel", "free travel", "vidiyal", "vettri", "vetri", "बस", "यात्रा", "मुफ़्त", "బస్సు", "ప్రయాణం", "ఉచిత"],
      ta: { title: "வெற்றிப் பயணம் (முன்பு விடியல் பயணம்)", desc: "மகளிர் மற்றும் மூன்றாம் பாலினத்தவர் தேர்ந்தெடுக்கப்பட்ட அரசுப் பேருந்துகளில் கட்டணமின்றிப் பயணம் செய்யலாம்.", benefit: "அரசுப் பேருந்துகளில் இலவசப் பயணம். வருமான வரம்பு இல்லை.", who: "தமிழ்நாட்டு மகளிருக்கு. வருமான நிபந்தனை இல்லை. எந்தப் பேருந்துகள் உள்ளடங்கும் என்பதை போக்குவரத்துக் கழகத்தில் உறுதி செய்யுங்கள்.", where: "தகுதியுள்ள அரசுப் போக்குவரத்துப் பேருந்துகள்.", next: "ஆன்லைன் பதிவு தேவையில்லை. தகுதியுள்ள அரசுப் பேருந்தில் ஏறி, நடத்துநரிடம் இலவசப் பயணச் சீட்டு கேளுங்கள்." },
      en: { title: "Vettri Payanam (earlier Vidiyal Payanam)", desc: "Women and transgender persons can travel free on notified government buses.", benefit: "Free travel on government buses. No income limit.", who: "Women of Tamil Nadu. There is no income condition. Confirm which buses are covered at the transport office.", where: "Eligible government (state transport) buses.", next: "No online registration is needed. Board an eligible government bus and ask the conductor for a free ticket." },
      hi: { title: "वेट्री पयणम (पहले विडियल पयणम)", desc: "महिलाएँ और ट्रांसजेंडर व्यक्ति चुनी हुई सरकारी बसों में मुफ़्त यात्रा कर सकते हैं।", benefit: "सरकारी बसों में मुफ़्त यात्रा। आय की कोई सीमा नहीं।", who: "तमिलनाडु की महिलाओं के लिए। आय की कोई शर्त नहीं। कौन-सी बसें शामिल हैं, यह परिवहन कार्यालय में पक्का कर लें।", where: "पात्र सरकारी (राज्य परिवहन) बसें।", next: "ऑनलाइन पंजीकरण ज़रूरी नहीं। पात्र सरकारी बस में चढ़ें और कंडक्टर से मुफ़्त टिकट माँगें।" },
      te: { title: "వెట్రి పయనం (ఇంతకు ముందు విడియల్ పయనం)", desc: "మహిళలు మరియు ట్రాన్స్‌జెండర్ వ్యక్తులు ఎంపిక చేసిన ప్రభుత్వ బస్సుల్లో ఉచితంగా ప్రయాణించవచ్చు.", benefit: "ప్రభుత్వ బస్సుల్లో ఉచిత ప్రయాణం. ఆదాయ పరిమితి లేదు.", who: "తమిళనాడు మహిళలకు. ఆదాయ షరతు లేదు. ఏ బస్సులు వర్తిస్తాయో రవాణా కార్యాలయంలో నిర్ధారించుకోండి.", where: "అర్హత గల ప్రభుత్వ (రాష్ట్ర రవాణా) బస్సులు.", next: "ఆన్‌లైన్ నమోదు అవసరం లేదు. అర్హత గల ప్రభుత్వ బస్సు ఎక్కి, కండక్టర్‌ను ఉచిత టికెట్ అడగండి." },
    },
    {
      id: "muthulakshmi", icon: Baby, cats: ["women", "preg", "money"], status: "active", url: null,
      docs: ["picme", "otherAsked"],
      kw: ["கர்ப்ப", "பிரசவ", "மகப்பேறு", "முத்துலட்சுமி", "ஊட்டச்சத்து", "pregnant", "pregnancy", "maternity", "delivery", "muthulakshmi", "nutrition", "picme", "गर्भ", "प्रसव", "पोषण", "గర్భ", "ప్రసవ", "పోషక"],
      ta: { title: "டாக்டர் முத்துலட்சுமி ரெட்டி மகப்பேறு உதவித் திட்டம்", desc: "கர்ப்பிணிகளுக்கு பிரசவத்துக்கு முன்னும் பின்னும் தவணைகளில் உதவி கிடைக்கும். இதில் ஊட்டச்சத்துப் பெட்டகமும் அடங்கும்.", benefit: "மொத்தம் 18,000 ரூபாய்: 14,000 ரூபாய் பணம் தவணைகளில், மற்றும் 4,000 ரூபாய் மதிப்புள்ள இரண்டு ஊட்டச்சத்துப் பெட்டகங்கள்.", who: "தமிழ்நாட்டுக் கர்ப்பிணிகளுக்கு. தகுதி விதிகளை சுகாதார நிலையத்தில் உறுதி செய்யுங்கள்.", where: "PICME இணையதளம், அருகிலுள்ள அரசு சுகாதார நிலையம் அல்லது கிராம சுகாதார செவிலியர்.", next: "கர்ப்பத்தை முன்கூட்டியே, 12 வாரங்களுக்குள் பதிவு செய்வது நல்லது. விவரங்களை சுகாதார நிலையத்தில் கேளுங்கள்." },
      en: { title: "Dr. Muthulakshmi Reddy Maternity Assistance Scheme", desc: "Pregnant women receive assistance in instalments before and after delivery. It also includes nutrition kits.", benefit: "Rs 18,000 in total: Rs 14,000 cash in instalments plus two nutrition kits worth Rs 4,000.", who: "Pregnant women of Tamil Nadu. Confirm the eligibility rules at the health centre.", where: "PICME website, the nearest government health centre or the village health nurse.", next: "Register your pregnancy early, ideally within 12 weeks. Ask the health centre for details." },
      hi: { title: "डॉ. मुथुलक्ष्मी रेड्डी मातृत्व सहायता योजना", desc: "गर्भवती महिलाओं को प्रसव से पहले और बाद में किस्तों में सहायता मिलती है। इसमें पोषण किट भी शामिल हैं।", benefit: "कुल 18,000 रुपये: 14,000 रुपये नकद किस्तों में और 4,000 रुपये के दो पोषण किट।", who: "तमिलनाडु की गर्भवती महिलाओं के लिए। पात्रता के नियम स्वास्थ्य केंद्र में पक्के कर लें।", where: "PICME वेबसाइट, नज़दीकी सरकारी स्वास्थ्य केंद्र या ग्राम स्वास्थ्य नर्स।", next: "गर्भावस्था का पंजीकरण जल्दी करवाएँ, बेहतर है 12 हफ़्तों के भीतर। जानकारी स्वास्थ्य केंद्र में पूछें।" },
      te: { title: "డాక్టర్ ముత్తులక్ష్మి రెడ్డి మాతృత్వ సహాయ పథకం", desc: "గర్భిణీలకు ప్రసవానికి ముందు మరియు తర్వాత విడతల్లో సహాయం లభిస్తుంది. ఇందులో పోషకాహార కిట్లు కూడా ఉంటాయి.", benefit: "మొత్తం 18,000 రూపాయలు: 14,000 రూపాయలు విడతల్లో నగదు, 4,000 రూపాయల విలువైన రెండు పోషకాహార కిట్లు.", who: "తమిళనాడు గర్భిణీలకు. అర్హత నియమాలను ఆరోగ్య కేంద్రంలో నిర్ధారించుకోండి.", where: "PICME వెబ్‌సైట్, సమీపంలోని ప్రభుత్వ ఆరోగ్య కేంద్రం లేదా గ్రామ ఆరోగ్య నర్సు.", next: "గర్భధారణ నమోదును త్వరగా చేయించుకోండి, 12 వారాల్లోపు చేస్తే మంచిది. వివరాలను ఆరోగ్య కేంద్రంలో అడగండి." },
    },
    {
      id: "cmgirl", icon: PiggyBank, cats: ["women", "edu", "money"], status: "active", url: null,
      docs: ["birthGirl", "parentAge", "income", "community", "nativity", "sterilization", "noMale"],
      kw: ["பெண் குழந்தை", "முதலமைச்சர்", "வைப்புத் தொகை", "பாதுகாப்பு", "girl child", "daughter", "deposit", "chief minister", "protection", "बेटी", "बालिका", "जमा", "ఆడపిల్ల", "డిపాజిట్", "రక్షణ"],
      ta: { title: "முதலமைச்சரின் பெண் குழந்தை பாதுகாப்புத் திட்டம்", desc: "பெண் குழந்தையின் பெயரில் அரசு வைப்புத் தொகை செலுத்தும். 18 வயதில் தொகை கிடைக்கும்; படிப்புக்கு உதவும்.", benefit: "பெண் குழந்தையின் பெயரில் அரசு வைப்புத் தொகை: ஒரு பெண் குழந்தைக்கு 50,000 ரூபாய், இரண்டு பெண் குழந்தைகளுக்கு தலா 25,000 ரூபாய். 18 வயதில் கிடைக்கும்.", who: "ஆண் குழந்தை இல்லாத, ஒன்று அல்லது இரண்டு பெண் குழந்தைகள் உள்ள குடும்பங்களுக்கு. ஆண்டு வருமான வரம்பு உண்டு. விதிகளை அலுவலகத்தில் உறுதி செய்யுங்கள்.", where: OFFICE.ta, next: "குழந்தை பிறந்த பிறகு விண்ணப்பிக்க காலக்கெடு உண்டு. கடைசி தேதியை அலுவலகத்தில் கேளுங்கள்." },
      en: { title: "Chief Minister's Girl Child Protection Scheme", desc: "The government makes a deposit in the girl child's name. The amount is received at age 18 and helps with education.", benefit: "A government fixed deposit in the girl child's name: Rs 50,000 for one girl child, or Rs 25,000 each for two girls. Paid when she turns 18.", who: "Families with one or two girl children and no male child. An annual income limit applies. Confirm the rules at the office.", where: OFFICE.en, next: "There is a time limit to apply after the child's birth. Ask about the deadline at the office." },
      hi: { title: "मुख्यमंत्री बालिका संरक्षण योजना", desc: "सरकार बालिका के नाम पर जमा राशि रखती है। 18 साल की उम्र में राशि मिलती है और पढ़ाई में मदद करती है।", benefit: "बालिका के नाम पर सरकारी सावधि जमा: एक बालिका के लिए 50,000 रुपये, दो बालिकाओं के लिए 25,000 रुपये प्रत्येक। 18 साल की उम्र में मिलती है।", who: "ऐसे परिवारों के लिए जिनमें एक या दो बेटियाँ हैं और कोई बेटा नहीं। वार्षिक आय की सीमा लागू है। नियम कार्यालय में पक्के कर लें।", where: OFFICE.hi, next: "बच्चे के जन्म के बाद आवेदन की समय-सीमा होती है। अंतिम तारीख कार्यालय में पूछें।" },
      te: { title: "ముఖ్యమంత్రి ఆడపిల్ల రక్షణ పథకం", desc: "ప్రభుత్వం ఆడపిల్ల పేరుపై డిపాజిట్ చేస్తుంది. 18 ఏళ్లకు మొత్తం లభిస్తుంది; చదువుకు సహాయపడుతుంది.", benefit: "ఆడపిల్ల పేరుపై ప్రభుత్వ ఫిక్స్‌డ్ డిపాజిట్: ఒక ఆడపిల్లకు 50,000 రూపాయలు, ఇద్దరు ఆడపిల్లలకు ఒక్కొక్కరికి 25,000 రూపాయలు. 18 ఏళ్లకు లభిస్తుంది.", who: "మగపిల్లవాడు లేని, ఒకరు లేదా ఇద్దరు ఆడపిల్లలు ఉన్న కుటుంబాలకు. వార్షిక ఆదాయ పరిమితి ఉంది. నియమాలను కార్యాలయంలో నిర్ధారించుకోండి.", where: OFFICE.te, next: "బిడ్డ పుట్టిన తర్వాత దరఖాస్తుకు సమయ పరిమితి ఉంటుంది. చివరి తేదీని కార్యాలయంలో అడగండి." },
    },
    {
      id: "sewing", icon: Scissors, cats: ["women", "money", "disab"], status: "active", url: null,
      docs: ["familyIncome", "ageProof", "categoryCert"],
      kw: ["தையல்", "இயந்திரம்", "சுயதொழில்", "விதவை", "மாற்றுத்திறன", "sewing", "machine", "self employment", "widow", "disabled", "satyavani", "sathyavani", "सिलाई", "मशीन", "स्वरोज़गार", "కుట్టు", "యంత్రం", "స్వయం ఉపాధి"],
      ta: { title: "சத்தியவாணிமுத்து அம்மையார் நினைவு இலவச தையல் இயந்திரத் திட்டம்", desc: "விதவைகள், கைவிடப்பட்ட மனைவியர், ஏழைப் பெண்கள், மாற்றுத்திறனாளிகளுக்கு சுயதொழிலுக்காக இலவச தையல் இயந்திரம் கிடைக்கும்.", benefit: "சுயதொழிலுக்கு இலவச தையல் இயந்திரம்.", who: "விதவைகள், கைவிடப்பட்ட மனைவியர், ஏழைப் பெண்கள், மாற்றுத்திறனாளிகளுக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் உறுதி செய்யுங்கள்.", where: OFFICE.ta, next: CHECK.ta },
      en: { title: "Sathyavani Muthu Ammaiyar Memorial Free Sewing Machine Scheme", desc: "Widows, deserted wives, women from poor families and differently-abled persons can get a free sewing machine for self-employment.", benefit: "A free sewing machine for self-employment.", who: "Widows, deserted wives, women from poor families and differently-abled persons. Confirm the age and income rules at the office.", where: OFFICE.en, next: CHECK.en },
      hi: { title: "सत्यवाणी मुत्तु अम्मैयार स्मृति निःशुल्क सिलाई मशीन योजना", desc: "विधवाओं, परित्यक्ता पत्नियों, निर्धन परिवारों की महिलाओं और दिव्यांगजनों को स्वरोज़गार के लिए निःशुल्क सिलाई मशीन मिलती है।", benefit: "स्वरोज़गार के लिए निःशुल्क सिलाई मशीन।", who: "विधवाओं, परित्यक्ता पत्नियों, निर्धन परिवारों की महिलाओं और दिव्यांगजनों के लिए। आयु और आय के नियम कार्यालय में पक्के कर लें।", where: OFFICE.hi, next: CHECK.hi },
      te: { title: "సత్యవాణి ముత్తు అమ్మైయార్ స్మారక ఉచిత కుట్టు యంత్ర పథకం", desc: "వితంతువులు, భర్త విడిచిపెట్టిన మహిళలు, పేద కుటుంబాల మహిళలు, దివ్యాంగులు స్వయం ఉపాధి కోసం ఉచిత కుట్టు యంత్రం పొందవచ్చు.", benefit: "స్వయం ఉపాధికి ఉచిత కుట్టు యంత్రం.", who: "వితంతువులు, భర్త విడిచిపెట్టిన మహిళలు, పేద కుటుంబాల మహిళలు, దివ్యాంగులకు. వయస్సు, ఆదాయ నియమాలను కార్యాలయంలో నిర్ధారించుకోండి.", where: OFFICE.te, next: CHECK.te },
    },
  ];
  
  /* expand document keys into each language */
  export const S = RAW.map((r) => {
    const out = { ...r };
    for (const l of L) {
      out[l] = { ...r[l], docs: r.docs ? r.docs.map((k) => DOC[k][l]) : null };
    }
    delete out.docs;
    return out;
  });
  
  /* ---------- helpers ---------- */
  export const getS = (id) => S.find((x) => x.id === id);
  
  export function matchSchemes(q) {
    const t = q.toLowerCase().trim();
    if (!t) return [];
    return S.map((s) => ({
      s,
      n: s.kw.reduce((a, k) => a + (t.includes(k.toLowerCase()) ? 2 : 0), 0),
    }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .map((x) => x.s);
  }