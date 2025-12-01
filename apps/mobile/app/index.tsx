import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { api } from "../../utils/api";
import { useState } from "react";

export default function TaskScreen() {
  const utils = api.useUtils();
  const { data: tasks, isLoading, error } = api.task.list.useQuery();

  const completeTask = api.task.complete.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
    },
  });

  if (isLoading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, item.status === "COMPLETED" && styles.completedItem]}
            onPress={() => completeTask.mutate({ taskId: item.id })}
            disabled={completeTask.isPending || item.status === "COMPLETED"}
          >
            <View style={styles.row}>
              <View style={[styles.checkbox, item.status === "COMPLETED" && styles.checked]} />
              <View>
                <Text style={[styles.itemTitle, item.status === "COMPLETED" && styles.completedText]}>
                  {item.title}
                </Text>
                {item.description && <Text style={styles.description}>{item.description}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  completedItem: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#4F46E5",
    marginRight: 15,
    borderRadius: 4,
  },
  checked: {
    backgroundColor: "#4F46E5",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
