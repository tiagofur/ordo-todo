package dev.creapolis.ordotodo.data

import org.junit.Assert.assertEquals
import org.junit.Test

class TaskCommentsTest {

    private val payload =
        """[{"id":"c1","content":"Please review","taskId":"t1","authorId":"u1",
            "author":{"id":"u1","name":"Tiago","email":"t@example.com","image":null},
            "parentCommentId":null,"mentions":[],"isEdited":false,"editedAt":null,
            "createdAt":"2026-11-12T10:00:00.000Z","updatedAt":"2026-11-12T10:00:00.000Z"},
           {"id":"c2","content":"Done","taskId":"t1","authorId":"u2",
            "author":{"id":"u2","name":null,"email":"ana@example.com","image":null},
            "parentCommentId":null,"mentions":[],"isEdited":false,"editedAt":null,
            "createdAt":"2026-11-13T10:00:00.000Z","updatedAt":"2026-11-13T10:00:00.000Z"}]"""

    @Test
    fun parsesCommentsWithAuthorFallback() {
        val comments = parseTaskComments(payload)
        assertEquals(2, comments.size)
        assertEquals(TaskComment("c1", "Please review", "Tiago", "2026-11-12"), comments[0])
        assertEquals(TaskComment("c2", "Done", "ana@example.com", "2026-11-13"), comments[1])
    }

    @Test
    fun emptyWhenMissingOrMalformed() {
        assertEquals(0, parseTaskComments("[]").size)
        assertEquals(0, parseTaskComments("{}").size)
        assertEquals(0, parseTaskComments("not json").size)
    }
}
