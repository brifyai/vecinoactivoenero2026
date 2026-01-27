import { supabase } from '../config/supabase';

class SupabasePhotosService {
  async getAlbums(userId = null) {
    let query = supabase
      .from('photo_albums')
      .select(`
        *,
        owner:users!photo_albums_user_id_fkey(id, username, avatar)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Contar fotos por álbum
    const albumsWithCount = await Promise.all(
      (data || []).map(async (album) => {
        const { count } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('album_id', album.id);
        return { ...album, photo_count: count || 0 };
      })
    );
    
    return albumsWithCount;
  }

  async createAlbum(albumData) {
    const { data, error } = await supabase
      .from('photo_albums')
      .insert([{
        name: albumData.name,
        description: albumData.description || null,
        user_id: albumData.userId,
        cover_photo: albumData.coverPhoto || null
      }])
      .select(`*, owner:users!photo_albums_user_id_fkey(id, username, avatar)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateAlbum(albumId, updates, userId) {
    const { data: album } = await supabase
      .from('photo_albums')
      .select('user_id')
      .eq('id', albumId)
      .single();

    if (!album || album.user_id !== userId) {
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
      .select('user_id')
      .eq('id', albumId)
      .single();

    if (!album || album.user_id !== userId) {
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
        uploader:users!photos_user_id_fkey(id, username, avatar),
        album:photo_albums(id, name)
      `)
      .order('uploaded_at', { ascending: false });

    if (albumId) {
      query = query.eq('album_id', albumId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
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
        user_id: photoData.userId,
        album_id: photoData.albumId || null,
        tags: photoData.tags || []
      }])
      .select(`
        *,
        uploader:users!photos_user_id_fkey(id, username, avatar),
        album:photo_albums(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updatePhoto(photoId, updates, userId) {
    const { data: photo } = await supabase
      .from('photos')
      .select('user_id')
      .eq('id', photoId)
      .single();

    if (!photo || photo.user_id !== userId) {
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
      .select('user_id')
      .eq('id', photoId)
      .single();

    if (!photo || photo.user_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
    return true;
  }

  // Subir archivo a Supabase Storage
  async uploadFile(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}

export default new SupabasePhotosService();
