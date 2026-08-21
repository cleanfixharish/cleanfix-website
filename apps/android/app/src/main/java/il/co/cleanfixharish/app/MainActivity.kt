package il.co.cleanfixharish.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import il.co.cleanfixharish.app.data.ApiProvider
import il.co.cleanfixharish.app.data.LeadRequest
import il.co.cleanfixharish.app.data.QuoteDecision
import il.co.cleanfixharish.app.data.ServiceQuote
import kotlinx.coroutines.launch

private val Navy = Color(0xFF102E38)
private val Gold = Color(0xFFB8842F)
private val Ivory = Color(0xFFF7F2EA)

class MainActivity : ComponentActivity() {
    private val activeQuoteToken = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        activeQuoteToken.value = quoteTokenFromIntent(intent)
        setContent { CleanFixApp(activeQuoteToken.value) }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        activeQuoteToken.value = quoteTokenFromIntent(intent)
    }

    private fun quoteTokenFromIntent(intent: Intent): String? {
        val uri = intent.data ?: return null
        return when {
            uri.scheme == "cleanfixharish" && uri.host == "quote" -> uri.lastPathSegment
            uri.host == "www.cleanfixharish.co.il" -> uri.pathSegments.lastOrNull()
            else -> null
        }
    }
}

@Composable
fun CleanFixApp(initialQuoteToken: String?) {
    var tab by remember(initialQuoteToken) { mutableIntStateOf(if (initialQuoteToken == null) 0 else 1) }
    MaterialTheme(
        colorScheme = MaterialTheme.colorScheme.copy(
            primary = Navy,
            secondary = Gold,
            background = Ivory,
        )
    ) {
        Scaffold(
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(selected = tab == 0, onClick = { tab = 0 }, icon = {}, label = { Text("Request service") })
                    NavigationBarItem(selected = tab == 1, onClick = { tab = 1 }, icon = {}, label = { Text("My quote") })
                }
            }
        ) { padding ->
            when (tab) {
                0 -> RequestScreen(Modifier.padding(padding))
                else -> QuoteScreen(initialQuoteToken.orEmpty(), Modifier.padding(padding))
            }
        }
    }
}

@Composable
private fun RequestScreen(modifier: Modifier = Modifier) {
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var area by remember { mutableStateOf("Harish") }
    var service by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var sending by remember { mutableStateOf(false) }

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("CleanFixHarish", style = MaterialTheme.typography.headlineMedium, color = Navy)
        Text("Tell us what needs to be done. We will review the scope before giving a price.")
        OutlinedTextField(name, { name = it }, label = { Text("Your name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(phone, { phone = it }, label = { Text("Phone / WhatsApp") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(area, { area = it }, label = { Text("Town or area") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(service, { service = it }, label = { Text("Service needed") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            description,
            { description = it },
            label = { Text("Explain the work, measurements and access") },
            minLines = 4,
            modifier = Modifier.fillMaxWidth(),
        )
        Button(
            enabled = !sending && name.isNotBlank() && phone.isNotBlank() && description.length >= 10,
            onClick = {
                sending = true
                message = null
                scope.launch {
                    runCatching {
                        ApiProvider.api.submitLead(LeadRequest(name, phone, phone, area, service, description))
                    }.onSuccess {
                        message = "Request #${it.id} received. CleanFixHarish will review it before pricing."
                        description = ""
                    }.onFailure {
                        message = "We could not send the request. Please check your connection and try again."
                    }
                    sending = false
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (sending) "Sending…" else "Send request") }
        message?.let { Text(it) }
    }
}

@Composable
private fun QuoteScreen(initialToken: String, modifier: Modifier = Modifier) {
    val coroutineScope = rememberCoroutineScope()
    var token by remember(initialToken) { mutableStateOf(initialToken) }
    var quote by remember { mutableStateOf<ServiceQuote?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    fun loadQuote() {
        loading = true
        message = null
        coroutineScope.launch {
            runCatching { ApiProvider.api.getQuote(token.trim()) }
                .onSuccess { quote = it }
                .onFailure { message = "Quote not found or no longer available." }
            loading = false
        }
    }

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Your quote", style = MaterialTheme.typography.headlineMedium, color = Navy)
        OutlinedTextField(token, { token = it }, label = { Text("Private quote code") }, modifier = Modifier.fillMaxWidth())
        Button(enabled = token.isNotBlank() && !loading, onClick = { loadQuote() }, modifier = Modifier.fillMaxWidth()) {
            Text(if (loading) "Loading…" else "Open quote")
        }
        message?.let { Text(it) }
        quote?.let { current ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("₪${"%.2f".format(current.quotedTotal)}", style = MaterialTheme.typography.headlineLarge, color = Navy)
                    Text(current.scope)
                    current.exclusions?.let { Text("Not included: $it") }
                    current.depositRequired?.let { Text("Deposit: ₪${"%.2f".format(it)}") }
                    Text("Status: ${current.status}")
                    Text(current.notice, style = MaterialTheme.typography.bodySmall)
                    if (current.status == "published") {
                        Spacer(Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(onClick = {
                                coroutineScope.launch {
                                    loading = true
                                    message = null
                                    runCatching {
                                        ApiProvider.api.decideQuote(token.trim(), QuoteDecision("accept"))
                                    }.onSuccess {
                                        quote = it
                                        message = "Quote accepted. CleanFixHarish will contact you to confirm scheduling."
                                    }.onFailure {
                                        message = "We could not accept the quote. Please try again or contact CleanFixHarish."
                                    }
                                    loading = false
                                }
                            }, enabled = !loading) { Text("Accept") }
                            Button(onClick = {
                                coroutineScope.launch {
                                    loading = true
                                    message = null
                                    runCatching {
                                        ApiProvider.api.decideQuote(token.trim(), QuoteDecision("decline"))
                                    }.onSuccess {
                                        quote = it
                                        message = "Quote declined. No booking or payment was created."
                                    }.onFailure {
                                        message = "We could not decline the quote. Please try again or contact CleanFixHarish."
                                    }
                                    loading = false
                                }
                            }, enabled = !loading) { Text("Decline") }
                        }
                    }
                }
            }
        }
    }
}
