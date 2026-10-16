/**
 * Definición del cliente de red Retrofit, URL base y DTOs para el consumo del backend de RIETI en AWS Lambda.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna

import com.google.gson.annotations.SerializedName
import mx.joshh.appsipinna.model.Municipio
import mx.joshh.appsipinna.model.Reporte
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/** Constante única con la dirección base del backend en AWS Lambda terminada en barra inclinada. */
const val BASE_URL = "https://tvsjdlg5v47fniy7m75j4wfjba0aoqcv.lambda-url.us-east-1.on.aws/"

/**
 * Objeto de transferencia (DTO) para la petición de consulta de estatus por folio y correo.
 * @property folio Código de folio de seguimiento.
 * @property correo Correo electrónico registrado.
 */
data class ConsultaRequest(
    @SerializedName("folio") val folio: String,
    @SerializedName("correo") val correo: String
)

/**
 * Objeto de transferencia (DTO) con la respuesta de consulta de estatus de un reporte.
 * @property idFolioReporte Identificador del folio del reporte.
 * @property estatus Estatus actual del reporte.
 * @property fechaRegistro Fecha y hora de registro.
 * @property ultimaNotaPublica Última nota pública agregada por el procurador (puede ser null).
 * @property message Mensaje de error (presente cuando la consulta falla, ej. 404).
 */
data class ReporteConsultaResponse(
    @SerializedName("id_folio_reporte") val idFolioReporte: String?,
    @SerializedName("estatus") val estatus: String?,
    @SerializedName("fecha_registro") val fechaRegistro: String?,
    @SerializedName("ultima_nota_publica") val ultimaNotaPublica: String?,
    @SerializedName("message") val message: String?
)

/**
 * Objeto de transferencia (DTO) con la respuesta del registro de un reporte.
 * @property folio Código de folio generado (si es con seguimiento).
 * @property ok Indicador booleano de éxito (si es anónimo).
 * @property message Mensaje de error o regla no cumplida devuelto por el servidor.
 */
data class ReporteResponse(
    @SerializedName("folio") val folio: String?,
    @SerializedName("ok") val ok: Boolean?,
    @SerializedName("message") val message: String?
)

/**
 * Objeto de transferencia (DTO) para enviar el registro de un reporte a POST "reportes".
 * Se creó esta clase separada de [Reporte] porque [Reporte] utiliza enums locales para la interfaz, mientras que el backend requiere tipos primitivos y texto exacto.
 * @property idMunicipio Identificador numérico del municipio ("id_municipio").
 * @property latitud Coordenada de latitud ("latitud").
 * @property longitud Coordenada de longitud ("longitud").
 * @property colonia Nombre de la colonia ("colonia").
 * @property nombreLugar Referencia del lugar o establecimiento ("nombre_lugar").
 * @property tipoActividad Tipo de actividad como texto libre ("tipo_actividad").
 * @property descripcion Descripción detallada ("descripcion").
 * @property numeroMenores Número de menores involucrados ("numero_menores").
 * @property edadAproximada Edad aproximada como texto ("edad_aproximada").
 * @property horario Horario ("horario").
 * @property frecuencia Frecuencia ("frecuencia").
 * @property nivelRiesgo Nivel de riesgo ("nivel_riesgo").
 * @property peligroInmediato Peligro inmediato ("peligro_inmediato").
 * @property correo Correo electrónico de contacto o null ("correo").
 * @property foto Foto en base64 sin prefijo o null ("foto").
 */
data class ReporteRequest(
    @SerializedName("id_municipio") val idMunicipio: Int,
    @SerializedName("latitud") val latitud: Double,
    @SerializedName("longitud") val longitud: Double,
    @SerializedName("colonia") val colonia: String,
    @SerializedName("nombre_lugar") val nombreLugar: String,
    @SerializedName("tipo_actividad") val tipoActividad: String,
    @SerializedName("descripcion") val descripcion: String,
    @SerializedName("numero_menores") val numeroMenores: Int,
    @SerializedName("edad_aproximada") val edadAproximada: String,
    @SerializedName("horario") val horario: String,
    @SerializedName("frecuencia") val frecuencia: String,
    @SerializedName("nivel_riesgo") val nivelRiesgo: String,
    @SerializedName("peligro_inmediato") val peligroInmediato: Boolean,
    @SerializedName("correo") val correo: String?,
    @SerializedName("foto") val foto: String?
)

/**
 * Interfaz de Retrofit que define los endpoints del backend de RIETI (sin slash inicial en las rutas).
 */
interface RietiApi {
    /** Obtiene la lista de municipios desde el servidor. */
    @GET("municipios")
    suspend fun getMunicipios(): List<Municipio>

    /** Registra un nuevo reporte ciudadano en el servidor. */
    @POST("reportes")
    suspend fun registrarReporte(@Body body: ReporteRequest): Response<ReporteResponse>

    /** Consulta el estatus de un reporte mediante folio y correo electrónico. */
    @POST("reportes/consulta")
    suspend fun consultarReporte(@Body request: ConsultaRequest): Response<ReporteConsultaResponse>
}

/**
 * Cliente Singleton para inicializar y proveer la instancia de [RietiApi] con el convertidor de Gson.
 */
object RietiNetworkClient {
    /** Instancia perezosa ([lazy]) configurada de [RietiApi]. */
    val api: RietiApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RietiApi::class.java)
    }
}
