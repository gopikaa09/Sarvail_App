import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import CorouselCard from './CorouselCard';

const { width } = Dimensions.get('screen');



const HomeCarousel = ({ data }) => {
  const renderItem = ({ item, index }) => {
    return <CorouselCard item={item} />;
  };

  return (
    <Carousel
      data={data}
      renderItem={renderItem}
      sliderWidth={width}
      itemWidth={width * 0.8} // The middle card width (80% of screen)
      inactiveSlideScale={0.8} // Scale the previous and next cards (8% width effect)
      inactiveSlideOpacity={0.6}
      containerCustomStyle={styles.carouselContainer}
      contentContainerCustomStyle={styles.carouselContent}
      loop={true} // Enable looping
      autoplay={true} // Auto-scroll through items
      autoplayInterval={3000} // Interval between auto-scrolls
      enableMomentum={true} // Allows smooth manual scrolling
      decelerationRate="fast"
      snapToAlignment="center" // Aligns the center card perfectly
    />
  );
};

export default HomeCarousel;

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 10,
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  categoryText: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 5,
    borderRadius: 5,
    fontSize: 10,
    opacity: 0.8,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginTop: 5,
  },
  carouselContainer: {
    marginVertical: 20,
  },
  carouselContent: {
    alignItems: 'center',
  },
});
