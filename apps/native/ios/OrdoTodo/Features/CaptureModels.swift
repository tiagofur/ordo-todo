import Foundation

/// Parser de captura (ODD 052): port fiel de `CaptureParser.kt` (ES/EN/PT).
/// Fechas relativas, numéricas, ISO, `5 dic`, días de semana, `en 2 h`,
/// horas `15:00`/`15h`/`3pm`, `p1-p4`/`!`/`!!`, `#proyecto`.
/// Trabaja en UTF-16 (como `NSRegularExpression`) y devuelve spans en
/// offsets de caracteres para el subrayado en vivo.

struct ParsedCapture: Equatable {
    var title: String
    var scheduledDate: String? // yyyy-MM-dd
    var scheduledTime: String? // HH:mm
    var priority: String? // URGENT|HIGH|MEDIUM|LOW
    var projectHint: String?
}

enum CaptureEntity {
    case date, time, priority, project
}

struct CaptureSpan: Equatable {
    var start: Int
    var end: Int
    var entity: CaptureEntity
}

private let isoFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    f.locale = Locale(identifier: "en_US_POSIX")
    return f
}()

private func rx(_ pattern: String) -> NSRegularExpression {
    try! NSRegularExpression(pattern: pattern,
                             options: [.caseInsensitive])
}

private let relative: [(NSRegularExpression, Int)] = [
    (rx(#"(?:pasado mañana|pasado manana)"#), 2),
    (rx(#"day\s+after\s+tomorrow"#), 2),
    (rx(#"depois\s+de\s+amanh[aã]"#), 2),
    (rx(#"(?:mañana|manana)"#), 1),
    (rx(#"tomorrow"#), 1),
    (rx(#"amanh[aã]"#), 1),
    (rx(#"hoy"#), 0),
    (rx(#"today"#), 0),
    (rx(#"hoje"#), 0),
]

private let months: [String: Int] = [
    "ene": 1, "enero": 1, "jan": 1, "january": 1, "janeiro": 1,
    "feb": 2, "febrero": 2, "february": 2, "fevereiro": 2, "fev": 2,
    "mar": 3, "marzo": 3, "march": 3, "março": 3,
    "abr": 4, "abril": 4, "april": 4,
    "may": 5, "mayo": 5, "maio": 5,
    "jun": 6, "junio": 6, "june": 6, "junho": 6,
    "jul": 7, "julio": 7, "july": 7, "julho": 7,
    "ago": 8, "agosto": 8, "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "set": 9, "september": 9, "septiembre": 9,
    "setembro": 9, "oct": 10, "octubre": 10, "october": 10,
    "out": 10, "outubro": 10, "nov": 11, "noviembre": 11, "november": 11,
    "novembro": 11, "dic": 12, "diciembre": 12, "dec": 12,
    "december": 12, "dez": 12, "dezembro": 12,
]

private var monthAlt: String {
    months.keys.sorted { $0.count > $1.count }.joined(separator: "|")
}

private let numericDate = rx(#"\b(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])(?:/(20\d{2}|\d{2}))?\b"#)
private let isoDate = rx(#"\b(20\d{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])\b"#)
private let timeColon = rx(#"\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b"#)
private let timeH = rx(#"\b([01]?[0-9]|2[0-3])h([0-5][0-9])?\b"#)
private let timeAmpm = rx(#"\b(0?[1-9]|1[0-2])(?::([0-5][0-9]))?\s?([ap])\s?\.?m\.?\b"#)
private let timePrep = rx(#"(?:\ba\s+las|\ba\s+la|\bal|\bat|às|\bas)\s+$"#)
private let priorityP = rx(#"(?<![A-Za-z0-9])p([1-4])(?![A-Za-z0-9])"#)
private let bangEnd = rx(#"(\S+?)(!{1,2})\s*$"#)
private let bangAlone = rx(#"(?:^|\s)(!{1,2})(?:$|\s)"#)
private let hourOffset = rx(#"(?<![\p{L}\p{N}_])(?:en|in|em)\s+(\d{1,2}|una|un|one|uma|um)\s+(?:horas?|hours?)(?![\p{L}\p{N}_])"#)
private let projectTag = rx(#"(?:^|\s)#([A-Za-z0-9_-]+)"#)

private let priorityOfP = ["1": "URGENT", "2": "HIGH",
                           "3": "MEDIUM", "4": "LOW"]

private let weekdays: [String: Int] = [
    "lunes": 2, "martes": 3, "miercoles": 4, "miércoles": 4, "jueves": 5,
    "viernes": 6, "sabado": 7, "sábado": 7, "domingo": 1,
    "monday": 2, "tuesday": 3, "wednesday": 4, "thursday": 5,
    "friday": 6, "saturday": 7, "sunday": 1,
    "segunda": 2, "segunda-feira": 2, "terca": 3, "terça": 3,
    "terca-feira": 3, "terça-feira": 3, "quarta": 4, "quarta-feira": 4,
    "quinta": 5, "quinta-feira": 5, "sexta": 6, "sexta-feira": 6,
]

private struct Cutter {
    var units: [UInt16]
    var origin: [Int]

    init(_ s: String) {
        units = Array(s.utf16)
        origin = Array(0..<units.count)
    }

    var text: String { String(decoding: units, as: UTF16.self) }

    /// Corta `[start, end)` (UTF-16) dejando un espacio; devuelve el rango
    /// en coordenadas originales. `stripPrep` extiende a la preposición
    /// de hora previa (`a las 15:00` sale entera del título).
    mutating func cut(start: Int, end: Int, stripPrep: Bool = false) -> (Int, Int) {
        var from = start
        if stripPrep {
            let prefix = String(decoding: units[0..<start], as: UTF16.self)
            let ns = prefix as NSString
            let full = NSRange(location: 0, length: ns.length)
            if let m = timePrep.firstMatch(in: prefix, range: full) {
                from = m.range.location
            }
        }
        let rawStart = origin[from]
        let rawEnd = origin[end - 1] + 1
        units.replaceSubrange(from..<end, with: [32])
        origin.replaceSubrange(from..<end, with: [rawStart])
        return (rawStart, rawEnd)
    }
}

private extension NSRegularExpression {
    func all(_ s: String) -> [NSTextCheckingResult] {
        let ns = s as NSString
        return matches(in: s, range: NSRange(location: 0, length: ns.length))
    }

    func group(_ m: NSTextCheckingResult, _ s: String, _ i: Int) -> String? {
        let r = m.range(at: i)
        guard r.location != NSNotFound else { return nil }
        return (s as NSString).substring(with: r)
    }
}

private func toOffsets(_ s: String, _ nsRange: NSRange) -> (Int, Int)? {
    let u = s.utf16
    guard let a = u.index(u.startIndex, offsetBy: nsRange.location,
                          limitedBy: u.endIndex),
          let b = u.index(a, offsetBy: nsRange.length,
                          limitedBy: u.endIndex),
          let sa = a.samePosition(in: s), let sb = b.samePosition(in: s)
    else { return nil }
    return (s.distance(from: s.startIndex, to: sa),
            s.distance(from: s.startIndex, to: sb))
}

/// `yyyy-MM-dd` de un día, o nulo si no existe (p. ej. 30 feb).
private func ymd(year: Int, month: Int, day: Int) -> String? {
    guard (1...12).contains(month), (1...31).contains(day) else { return nil }
    var comps = DateComponents()
    comps.year = year; comps.month = month; comps.day = day
    comps.calendar = Calendar(identifier: .gregorian)
    guard let date = comps.date,
          Calendar(identifier: .gregorian).component(.day, from: date) == day,
          Calendar(identifier: .gregorian).component(.month, from: date) == month
    else { return nil }
    return isoFormatter.string(from: date)
}

private func resolveYear(month: Int, day: Int, today: Date,
                         cal: Calendar) -> String? {
    let year = cal.component(.year, from: today)
    if let d = ymd(year: year, month: month, day: day) {
        return d >= isoFormatter.string(from: today)
            ? d : ymd(year: year + 1, month: month, day: day)
    }
    return nil
}

/// Hint (`#tag`) a id: slug exacto gana a nombre-contiene. Sin match = exprés.
func resolveProjectId(hint: String?, projects: [TodayProject]) -> String? {
    let needle = hint?.trimmingCharacters(in: .whitespaces).lowercased()
        ?? ""
    guard !needle.isEmpty else { return nil }
    if let exact = projects.first(where: {
        ($0.slug ?? "").lowercased() == needle
    }) { return exact.id }
    return projects.first(where: {
        $0.name.lowercased().contains(needle)
    })?.id
}

/// Parsea con `today`/`now` explícitos para pruebas deterministas.
func parseCapture(_ raw: String, today: Date = Date()) -> ParsedCapture {
    parseCaptureWithSpans(raw, today: today).parsed
}

func parseCaptureWithSpans(_ raw: String, today: Date = Date())
    -> (parsed: ParsedCapture, spans: [CaptureSpan]) {
    let cal = Calendar(identifier: .gregorian)
    let todayStart = cal.startOfDay(for: today)
    let todayKey = isoFormatter.string(from: todayStart)
    func plusDays(_ n: Int) -> String {
        isoFormatter.string(from: cal.date(byAdding: .day, value: n,
                                           to: todayStart) ?? todayStart)
    }
    var cutter = Cutter(raw)
    var spans: [CaptureSpan] = []

    func toChar(_ r: (Int, Int)) -> (Int, Int) {
        let s = raw
        let u = s.utf16
        let a = u.index(u.startIndex, offsetBy: r.0)
        let b = u.index(a, offsetBy: r.1 - r.0)
        let sa = a.samePosition(in: s) ?? s.startIndex
        let sb = b.samePosition(in: s) ?? s.endIndex
        return (s.distance(from: s.startIndex, to: sa),
                s.distance(from: s.startIndex, to: sb))
    }

    // Proyecto primero: `#p1` nombra proyecto, no es prioridad.
    var project: String?
    let tags = projectTag.all(cutter.text).compactMap { m -> (NSRange, String)? in
        guard let tag = projectTag.group(m, cutter.text, 1) else { return nil }
        let hash = (cutter.text as NSString).range(of: "#",
            options: .backwards,
            range: NSRange(location: m.range.location,
                           length: m.range.length))
        let start = hash.location == NSNotFound
            ? m.range.location : hash.location
        return (NSRange(location: start,
                        length: tag.utf16.count + 1), tag)
    }
    project = tags.map(\.1).last
    for (range, _) in tags.sorted(by: { $0.0.location > $1.0.location }) {
        let r = cutter.cut(start: range.location,
                           end: range.location + range.length)
        let c = toChar(r)
        spans.append(CaptureSpan(start: c.0, end: c.1, entity: .project))
    }

    // Prioridad: gana la última marca; solapes, la más larga.
    var hits: [(Int, Int, String)] = []
    for m in priorityP.all(cutter.text) {
        if let p = priorityP.group(m, cutter.text, 1),
           let prio = priorityOfP[p] {
            hits.append((m.range.location,
                         m.range.location + m.range.length, prio))
        }
    }
    for m in bangAlone.all(cutter.text) {
        let ns = cutter.text as NSString
        let bangRange = m.range(at: 1)
        if bangRange.location != NSNotFound {
            let len = bangRange.length
            hits.append((bangRange.location, bangRange.location + len,
                         len == 2 ? "URGENT" : "HIGH"))
        }
        _ = ns
    }
    if let m = bangEnd.firstMatch(in: cutter.text,
                                  range: NSRange(location: 0,
                                                 length: (cutter.text as NSString).length)) {
        let bangs = bangEnd.group(m, cutter.text, 2) ?? ""
        let len = bangs.count
        let start = m.range.location + m.range.length - len
        hits.append((start, start + len, len == 2 ? "URGENT" : "HIGH"))
    }
    // Gana la última marca; en solape, la más larga (igual que Android).
    let priority = hits.max {
        $0.1 != $1.1 ? $0.1 < $1.1 : ($0.1 - $0.0) < ($1.1 - $1.0)
    }.map { hit -> String in
        let r = cutter.cut(start: hit.0, end: hit.1)
        let c = toChar(r)
        spans.append(CaptureSpan(start: c.0, end: c.1, entity: .priority))
        return hit.2
    }

    // Fecha: la primera marca del texto gana.
    struct DH { var start: Int; var end: Int; var date: String }
    var cands: [DH] = []
    for (re, plus) in relative {
        for m in re.all(cutter.text) {
            cands.append(DH(start: m.range.location,
                            end: m.range.location + m.range.length,
                            date: plusDays(plus)))
        }
    }
    for m in numericDate.all(cutter.text) {
        guard let d = Int(numericDate.group(m, cutter.text, 1) ?? ""),
              let mo = Int(numericDate.group(m, cutter.text, 2) ?? "")
        else { continue }
        let yearRaw = numericDate.group(m, cutter.text, 3)
        let date: String?
        if let yearRaw, !yearRaw.isEmpty {
            let y = yearRaw.count == 2 ? 2000 + (Int(yearRaw) ?? 0)
                                       : (Int(yearRaw) ?? 0)
            date = ymd(year: y, month: mo, day: d)
        } else {
            date = resolveYear(month: mo, day: d, today: todayStart, cal: cal)
        }
        if let date {
            cands.append(DH(start: m.range.location,
                            end: m.range.location + m.range.length,
                            date: date))
        }
    }
    for m in isoDate.all(cutter.text) {
        guard let y = Int(isoDate.group(m, cutter.text, 1) ?? ""),
              let mo = Int(isoDate.group(m, cutter.text, 2) ?? ""),
              let d = Int(isoDate.group(m, cutter.text, 3) ?? ""),
              let date = ymd(year: y, month: mo, day: d)
        else { continue }
        cands.append(DH(start: m.range.location,
                        end: m.range.location + m.range.length, date: date))
    }
    let dayMonth = try! NSRegularExpression(
        pattern: #"\b(\d{1,2})\s+(?:de\s+)?("# + monthAlt + #")\b(?:\s+(\d{4}))?"#,
        options: [.caseInsensitive])
    for m in dayMonth.all(cutter.text) {
        guard let d = Int(dayMonth.group(m, cutter.text, 1) ?? ""),
              let mo = months[(dayMonth.group(m, cutter.text, 2) ?? "")
                .lowercased()]
        else { continue }
        let yRaw = dayMonth.group(m, cutter.text, 3)
        let date: String?
        if let yRaw, let y = Int(yRaw) {
            date = ymd(year: y, month: mo, day: d)
        } else {
            date = resolveYear(month: mo, day: d, today: todayStart, cal: cal)
        }
        if let date {
            cands.append(DH(start: m.range.location,
                            end: m.range.location + m.range.length,
                            date: date))
        }
    }
    let monthDay = try! NSRegularExpression(
        pattern: #"\b("# + monthAlt + #")\s+(\d{1,2})\b(?:\s*,?\s+(\d{4}))?"#,
        options: [.caseInsensitive])
    for m in monthDay.all(cutter.text) {
        guard let d = Int(monthDay.group(m, cutter.text, 2) ?? ""),
              let mo = months[(monthDay.group(m, cutter.text, 1) ?? "")
                .lowercased()]
        else { continue }
        let yRaw = monthDay.group(m, cutter.text, 3)
        let date: String?
        if let yRaw, let y = Int(yRaw) {
            date = ymd(year: y, month: mo, day: d)
        } else {
            date = resolveYear(month: mo, day: d, today: todayStart, cal: cal)
        }
        if let date {
            cands.append(DH(start: m.range.location,
                            end: m.range.location + m.range.length,
                            date: date))
        }
    }
    let weekdayAlt = weekdays.keys.sorted { $0.count > $1.count }
        .joined(separator: "|")
    let weekdayRe = try! NSRegularExpression(
        pattern: #"(?<![\p{L}\p{N}_])(?:(próximo|próxima|proximo|proxima|next)\s+|(cada|every|toda|todo)\s+|(el|del|este|esta|this)\s+)?("# + weekdayAlt + #")(?![\p{L}\p{N}_])"#,
        options: [.caseInsensitive])
    for m in weekdayRe.all(cutter.text) {
        guard let name = weekdayRe.group(m, cutter.text, 4)?.lowercased(),
              let target = weekdays[name]
        else { continue }
        let hasNext = weekdayRe.group(m, cutter.text, 1)?.isEmpty == false
        var date: Date
        if hasNext {
            var sunday = todayStart
            while cal.component(.weekday, from: sunday) != 1 {
                sunday = cal.date(byAdding: .day, value: 1,
                                  to: sunday) ?? sunday
            }
            date = sunday
            while cal.component(.weekday, from: date) != target {
                date = cal.date(byAdding: .day, value: 1,
                                to: date) ?? date
            }
        } else {
            date = todayStart
            while cal.component(.weekday, from: date) != target {
                date = cal.date(byAdding: .day, value: 1,
                                to: date) ?? date
            }
        }
        cands.append(DH(start: m.range.location,
                        end: m.range.location + m.range.length,
                        date: isoFormatter.string(from: date)))
    }
    var date: String?
    if let best = cands.min(by: { $0.start < $1.start }) {
        let r = cutter.cut(start: best.start, end: best.end)
        let c = toChar(r)
        spans.append(CaptureSpan(start: c.0, end: c.1, entity: .date))
        date = best.date
    }

    // Hora: la primera marca gana; `a las 15:00` sale entera.
    struct TH { var start: Int; var end: Int; var time: String }
    var thits: [TH] = []
    for m in timeColon.all(cutter.text) {
        guard let h = Int(timeColon.group(m, cutter.text, 1) ?? ""),
              let min = timeColon.group(m, cutter.text, 2)
        else { continue }
        thits.append(TH(start: m.range.location,
                        end: m.range.location + m.range.length,
                        time: String(format: "%02d:%@", h, min)))
    }
    for m in timeH.all(cutter.text) {
        guard let h = Int(timeH.group(m, cutter.text, 1) ?? "") else { continue }
        let min = timeH.group(m, cutter.text, 2) ?? "00"
        thits.append(TH(start: m.range.location,
                        end: m.range.location + m.range.length,
                        time: String(format: "%02d:%@", h, min)))
    }
    for m in timeAmpm.all(cutter.text) {
        guard var h = Int(timeAmpm.group(m, cutter.text, 1) ?? "") else { continue }
        let min = timeAmpm.group(m, cutter.text, 2) ?? "00"
        let pm = (timeAmpm.group(m, cutter.text, 3) ?? "").lowercased() == "p"
        if pm && h < 12 { h += 12 }
        if !pm && h == 12 { h = 0 }
        thits.append(TH(start: m.range.location,
                        end: m.range.location + m.range.length,
                        time: String(format: "%02d:%@", h, min)))
    }
    var time: String?
    if let best = thits.min(by: { $0.start < $1.start }) {
        let r = cutter.cut(start: best.start, end: best.end, stripPrep: true)
        let c = toChar(r)
        spans.append(CaptureSpan(start: c.0, end: c.1, entity: .time))
        time = best.time
    }
    if time == nil {
        let lower = cutter.text
        let ns = lower as NSString
        if let m = hourOffset.firstMatch(
            in: lower, range: NSRange(location: 0, length: ns.length)) {
            let amount = hourOffset.group(m, lower, 1) ?? ""
            let hours = Int(amount) ?? 1
            let target = cal.date(byAdding: .hour, value: hours,
                                  to: today) ?? today
            let comps = cal.dateComponents([.hour, .minute], from: target)
            time = String(format: "%02d:%02d", comps.hour ?? 0,
                          comps.minute ?? 0)
            let r = cutter.cut(start: m.range.location,
                               end: m.range.location + m.range.length)
            let c = toChar(r)
            spans.append(CaptureSpan(start: c.0, end: c.1, entity: .time))
            let targetKey = isoFormatter.string(from: target)
            if date == nil && targetKey != todayKey {
                date = targetKey
                spans.append(CaptureSpan(start: c.0, end: c.1, entity: .date))
            }
        }
    }

    var title = cutter.text.replacingOccurrences(
        of: "\\s+", with: " ", options: .regularExpression)
        .trimmingCharacters(in: .whitespaces)
    while let last = title.last, ",;:".contains(last) {
        title.removeLast()
    }
    title = title.trimmingCharacters(in: .whitespaces)
    return (ParsedCapture(title: title, scheduledDate: date,
                          scheduledTime: time, priority: priority,
                          projectHint: project),
            spans.sorted { $0.start < $1.start })
}
