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


const Details = () => {
  const { ID } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://sarvail.net/wp-json/ds-custom_endpoints/v1/posts/${ID}`);
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
    router.push('home')
  }
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </View>
        ) : (
          data && (
            <View style={styles.contentContainer} className='bg-primary'>
              {data?.featured_image?.large ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: data.featured_image.large }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                    style={styles.gradient}
                  />
                  <View style={styles.imageText} className='flex flex-col'>
                    <View className='self-start bg-gray-600 opacity-60 p-2 rounded-3xl relative -top-44' >
                      <Icons name="chevron-left" className="bg-slate-600 p-3 self-start" size={20} color="white" onPress={handleBackStep} />
                    </View>
                    <Text className='bg-secondary-100 text-slate-50 p-2 rounded-3xl font-semibold self-start my-0 opacity-80 text-xs'>{data?.categories[0]?.name}</Text>
                    <Text className='text-slate-50 text-2xl font-semibold leading-6 mt-1' numberOfLines={2}>{data?.post_title}</Text>
                    <View className='flex flex-row items-center gap-1'>
                      <Icons2 name="clockcircleo" className="bg-slate-600 p-3 self-start" size={12} color="white" onPress={handleBackStep} />
                      <Text className='text-slate-100 text-sm mt-1'>{formattedDate}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.errorText}>Image not available</Text>
              )}

              {/* Render HTML content */}
              <View className='bg-primary' style={styles.description}>

                {data.post_content && (
                  <RenderHTML
                    contentWidth={Dimensions.get('window').width}
                    source={{ html: data.post_content }}
                    tagsStyles={tagsStyles}
                  />
                )}
              </View>
            </View>
          )
        )}
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light' />
    </View>
  );
};

const tagsStyles = {
  p: {
    marginVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E8F0'
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
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
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
    // borderRadius: 0,
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    position: 'relative',
    top: -30
  }
});

export default Details;
