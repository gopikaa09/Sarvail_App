import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link, Slot, Stack } from 'expo-router'
import GlobalProvider from '@/context/GloberProvider'

const Rootlayout = () => {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="userDetails" options={{ headerShown: false }} /> */}
      </Stack>
    </GlobalProvider>
  )
}

export default Rootlayout
