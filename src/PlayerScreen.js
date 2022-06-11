import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Image,
  FlatList,
  Dimensions,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import TrackPlayer, {
  Capability,
  useTrackPlayerEvents,
  usePlaybackState,
  TrackPlayerEvents,
  STATE_PLAYING,
  Event,
} from 'react-native-track-player';

// import songs from './data';
import Controller from './Controller';
import SliderComp from './SliderComp';
import HeaderButtons from './GetSongs';
import pictures from '../assets/picture.js';

import {PLAYBACK_TRACK_CHANGED} from 'react-native-track-player/lib/eventTypes';
import {NodePath} from '@babel/core';

const RNFS = require('react-native-fs');

const {width, height} = Dimensions.get('window');

// const events = [
//   TrackPlayerEvents.PLAYBACK_STATE,
//   TrackPlayerEvents.PLAYBACK_ERROR
// ];

const TRACK_PLAYER_CONTROLS_OPTS = {
  waitforBuffer: true,
  stopWithApp: false,
  alwaysPauseOnInterruption: true,
  capabilities: [
    TrackPlayer.CAPABILITY_PLAY,
    TrackPlayer.CAPABILITY_PAUSE,
    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
    TrackPlayer.CAPABILITY_SEEK_TO,
  ],
  compactCapabilities: [
    TrackPlayer.CAPABILITY_PLAY,
    TrackPlayer.CAPABILITY_PAUSE,
    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
  ],
};

export default function PlayerScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const slider = useRef(null);
  const simpleSlider = useRef(null);
  const isPlayerReady = useRef(false);
  const index = useRef(0);
  const [songIndex, setSongIndex] = useState(0);
  const [openPlayList, setOpenPlayList] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [songList, setSongList] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [randomMode, setRandomMode] = useState(false);
  const isItFromUser = useRef(true);

  // for tranlating the album art
  const position = useRef(Animated.divide(scrollX, width)).current;
  const playbackState = usePlaybackState();
  const readFile = async () => {
    var path =
      RNFS.ExternalStorageDirectoryPath + '/Download/music/data.json';

    return RNFS.readFile(path, 'utf8')
      .then(data => {
        // console.log('songListHere', data);
        return data;
      })
      .catch(err => {
        console.log(err.message);
      });
  };
  // const readIcons = async () => {
  //   var path =
  //     RNFS.ExternalStorageDirectoryPath +
  //     '/Download/assets/album-arts/icons.json';

  //   return RNFS.readFile(path, 'utf8')
  //     .then(data => {
  //       console.log('songListHere', data);
  //       return data;
  //     })
  //     .catch(err => {
  //       console.log(err.message);
  //     });
  // };

  const updateSongLists = () => {
    TrackPlayer.setupPlayer().then(async () => {
      let data = await readFile();
      const songList = JSON.parse(data);
      setSongList(songList);
      setSelectedIndex(0);
      await TrackPlayer.add(songList);
      await TrackPlayer.play();
      isPlayerReady.current = true;
    });
  };

  // const initialSongLists = async () => {
  //   TrackPlayer.setupPlayer().then(async () => {
  //     setSongList(orignalSongList);
  //     await TrackPlayer.add(orignalSongList);
  //   });
  //   let originalId = songList[songIndex + 1].originalId;
  //   console.log('originalId', originalId - 1);
  //   selectSong(originalId);
  // };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      array[j].id = array[i].id.toString();
      array[i].id = [j + 1].toString();
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  const randomSongLists = () => {
    TrackPlayer.setupPlayer().then(async () => {
      const randomSongList = shuffleArray(songList.slice());
      console.log('randomSongList', randomSongList);
      setSongList(randomSongList);
      await TrackPlayer.add(randomSongList);
      await TrackPlayer.play();
      isPlayerReady.current = true;
    });
  };

  useEffect(() => {
    if (!openPlayList && slider.current) {
      // console.log('selectedIndex', selectedIndex);
      // console.log('HelloThere', index.current * width);
      slider.current.scrollToOffset({
        offset: selectedIndex * width,
      });
      setSongIndex(selectedIndex);
    }
  }, [openPlayList]);

  useEffect(() => {
    // position.addListener(({value}) => {
    //   console.log(value);
    // });

    setSongIndex(selectedIndex);

    scrollX.addListener(async ({value}) => {
      // console.log('value', value);
      // console.log('index', index.current);
      const val = Math.round(value / width);
      const integerVal = value / width;
      // const trackId = (await TrackPlayer.getCurrentTrack()) - 1; //get the current id
      if (integerVal === val) {
        // setSelectedIndex(val);
        setSongIndex(val);
      }
    });

    // scrollX.addListener(({value}) => {
    //   console.log('value', value);

    // const val = Math.round(value / width);
    // const integerVal = value / width;
    // if (integerVal === val) {
    //   console.log('val',val);
    //   setSongIndex(val);
    // }
    // });

    TrackPlayer.setupPlayer().then(async () => {
      // The player is ready to be used
      // console.log('Player ready');
      // add the array of songs in the playlist
      await TrackPlayer.reset();
      let data = await readFile();
      const songList = JSON.parse(data);
      setSongList(songList);
      await TrackPlayer.add(songList);
      TrackPlayer.play();
      isPlayerReady.current = true;

      await TrackPlayer.updateOptions(TRACK_PLAYER_CONTROLS_OPTS);

      //add listener on track change
      TrackPlayer.addEventListener(PLAYBACK_TRACK_CHANGED, async e => {
        console.log('song ended', e);
        const trackId = (await TrackPlayer.getCurrentTrack()) - 1; //get the current id
        let selectedPhoto = getRandomInt(pictures.length, 0);
        setPhotoIndex(selectedPhoto);
        setSelectedIndex(trackId);

        if (e.track && e.nextTrack === null) {
          selectSong(1);
        } else {
          if (trackId !== index.current) {
            isItFromUser.current = false;
            if (trackId > index.current) {
              goNext();
            } else {
              goPrv();
            }
            setTimeout(() => {
              isItFromUser.current = true;
            }, 2000);
          }
        }

        isPlayerReady.current = true;
      });

      // monitor intterupt when other apps start playing music
      TrackPlayer.addEventListener(TrackPlayerEvents.REMOTE_DUCK, e => {
        // console.log(e);
        if (e.paused) {
          // if pause true we need to pause the music
          TrackPlayer.pause();
        } else {
          TrackPlayer.play();
        }
      });
    });

    return () => {
      scrollX.removeAllListeners();
      TrackPlayer.destroy();
      // exitPlayer();
    };
  }, [scrollX]);

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  const getRandom = async () => {
    if (slider && slider.current && slider.current.scrollToOffset) {
      let randomNumber = getRandomInt(0, songList.length);
      while (randomNumber === songIndex) {
        randomNumber = getRandomInt(0, songList.length);
      }

      // console.log('randomNumber', randomNumber);
      slider.current.scrollToOffset({
        offset: randomNumber * width,
      });
      setSongIndex(randomNumber);
      await TrackPlayer.play();
    }
  };

  // change the song when index changes
  useEffect(() => {
    // if (randomMode && !openPlayList) {
    //   let randomNumber = getRandomInt(0, songList.length);
    //   TrackPlayer.skip(
    //     songList[randomNumber] ? songList[randomNumber].id : null,
    //   )
    //     .then(_ => {
    //       console.log('changed track');
    //     })
    //     .catch(e => console.log('error in changing track ', e));

    //   setSelectedIndex(randomNumber);
    //   index.current = randomNumber;
    // } else
    //  {

    if (isPlayerReady.current && isItFromUser.current) {
      TrackPlayer.skip(songList[songIndex] ? songList[songIndex].id : null)
        .then(_ => {
          console.log('changed track');
        })
        .catch(e => console.log('error in changing track ', e));

      setSelectedIndex(songIndex);
      index.current = songIndex;
    }

    // }
  }, [songIndex]);

  const goNext = async () => {
    if (randomMode && !openPlayList) {
      getRandom();
    } else if (index.current + 1 === songList.length) {
      selectSong(1);
    } else {
      if (slider && slider.current && slider.current.scrollToOffset) {
        slider.current.scrollToOffset({
          offset: (index.current + 1) * width,
        });
        setSongIndex(index.current + 1);
        await TrackPlayer.play();
      }
    }
  };

  const goPrv = async () => {
    if (randomMode && !openPlayList) {
      getRandom();
    } else if (index.current - 1 === -1) {
      selectSong(songList.length);
    } else {
      if (slider && slider.current && slider.current.scrollToOffset) {
        slider.current.scrollToOffset({
          offset: (index.current - 1) * width,
        });
        setSongIndex(index.current - 1);
        await TrackPlayer.play();
      }
    }
  };

  const selectSong = async key => {
    // console.log('key', key);
    setSelectedIndex(key);
    index.current = key - 1;
    setSongIndex(key - 1);
    await TrackPlayer.play();
  };

  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });

  const renderAnimatedItem = ({index, item}) => {
    return (
      <Animated.View
        style={{
          alignItems: 'center',
          width: width,
          transform: [
            {
              translateX: Animated.multiply(
                Animated.add(position, -index),
                -100,
              ),
            },
          ],
        }}>
        <Animated.Image
          source={pictures[photoIndex].artwork}
          style={{width: 320, height: 320, borderRadius: 5}}
        />
      </Animated.View>
    );
  };

  const renderItem = ({index, item}) => {
    return (
      <TouchableOpacity onPress={() => selectSong(item ? item.id : 0)}>
        <Text key={item.id} style={styles.listText}>
          {item ? (item.title ? item.title.split('-', 1) : null) : null}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderButtons onUpdate={updateSongLists} openPlayList={openPlayList} />
      {songList.length > 0 ? (
        <>
          <SafeAreaView style={{height: 320}}>
            <Animated.FlatList
              ref={slider}
              horizontal
              pagingEnabled
              scrollToOverflowEnabled={true}
              initialNumToRender={songList.length}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              data={songList}
              renderItem={renderAnimatedItem}
              keyExtractor={item => item.id}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {x: scrollX},
                    },
                  },
                ],
                {useNativeDriver: true},
              )}
            />
          </SafeAreaView>
          <SliderComp />
          {!openPlayList && (
            <View>
              <Text style={styles.title}>
                {songList[selectedIndex]
                  ? songList[selectedIndex].title
                    ? songList[selectedIndex].title.split('-', 1)
                    : null
                  : null}
              </Text>
              <Text style={styles.title}>
                {songList[selectedIndex]
                  ? songList[selectedIndex].title
                    ? songList[selectedIndex].title.split('-', 2)[1]
                      ? songList[selectedIndex].title
                          .split('-', 2)[1]
                          .split('.', 1)
                      : null
                    : null
                  : null}
              </Text>
            </View>
          )}
          {openPlayList && (
            <SafeAreaView style={{height: 122}}>
              <FlatList
                ref={simpleSlider}
                getItemLayout={getItemLayout}
                vertical
                // pagingEnabled
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                data={songList}
                renderItem={renderItem}
                keyExtractor={item => item.id}
              />
            </SafeAreaView>
          )}
        </>
      ) : (
        <View>
          <Image
            source={pictures[0].artwork}
            style={{width: 320, height: 320, borderRadius: 5}}
          />
        </View>
      )}
      <Controller
        onNext={goNext}
        onPrv={goPrv}
        openPlayList={openPlayList}
        setOpenPlayList={setOpenPlayList}
        setRandomMode={() => {
          if (!randomMode) {
            randomSongLists();
          } else {
            updateSongLists();
          }

          setRandomMode(!randomMode);
        }}
        randomMode={randomMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#ffffff',
  },
  artist: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  container: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: height,
    maxHeight: 600,
  },
  listText: {
    fontSize: 20,
    height: 40,
    textAlignVertical: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#ffffff',
  },
});
