import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.IDN;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/** Local Java HTTP service with explainable rules. It never fetches submitted URLs. */
public final class ScamSathiServer {
  private static final Path WEB = Paths.get("web").toAbsolutePath().normalize();
  private static final int MAX_MESSAGE = 4_000;
  private static final int MAX_URL = 2_048;
  private static final int MAX_QR = 4_096;

  private static final class Signal {
    final String id;
    final String label;
    final String detail;
    final int points;

    Signal(String id, String label, String detail, int points) {
      this.id = id;
      this.label = label;
      this.detail = detail;
      this.points = points;
    }
  }

  private static final class Result {
    int score;
    String level;
    String title;
    String summary;
    String disclaimer;
    boolean hasUrl;
    final List<Signal> signals = new ArrayList<>();
    final List<String> actions = new ArrayList<>();
  }

  public static void main(String[] args) throws Exception {
    int port = args.length > 0 ? Integer.parseInt(args[0]) : 18878;
    HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
    server.createContext("/api/health", ScamSathiServer::health);
    server.createContext("/api/analyze", ScamSathiServer::analyzeRequest);
    server.createContext("/api/qr/analyze", ScamSathiServer::qrRequest);
    server.createContext("/", ScamSathiServer::staticFile);
    server.setExecutor(Executors.newFixedThreadPool(8));
    server.start();
    System.out.println("ScamSathi running at http://127.0.0.1:" + port);
  }

  private static void health(HttpExchange exchange) throws IOException {
    if (!"GET".equals(exchange.getRequestMethod())) {
      send(exchange, 405, "application/json; charset=utf-8", "{\"error\":\"GET required\"}");
      return;
    }
    send(exchange, 200, "application/json; charset=utf-8",
        "{\"status\":\"ok\",\"engine\":\"ScamSathi explainable rules v2\",\"privacy\":\"local-only\"}");
  }

  private static void analyzeRequest(HttpExchange exchange) throws IOException {
    if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
      send(exchange, 405, "application/json; charset=utf-8", "{\"error\":\"POST required\"}");
      return;
    }
    try {
      byte[] raw = exchange.getRequestBody().readNBytes(65_537);
      if (raw.length > 65_536) {
        send(exchange, 413, "application/json; charset=utf-8", "{\"error\":\"Request body too large\"}");
        return;
      }
      Map<String, String> form = parseForm(new String(raw, StandardCharsets.UTF_8));
      String message = form.getOrDefault("message", "");
      String url = form.getOrDefault("url", "");
      if (message.length() > MAX_MESSAGE || url.length() > MAX_URL) {
        send(exchange, 413, "application/json; charset=utf-8",
            "{\"error\":\"Message limit is 4,000 characters and URL limit is 2,048 characters\"}");
        return;
      }
      if (message.isBlank() && url.isBlank()) {
        send(exchange, 400, "application/json; charset=utf-8", "{\"error\":\"Provide a message or link to analyze\"}");
        return;
      }
      send(exchange, 200, "application/json; charset=utf-8", toJson(analyze(message, url)));
    } catch (Exception ignored) {
      send(exchange, 400, "application/json; charset=utf-8", "{\"error\":\"Could not analyze this input\"}");
    }
  }

  private static void qrRequest(HttpExchange exchange) throws IOException {
    if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
      send(exchange, 405, "application/json; charset=utf-8", "{\"error\":\"POST required\"}");
      return;
    }
    try {
      byte[] raw = exchange.getRequestBody().readNBytes(8_193);
      if (raw.length > 8_192) {
        send(exchange, 413, "application/json; charset=utf-8", "{\"error\":\"QR request is too large\"}");
        return;
      }
      String payload = parseForm(new String(raw, StandardCharsets.UTF_8)).getOrDefault("payload", "").trim();
      if (payload.isEmpty()) {
        send(exchange, 400, "application/json; charset=utf-8", "{\"error\":\"Paste decoded QR content\"}");
        return;
      }
      if (payload.length() > MAX_QR) {
        send(exchange, 413, "application/json; charset=utf-8", "{\"error\":\"QR content limit is 4,096 characters\"}");
        return;
      }
      send(exchange, 200, "application/json; charset=utf-8", toJson(analyzeQr(payload)));
    } catch (Exception ignored) {
      send(exchange, 400, "application/json; charset=utf-8", "{\"error\":\"Could not analyze QR content\"}");
    }
  }

  private static void staticFile(HttpExchange exchange) throws IOException {
    String requestPath = URLDecoder.decode(exchange.getRequestURI().getPath(), StandardCharsets.UTF_8);
    if (requestPath.equals("/")) requestPath = "/index.html";
    Path file = WEB.resolve(requestPath.substring(1)).normalize();
    if (!file.startsWith(WEB) || !Files.isRegularFile(file)) {
      send(exchange, 404, "text/plain; charset=utf-8", "Not found");
      return;
    }
    send(exchange, 200, contentType(file.getFileName().toString()), Files.readString(file, StandardCharsets.UTF_8));
  }

  private static String contentType(String fileName) {
    String name = fileName.toLowerCase(Locale.ROOT);
    if (name.endsWith(".html")) return "text/html; charset=utf-8";
    if (name.endsWith(".css")) return "text/css; charset=utf-8";
    if (name.endsWith(".js")) return "text/javascript; charset=utf-8";
    if (name.endsWith(".json")) return "application/json; charset=utf-8";
    if (name.endsWith(".svg")) return "image/svg+xml";
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".webp")) return "image/webp";
    if (name.endsWith(".ico")) return "image/x-icon";
    return "application/octet-stream";
  }

  private static void send(HttpExchange exchange, int status, String type, String body) throws IOException {
    byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
    Headers headers = exchange.getResponseHeaders();
    headers.set("Content-Type", type);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
    headers.set("Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; " +
        "img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self'; style-src 'self'; " +
        "connect-src 'self'; worker-src 'self' blob:; font-src 'self' data:");
    exchange.sendResponseHeaders(status, bytes.length);
    try (OutputStream output = exchange.getResponseBody()) {
      output.write(bytes);
    }
  }

  private static Map<String, String> parseForm(String body) {
    Map<String, String> fields = new HashMap<>();
    for (String pair : body.split("&")) {
      int equalsAt = pair.indexOf('=');
      if (equalsAt < 0) continue;
      String key = URLDecoder.decode(pair.substring(0, equalsAt), StandardCharsets.UTF_8);
      String value = URLDecoder.decode(pair.substring(equalsAt + 1), StandardCharsets.UTF_8);
      fields.put(key, value);
    }
    return fields;
  }

  static Result analyze(String input, String rawUrl) {
    Result result = new Result();
    String text = (input == null ? "" : input).toLowerCase(Locale.ROOT);
    String url = (rawUrl == null ? "" : rawUrl.trim());
    result.hasUrl = !url.isBlank();

    boolean educational = matches(text,
        "(?:never|don't|do not|avoid|beware)\\s+(?:share|tell|send|give).{0,24}(?:otp|pin|password|cvv)|" +
        "(?:otp|pin|password|cvv).{0,24}(?:never|don't|do not)\\s+(?:share|tell|send|give)");
    if (!educational && matches(text,
        "\\b(otp|one[ -]?time password|verification code|cvv|card pin|upi pin|atm pin|password|passcode)\\b|ओटीपी|पासवर्ड|पिन बताएं")) {
      add(result, "secret", "Request for a secret code or credential",
          "A request to disclose an OTP, PIN, CVV or password can enable account takeover. Do not tell these secrets to another person.", 35);
    }
    if (matches(text,
        "(receive|get|claim|unlock|release).{0,35}(money|refund|reward|cashback|prize|payment)|" +
        "pay.{0,30}(to receive|to claim|for refund)|पैसे.{0,25}(पाने|प्राप्त)|रिफंड.{0,20}(लेने|पाने)|शुल्क.{0,15}(जमा|भुगतान)|जमा.{0,10}शुल्क")) {
      add(result, "receive_fee", "Payment requested to receive money",
          "A demand to pay first to receive a refund or reward is a common fraud pattern. A UPI PIN authorizes an outgoing payment.", 32);
    }
    if (matches(text, "\\b(anydesk|teamviewer|quick.?support|remote access|screen share|install this app|download.*apk)\\b|स्क्रीन शेयर|ऐप इंस्टॉल")) {
      add(result, "remote_access", "Remote access or unknown app request",
          "Remote-control tools, screen sharing or unknown APKs can expose messages, credentials and banking activity.", 34);
    }
    if (matches(text,
        "(account|card|kyc|sim|wallet).{0,30}(block|suspend|expire|close|deactivat)|" +
        "police.{0,25}(arrest|case)|digital arrest|immediately|within \\d+ hours|last warning|तुरंत|खाता बंद|खाता.{0,20}(बंद|रोक|निलंबित|अवरुद्ध)|केवाईसी|पुलिस.{0,15}(गिरफ्तार|केस)|आज ही")) {
      add(result, "pressure", "Urgency, threat or authority pressure",
          "Scammers create fear to stop people verifying. Contact the organization through a number you find independently.", 16);
    }
    if (matches(text, "\\b(urgent|verify now|click here|claim now|limited time|winner|lottery|prize money|kyc update|refund pending)\\b|अभी क्लिक|इनाम|लॉटरी")) {
      add(result, "bait", "High-pressure call to action",
          "The wording encourages action before checking the sender or destination.", 10);
    }
    if (matches(text,
        "\\b(upi collect|collect request|approve.{0,20}upi|enter.{0,20}upi pin|scan.{0,20}qr.{0,20}receive|qr code.{0,20}receive)\\b|" +
        "collect request|पैसे पाने के लिए.{0,10}qr|upi pin डाल")) {
      add(result, "payment_direction", "Possible payment-direction trick",
          "Approving a collect request or entering a UPI PIN may send money out. Read the payment screen before approving.", 30);
    }
    if (!url.isBlank()) inspectUrl(result, url);
    finish(result);
    addActions(result);
    return result;
  }

  static Result analyzeQr(String payload) {
    Result result = new Result();
    String value = payload.trim();
    if (value.regionMatches(true, 0, "upi://pay", 0, 9) && (value.length() == 9 || value.charAt(9) == '?' || value.charAt(9) == '/')) {
      add(result, "upi_qr", "UPI payment QR detected",
          "This QR appears to start a UPI payment. Verify the recipient and amount in your trusted UPI app before entering a PIN.", 12);
      try {
        URI uri = URI.create(value);
        Map<String, String> query = parseQuery(uri.getRawQuery());
        String payee = query.getOrDefault("pa", "");
        String name = query.getOrDefault("pn", "");
        String amount = query.getOrDefault("am", "");
        if (!payee.isBlank()) result.actions.add("UPI payee address (unverified QR data): " + payee);
        if (!name.isBlank()) result.actions.add("Payee display name (unverified QR data): " + name);
        if (!amount.isBlank()) result.actions.add("Encoded amount: " + amount + " (confirm it in your UPI app)");
        if (payee.isBlank()) {
          add(result, "upi_missing_payee", "UPI QR has no visible payee address",
              "The decoded payload does not contain a payee address. Do not proceed unless your payment app clearly identifies the recipient.", 16);
        }
      } catch (Exception exception) {
        add(result, "qr_parse", "UPI QR format is unusual",
            "The payment fields could not be interpreted reliably. Do not proceed until your UPI app shows the details.", 12);
      }
    } else if (value.matches("(?is)^https?://.*") || value.matches("(?is)^[a-z0-9.-]+\\.[a-z]{2,}(/.*)?$")) {
      add(result, "qr_url", "QR contains a web destination",
          "A QR can hide a phishing link. Inspect the destination and verify the domain independently; ScamSathi will not open it.", 8);
      result.hasUrl = true;
      inspectUrl(result, value);
    } else if (value.matches("(?is)^[a-z][a-z0-9+.-]*:.*")) {
      add(result, "unknown_scheme", "QR contains an unsupported destination type",
          "This QR payload uses a destination type ScamSathi does not inspect. Do not open or approve it unless you understand it.", 28);
    } else {
      add(result, "qr_unknown", "QR contains text or an unsupported payload",
          "The decoded data is not a recognized UPI payment or web link. Do not trust it just because it is a QR code.", 5);
    }
    finish(result);
    result.actions.add(0, "Do not pay or open anything from the QR until you verify it independently.");
    addActions(result);
    return result;
  }

  private static Map<String, String> parseQuery(String query) {
    Map<String, String> result = new HashMap<>();
    if (query == null || query.isBlank()) return result;
    for (String pair : query.split("&")) {
      int equalsAt = pair.indexOf('=');
      if (equalsAt < 1) continue;
      String key = URLDecoder.decode(pair.substring(0, equalsAt), StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
      String value = URLDecoder.decode(pair.substring(equalsAt + 1), StandardCharsets.UTF_8);
      result.put(key, value);
    }
    return result;
  }

  private static void inspectUrl(Result result, String raw) {
    String value = raw.trim();
    if (value.matches("(?i)^[a-z][a-z0-9+.-]*:.*") && !value.matches("(?i)^https?://.*")) {
      add(result, "unknown_scheme", "Link uses an unsupported destination type",
          "Only ordinary web addresses are inspected. Do not open an unfamiliar link scheme.", 28);
      return;
    }
    if (!value.matches("(?i)^https?://.*")) value = "https://" + value;
    try {
      URI uri = URI.create(value);
      String host = uri.getHost();
      if (host == null || host.isBlank() || value.matches(".*\\s+.*")) {
        add(result, "malformed_url", "Link format is unusual",
            "The address could not be read as a normal web domain. Do not open it from the message.", 24);
        return;
      }
      String asciiHost = IDN.toASCII(host).toLowerCase(Locale.ROOT);
      String clean = asciiHost.startsWith("www.") ? asciiHost.substring(4) : asciiHost;
      String[] labels = clean.split("\\.");
      String root = labels.length >= 2 ? labels[labels.length - 2] + "." + labels[labels.length - 1] : clean;
      if (uri.getScheme().equalsIgnoreCase("http")) {
        add(result, "unencrypted", "Link does not use HTTPS",
            "The link does not use an encrypted HTTPS connection. Do not enter personal or payment details there.", 10);
      }
      if (uri.getRawUserInfo() != null || value.matches("(?i)^https?://[^/]*@.*")) {
        add(result, "userinfo", "Link contains misleading sign-in text",
            "Text before an @ sign can make a URL look as if it belongs to a trusted site. The actual host is after the @ sign.", 24);
      }
      if (clean.matches("\\d{1,3}(\\.\\d{1,3}){3}") || clean.startsWith("[")) {
        add(result, "ip_host", "Link uses a numeric address",
            "A numeric address instead of a recognizable organization domain is unusual in an account or payment message.", 22);
      }
      if (containsPunycode(clean)) {
        add(result, "idn", "Internationalized domain needs extra care",
            "This domain uses encoded characters. Similar-looking characters can make a destination hard to recognize.", 12);
      }
      if (isShortener(clean)) {
        add(result, "shortener", "Shortened link hides its destination",
            "The final destination is hidden. Check it independently instead of opening the shortened address.", 16);
      }
      if (labels.length > 0 && List.of("xyz", "top", "click", "buzz", "work", "zip", "mov").contains(labels[labels.length - 1])) {
        add(result, "uncommon_tld", "Uncommon domain ending",
            "This domain ending is less common for banks and payment services. Treat it cautiously, especially with a request for money or credentials.", 10);
      }
      String[][] brands = {
          {"sbi", "sbi.co.in"}, {"hdfcbank", "hdfcbank.com"}, {"icicibank", "icicibank.com"},
          {"axisbank", "axisbank.com"}, {"paytm", "paytm.com"}, {"phonepe", "phonepe.com"},
          {"googlepay", "google.com"}, {"npci", "npci.org.in"}, {"amazon", "amazon.in"}
      };
      for (String[] brand : brands) {
        String name = brand[0];
        String official = brand[1];
        if (clean.contains(name) && !clean.equals(official) && !clean.endsWith("." + official)) {
          add(result, "brand_mismatch", "Brand name appears outside its usual domain",
              "The address contains a familiar brand name, but the actual domain differs. A brand name in a URL does not prove it is official.", 28);
          break;
        }
        boolean similar = false;
        for (String label : labels) {
          if (!label.equals(name) && label.length() >= name.length() - 1 && label.length() <= name.length() + 1 && distance(label, name) == 1) {
            similar = true;
            break;
          }
        }
        if (similar && !root.equals(official)) {
          add(result, "lookalike", "Domain resembles a familiar brand",
              "A domain label is similar to a known brand but is not the same. Read the complete domain carefully.", 25);
        }
      }
    } catch (Exception exception) {
      add(result, "malformed_url", "Link format is unusual",
          "The address could not be read as a normal web domain. Do not open it from the message.", 24);
    }
  }

  private static boolean containsPunycode(String host) {
    for (String label : host.split("\\.")) if (label.startsWith("xn--")) return true;
    return false;
  }

  private static boolean isShortener(String host) {
    return Pattern.compile("(^|\\.)(bit\\.ly|tinyurl\\.com|t\\.co|rb\\.gy|cutt\\.ly|is\\.gd|ow\\.ly|buff\\.ly)$")
        .matcher(host).find();
  }

  private static int distance(String first, String second) {
    int[][] distance = new int[first.length() + 1][second.length() + 1];
    for (int i = 0; i <= first.length(); i++) distance[i][0] = i;
    for (int j = 0; j <= second.length(); j++) distance[0][j] = j;
    for (int i = 1; i <= first.length(); i++) {
      for (int j = 1; j <= second.length(); j++) {
        int cost = first.charAt(i - 1) == second.charAt(j - 1) ? 0 : 1;
        distance[i][j] = Math.min(Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1), distance[i - 1][j - 1] + cost);
      }
    }
    return distance[first.length()][second.length()];
  }

  private static void add(Result result, String id, String label, String detail, int points) {
    for (Signal signal : result.signals) if (signal.id.equals(id)) return;
    result.signals.add(new Signal(id, label, detail, points));
    result.score += points;
  }

  private static void finish(Result result) {
    if (result.signals.size() > 1) result.score += 8;
    result.score = Math.min(100, result.score);
    if (result.score >= 75) {
      result.level = "critical";
      result.title = "Several serious warning signs";
      result.summary = "Stop and verify through an official app or a number you find independently before acting.";
    } else if (result.score >= 55) {
      result.level = "high";
      result.title = "Multiple high-risk indicators";
      result.summary = "Several warning signs matched. Do not reply, click, share a code or approve a payment before verifying.";
    } else if (result.score >= 30) {
      result.level = "caution";
      result.title = "Pause and verify";
      result.summary = "One or more warning signs matched. Verify through an official app or contact channel before acting.";
    } else {
      result.level = "low";
      result.title = "No strong known pattern found";
      result.summary = "This checker did not find strong known patterns. That does not prove the message or link is safe.";
    }
    result.disclaimer = "Rule-based warning score, not a probability or guarantee. A low score does not prove safety.";
  }

  private static void addActions(Result result) {
    result.actions.add("Do not share an OTP, PIN, CVV, password or screen access.");
    for (Signal signal : result.signals) {
      if (signal.id.equals("receive_fee") || signal.id.equals("payment_direction") || signal.id.equals("upi_qr")) {
        result.actions.add("A UPI PIN authorizes money going out. Read the recipient and amount before approving.");
        break;
      }
    }
    if (result.hasUrl) result.actions.add("Do not open the link from the message. Check the destination independently.");
    result.actions.add("If money was lost, contact your bank and call India’s cyber-fraud helpline 1930 promptly.");
    if (result.signals.isEmpty()) result.actions.add(0, "When unsure, ask someone you trust to review it before acting.");
  }

  private static boolean matches(String text, String regex) {
    return Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE).matcher(text).find();
  }

  private static String json(String value) {
    StringBuilder output = new StringBuilder("\"");
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      switch (c) {
        case '"': output.append("\\\""); break;
        case '\\': output.append("\\\\"); break;
        case '\b': output.append("\\b"); break;
        case '\f': output.append("\\f"); break;
        case '\n': output.append("\\n"); break;
        case '\r': output.append("\\r"); break;
        case '\t': output.append("\\t"); break;
        default:
          if (c < 0x20) output.append(String.format("\\u%04x", (int) c));
          else output.append(c);
      }
    }
    return output.append('"').toString();
  }

  private static String toJson(Result result) {
    StringBuilder output = new StringBuilder();
    output.append("{\"score\":").append(result.score)
        .append(",\"level\":").append(json(result.level))
        .append(",\"title\":").append(json(result.title))
        .append(",\"summary\":").append(json(result.summary))
        .append(",\"signals\":[");
    for (int i = 0; i < result.signals.size(); i++) {
      Signal signal = result.signals.get(i);
      if (i > 0) output.append(',');
      output.append("{\"id\":").append(json(signal.id))
          .append(",\"label\":").append(json(signal.label))
          .append(",\"detail\":").append(json(signal.detail))
          .append(",\"points\":").append(signal.points).append('}');
    }
    output.append("],\"actions\":[");
    for (int i = 0; i < result.actions.size(); i++) {
      if (i > 0) output.append(',');
      output.append(json(result.actions.get(i)));
    }
    return output.append("],\"disclaimer\":").append(json(result.disclaimer)).append('}').toString();
  }
}
