const $ = (id) => document.getElementById(id);
function page(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===name));document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));if(name==="network")showNetwork();}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>page(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>page(b.dataset.go));
function command(text){const s=text.toLowerCase();let target=s.includes("website")?"website":s.includes("phish")?"phishing":s.includes("network")?"network":s.includes("apk")?"apk":s.includes("account")||s.includes("login")?"account":s.includes("jarvis")?"jarvis":s.includes("home")||s.includes("dashboard")?"home":null;if(target){page(target);$("jarvisReply").textContent="Opening "+target+".";return;} $("jarvisReply").textContent="I didn't understand. Try: website, phishing, network, APK, account, dashboard."}
$("sendCommand").onclick=()=>command($("command").value);
const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
$("listen").onclick=()=>{if(!Speech){$("jarvisReply").textContent="Voice recognition is not supported in this browser. Use the text command instead.";return;}const r=new Speech();r.lang="en-IN";r.onresult=e=>{const t=e.results[0][0].transcript;$("command").value=t;command(t)};r.onerror=()=>{$("jarvisReply").textContent="Microphone/voice recognition unavailable. Check browser permission or type a command."};r.start()};
function inspectUrl(raw){try{const u=new URL(raw);if(!["http:","https:"].includes(u.protocol))return {ok:false,msg:"Only http/https URLs are accepted."};return {ok:true,u}}catch{return {ok:false,msg:"That URL format is invalid. Include https://"} }}
$("checkSite").onclick=()=>{const r=inspectUrl($("siteUrl").value.trim());if(!r.ok){$("siteResult").textContent=r.msg;return;}const flags=[];if(r.u.protocol!=="https:")flags.push("The URL does not use HTTPS.");if(r.u.hostname.includes("xn--"))flags.push("The domain uses punycode; verify the spelling carefully.");if(r.u.hostname.split(".").length>4)flags.push("The hostname has many subdomains.");$("siteResult").textContent=flags.length?"Review notes: "+flags.join(" "):"No basic URL-format warning detected. This does NOT prove the website is safe."};
$("checkPhish").onclick=()=>{const r=inspectUrl($("phishUrl").value.trim());if(!r.ok){$("phishResult").textContent=r.msg;return;}const h=r.u.hostname.toLowerCase(),s=r.u.href.toLowerCase(),flags=[];if(r.u.protocol!=="https:")flags.push("No HTTPS");if(/\\d{1,3}(\\.\\d{1,3}){3}/.test(h))flags.push("IP address used as host");if(h.includes("xn--"))flags.push("Punycode domain");if(/login|verify|wallet|password|secure|gift|claim|update/.test(s))flags.push("Words often used in deceptive links");if(h.split(".").length>4)flags.push("Many subdomains");$("phishResult").textContent=flags.length?"Caution signs: "+flags.join("; ")+". Verify through the organization's official app/site.":"No simple pattern matched. This is not a guarantee of safety."};
function showNetwork(){$("networkResult").textContent="Browser online: "+(navigator.onLine?"Yes":"No")+"\\nPlatform: "+(navigator.platform||"Not provided")+"\\nLanguage: "+navigator.language+"\\nConnection type: "+(navigator.connection?.effectiveType||"Not exposed by browser");}
$("apkFile").onchange=e=>{const f=e.target.files[0];$("apkResult").textContent=f?`File name: ${f.name}\\nSize: ${(f.size/1024/1024).toFixed(2)} MB\\nLast modified: ${new Date(f.lastModified).toLocaleString()}\\nThis does not inspect code, permissions, signature, or malware.`:"No file selected."};
async function api(path,body){const res=await fetch("/api/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw Error(data.error||"Request failed");return data}
$("register").onclick=async()=>accountAction("register");$("login").onclick=async()=>accountAction("login");
async function accountAction(which){$("accountResult").textContent="Working...";try{const d=await api(which,{email:$("email").value,password:$("password").value});sessionStorage.setItem("sachin_toolkit_token",d.token);$("accountResult").textContent="Signed in as "+d.user.email+". Session token is kept only for this browser tab."; $("status").textContent="SIGNED IN";}catch(e){$("accountResult").textContent=e.message}}
$("logout").onclick=()=>{sessionStorage.removeItem("sachin_toolkit_token");$("accountResult").textContent="Signed out."; $("status").textContent="GUEST MODE";};
async function verifySession(){const token=sessionStorage.getItem("sachin_toolkit_token");if(!token)return;try{const r=await fetch("/api/me",{headers:{Authorization:"Bearer "+token}});if(!r.ok)throw Error();const d=await r.json();$("status").textContent="SIGNED IN";$("accountResult").textContent="Signed in as "+d.user.email+"."; }catch{sessionStorage.removeItem("sachin_toolkit_token");$("status").textContent="GUEST MODE";}}
verifySession();
showNetwork();

function addChatBubble(who, text) {
  const node = document.createElement("div");
  node.className = "chat-bubble " + who;
  node.textContent = text;
  $("chatMessages").appendChild(node);
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}
const jarvisHistory = [];
$("clearChat").onclick = () => {
  jarvisHistory.length = 0;
  $("chatMessages").replaceChildren();
  const note = document.createElement("p");
  note.className = "chat-note";
  note.textContent = "Chat cleared. Ask Jarvis a new question.";
  $("chatMessages").appendChild(note);
};
async function sendAIMessage() {
  const message = $("aiMessage").value.trim();
  if (!message) return;
  $("aiMessage").value = "";
  addChatBubble("user", message);
  const pending = document.createElement("div");
  pending.className = "chat-bubble jarvis";
  pending.textContent = "Jarvis is thinking...";
  $("chatMessages").appendChild(pending);
  try {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message, history: jarvisHistory.slice(-8)})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not reach Jarvis.");
    pending.textContent = (data.mode === "demo" ? "[DEMO] " : "") + data.reply;
    jarvisHistory.push({role:"user", content:message}, {role:"assistant", content:data.reply});
    if (jarvisHistory.length > 8) jarvisHistory.splice(0, jarvisHistory.length - 8);
  } catch (error) {
    pending.textContent = error.message || "Jarvis is temporarily unavailable.";
  }
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}
$("sendAI").onclick = sendAIMessage;
$("aiMessage").addEventListener("keydown", e => { if (e.key === "Enter") sendAIMessage(); });

if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
