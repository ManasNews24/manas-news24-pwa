# Manas News-24 — एकीकृत न्यूज़रूम और Blogger प्रकाशन कार्यप्रवाह

यह दस्तावेज़ मौजूदा PWA और Supabase कोड के निरीक्षण पर आधारित है। इसका लक्ष्य रिपोर्ट प्राप्ति से लेकर संपादकीय स्वीकृति और Blogger पर वास्तविक प्रकाशन तक एक नियंत्रित क्रम बनाना है। Blogger Theme V102 में पहले से उपलब्ध समाचार कटिंग सुविधा उसी थीम में रहेगी; न्यूज़रूम में उसका अलग विकल्प नहीं बनाया जाएगा।

## 1. मुख्य प्रवेश-बिंदु

- `admin.html` — मुख्य न्यूज़रूम: भूमिका-आधारित डैशबोर्ड, खबर लेखन/संपादन, समीक्षा, मीडिया लाइब्रेरी, पाठक खबरें, टीम और सुविधा केंद्र।
- `news-pipeline.html` — रिपोर्ट/सूचना प्राप्ति, AI मसौदा और न्यूज़रूम ड्राफ्ट में रूपांतरण।
- `blogger-publish.html` — एडमिन के लिए Blogger प्रकाशन डेस्क: Google OAuth, स्वीकृत खबरें, Blogger पोस्ट निर्माण/प्रकाशन और प्रकाशित URL का न्यूज़रूम में समन्वय।
- `daily-edition.html` — प्रकाशित खबरों की तारीखवार सूची।
- `operations-center.html` — एडमिन के लिए सिस्टम/गुणवत्ता निरीक्षण।

## 2. खबर का जीवन-चक्र

1. **सूचना प्राप्ति:** रिपोर्टर मुख्य न्यूज़रूम में खबर लिखे; पाठक `reader-submit.html` से सूचना भेजें; अधिकृत स्रोत `news-sources.html` में दर्ज हों।
2. **प्रारंभिक मसौदा:** `news-pipeline.html` का AI मसौदा मानव समीक्षा के बाद मौजूदा `news_articles` में draft बनाता है। AI मसौदा अपने आप प्रकाशित नहीं होता।
3. **संपादन और तथ्य-जांच:** मुख्य न्यूज़रूम में शीर्षक, सार, खबर, डेटलाइन, स्रोत नोट, तथ्य-जांच, फोटो/वीडियो और श्रेणी जाँची जाए।
4. **संपादकीय स्वीकृति:** संपादक खबर को `approved` करे। केवल approved खबर Blogger प्रकाशन डेस्क में उपलब्ध होगी।
5. **Blogger प्रकाशन:** एडमिन Google खाते की OAuth अनुमति देकर स्वीकृत खबर Blogger में पहले draft के रूप में बनवाए और फिर स्पष्ट प्रकाशन कार्रवाई से live करे। Blogger से प्राप्त वास्तविक URL, post ID और वितरण परिणाम `distribution_logs` में दर्ज हों; खबर की स्थिति `news_articles` में `published` और `published_url` के साथ अपडेट हो।
6. **वितरण और अभिलेख:** `daily-edition.html` प्रकाशित खबरों को दिखाए; मौजूदा Blogger Theme V102 की कटिंग सुविधा वहीं रहे; `social-poster.html` सोशल पोस्टर बनाए; पुश नोटिफिकेशन अलग अधिकृत प्रक्रिया से भेजे जाएँ।

## 3. मौजूदा डेटा स्रोत — दोहराव से बचें

| काम | मौजूदा डेटा/सेवा |
|---|---|
| मुख्य खबर और संपादकीय स्थिति | `news_articles` |
| संपादकीय कार्रवाई का इतिहास | `editorial_actions`, `audit_logs` |
| AI/प्राप्त स्रोत सामग्री | `news_intake_items` |
| वितरण / Blogger पोस्ट ID / URL / विफलता | `distribution_logs` |
| टीम/भूमिका | `user_profiles` |
| श्रेणियाँ | `news_categories` |
| मीडिया परिसंपत्तियाँ | `media_assets` |
| अधिकृत स्रोत | `news_sources` |

नया समानांतर article table या दूसरी login व्यवस्था न बनाई जाए। `distribution_logs` में Blogger की पहचान `external_message_id` के `blogger:` prefix से होगी। Service-role key या Google client secret को HTML/ब्राउज़र में कभी न रखें।

## 4. Blogger OAuth आवश्यकताएँ

- Google Cloud Console में Blogger API v3 सक्षम हो।
- Web OAuth Client ID बनाया जाए और प्रकाशित न्यूज़रूम का HTTPS origin Authorized JavaScript origin में जोड़ा जाए।
- OAuth scope केवल `https://www.googleapis.com/auth/blogger` हो।
- Google Identity Services का token model ब्राउज़र में अल्पकालिक access token देता है; token केवल मेमोरी में रखा जाए, localStorage में नहीं।
- Blog ID को Blogger API `blogs/byurl` से सत्यापित URL के आधार पर प्राप्त किया जाए।
- अभी वास्तविक Google OAuth Client ID और live origin पर परीक्षण/अनुमति आवश्यक है। इसके बिना Blogger पर वास्तविक प्रकाशन संभव नहीं है।

## 5. भूमिका और सुरक्षा

- **रिपोर्टर:** अपनी खबर तैयार करे और समीक्षा हेतु भेजे।
- **संपादक:** खबरों की जाँच, संपादन और स्वीकृति करे।
- **एडमिन:** Blogger OAuth कनेक्शन और अंतिम प्रकाशन कार्रवाई करे।
- Blogger पर पोस्ट पहले draft के रूप में बनेगी; उसके बाद स्पष्ट publish चरण होगा।
- यदि Blogger पोस्ट बन जाए लेकिन नेटवर्क/डेटाबेस समन्वय विफल हो, तो `distribution_logs` में pending/failed रिकॉर्ड के आधार पर उसी Blogger post ID से retry किया जाए; नया duplicate post न बनाया जाए।
- प्रकाशित स्थिति केवल वास्तविक Blogger response और URL मिलने के बाद दर्ज हो।

## 6. सुरक्षित रिलीज नीति

- विकास शाखा: `testing/cutting-studio-v102`
- Draft Pull Request में सभी बदलावों की समीक्षा होगी।
- `main`, GitHub Pages live deployment, Blogger V102 theme, Supabase schema/policies और live Edge Functions में बिना अलग स्पष्ट स्वीकृति कोई बदलाव नहीं।
- वास्तविक Google OAuth Client ID मिलने और मोबाइल/डेस्कटॉप परीक्षण के बाद ही अंतिम merge/live deployment।