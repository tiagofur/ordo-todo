package dev.creapolis.ordotodo.ritual

import dev.creapolis.ordotodo.data.ApiClient
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.add

class RitualRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun getStreak(): RitualStreak =
        try {
            json.decodeFromString(api.get("/ritual/streak"))
        } catch (_: Exception) {
            RitualStreak()
        }

    suspend fun getMorning(): RitualMorningView =
        json.decodeFromString(api.get("/ritual/morning"))

    suspend fun completeMorning(top3: List<String>) {
        val body = buildJsonObject {
            putJsonArray("top3") {
                top3.forEach { add(it) }
            }
        }
        api.post("/ritual/morning/complete", json.encodeToString(JsonObject.serializer(), body))
    }

    suspend fun skipMorning() {
        api.post("/ritual/morning/skip")
    }

    suspend fun acceptMorningTimebox() {
        api.post("/ritual/morning/timebox/accept")
    }

    suspend fun getEvening(): RitualEveningView =
        json.decodeFromString(api.get("/ritual/evening"))

    suspend fun completeEvening(moves: List<RitualEveningMove>) {
        val movesArray = json.encodeToJsonElement(
            ListSerializer(RitualEveningMove.serializer()),
            moves,
        )
        val body = buildJsonObject {
            put("moves", movesArray)
        }
        api.post("/ritual/evening/complete", json.encodeToString(JsonObject.serializer(), body))
    }

    suspend fun skipEvening() {
        api.post("/ritual/evening/skip")
    }
}
