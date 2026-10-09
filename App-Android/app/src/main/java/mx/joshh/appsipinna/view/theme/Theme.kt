/**
 * Configuración del tema visual y esquema de colores de la aplicación.
 */
package mx.joshh.appsipinna.view.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF0F524A),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFB5EBE3),
    onPrimaryContainer = Color(0xFF00201C),
    secondary = Color(0xFF267D71),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFA5F4E7),
    onSecondaryContainer = Color(0xFF00201C),
    tertiary = Color(0xFFF3EAD3),
    onTertiary = Color(0xFF383120),
    tertiaryContainer = Color(0xFFFFF1DC),
    onTertiaryContainer = Color(0xFF534834),
    background = Color(0xFFFBF9F2),
    onBackground = Color(0xFF1D201E),
    surface = Color(0xFFFBF9F2),
    onSurface = Color(0xFF1D201E),
    surfaceVariant = Color(0xFFEFECE4),
    onSurfaceVariant = Color(0xFF4A4945),
    outline = Color(0xFF7A7872),
    outlineVariant = Color(0xFFCAC6BC),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002)
)

object RietiTheme {
    val spacing: RietiSpacing
        @Composable get() = RietiSpacing()

    val statusColors: StatusColors
        @Composable get() = StatusColors(
            recibidoContainer = Color(0xFFE0F2FE),
            onRecibidoContainer = Color(0xFF0369A1),
            enRevisionContainer = Color(0xFFFEF08A),
            onEnRevisionContainer = Color(0xFF854D0E),
            atendidoContainer = Color(0xFFDCFCE7),
            onAtendidoContainer = Color(0xFF166534),
            noProcedenteContainer = Color(0xFFFEE2E2),
            onNoProcedenteContainer = Color(0xFF991B1B)
        )
}

/** Tema principal de Material 3 para RIETI. */
@Composable
fun RietiTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = RietiTypography,
        content = content
    )
}
