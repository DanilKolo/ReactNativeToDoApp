import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Home() { // Можна назвати App, Index, або Home - це назва вашого головного компонента
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([]); // Додав тип для TypeScript
  const [taskText, setTaskText] = useState('');

  const addTask = async () => {
    if (taskText.trim().length === 0) {
      Alert.alert('Помилка', 'Будь ласка, введіть текст завдання.');
      return;
    }

    const newTaskId = Date.now().toString();
    const newTask = { id: newTaskId, text: taskText.trim(), completed: false };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setTaskText('');
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => { // Додав тип для TypeScript
    Alert.alert(
      'Видалити завдання',
      'Ви впевнені, що хочете видалити це завдання?',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Видалити',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleTaskCompletion = async (id: string) => { // Додав тип для TypeScript
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const saveTasks = async (tasksToSave: Array<{ id: string; text: string; completed: boolean }>) => { // Додав тип для TypeScript
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('@todo_tasks', jsonValue);
      console.log('Завдання збережено!');
    } catch (e) {
      console.error('Помилка збереження завдань:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@todo_tasks');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Помилка завантаження завдань:', e);
      return [];
    }
  };

  useEffect(() => {
    const getTasks = async () => {
      const storedTasks = await loadTasks();
      if (storedTasks) {
        setTasks(storedTasks);
      }
    };
    getTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мій Список Завдань</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Нове завдання..."
          value={taskText}
          onChangeText={setTaskText}
        />
        <Button title="Додати" onPress={addTask} color="#007AFF" />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.taskItem, item.completed && styles.completedTask]}
            onPress={() => toggleTaskCompletion(item.id)}
            onLongPress={() => deleteTask(item.id)}
          >
            <Text style={[styles.taskText, item.completed && styles.completedText]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>Завдань поки що немає. Додайте перше!</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: '#e0ffe0',
  },
  taskText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});