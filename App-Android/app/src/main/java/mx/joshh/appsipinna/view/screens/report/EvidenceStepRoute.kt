/**
 * Ruta para el Paso 3 (Evidencia y Contacto) del formulario de reporte.
 */
package mx.joshh.appsipinna.view.screens.report

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import mx.joshh.appsipinna.view.navigation.Routes
import mx.joshh.appsipinna.viewmodel.ReportViewModel
import java.io.File

/** Conecta el ReportViewModel con la EvidenceStepScreen. */
@Composable
fun EvidenceStepRoute(
    viewModel: ReportViewModel,
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var showSourceDialog by remember { mutableStateOf(false) }
    var tempPhotoUri by remember { mutableStateOf<Uri?>(null) }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { viewModel.onAttachEvidence(it.toString()) }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && tempPhotoUri != null) {
            viewModel.onAttachEvidence(tempPhotoUri.toString())
        }
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            launchCamera(context, cameraLauncher) { uri -> tempPhotoUri = uri }
        }
    }

    if (showSourceDialog) {
        AlertDialog(
            onDismissRequest = { showSourceDialog = false },
            title = { Text(text = "Adjuntar evidencia") },
            text = { Text(text = "Selecciona de dónde deseas obtener la fotografía.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSourceDialog = false
                        galleryLauncher.launch("image/*")
                    }
                ) {
                    Text(text = "Galería")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showSourceDialog = false
                        when {
                            ContextCompat.checkSelfPermission(
                                context,
                                Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED -> {
                                launchCamera(context, cameraLauncher) { uri -> tempPhotoUri = uri }
                            }
                            else -> {
                                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                            }
                        }
                    }
                ) {
                    Text(text = "Cámara")
                }
            }
        )
    }

    EvidenceStepScreen(
        tipoEnvio = uiState.tipoEnvio,
        advertenciaEntendida = uiState.advertenciaEntendida,
        evidenciaUri = uiState.evidenciaUri,
        correo = uiState.correo,
        errorCorreo = uiState.errorCorreo,
        isStepValid = uiState.isStep3Valid,
        onTipoEnvioChange = viewModel::onTipoEnvioChange,
        onAdvertenciaEntendidaChange = viewModel::onAdvertenciaEntendidaChange,
        onAttachEvidenceClick = { showSourceDialog = true },
        onRemoveEvidenceClick = viewModel::onRemoveEvidence,
        onCorreoChange = viewModel::onCorreoChange,
        onNextClick = { navController.navigate(Routes.REPORT_REVIEW) },
        onBackClick = { navController.popBackStack() }
    )
}

private fun launchCamera(
    context: Context,
    cameraLauncher: ActivityResultLauncher<Uri>,
    onUriReady: (Uri) -> Unit
) {
    try {
        val photoFile = File.createTempFile("evidence_", ".jpg", context.cacheDir)
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            photoFile
        )
        onUriReady(uri)
        cameraLauncher.launch(uri)
    } catch (_: Exception) {}
}
