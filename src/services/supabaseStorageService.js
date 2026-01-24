import { supabase } from '../config/supabase';

class SupabaseStorageService {
  async uploadImage(file, bucket = 'images', folder = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files, bucket = 'images', folder = '') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, bucket, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  async deleteImage(path, bucket = 'images') {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async deleteMultipleImages(paths, bucket = 'images') {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw error;
    }
  }

  getPublicUrl(path, bucket = 'images') {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async listFiles(folder = '', bucket = 'images') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}

export default new SupabaseStorageService();
