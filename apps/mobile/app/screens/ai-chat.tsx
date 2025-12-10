
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../lib/api-client';
import Toast from 'react-native-toast-message';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your Ordo AI assistant. How can I help you be more productive today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
         try {
             const newConv = await apiClient.createConversation({ 
                 title: 'Mobile Session ' + new Date().toLocaleTimeString(),
                 initialMessage: userMessage.content 
             });
             currentConversationId = newConv.id;
             setConversationId(currentConversationId);
         } catch (err) {
             console.error("Failed to create conversation", err);
             throw new Error("Could not start conversation");
         }
      }

      if (!currentConversationId) throw new Error("Conversation ID not established");
      
      const response = await apiClient.sendMessage(currentConversationId, { message: userMessage.content });
      
      const aiMessage: Message = {
        id: response.aiResponse.id,
        role: "assistant",
        content: response.aiResponse.content,
        timestamp: new Date(response.aiResponse.createdAt),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        {!isUser && (
            <View style={styles.avatarContainer}>
                <Ionicons name="sparkles" size={16} color="#6366f1" />
            </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>{item.content}</Text>
        </View>
        {isUser && (
             <View style={styles.avatarContainerUser}>
                 <Ionicons name="person" size={16} color="#ffffff" />
             </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
          title: "AI Assistant",
          headerShown: true,
          headerStyle: { backgroundColor: '#f9fafb' }, // Adjust for dark mode later
      }} />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
           <ActivityIndicator size="small" color="#6366f1" />
           <Text style={styles.loadingText}>Ordo is thinking...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarContainerUser: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#6366f1',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1f2937',
  },
  loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 8,
  },
  loadingText: {
      marginLeft: 8,
      color: '#6b7280',
      fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f9fafb',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
      backgroundColor: '#c7d2fe',
  }
});
