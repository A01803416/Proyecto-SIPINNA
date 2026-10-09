/**
 * Definición de formas, espaciados y estilos reutilizables de componentes.
 */
package mx.joshh.appsipinna.view.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

val PillShape = RoundedCornerShape(50)

data class RietiSpacing(
    val xxs: androidx.compose.ui.unit.Dp = 2.dp,
    val xs: androidx.compose.ui.unit.Dp = 4.dp,
    val sm: androidx.compose.ui.unit.Dp = 8.dp,
    val md: androidx.compose.ui.unit.Dp = 12.dp,
    val lg: androidx.compose.ui.unit.Dp = 16.dp,
    val xl: androidx.compose.ui.unit.Dp = 24.dp,
    val xxl: androidx.compose.ui.unit.Dp = 32.dp,
    val huge: androidx.compose.ui.unit.Dp = 48.dp,
    val screenHorizontal: androidx.compose.ui.unit.Dp = 20.dp,
    val minTouchTarget: androidx.compose.ui.unit.Dp = 48.dp
)

data class StatusColors(
    val recibidoContainer: androidx.compose.ui.graphics.Color,
    val onRecibidoContainer: androidx.compose.ui.graphics.Color,
    val enRevisionContainer: androidx.compose.ui.graphics.Color,
    val onEnRevisionContainer: androidx.compose.ui.graphics.Color,
    val atendidoContainer: androidx.compose.ui.graphics.Color,
    val onAtendidoContainer: androidx.compose.ui.graphics.Color,
    val noProcedenteContainer: androidx.compose.ui.graphics.Color,
    val onNoProcedenteContainer: androidx.compose.ui.graphics.Color
)
