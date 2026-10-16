/**
 * Pantalla de aviso cuando el dispositivo no cuenta con conexión a internet.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import mx.joshh.appsipinna.view.theme.RietiTheme

/**
 * Pantalla bloqueante de sin conexión a internet.
 * @param onRetry Se invoca al pulsar el botón "Reintentar" para comprobar de nuevo la conectividad.
 * @param modifier Modificador de diseño opcional.
 */
@Composable
fun OfflineScreen(
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(RietiTheme.spacing.xxl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.WifiOff,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error,
            modifier = Modifier.size(72.dp)
        )
        Text(
            text = "Sin conexión a internet",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.error,
            modifier = Modifier.padding(top = RietiTheme.spacing.lg),
            textAlign = TextAlign.Center
        )
        Text(
            text = "Se requiere conexión a internet para utilizar la aplicación, consultar reportes y cargar los mapas interactivos.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(top = RietiTheme.spacing.md, bottom = RietiTheme.spacing.xxl),
            textAlign = TextAlign.Center
        )
        RietiButton(
            text = "Reintentar",
            onClick = onRetry
        )
    }
}
