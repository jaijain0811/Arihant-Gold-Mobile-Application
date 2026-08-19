import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register both primary name ("mobile") and secondary alias ("arihantgold")
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('arihantgold', () => App);
AppRegistry.registerComponent('TempApp', () => App);
