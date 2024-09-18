import { Stack } from "expo-router"

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }} />
      <Stack.Screen name="personal"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen name="professional"
        options={{
          headerShown: false
        }} />
      <Stack.Screen name="updatePassword"
        options={{
          headerShown: false
        }} />
    </Stack>
  )
}
export default StackLayout