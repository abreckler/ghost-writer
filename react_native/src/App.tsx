import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/Home';
import PlaygroundScreen from './screens/Playground';
import { Provider } from 'react-redux';
import { store } from './redux/store';


export default function App() {
  const config = {
    screens: {
      Home: '',
      Playground: 'playground',
    },
  };

  const linking = {
    prefixes: ['https://app.ghost-writer.io', 'http://localhost:19006'],
    config,
  }

  const Stack = createStackNavigator();

  return (
    <Provider store={store}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Playground" component={PlaygroundScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
