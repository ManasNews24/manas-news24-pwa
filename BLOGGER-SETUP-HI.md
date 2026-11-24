# Manas News-24 — Blogger प्रकाशन सेटअप (हिंदी)

## इस सुविधा का काम

न्यूज़रूम में संपादकीय रूप से `approved` खबरें चुनकर Blogger API v3 के माध्यम से पहले Blogger Draft में बनाई जाती हैं। इसके बाद स्पष्ट पुष्टि से वही पोस्ट प्रकाशित होती है। सफल प्रकाशन पर वास्तविक URL, Blogger Post ID और स्थिति Supabase के मौजूदा `distribution_logs` तथा `news_articles` में दर्ज होती है।

Blogger Theme V102 की मौजूदा न्यूज कटिंग इमेज सुविधा यथावत रहेगी। इस PWA में अलग कटिंग स्टूडियो नहीं है।

## Google Cloud में एक बार का सेटअप

1. [Google Cloud Console](https://console.cloud.google.com/) में अपने Google खाते से लॉगिन करें और एक प्रोजेक्ट चुनें/बनाएँ।
2. **APIs & Services → Library** में **Blogger API v3** खोजकर Enable करें।
3. **Google Auth Platform / OAuth consent screen** में ऐप का नाम और सहायता ईमेल दर्ज करें। यदि ऐप Testing mode में है, तो अपने Blogger एडमिन Google खाते को Test users में जोड़ें।
4. **Clients / Credentials → Create OAuth client ID → Web application** चुनें।
5. **Authorized JavaScript origins** में यह origin जोड़ें:
   - `https://manasnews24.github.io`
   - यदि भविष्य में न्यूज़रूम किसी अलग custom domain पर चले, तो उसका exact HTTPS origin भी जोड़ें।
6. OAuth Client ID कॉपी करें। यह `.apps.googleusercontent.com` पर समाप्त होती है।

**महत्वपूर्ण:** इस सुविधा को Google Identity Services के browser token model से बनाया गया है। इसमें OAuth Client ID चाहिए, Client Secret नहीं। Client Secret, Supabase service-role key या कोई निजी credential HTML/ब्राउज़र में न डालें। Access token अस्थायी रूप से केवल पेज की मेमोरी में रहता है; localStorage में नहीं।

## न्यूज़रूम में कनेक्शन

1. मुख्य न्यूज़रूम में एडमिन खाते से लॉगिन करें।
2. **Blogger प्रकाशन** खोलें।
3. Google OAuth Client ID दर्ज करें और Blogger वेबसाइट URL की पुष्टि करें। डिफॉल्ट URL `https://manasnews.blogspot.com/` है; यदि ब्लॉग का पता अलग है तो उसे बदलें।
4. **सेटिंग सुरक्षित करें** दबाएँ।
5. **Google खाते से जोड़ें** दबाकर उसी Google खाते को चुनें जिसके पास Blogger ब्लॉग में पोस्ट प्रकाशित करने का अधिकार है।
6. Google की अनुमति स्वीकार करें। कनेक्शन सफल होने पर पेज Blogger ब्लॉग का नाम/ID दिखाएगा।

## खबर प्रकाशित करने का तरीका

1. रिपोर्ट/सूचना या मुख्य खबर संपादक से खबर तैयार करें।
2. संपादक खबर की तथ्य-जाँच करके स्थिति **स्वीकृत** करे।
3. एडमिन **Blogger प्रकाशन** डेस्क खोले।
4. स्वीकृत खबर के सामने **Blogger पर प्रकाशित करें** दबाएँ और पुष्टि करें।
5. सिस्टम पहले Blogger में Draft बनाता है, फिर उसी Draft को Publish करता है।
6. सफल होने पर Blogger URL न्यूज़रूम में `published_url` और स्थिति `published` के रूप में दर्ज होती है। दैनिक ई-अखबार में भी वही प्रकाशित खबर उपलब्ध होती है।

## विफलता और दोबारा प्रयास

- Blogger Draft बनने के बाद प्रकाशन विफल हो तो उसका Post ID `distribution_logs` में रखा जाता है। अगली कोशिश उसी Draft को प्रकाशित करती है; नया पोस्ट नहीं बनाती।
- यदि स्क्रीन बताए कि पिछला प्रयास बीच में रुका और Post ID सुरक्षित नहीं हुई, तो Blogger Dashboard के **Posts → Drafts** में शीर्षक जाँचें। पुष्टि किए बिना दोबारा नया पोस्ट न बनाएँ।
- यदि Blogger पर पोस्ट Live हो गई लेकिन न्यूज़रूम स्थिति अपडेट न हुई, तो **न्यूज़रूम स्थिति सिंक करें** विकल्प उसी लाइव URL को `news_articles` में दर्ज करेगा।
- वास्तविक Android Chrome और Desktop पर पहला कनेक्शन/प्रकाशन परीक्षण आवश्यक है।

## आधिकारिक तकनीकी दस्तावेज

- [Blogger API v3 — Posts: insert](https://developers.google.com/blogger/docs/3.0/reference/posts/insert)
- [Blogger API v3 — Posts: publish](https://developers.google.com/blogger/docs/3.0/reference/posts/publish)
- [Blogger API v3 — Blogs: getByUrl](https://developers.google.com/blogger/docs/3.0/reference/blogs/getByUrl)
- [Google Identity Services — Web authorization overview](https://developers.google.com/identity/oauth2/web/guides/overview)

## वर्तमान रिलीज सीमा

यह सुविधा अभी परीक्षण शाखा में है। जब तक Google OAuth Client ID देकर वास्तविक origin पर परीक्षण और उपयोगकर्ता की स्पष्ट स्वीकृति न मिल जाए, तब तक PR merge, GitHub Pages deployment, Blogger Theme V102 या live PWA में कोई बदलाव नहीं किया जाएगा।