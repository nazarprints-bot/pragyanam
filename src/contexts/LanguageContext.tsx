import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.home": { en: "Home", hi: "होम" },
  "nav.courses": { en: "Courses", hi: "कोर्सेज़" },
  "nav.features": { en: "Features", hi: "फ़ीचर्स" },
  "nav.pricing": { en: "Pricing", hi: "मूल्य" },
  "nav.login": { en: "Log in", hi: "लॉग इन" },
  "nav.getStarted": { en: "Get started", hi: "शुरू करें" },

  // Hero
  "hero.badge": { en: "India's most affordable learning platform", hi: "भारत का सबसे सस्ता शिक्षा मंच" },
  "hero.title1": { en: "Quality education for ", hi: "हर छात्र के लिए " },
  "hero.titleHighlight": { en: "every student", hi: "गुणवत्ता शिक्षा" },
  "hero.subtitle": { en: "Class 6–12, competitive exams, scholarships — live classes, smart tests, and doubt solving. All at the lowest price.", hi: "कक्षा 6–12, प्रतियोगी परीक्षाएँ, छात्रवृत्ति — लाइव कक्षाएँ, स्मार्ट टेस्ट और डाउट सॉल्विंग। सबसे कम कीमत पर।" },
  "hero.cta1": { en: "Start learning free", hi: "मुफ़्त पढ़ना शुरू करें" },
  "hero.cta2": { en: "See how it works", hi: "कैसे काम करता है देखें" },
  "hero.students": { en: "Students", hi: "छात्र" },
  "hero.coursesCount": { en: "Courses", hi: "कोर्सेज़" },
  "hero.passRate": { en: "Pass Rate", hi: "पास दर" },

  // Courses Section
  "courses.label": { en: "Courses", hi: "कोर्सेज़" },
  "courses.title": { en: "Learn what matters", hi: "जो ज़रूरी है वो सीखें" },
  "courses.subtitle": { en: "From school to competitive exams — everything in one place", hi: "स्कूल से प्रतियोगी परीक्षाओं तक — सब एक जगह" },
  "courses.class68": { en: "Class 6–8", hi: "कक्षा 6–8" },
  "courses.class68Desc": { en: "Foundation building with strong basics", hi: "मज़बूत बुनियाद के साथ नींव" },
  "courses.class910": { en: "Class 9–10", hi: "कक्षा 9–10" },
  "courses.class910Desc": { en: "Board exam preparation & concepts", hi: "बोर्ड परीक्षा तैयारी और कॉन्सेप्ट" },
  "courses.class1112": { en: "Class 11–12", hi: "कक्षा 11–12" },
  "courses.class1112Desc": { en: "Advanced subjects & board prep", hi: "एडवांस विषय और बोर्ड तैयारी" },
  "courses.police": { en: "Police Exam", hi: "पुलिस परीक्षा" },
  "courses.policeDesc": { en: "Complete preparation with mock tests", hi: "मॉक टेस्ट के साथ पूरी तैयारी" },
  "courses.army": { en: "Army Exam", hi: "सेना परीक्षा" },
  "courses.armyDesc": { en: "Physical & written exam preparation", hi: "शारीरिक और लिखित परीक्षा तैयारी" },
  "courses.scholarship": { en: "Scholarship", hi: "छात्रवृत्ति" },
  "courses.scholarshipDesc": { en: "NTSE, Olympiad & state scholarship", hi: "NTSE, ओलंपियाड और राज्य छात्रवृत्ति" },
  "courses.explore": { en: "Explore", hi: "देखें" },

  // Features Section
  "features.label": { en: "Features", hi: "फ़ीचर्स" },
  "features.title": { en: "Everything you need to succeed", hi: "सफ़लता के लिए सब कुछ" },
  "features.subtitle": { en: "All the tools for success in one place", hi: "सफ़लता के सभी उपकरण एक जगह" },
  "features.liveClasses": { en: "Live Classes", hi: "लाइव कक्षाएँ" },
  "features.liveClassesDesc": { en: "Interactive sessions with real-time doubt solving", hi: "रियल-टाइम डाउट सॉल्विंग के साथ इंटरैक्टिव सेशन" },
  "features.recorded": { en: "Recorded Lectures", hi: "रिकॉर्डेड लेक्चर" },
  "features.recordedDesc": { en: "Access video lectures anytime, organized chapter-wise", hi: "कभी भी वीडियो लेक्चर एक्सेस करें, चैप्टर वाइज़" },
  "features.studyMaterial": { en: "Study Material", hi: "अध्ययन सामग्री" },
  "features.studyMaterialDesc": { en: "PDF notes, practice sheets & chapter summaries", hi: "PDF नोट्स, प्रैक्टिस शीट और चैप्टर सारांश" },
  "features.smartTests": { en: "Smart Tests", hi: "स्मार्ट टेस्ट" },
  "features.smartTestsDesc": { en: "Chapter tests, mock exams with instant results", hi: "चैप्टर टेस्ट, मॉक परीक्षाएँ तुरंत परिणाम के साथ" },
  "features.doubtSolving": { en: "Doubt Solving", hi: "डाउट सॉल्विंग" },
  "features.doubtSolvingDesc": { en: "Post doubts and get teacher responses quickly", hi: "डाउट पोस्ट करें और टीचर का जवाब जल्दी पाएँ" },
  "features.progressTracking": { en: "Progress Tracking", hi: "प्रगति ट्रैकिंग" },
  "features.progressTrackingDesc": { en: "Track completion, scores & performance analytics", hi: "पूर्णता, स्कोर और प्रदर्शन एनालिटिक्स ट्रैक करें" },
  "features.multiLanguage": { en: "Multi-Language", hi: "बहु-भाषा" },
  "features.multiLanguageDesc": { en: "Full bilingual support across the platform", hi: "पूरे प्लेटफ़ॉर्म पर द्विभाषी सपोर्ट" },
  "features.allSubjects": { en: "All Subjects", hi: "सभी विषय" },
  "features.allSubjectsDesc": { en: "Class 6–12, Govt Jobs & Scholarship prep", hi: "कक्षा 6–12, सरकारी नौकरी और छात्रवृत्ति तैयारी" },

  // Testimonials Section
  "testimonials.label": { en: "Student Stories", hi: "छात्रों की कहानियाँ" },
  "testimonials.title": { en: "Loved by thousands of students", hi: "हज़ारों छात्रों का भरोसा" },
  "testimonials.subtitle": { en: "Real students, real results — hear from our community", hi: "असली छात्र, असली परिणाम — हमारी कम्युनिटी से सुनें" },
  "testimonials.name1": { en: "Rahul Sharma", hi: "राहुल शर्मा" },
  "testimonials.role1": { en: "Class 12 — Board Topper", hi: "कक्षा 12 — बोर्ड टॉपर" },
  "testimonials.text1": { en: "I scored 95% in boards thanks to Pragyanam's live classes and smart tests. The best part? It costs less than a single tuition class!", hi: "प्रज्ञानम् की लाइव कक्षाओं और स्मार्ट टेस्ट की बदौलत मैंने बोर्ड में 95% स्कोर किया। सबसे अच्छी बात? यह एक ट्यूशन क्लास से भी सस्ता है!" },
  "testimonials.name2": { en: "Priya Patel", hi: "प्रिया पटेल" },
  "testimonials.role2": { en: "Police Exam — Selected", hi: "पुलिस परीक्षा — चयनित" },
  "testimonials.text2": { en: "From a small village to clearing the police exam — Pragyanam gave me access to quality coaching that I could never afford before.", hi: "एक छोटे गाँव से पुलिस परीक्षा पास करने तक — प्रज्ञानम् ने मुझे वो कोचिंग दी जो पहले कभी afford नहीं कर पाती।" },
  "testimonials.name3": { en: "Arjun Yadav", hi: "अर्जुन यादव" },
  "testimonials.role3": { en: "NTSE Scholar — Free Student", hi: "NTSE स्कॉलर — मुफ़्त छात्र" },
  "testimonials.text3": { en: "Being a free student didn't mean compromise. I got the same quality education and cracked NTSE. This platform truly cares about students.", hi: "मुफ़्त छात्र होने का मतलब कोई समझौता नहीं था। मैंने वही गुणवत्ता शिक्षा पाई और NTSE क्रैक किया। यह प्लेटफ़ॉर्म सच में छात्रों की परवाह करता है।" },
  "testimonials.successTitle": { en: "Our Impact in Numbers", hi: "हमारा प्रभाव संख्याओं में" },
  "testimonials.stat1": { en: "Active Students", hi: "सक्रिय छात्र" },
  "testimonials.stat2": { en: "Pass Rate", hi: "पास दर" },
  "testimonials.stat3": { en: "Per Month Only", hi: "प्रति माह केवल" },
  "testimonials.stat4": { en: "Expert Teachers", hi: "विशेषज्ञ शिक्षक" },

  // Pricing Section
  "pricing.label": { en: "Pricing", hi: "मूल्य" },
  "pricing.title": { en: "Complete access at an unbelievably low price", hi: "अविश्वसनीय रूप से कम कीमत पर पूरा एक्सेस" },
  "pricing.subtitle": { en: "All study material, live classes, tests & more — cheaper than a single tuition class", hi: "सारा स्टडी मटीरियल, लाइव क्लासेज़, टेस्ट और भी बहुत कुछ — एक ट्यूशन क्लास से भी सस्ता" },
  "pricing.basic": { en: "Starter", hi: "स्टार्टर" },
  "pricing.basicDesc": { en: "Get started with recorded lectures & study material", hi: "रिकॉर्डेड लेक्चर और स्टडी मटीरियल के साथ शुरू करें" },
  "pricing.pro": { en: "Pro — Full Access", hi: "प्रो — पूरा एक्सेस" },
  "pricing.proDesc": { en: "Everything you need — less than ₹10/day for unlimited learning!", hi: "सब कुछ जो चाहिए — असीमित पढ़ाई ₹10/दिन से भी कम में!" },
  "pricing.free": { en: "Free — Social Impact", hi: "मुफ़्त — सामाजिक प्रभाव" },
  "pricing.freeDesc": { en: "Same quality, zero cost — for students who truly need it", hi: "वही गुणवत्ता, ज़ीरो कीमत — जिन छात्रों को सच में ज़रूरत है" },
  "pricing.mostPopular": { en: "🔥 Best Value", hi: "🔥 सबसे किफ़ायती" },
  "pricing.socialImpact": { en: "Social Impact", hi: "सामाजिक प्रभाव" },
  "pricing.getStarted": { en: "Start learning now", hi: "अभी पढ़ना शुरू करें" },
  "pricing.applyNow": { en: "Apply for free access", hi: "मुफ़्त एक्सेस के लिए आवेदन करें" },
  // Pricing features
  "pricing.f.recordedLectures": { en: "All recorded lectures", hi: "सभी रिकॉर्डेड लेक्चर" },
  "pricing.f.pdfStudyMaterial": { en: "PDF notes & study material", hi: "PDF नोट्स और स्टडी मटीरियल" },
  "pricing.f.chapterTests": { en: "Chapter-wise practice tests", hi: "चैप्टर वाइज़ प्रैक्टिस टेस्ट" },
  "pricing.f.basicDoubt": { en: "Community doubt support", hi: "कम्युनिटी डाउट सपोर्ट" },
  "pricing.f.everythingBasic": { en: "Everything in Starter +", hi: "स्टार्टर में सब कुछ +" },
  "pricing.f.liveClasses": { en: "Unlimited live classes", hi: "असीमित लाइव कक्षाएँ" },
  "pricing.f.mockExams": { en: "Mock exams with All India ranking", hi: "ऑल इंडिया रैंकिंग के साथ मॉक परीक्षा" },
  "pricing.f.priorityDoubt": { en: "1-on-1 priority doubt solving", hi: "1-on-1 प्राथमिकता डाउट सॉल्विंग" },
  "pricing.f.progressAnalytics": { en: "Detailed performance analytics", hi: "विस्तृत प्रदर्शन एनालिटिक्स" },
  "pricing.f.competitivePrep": { en: "Competitive exam preparation", hi: "प्रतियोगी परीक्षा तैयारी" },
  "pricing.f.fullAccess": { en: "100% platform access — no limits", hi: "100% प्लेटफ़ॉर्म एक्सेस — कोई लिमिट नहीं" },
  "pricing.f.verification": { en: "Simple verification process", hi: "सरल वेरिफ़िकेशन प्रक्रिया" },
  "pricing.f.adminApproval": { en: "Admin approval — genuine students only", hi: "एडमिन अप्रूवल — केवल सच्चे छात्र" },
  "pricing.f.community": { en: "Community & teacher support", hi: "कम्युनिटी और शिक्षक सपोर्ट" },
  "pricing.f.noCompromise": { en: "Same quality — zero compromise", hi: "वही गुणवत्ता — ज़ीरो समझौता" },

  // Footer
  "footer.desc": { en: "India's most affordable education platform. Quality learning for every student, regardless of their background.", hi: "भारत का सबसे सस्ता शिक्षा मंच। हर छात्र के लिए गुणवत्ता शिक्षा, चाहे उनकी पृष्ठभूमि कुछ भी हो।" },
  "footer.platform": { en: "Platform", hi: "प्लेटफ़ॉर्म" },
  "footer.support": { en: "Support", hi: "सहायता" },
  "footer.helpCenter": { en: "Help Center", hi: "सहायता केंद्र" },
  "footer.contact": { en: "Contact", hi: "संपर्क" },
  "footer.privacy": { en: "Privacy", hi: "गोपनीयता" },
  "footer.rights": { en: "© 2026 Pragyanam Academy. All rights reserved.", hi: "© 2026 प्रज्ञानम् एकेडमी। सर्वाधिकार सुरक्षित।" },
  "footer.madeFor": { en: "Made for India's students 🇮🇳", hi: "भारत के छात्रों के लिए बना 🇮🇳" },

  // Auth
  "auth.welcomeBack": { en: "Welcome back", hi: "वापस स्वागत है" },
  "auth.createAccount": { en: "Create account", hi: "खाता बनाएँ" },
  "auth.signInDesc": { en: "Sign in to your account", hi: "अपने खाते में लॉग इन करें" },
  "auth.getStartedDesc": { en: "Get started with Pragyanam", hi: "प्रज्ञानम् के साथ शुरू करें" },
  "auth.fullName": { en: "Full name", hi: "पूरा नाम" },
  "auth.yourName": { en: "Your name", hi: "आपका नाम" },
  "auth.iAmA": { en: "I am a", hi: "मैं हूँ" },
  "auth.student": { en: "Student", hi: "छात्र" },
  "auth.teacher": { en: "Teacher", hi: "शिक्षक" },
  "auth.email": { en: "Email", hi: "ईमेल" },
  "auth.password": { en: "Password", hi: "पासवर्ड" },
  "auth.signIn": { en: "Sign in", hi: "लॉग इन" },
  "auth.pleaseWait": { en: "Please wait...", hi: "कृपया प्रतीक्षा करें..." },
  "auth.noAccount": { en: "Don't have an account?", hi: "खाता नहीं है?" },
  "auth.haveAccount": { en: "Already have an account?", hi: "पहले से खाता है?" },
  "auth.signUp": { en: "Sign up", hi: "साइन अप" },
  "auth.backToHome": { en: "Back to home", hi: "होम पर वापस" },
  "auth.brandDesc": { en: "India's premium learning platform for students & teachers", hi: "छात्रों और शिक्षकों के लिए भारत का प्रीमियम शिक्षा मंच" },
  "auth.phone": { en: "Phone number", hi: "फ़ोन नंबर" },
  "auth.parentPhone": { en: "Parent's phone number", hi: "अभिभावक का फ़ोन नंबर" },
  "auth.school": { en: "School name", hi: "स्कूल का नाम" },
  "auth.schoolPlaceholder": { en: "Enter school name", hi: "स्कूल का नाम लिखें" },
  "auth.class": { en: "Class", hi: "कक्षा" },
  "auth.selectClass": { en: "Select class", hi: "कक्षा चुनें" },
  "auth.classLabel": { en: "Class", hi: "कक्षा" },
  "auth.state": { en: "State", hi: "राज्य" },
  "auth.selectState": { en: "Select", hi: "चुनें" },
  "auth.district": { en: "District", hi: "ज़िला" },
  "auth.districtPlaceholder": { en: "Enter district", hi: "ज़िला लिखें" },
  "auth.fillAllFields": { en: "Please fill all required fields", hi: "कृपया सभी आवश्यक फ़ील्ड भरें" },
  "auth.accountCreated": { en: "Account created! Please verify your email.", hi: "खाता बन गया! कृपया अपना ईमेल वेरिफ़ाई करें।" },

  // Dashboard
  "dash.goodMorning": { en: "Good Morning", hi: "सुप्रभात" },
  "dash.goodAfternoon": { en: "Good Afternoon", hi: "शुभ दोपहर" },
  "dash.goodEvening": { en: "Good Evening", hi: "शुभ संध्या" },
  "dash.overview": { en: "here's your overview", hi: "यहाँ आपका सारांश है" },
  "dash.quickActions": { en: "Quick Actions", hi: "त्वरित कार्य" },
  "dash.enrolledCourses": { en: "Enrolled Courses", hi: "नामांकित कोर्सेज़" },
  "dash.testsTaken": { en: "Tests Taken", hi: "दिए गए टेस्ट" },
  "dash.doubtsAsked": { en: "Doubts Asked", hi: "पूछे गए डाउट" },
  "dash.avgScore": { en: "Avg Score", hi: "औसत स्कोर" },
  "dash.myCourses": { en: "My Courses", hi: "मेरे कोर्सेज़" },
  "dash.studentsLabel": { en: "Students", hi: "छात्र" },
  "dash.testsCreated": { en: "Tests Created", hi: "बनाए गए टेस्ट" },
  "dash.pendingDoubts": { en: "Pending Doubts", hi: "लंबित डाउट" },
  "dash.totalUsers": { en: "Total Users", hi: "कुल उपयोगकर्ता" },
  "dash.totalCourses": { en: "Total Courses", hi: "कुल कोर्सेज़" },
  "dash.totalTests": { en: "Total Tests", hi: "कुल टेस्ट" },
  "dash.revenue": { en: "Revenue", hi: "राजस्व" },
  "dash.browseCourses": { en: "Browse Courses", hi: "कोर्सेज़ ब्राउज़ करें" },
  "dash.takeTest": { en: "Take a Test", hi: "टेस्ट दें" },
  "dash.askDoubt": { en: "Ask a Doubt", hi: "डाउट पूछें" },
  "dash.viewProgress": { en: "View Progress", hi: "प्रगति देखें" },
  "dash.uploadContent": { en: "Upload Content", hi: "कंटेंट अपलोड करें" },
  "dash.createTest": { en: "Create Test", hi: "टेस्ट बनाएँ" },
  "dash.answerDoubts": { en: "Answer Doubts", hi: "डाउट का जवाब दें" },
  "dash.viewStudents": { en: "View Students", hi: "छात्र देखें" },
  "dash.manageUsers": { en: "Manage Users", hi: "उपयोगकर्ता प्रबंधन" },
  "dash.manageCourses": { en: "Manage Courses", hi: "कोर्सेज़ प्रबंधन" },
  "dash.viewAnalytics": { en: "View Analytics", hi: "एनालिटिक्स देखें" },
  "dash.settings": { en: "Settings", hi: "सेटिंग्स" },

  // Sidebar
  "sidebar.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "sidebar.courses": { en: "Courses", hi: "कोर्सेज़" },
  "sidebar.liveClasses": { en: "Live Classes", hi: "लाइव कक्षाएँ" },
  "sidebar.tests": { en: "Tests", hi: "टेस्ट" },
  "sidebar.doubts": { en: "Doubts", hi: "डाउट" },
  "sidebar.progress": { en: "Progress", hi: "प्रगति" },
  "sidebar.profile": { en: "Profile", hi: "प्रोफ़ाइल" },
  "sidebar.myCourses": { en: "My Courses", hi: "मेरे कोर्सेज़" },
  "sidebar.upload": { en: "Upload", hi: "अपलोड" },
  "sidebar.aiTests": { en: "AI Tests", hi: "AI टेस्ट" },
  "sidebar.students": { en: "Students", hi: "छात्र" },
  "sidebar.users": { en: "Users", hi: "उपयोगकर्ता" },
  "sidebar.analytics": { en: "Analytics", hi: "एनालिटिक्स" },
  "sidebar.settings": { en: "Settings", hi: "सेटिंग्स" },
  "sidebar.logOut": { en: "Log out", hi: "लॉग आउट" },
  "sidebar.admin": { en: "Admin", hi: "एडमिन" },
  "sidebar.teacher": { en: "Teacher", hi: "शिक्षक" },
  "sidebar.student": { en: "Student", hi: "छात्र" },

  "sidebar.classes": { en: "Classes", hi: "कक्षाएँ" },
  "sidebar.recorded": { en: "Recorded", hi: "रिकॉर्डेड" },
  "sidebar.teachers": { en: "Teachers", hi: "शिक्षक" },

  // Bottom Nav
  "bnav.home": { en: "Home", hi: "होम" },
  "bnav.classes": { en: "Classes", hi: "कक्षाएँ" },
  "bnav.live": { en: "Live", hi: "लाइव" },
  "bnav.courses": { en: "Courses", hi: "कोर्सेज़" },
  "bnav.profile": { en: "Profile", hi: "प्रोफ़ाइल" },

  // Student Home
  "shome.liveNow": { en: "Live Now", hi: "अभी लाइव" },
  "shome.joinNow": { en: "Join Now", hi: "अभी जुड़ें" },
  "shome.continueLearning": { en: "Continue Learning", hi: "पढ़ाई जारी रखें" },
  "shome.viewAll": { en: "View All", hi: "सब देखें" },
  "shome.upcomingLive": { en: "Upcoming Live Sessions", hi: "आने वाली लाइव कक्षाएँ" },
  "shome.academicClasses": { en: "Coaching Classes", hi: "कोचिंग कक्षाएँ" },
  "shome.class": { en: "Class", hi: "कक्षा" },
  "shome.competitivePrep": { en: "Competitive Preparation", hi: "प्रतियोगी तैयारी" },
  "shome.popularCourses": { en: "Popular Courses", hi: "लोकप्रिय कोर्सेज़" },
  "shome.armyPrep": { en: "Army Preparation", hi: "सेना तैयारी" },
  "shome.armyPrepDesc": { en: "Physical & written exam prep", hi: "शारीरिक और लिखित परीक्षा तैयारी" },
  "shome.policePrep": { en: "Police Preparation", hi: "पुलिस तैयारी" },
  "shome.policePrepDesc": { en: "Reasoning, GK & practice tests", hi: "रीज़निंग, GK और प्रैक्टिस टेस्ट" },
  "shome.govtExam": { en: "Govt Exam Basics", hi: "सरकारी परीक्षा बेसिक्स" },
  "shome.govtExamDesc": { en: "General preparation for govt exams", hi: "सरकारी परीक्षाओं की सामान्य तैयारी" },

  // Academic
  "academic.selectClass": { en: "Select your class to start learning", hi: "सीखने के लिए अपनी कक्षा चुनें" },
  "academic.subjectsTeachers": { en: "Subjects & Teachers", hi: "विषय और शिक्षक" },
  "academic.noContent": { en: "No content yet", hi: "अभी कोई सामग्री नहीं" },
  "academic.comingSoon": { en: "Coming soon!", hi: "जल्द आ रहा है!" },
  "academic.liveClass": { en: "Live Class", hi: "लाइव कक्षा" },
  "academic.recorded": { en: "Recorded", hi: "रिकॉर्डेड" },
  "academic.notes": { en: "Notes", hi: "नोट्स" },
  "academic.tests": { en: "Tests", hi: "टेस्ट" },

  // Competitive
  "competitive.selectExam": { en: "Choose your exam category", hi: "अपनी परीक्षा श्रेणी चुनें" },
  "competitive.armyTitle": { en: "Army Preparation", hi: "सेना तैयारी" },
  "competitive.armyDesc": { en: "Physical training & written exam prep", hi: "शारीरिक प्रशिक्षण और लिखित परीक्षा तैयारी" },
  "competitive.policeTitle": { en: "Police Preparation", hi: "पुलिस तैयारी" },
  "competitive.policeDesc": { en: "Reasoning, GK & practice tests", hi: "रीज़निंग, सामान्य ज्ञान और प्रैक्टिस टेस्ट" },
  "competitive.govtTitle": { en: "Government Exam", hi: "सरकारी परीक्षा" },
  "competitive.govtDesc": { en: "General preparation for government exams", hi: "सरकारी परीक्षाओं की सामान्य तैयारी" },
  "competitive.coursesComingSoon": { en: "Courses will be added soon", hi: "कोर्सेज़ जल्द जोड़े जाएंगे" },

  // Teachers
  "teachers.title": { en: "Teachers", hi: "शिक्षक" },
  "teachers.subtitle": { en: "Browse all teachers on Pragyanam", hi: "प्रज्ञानम् के सभी शिक्षक देखें" },
  "teachers.search": { en: "Search teachers...", hi: "शिक्षक खोजें..." },
  "teachers.noTeachers": { en: "No teachers found", hi: "कोई शिक्षक नहीं मिला" },
  "teachers.profile": { en: "Teacher Profile", hi: "शिक्षक प्रोफ़ाइल" },
  "teachers.notFound": { en: "Teacher not found", hi: "शिक्षक नहीं मिला" },
  "teachers.courses": { en: "Courses", hi: "कोर्सेज़" },
  "teachers.upcoming": { en: "Upcoming", hi: "आने वाले" },
  "teachers.upcomingLive": { en: "Upcoming Live Classes", hi: "आने वाली लाइव कक्षाएँ" },
  "teachers.viewDetails": { en: "View", hi: "देखें" },
  "teachers.coursesRecorded": { en: "Courses & Recorded Lectures", hi: "कोर्सेज़ और रिकॉर्डेड लेक्चर" },
  "teachers.noCourses": { en: "No courses available yet", hi: "अभी कोई कोर्स उपलब्ध नहीं" },

  // Recorded Lectures
  "recorded.title": { en: "Recorded Lectures", hi: "रिकॉर्डेड लेक्चर" },
  "recorded.subtitle": { en: "Learn at your own pace, anytime", hi: "अपनी गति से, कभी भी सीखें" },
  "recorded.selectSubject": { en: "Select a subject", hi: "विषय चुनें" },
  "recorded.selectChapter": { en: "Select a chapter", hi: "अध्याय चुनें" },
  "recorded.chapterContent": { en: "Video lectures, notes & tests", hi: "वीडियो लेक्चर, नोट्स और टेस्ट" },
  "recorded.noLessons": { en: "No lessons yet", hi: "अभी कोई पाठ नहीं" },
  "recorded.noChapters": { en: "No chapters yet", hi: "अभी कोई अध्याय नहीं" },
  "recorded.videoLecture": { en: "Video Lecture", hi: "वीडियो लेक्चर" },
  "recorded.notes": { en: "Notes / PDF", hi: "नोट्स / PDF" },
  "recorded.reading": { en: "Reading", hi: "पठन" },
  "recorded.free": { en: "Free", hi: "मुफ़्त" },
  "recorded.watch": { en: "Watch", hi: "देखें" },
  "recorded.download": { en: "Download", hi: "डाउनलोड" },

  // Profile
  "profile.editProfile": { en: "Edit Profile", hi: "प्रोफ़ाइल संपादित करें" },
  "profile.certificates": { en: "Certificates & Progress", hi: "प्रमाणपत्र और प्रगति" },
  "profile.enrolled": { en: "Enrolled", hi: "नामांकित" },
  "profile.testsPassed": { en: "Tests Passed", hi: "पास टेस्ट" },
  "profile.avgScore": { en: "Avg Score", hi: "औसत स्कोर" },
  "profile.enrolledCourses": { en: "Enrolled Courses", hi: "नामांकित कोर्सेज़" },
  "profile.noCourses": { en: "No courses enrolled yet", hi: "अभी कोई कोर्स नामांकित नहीं" },
  "profile.testAchievements": { en: "Test Achievements", hi: "टेस्ट उपलब्धियाँ" },
  "profile.noTests": { en: "No tests taken yet", hi: "अभी कोई टेस्ट नहीं दिया" },
  "profile.score": { en: "Score", hi: "स्कोर" },
  "profile.passed": { en: "Passed", hi: "पास" },
  "profile.progress": { en: "Progress", hi: "प्रगति" },

  // Common
  "common.user": { en: "User", hi: "उपयोगकर्ता" },

  // Live Chat
  "chat.liveChat": { en: "Live Chat", hi: "लाइव चैट" },
  "chat.typeMessage": { en: "Type a message...", hi: "संदेश लिखें..." },
  "chat.send": { en: "Send", hi: "भेजें" },
  "chat.you": { en: "You", hi: "आप" },
  "chat.noMessages": { en: "No messages yet. Say hi! 👋", hi: "अभी कोई संदेश नहीं। हैलो बोलिए! 👋" },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("pragyanam-lang") as Language) || "en";
  });

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("pragyanam-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
