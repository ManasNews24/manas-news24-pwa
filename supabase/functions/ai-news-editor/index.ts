import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "केवल POST अनुरोध स्वीकार है।" });

  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  if (!token) return reply(401, { error: "लॉगिन आवश्यक है।" });

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return reply(401, { error: "लॉगिन की पुष्टि नहीं हो सकी।" });
  const user = await userRes.json();
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(user.id)}&select=role`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!profileRes.ok) return reply(403, { error: "उपयोगकर्ता की भूमिका की पुष्टि नहीं हो सकी।" });
  const profiles = await profileRes.json();
  if (!profiles?.length || !["reporter", "editor", "admin"].includes(profiles[0].role)) {
    return reply(403, { error: "आपको AI समाचार संपादन की अनुमति नहीं है।" });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return reply(503, { error: "AI सेवा की सुरक्षित API कुंजी अभी कॉन्फ़िगर नहीं है। एडमिन सेटअप पूरा होने पर यह सुविधा चालू होगी।" });

  let input: any;
  try { input = await req.json(); } catch { return reply(400, { error: "अनुरोध पढ़ा नहीं जा सका।" }); }
  const facts = String(input.facts || "").trim();
  const mode = input.mode === "polish" ? "polish" : "draft";
  if (!facts || facts.length > 12000) return reply(400, { error: "खबर के तथ्य खाली हैं या 12,000 अक्षरों से अधिक हैं।" });

  const prompt = `आप मानस न्यूज-24 के वरिष्ठ हिंदी समाचार संपादक हैं। केवल दिए गए इनपुट के आधार पर काम करें। कोई नाम, पद, तारीख, समय, संख्या, स्थान, आरोप, बयान, कारण या परिणाम न गढ़ें। जो जानकारी नहीं है उसे missing_facts में लिखें। आरोप को आरोप की तरह और अपुष्ट बात को अपुष्ट की तरह लिखें। मानहानिकारक निष्कर्ष न जोड़ें। भाषा शुद्ध, सरल, स्वाभाविक और समाचार-पत्र शैली की हो। शीर्षक तथ्यपरक हो, सनसनीखेज नहीं। इनपुट का अर्थ न बदलें। मोड: ${mode === "polish" ? "केवल भाषा/व्याकरण सुधारें; उपलब्ध शीर्षक और सामग्री का आशय बनाए रखें।" : "दिए तथ्यों से खबर का प्रारूप बनाएं; अधूरे तथ्य स्पष्ट करें।"}\nश्रेणी: ${String(input.category || "")}\nदिया शीर्षक: ${String(input.headline || "")}\nदिया सार: ${String(input.summary || "")}\nस्रोत/सत्यापन नोट: ${String(input.source_note || "")}\nकच्चे तथ्य/खबर:\n${facts}\nकेवल वैध JSON लौटाएं: { "title": string, "summary": string, "body": string, "seo_title": string, "seo_description": string, "missing_facts": string[], "cautions": string[] }`;

  const model = "gemini-2.5-flash";
  const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });
  if (!aiRes.ok) return reply(502, { error: "AI सेवा से उत्तर नहीं मिला। कुछ देर बाद पुनः प्रयास करें।" });
  const ai = await aiRes.json();
  const text = ai?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
  try {
    const result = JSON.parse(text);
    if (!result.title || !result.body) throw new Error("incomplete");
    return reply(200, { result });
  } catch {
    return reply(502, { error: "AI का उत्तर निर्धारित समाचार प्रारूप में नहीं मिला। दोबारा प्रयास करें।" });
  }
});
