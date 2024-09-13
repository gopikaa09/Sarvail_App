import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link, Slot, Stack } from 'expo-router'
import { NativeWindStyleSheet } from "nativewind";
const Rootlayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default Rootlayout
