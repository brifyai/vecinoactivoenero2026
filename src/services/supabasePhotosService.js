import { supabase } from '../config/supabase';

class SupabasePhotosService {
  async getAlbums(userId = null, neighborhoodId = null) {
    let query = supabase
      .from('photo_albums')
      .select(`
        *,
        owner:users!photo_albums_owner_id_fkey(id, name, avatar),
        photos:photos(count)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('owner_id', userId);
    }

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createAlbum(albumData) {
    const { data, error } = await supabase
      .from('photo_albums')
      .insert([{
        title: albumData.title,
        description: albumData.description || null,
        owner_id: albumData.ownerId,
        neighborhood_id: albumData.neighborhoodId,
        privacy: albumData.privacy || 'publico',
        cover_photo: albumData.coverPhoto || null
      }])
      .select(`*, owner:users!photo_albums_owner_id_fkey(id, name, avatar)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateAlbum(albumId, updates, userId) {
    const { data: album } = await supabase
      .from('photo_albums')
      .select('owner_id')
      .eq('id', albumId)
      .single();

    if (!album || album.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('photo_albums')
      .update(updates)
      .eq('id', albumId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAlbum(albumId, userId) {
    const { data: album } = await supabase
      .from('photo_albums')
      .select('owner_id')
      .eq('id', albumId)
      .single();

    if (!album || album.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('photo_albums')
      .delete()
      .eq('id', albumId);

    if (error) throw error;
    return true;
  }

  async getPhotos(albumId = null, userId = null) {
    let query = supabase
      .from('photos')
      .select(`
        *,
        uploader:users!photos_uploader_id_fkey(id, name, avatar),
        album:photo_albums(id, title)
      `)
      .order('created_at', { ascending: false });

    if (albumId) {
      query = query.eq('album_id', albumId);
    }

    if (userId) {
      query = query.eq('uploader_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async uploadPhoto(photoData) {
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        url: photoData.url,
        caption: photoData.caption || null,
        uploader_id: photoData.uploaderId,
        album_id: photoData.albumId || null,
        neighborhood_id: photoData.neighborhoodId,
        tags: photoData.tags || []
      }])
      .select(`*, uploader:users!photos_uploader_id_fkey(id, name, avatar)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updatePhoto(photoId, updates, userId) {
    const { data: photo } = await supabase
      .from('photos')
      .select('uploader_id')
      .eq('id', photoId)
      .single();

    if (!photo || photo.uploader_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePhoto(photoId, userId) {
    const { data: photo } = await supabase
      .from('photos')
      .select('uploader_id')
      .eq('id', photoId)
      .single();

    if (!photo || photo.uploader_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
    return true;
  }
}

export default new SupabasePhotosService();
