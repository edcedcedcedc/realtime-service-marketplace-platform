import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/login/', {
        username, password
      });
      await AsyncStorage.setItem('token', res.data.access);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials.');
    }
  };

  return (
    <View>
      <Text>username:</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Password:</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
