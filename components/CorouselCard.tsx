import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

const { width } = Dimensions.get('screen');

const CorouselCard = ({ item, index, scrollX }) => {
  const router = useRouter();

  const rnStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8], // scale for previous, current, and next
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-width * 0.2, 0, width * 0.2], // create parallax effect
      Extrapolation.CLAMP
    );

    const cardWidth = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.08, width * 0.8, width * 0.08], // widths for previous, current, and next
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scale },
        { translateX },
      ],
      width: cardWidth,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.itemContainer, rnStyle]}>
        <Image
          source={{ uri: item?.featured_image?.medium_large }}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.background}
        />
        <View style={styles.textContainer}>
          <Text className='bg-secondary-100 text-slate-50 p-2 rounded-3xl font-semibold self-start my-0 opacity-80 text-xs'>
            {item?.categories[0]?.name}
          </Text>
          <Text
            style={styles.text}
            numberOfLines={2}
            onPress={() => router.push(`/details/${item.ID}`)}
          >
            {item.post_title}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default CorouselCard;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 10,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: 190,
    borderRadius: 10,
    bottom: 0,
    left: 0,
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    lineHeight: 32,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});
