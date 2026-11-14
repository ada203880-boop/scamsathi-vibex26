import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.regex.*;

/** Local Java HTTP server and explainable scam triage engine. */
public class ScamSathiServer {
  static final Path WEB = Paths.get("web").toAbsolutePath().normalize();
  static class Signal { String id,label,detail; int points; Signal(String i,String l,String d,int p){id=i;label=l;detail=d;points=p;} }
  static class Result { int score; String level,title,summary; List<Signal> signals=new ArrayList<>(); List<String> actions=new ArrayList<>(); }

  public static void main(String[] args) throws Exception {
    int port=args.length>0?Integer.parseInt(args[0]):8080;
    HttpServer server=HttpServer.create(new InetSocketAddress("127.0.0.1",port),0);
    server.createContext("/api/health",x->send(x,200,"application/json; charset=utf-8","{\"status\":\"ok\",\"engine\":\"ScamSathi rules v1\"}"));
    server.createContext("/api/analyze",x->{ if(!"POST".equalsIgnoreCase(x.getRequestMethod())){send(x,405,"application/json","{\"error\":\"POST required\"}");return;} try { byte[] raw=x.getRequestBody().readNBytes(65537); if(raw.length>65536){send(x,413,"application/json; charset=utf-8","{\"error\":\"Request body too large\"}");return;} Map<String,String> form=parseForm(new String(raw,StandardCharsets.UTF_8)); String message=form.getOrDefault("message",""); String url=form.getOrDefault("url",""); if(message.length()>4000||url.length()>2048){send(x,413,"application/json; charset=utf-8","{\"error\":\"Message limit is 4,000 characters and URL limit is 2,048 characters\"}");return;} if(message.isBlank()&&url.isBlank()){send(x,400,"application/json; charset=utf-8","{\"error\":\"Provide a message or link to analyze\"}");return;} Result r=analyze(message,url); send(x,200,"application/json; charset=utf-8",toJson(r)); }catch(Exception e){send(x,400,"application/json; charset=utf-8","{\"error\":\"Could not analyze this input\"}");}});
    server.createContext("/",ScamSathiServer::staticFile);
    server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(8)); server.start();
    System.out.println("ScamSathi running at http://127.0.0.1:"+port);
  }
  static void staticFile(HttpExchange x)throws IOException{
    String path=URLDecoder.decode(x.getRequestURI().getPath(),StandardCharsets.UTF_8); if(path.equals("/"))path="/index.html";
    Path f=WEB.resolve(path.substring(1)).normalize(); if(!f.startsWith(WEB)||!Files.isRegularFile(f)){send(x,404,"text/plain; charset=utf-8","Not found");return;}
    String n=f.getFileName().toString(); String type=n.endsWith(".html")?"text/html; charset=utf-8":n.endsWith(".css")?"text/css; charset=utf-8":n.endsWith(".js")?"text/javascript; charset=utf-8":"application/octet-stream";
    send(x,200,type,Files.readString(f,StandardCharsets.UTF_8));
  }
  static void send(HttpExchange x,int code,String type,String body)throws IOException{byte[] b=body.getBytes(StandardCharsets.UTF_8);x.getResponseHeaders().set("Content-Type",type);x.getResponseHeaders().set("X-Content-Type-Options","nosniff");x.getResponseHeaders().set("Cache-Control","no-store");x.sendResponseHeaders(code,b.length);try(OutputStream o=x.getResponseBody()){o.write(b);}}
  static Map<String,String> parseForm(String body){Map<String,String> m=new HashMap<>();for(String pair:body.split("&")){int i=pair.indexOf('=');if(i>=0)m.put(URLDecoder.decode(pair.substring(0,i),StandardCharsets.UTF_8),URLDecoder.decode(pair.substring(i+1),StandardCharsets.UTF_8));}return m;}

  static Result analyze(String input,String url){
    Result r=new Result(); String s=(input==null?"":input).toLowerCase(Locale.ROOT); String u=(url==null?"":url).trim();
    if(matches(s,"\\b(otp|one.time.password|verification code|cvv|card pin|upi pin|atm pin|password|passcode)\\b|ओटीपी|otp बताएं|pin बताएं|पासवर्ड")) add(r,"secret","Requests a secret code or credential","A bank or payment app should not ask you to reveal an OTP, PIN, CVV, or password to another person.",38);
    if(matches(s,"(receive|get|claim|unlock|release).{0,35}(money|refund|reward|cashback|prize|payment)|pay.{0,30}(to receive|to claim|for refund)|पैसे.{0,25}(पाने|प्राप्त)|रिफंड.{0,20}(लेने|पाने)")) add(r,"receive_fee","Payment required to receive money","The message links receiving money or a refund to an advance payment. UPI PIN entry authorizes a payment; it is not needed to receive one.",32);
    if(matches(s,"\\b(anydesk|teamviewer|quick.?support|remote access|screen share|install this app|download.*apk)\\b|स्क्रीन शेयर|ऐप इंस्टॉल")) add(r,"remote_access","Remote access or app installation","A caller asking for screen sharing or remote-control software can view or control your device.",36);
    if(matches(s,"(account|card|kyc|sim|wallet).{0,30}(block|suspend|expire|close|deactivat)|police.{0,25}(arrest|case)|digital arrest|immediately|within \\d+ hours|last warning|तुरंत|खाता बंद|केवाईसी|पुलिस.{0,15}(गिरफ्तार|केस)|आज ही")) add(r,"pressure","Urgency, threat, or authority pressure","The sender is pressuring you to act quickly or using a threat. Pause and contact the organization through a number you find independently.",18);
    if(matches(s,"\\b(urgent|verify now|click here|claim now|limited time|winner|lottery|prize money|kyc update|refund pending)\\b|अभी क्लिक|इनाम|लॉटरी")) add(r,"bait","Common bait or verification wording","This phrasing is often used to make people click before checking who sent the message.",12);
    if(matches(s,"\\b(upi collect|collect request|approve.*upi|enter.*upi pin|scan.*qr.*receive|qr code.*receive)\\b|collect request|पैसे पाने के लिए.*qr|upi pin डाल")) add(r,"payment_direction","Possible payment-direction trick","Check the UPI screen carefully: approving a collect request or entering a PIN can send money out of your account.",30);
    if(!u.isBlank()) inspectUrl(r,u);
    if(r.signals.size()>=2 && r.score>0) r.score=Math.min(100,r.score+10);
    if(r.score>=65){r.level="high";r.title="High risk signals";r.summary="Several strong warning signs are present. Do not reply, click, install, share a code, or approve a payment.";}
    else if(r.score>=30){r.level="caution";r.title="Pause and verify";r.summary="This has warning signs. Verify using the official app or a phone number you find yourself.";}
    else {r.level="low";r.title="No strong warning pattern found";r.summary="This checker did not find strong known patterns. That does not prove the message or link is safe.";}
    r.score=Math.min(100,r.score);
    r.actions.add("Do not share OTPs, PINs, CVV, passwords, or screen access.");
    if(r.signals.stream().anyMatch(q->q.id.equals("receive_fee")||q.id.equals("payment_direction")))r.actions.add("Never enter a UPI PIN to receive money. Read the payment screen before approving.");
    if(!u.isBlank())r.actions.add("Do not open the link from the message. Check the organization through its official app or a trusted bookmark.");
    r.actions.add("If money was lost, contact your bank immediately and report it at cybercrime.gov.in or call 1930.");
    if(r.signals.isEmpty())r.actions.add("When unsure, ask someone you trust to review it before acting.");
    return r;
  }
  static boolean matches(String s,String regex){return Pattern.compile(regex,Pattern.CASE_INSENSITIVE|Pattern.UNICODE_CASE).matcher(s).find();}
  static void add(Result r,String id,String label,String detail,int points){if(r.signals.stream().noneMatch(s->s.id.equals(id))){r.signals.add(new Signal(id,label,detail,points));r.score+=points;}}
  static void inspectUrl(Result r,String raw){
    String val=raw.trim(); if(!val.matches("(?i)^https?://.*"))val="https://"+val;
    try{
      URI uri=URI.create(val); String host=uri.getHost(); if(host==null){add(r,"malformed_url","Link format is unusual","The address could not be read as a normal web domain. Do not open it from the message.",24);return;}
      host=IDN.toASCII(host).toLowerCase(Locale.ROOT); String clean=host.startsWith("www.")?host.substring(4):host;
      if(uri.getScheme().equalsIgnoreCase("http"))add(r,"unencrypted","Link does not use HTTPS","The link does not use an encrypted HTTPS connection. Do not enter personal or payment details there.",10);
      if(clean.matches("\\d{1,3}(\\.\\d{1,3}){3}"))add(r,"ip_host","Link uses a numeric address","A numeric address instead of a recognizable organization domain is unusual in a payment or account message.",22);
      if(matches(clean,"(^|\\.)(bit\\.ly|tinyurl\\.com|t\\.co|rb\\.gy|cutt\\.ly|is\\.gd)$"))add(r,"shortener","Shortened link hides its destination","The final destination is hidden. Check it independently instead of opening the shortened address.",16);
      String[] brands={"sbi","hdfcbank","icicibank","axisbank","paytm","phonepe","googlepay","npci"};
      for(String b:brands){String base=b.equals("sbi")?"sbi.co.in":b.equals("hdfcbank")?"hdfcbank.com":b.equals("icicibank")?"icicibank.com":b.equals("axisbank")?"axisbank.com":b.equals("paytm")?"paytm.com":b.equals("phonepe")?"phonepe.com":b.equals("googlepay")?"google.com":"npci.org.in";
        if(clean.contains(b)&&!clean.equals(base)&&!clean.endsWith("."+base)){add(r,"brand_mismatch","Brand name appears outside its usual domain","The address contains a familiar brand name, but the actual domain is different. A brand name in a URL does not prove it is official.",28);break;}
        for(String label:clean.split("\\.")){if(label.length()>=b.length()-1&&label.length()<=b.length()+2&&!label.equals(b)&&distance(label,b)==1){add(r,"lookalike","Domain resembles a known brand","The domain contains a small spelling change that could be used to imitate a familiar service.",28);break;}}
      }
      if(matches(clean,"(^|\\.)(xyz|top|click|shop|buzz|work)$"))add(r,"uncommon_tld","Uncommon domain ending","This domain ending is less common for banks and payment services. Treat it cautiously, especially with a request for money or credentials.",10);
    }catch(Exception e){add(r,"malformed_url","Link could not be parsed","The address looks unusual. Do not open it from the message.",24);}
  }
  static int distance(String a,String b){int[][]d=new int[a.length()+1][b.length()+1];for(int i=0;i<=a.length();i++)d[i][0]=i;for(int j=0;j<=b.length();j++)d[0][j]=j;for(int i=1;i<=a.length();i++)for(int j=1;j<=b.length();j++)d[i][j]=Math.min(Math.min(d[i-1][j]+1,d[i][j-1]+1),d[i-1][j-1]+(a.charAt(i-1)==b.charAt(j-1)?0:1));return d[a.length()][b.length()];}
  static String esc(String s){return s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");}
  static String toJson(Result r){StringBuilder b=new StringBuilder("{\"score\":").append(r.score).append(",\"level\":\"").append(r.level).append("\",\"title\":\"").append(esc(r.title)).append("\",\"summary\":\"").append(esc(r.summary)).append("\",\"signals\":[");for(int i=0;i<r.signals.size();i++){Signal s=r.signals.get(i);if(i>0)b.append(',');b.append("{\"id\":\"").append(s.id).append("\",\"label\":\"").append(esc(s.label)).append("\",\"detail\":\"").append(esc(s.detail)).append("\",\"points\":").append(s.points).append('}');}b.append("],\"actions\":[");for(int i=0;i<r.actions.size();i++){if(i>0)b.append(',');b.append('\"').append(esc(r.actions.get(i))).append('\"');}return b.append("],\"disclaimer\":\"Rule-based warning score, not a probability or a guarantee. Input is analyzed locally by this Java service and not retained.\"}").toString();}
}
