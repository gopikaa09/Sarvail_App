import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Text, View, ScrollView, Dimensions, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { LinearGradient } from 'expo-linear-gradient';
import Badge from '@/components/Badge';
import { icons } from '@/constants';
const { width } = Dimensions.get('window');
import Icons from 'react-native-vector-icons/Entypo';
import Icons2 from 'react-native-vector-icons/AntDesign';
import YoutubePlayer from "react-native-youtube-iframe";

const Details = () => {
  const { ID } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://sarvail.net/wp-json/ds-custom_endpoints/v1/posts/${ID}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ID]);

  const formattedDate = new Date(data?.post_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleBackStep = () => {
    router.push('home');
  };
  function getYoutubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  }

  const videoId = getYoutubeVideoId(data?.videos?.[0]?.td_video);
  console.log(videoId);

  return (
    <View className="bg-primary flex-1">
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {data && (
            <View style={styles.contentContainer} className="bg-primary">
              {data?.featured_image?.large ? (
                <View style={styles.imageContainer}>
                  {data?.videos?.length !== 0 ? (
                    <YoutubePlayer
                      height={200}
                      width={340}
                      play={isPlaying}
                      videoId={videoId}
                      volume={100}  // Ensure the sound is enabled
                      onChangeState={(state) => {
                        if (state === "ended") {
                          setIsPlaying(false);
                        }
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri: item?.featured_image?.medium_large }}
                      className="w-full h-48 rounded-xl mt-3"
                      resizeMode="cover"
                    />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                    style={styles.gradient}
                  />
                  <View style={styles.imageText} className="flex flex-col">
                    <View className="self-start bg-gray-600 opacity-60 p-2 rounded-3xl relative -top-44">
                      <Icons name="chevron-left" size={20} color="white" onPress={handleBackStep} />
                    </View>
                    <Text className="bg-secondary-100 text-slate-50 p-2 rounded-3xl font-semibold self-start my-0 opacity-80 text-xs">
                      {data?.categories[0]?.name}
                    </Text>
                    <Text className="text-slate-50 text-2xl font-semibold leading-6 mt-1" numberOfLines={2}>
                      {data?.post_title}
                    </Text>
                    <View className="flex flex-row items-center gap-1">
                      <Icons2 name="clockcircleo" size={12} color="white" />
                      <Text className="text-slate-100 text-sm mt-1">{formattedDate}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.errorText}>Image not available</Text>
              )}

              <View className="bg-primary" style={styles.description}>
                <Text className="text-slate-50 text-lg tracking-tighter">{data?.post_title}</Text>
                {data.post_content && (
                  <RenderHTML
                    contentWidth={Dimensions.get('window').width}
                    source={{ html: data.post_content }}
                    tagsStyles={tagsStyles}
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const tagsStyles = {
  p: {
    marginVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E8F0',
  },
  ul: {
    marginVertical: 1,
    paddingLeft: 20,
    color: '#E2E8F0',
  },
  li: {
    marginTop: -3,
    fontSize: 16,
    marginLeft: 2,
    lineHeight: 32,
    color: '#E2E8F0',
  },
  img: {
    width: 250,
    height: 250,
  },
  a: {
    color: 'white',
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161622',
  },
  scrollViewContent: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width,
    height: 400,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageText: {
    position: 'absolute',
    bottom: 45,
    left: 10,
  },
  description: {
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
    top: -30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161622',
  },
});

export default Details;


