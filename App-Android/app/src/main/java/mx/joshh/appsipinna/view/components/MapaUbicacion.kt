/**
 * Composable que envuelve un MapView de osmdroid para mostrar el mapa interactivo y un pin central.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme
import org.osmdroid.config.Configuration
import org.osmdroid.events.DelayedMapListener
import org.osmdroid.events.MapListener
import org.osmdroid.events.ScrollEvent
import org.osmdroid.events.ZoomEvent
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import java.io.File
import android.content.Context

@Composable
fun MapaUbicacion(
    centro: GeoPoint,
    onCentroCambiado: (GeoPoint) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val mapView = remember {
        Configuration.getInstance().apply {
            load(context, context.getSharedPreferences("osmdroid", Context.MODE_PRIVATE))
            userAgentValue = context.packageName
            osmdroidBasePath = File(context.cacheDir, "osmdroid")
            osmdroidTileCache = File(File(context.cacheDir, "osmdroid"), "tiles")
        }
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
            minZoomLevel = 4.0
            maxZoomLevel = 19.0
            controller.setZoom(17.0)
            controller.setCenter(centro)
        }
    }

    DisposableEffect(Unit) {
        mapView.onResume()
        onDispose {
            mapView.onPause()
            mapView.onDetach()
        }
    }

    var lastCenter by remember { mutableStateOf(centro) }

    DisposableEffect(mapView) {
        val mapListener = DelayedMapListener(object : MapListener {
            override fun onScroll(event: ScrollEvent?): Boolean {
                val center = mapView.mapCenter
                val newPoint = GeoPoint(center.latitude, center.longitude)
                lastCenter = newPoint
                onCentroCambiado(newPoint)
                return true
            }

            override fun onZoom(event: ZoomEvent?): Boolean {
                val center = mapView.mapCenter
                val newPoint = GeoPoint(center.latitude, center.longitude)
                lastCenter = newPoint
                onCentroCambiado(newPoint)
                return true
            }
        }, 300L)
        mapView.addMapListener(mapListener)
        onDispose {
            mapView.removeMapListener(mapListener)
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(260.dp)
            .clip(MaterialTheme.shapes.medium)
            .testTag("mapa_ubicacion"),
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            factory = { mapView },
            modifier = Modifier.matchParentSize()
        ) { view ->
            val currentCenter = view.mapCenter
            val latDiff = kotlin.math.abs(currentCenter.latitude - centro.latitude)
            val lonDiff = kotlin.math.abs(currentCenter.longitude - centro.longitude)
            if (latDiff > 0.00001 || lonDiff > 0.00001) {
                if (centro.latitude != lastCenter.latitude || centro.longitude != lastCenter.longitude) {
                    view.controller.animateTo(centro)
                    lastCenter = centro
                }
            }
        }

        Icon(
            imageVector = Icons.Default.Place,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier
                .size(48.dp)
                .offset(y = (-24).dp)
        )

        Column(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(RietiTheme.spacing.sm),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)
        ) {
            FilledTonalIconButton(
                onClick = { mapView.controller.zoomIn() },
                modifier = Modifier.size(RietiTheme.spacing.minTouchTarget),
                colors = IconButtonDefaults.filledTonalIconButtonColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    contentColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = stringResource(R.string.zoom_acercar)
                )
            }

            FilledTonalIconButton(
                onClick = { mapView.controller.zoomOut() },
                modifier = Modifier.size(RietiTheme.spacing.minTouchTarget),
                colors = IconButtonDefaults.filledTonalIconButtonColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    contentColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Remove,
                    contentDescription = stringResource(R.string.zoom_alejar)
                )
            }
        }
    }
}
