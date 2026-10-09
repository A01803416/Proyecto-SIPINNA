/**
 * Definición de fuentes, estilos de texto y tipografía tipográfica de la aplicación.
 */
package mx.joshh.appsipinna.view.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.sp

val Nunito = FontFamily.Default
val Inter = FontFamily.Default

private val TrimAlign = LineHeightStyle(
    alignment = LineHeightStyle.Alignment.Center,
    trim = LineHeightStyle.Trim.None
)

val RietiTypography = Typography(
    displaySmall = TextStyle(
        fontFamily = Nunito, fontWeight = FontWeight.ExtraBold,
        fontSize = 34.sp, lineHeight = 42.sp, letterSpacing = (-0.5).sp,
        lineHeightStyle = TrimAlign
    ),
    headlineLarge = TextStyle(
        fontFamily = Nunito, fontWeight = FontWeight.Bold,
        fontSize = 30.sp, lineHeight = 38.sp, letterSpacing = (-0.4).sp,
        lineHeightStyle = TrimAlign
    ),
    headlineMedium = TextStyle(
        fontFamily = Nunito, fontWeight = FontWeight.Bold,
        fontSize = 26.sp, lineHeight = 34.sp, letterSpacing = (-0.3).sp,
        lineHeightStyle = TrimAlign
    ),
    headlineSmall = TextStyle(
        fontFamily = Nunito, fontWeight = FontWeight.Bold,
        fontSize = 22.sp, lineHeight = 30.sp, letterSpacing = (-0.2).sp,
        lineHeightStyle = TrimAlign
    ),
    titleLarge = TextStyle(
        fontFamily = Nunito, fontWeight = FontWeight.Bold,
        fontSize = 19.sp, lineHeight = 26.sp,
        lineHeightStyle = TrimAlign
    ),
    titleMedium = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp, lineHeight = 24.sp, letterSpacing = 0.1.sp
    ),
    titleSmall = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = 0.1.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.Normal,
        fontSize = 16.sp, lineHeight = 25.sp, letterSpacing = 0.15.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.Normal,
        fontSize = 14.sp, lineHeight = 22.sp, letterSpacing = 0.15.sp
    ),
    bodySmall = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.Normal,
        fontSize = 12.sp, lineHeight = 18.sp, letterSpacing = 0.2.sp
    ),
    labelLarge = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp, lineHeight = 20.sp, letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.Medium,
        fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.3.sp
    ),
    labelSmall = TextStyle(
        fontFamily = Inter, fontWeight = FontWeight.Medium,
        fontSize = 11.sp, lineHeight = 16.sp, letterSpacing = 0.3.sp
    )
)

val FolioTextStyle = TextStyle(
    fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,
    fontSize = 26.sp, lineHeight = 34.sp, letterSpacing = 2.sp
)
