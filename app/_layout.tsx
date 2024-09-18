import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link, Slot, Stack } from 'expo-router'
import { NativeWindStyleSheet } from "nativewind";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const Rootlayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>

  )
}
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default Rootlayout
