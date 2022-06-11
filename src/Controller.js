import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {usePlaybackState} from 'react-native-track-player';

export default function Controller({
  onNext,
  onPrv,
  openPlayList,
  setOpenPlayList,
  setRandomMode,
  randomMode,
}) {
  const playbackState = usePlaybackState();
  const isPlaying = useRef('paused'); //paused play loading
  let [disabled, setDisabled] = useState(false);

  useEffect(() => {
    // console.log('Player State', playbackState);

    //set the player state
    if (playbackState === 'playing' || playbackState === 3) {
      isPlaying.current = 'playing';
    } else if (playbackState === 'paused' || playbackState === 2) {
      isPlaying.current = 'paused';
    } else {
      isPlaying.current = 'loading';
    }
  }, [playbackState]);

  const returnPlayBtn = () => {
    switch (isPlaying.current) {
      case 'playing':
        return <Icon color="#fff" name="pause" size={45} />;
      case 'paused':
        return <Icon color="#fff" name="play-arrow" size={45} />;
      default:
        return <ActivityIndicator size={45} color="#fff" />;
    }
  };

  const onPlayPause = () => {
    if (isPlaying.current === 'playing') {
      TrackPlayer.pause();
    } else if (isPlaying.current === 'paused') {
      TrackPlayer.play();
    }
  };

  return (
    <>
      <View style={styles.tools}>
        {setRandomMode && (
          <>
            {!openPlayList ? (
              <TouchableOpacity onPress={setRandomMode}>
                <Icon
                  selectable
                  color={randomMode ? '#f1e169' : 'rgb(72,72,72)'}
                  name="shuffle"
                  size={30}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity disabled>
                <Icon color={'black'} name="shuffle" size={30} />
              </TouchableOpacity>
            )}
          </>
        )}
        <TouchableOpacity onPress={() => setOpenPlayList(!openPlayList)}>
          <Icon
            color={openPlayList ? '#f1e169' : 'rgb(72,72,72)'}
            name="queue-music"
            size={30}
          />
        </TouchableOpacity>
      </View>
      {!openPlayList && (
        <View style={styles.container}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => {
              setDisabled(true);
              onPrv();
              setTimeout(() => {
                setDisabled(false);
              }, 2000);
            }}>
            <Icon color="#fff" name="skip-previous" size={45} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPlayPause}>
            {returnPlayBtn()}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={disabled}
            onPress={() => {
              setDisabled(true);
              onNext();
              setTimeout(() => {
                setDisabled(false);
              }, 2000);
            }}>
            <Icon color="#fff" name="skip-next" size={45} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 250,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
  },
});
