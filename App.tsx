import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroProdutoScreen from './src/screens/CadastroProdutoScreen';
import DetalheProdutoScreen from './src/screens/DetalheProdutoScreen';
import ListaProdutosScreen from './src/screens/ListaProdutosScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaProdutos">
        <Stack.Screen
          name="ListaProdutos"
          component={ListaProdutosScreen}
          options={{ title: 'Loja Compre Bem' }}
        />
        <Stack.Screen
          name="DetalheProduto"
          component={DetalheProdutoScreen}
          options={{ title: 'Detalhe do produto' }}
        />
        <Stack.Screen
          name="CadastroProduto"
          component={CadastroProdutoScreen}
          options={{ title: 'Cadastro de produto' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
