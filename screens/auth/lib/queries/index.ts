import * as MediaLibrary from 'expo-media-library';

export const QUERIES = {
  getPhotos: async function (first = 10) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return result.assets;
  },
  getLocalUri: async function (id: string) {
    const info = await MediaLibrary.getAssetInfoAsync(id);

    return info;
  },
};
