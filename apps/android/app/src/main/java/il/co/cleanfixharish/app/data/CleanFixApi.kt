package il.co.cleanfixharish.app.data

import com.google.gson.annotations.SerializedName
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class LeadRequest(
    @SerializedName("customer_name") val customerName: String,
    val phone: String,
    val whatsapp: String = phone,
    val area: String,
    @SerializedName("service_requested") val serviceRequested: String,
    val description: String,
)

data class LeadResponse(
    val id: Int,
    @SerializedName("customer_name") val customerName: String,
    val status: String?,
)

data class ServiceQuote(
    val id: Int,
    @SerializedName("quoted_total") val quotedTotal: Double,
    @SerializedName("deposit_required") val depositRequired: Double?,
    val scope: String,
    val exclusions: String?,
    val terms: String?,
    val status: String,
    @SerializedName("expires_at") val expiresAt: String,
    val currency: String,
    val notice: String,
)

data class QuoteDecision(val decision: String)

interface CleanFixApi {
    @POST("api/v1/entities/leads")
    suspend fun submitLead(@Body request: LeadRequest): LeadResponse

    @GET("api/v1/public/quotes/{token}")
    suspend fun getQuote(@Path("token") token: String): ServiceQuote

    @POST("api/v1/public/quotes/{token}/decision")
    suspend fun decideQuote(
        @Path("token") token: String,
        @Body decision: QuoteDecision,
    ): ServiceQuote
}
