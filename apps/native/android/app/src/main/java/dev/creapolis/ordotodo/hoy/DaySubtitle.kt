package dev.creapolis.ordotodo.hoy

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

/**
 * Subtítulo del día de Hoy en el idioma del sistema (S20, trilingüe ES/EN/PT).
 * Usa el formato de fecha largo localizado en lugar de un patrón fijo en español.
 */
fun formatDaySubtitle(date: LocalDate, locale: Locale): String =
    date.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withLocale(locale))
