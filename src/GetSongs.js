import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
const RNFS = require('react-native-fs');
import Icon from 'react-native-vector-icons/MaterialIcons';
import TwiceIcon from '../assets/twiceIcon.png';

export default function HeaderButtons({onUpdate, openPlayList}) {
  // require the module

  const getPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
    } catch (err) {
      console.warn(err);
    }
    const readGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    const writeGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (!readGranted || !writeGranted) {
      console.log('Read and write permissions have not been granted');
      return;
    }
  };

  const createSongList = async () => {
    RNFS.readDir(RNFS.ExternalStorageDirectoryPath + '/Download/music')
      .then(results => {
        let list = null;
        list = results.find(result => result.name === 'data.json');
        if (list) {
          deleteFile();
          getData();
        } else {
          getData();
        }
      })
      .then(() => {
        onUpdate();
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };

  const getData = async () => {
    RNFS.readDir(RNFS.ExternalStorageDirectoryPath + '/Download/music')
      .then(result => {
        console.log('GOT RESULT', result);
        console.log('result[0].name', result[0].name);

        let songs = [];
        result.map((item, i) => {
          let sortedItem = null;

          sortedItem = {
            title: item.name,
            url: item.path,
            id: JSON.stringify(++i),
            // originalId: ++i,
          };
          songs.push(sortedItem);
        });
        console.log('songs', songs);

        RNFS.writeFile(
          RNFS.ExternalStorageDirectoryPath + '/Download/music/data.json',
          JSON.stringify(songs),
          'utf8',
        )
          .then(success => {
            console.log('Success', success);
          })
          .catch(err => {
            console.log(err.message);
          });
        return result[0].name;
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };
  
  const deleteFile = async () => {
    var path = RNFS.ExternalStorageDirectoryPath + '/Download/music/data.json';

    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED');
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  };

  const getSongList = () => {
    getPermissions();
    createSongList();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.slogan}>
      風曉夢
      </Text> */}
      {/* <Image source={QIcon} style={styles.twiceIcon} /> */}

      {openPlayList ? (
        <TouchableOpacity onPress={getSongList}>
          <Icon color="#fff" name="refresh" size={45} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity disabled>
          <Icon color="black" name="refresh" size={45} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slogan: {
    width: 255,
    fontSize: 15,
    textAlign: 'left',
    textTransform: 'capitalize',
    fontWeight: 'bold',
    color: 'rgb(247,202,201)',
  },
  twiceIcon: {
    width: 70,
    height: 70,
  },
});
