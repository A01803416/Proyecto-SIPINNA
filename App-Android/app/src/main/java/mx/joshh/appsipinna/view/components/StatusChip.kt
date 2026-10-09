/**
 * Chip coloreado para representar el estatus actual de un reporte.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.model.EstatusReporte
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Chip indicador de estatus con colores temáticos según el estado del reporte. */
@Composable
fun StatusChip(
    estatus: EstatusReporte,
    modifier: Modifier = Modifier
) {
    val colors = RietiTheme.statusColors
    val (containerColor, contentColor) = when (estatus) {
        EstatusReporte.REGISTRADO -> colors.recibidoContainer to colors.onRecibidoContainer
        EstatusReporte.EN_REVISION -> colors.enRevisionContainer to colors.onEnRevisionContainer
        EstatusReporte.EN_SEGUIMIENTO -> colors.enRevisionContainer to colors.onEnRevisionContainer
        EstatusReporte.CANALIZADO -> colors.enRevisionContainer to colors.onEnRevisionContainer
        EstatusReporte.CONCLUIDO -> colors.atendidoContainer to colors.onAtendidoContainer
        EstatusReporte.ARCHIVADO -> colors.noProcedenteContainer to colors.onNoProcedenteContainer
        EstatusReporte.CANCELADO -> colors.noProcedenteContainer to colors.onNoProcedenteContainer
        EstatusReporte.REINCIDENTE -> colors.noProcedenteContainer to colors.onNoProcedenteContainer
    }

    Box(
        modifier = modifier
            .clip(MaterialTheme.shapes.extraSmall)
            .background(containerColor)
            .padding(horizontal = RietiTheme.spacing.md, vertical = RietiTheme.spacing.xs)
    ) {
        Text(
            text = stringResource(estatus.labelRes),
            style = MaterialTheme.typography.labelSmall,
            color = contentColor
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun StatusChipPreview() {
    RietiTheme {
        StatusChip(estatus = EstatusReporte.REGISTRADO)
    }
}
