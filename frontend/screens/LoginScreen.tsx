import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://<your-backend-ip>/api/token/', {
        email, password
      });
      await AsyncStorage.setItem('token', res.data.access);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials.');
    }
  };

  return (
    <View>
      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} />
      <Text>Password:</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="No account? Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
