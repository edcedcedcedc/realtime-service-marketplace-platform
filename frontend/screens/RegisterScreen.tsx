import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../services/api'

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await api.post('/register/', {
        username, password
      });
      Alert.alert('Success', 'You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Register Failed', 'Something went wrong.');
    }
  };

  return (
    <View>
      <Text>username:</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Password:</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
