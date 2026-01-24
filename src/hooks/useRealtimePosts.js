import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import realtimeService from '../services/supabaseRealtimeService';
import { addPost, updatePost as updatePostAction, removePost } from '../store/slices/postsSlice';

/**
 * Hook para subscribirse a cambios en posts en tiempo real
 */
export const useRealtimePosts = (enabled = true) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    console.log('📡 Iniciando subscripción a posts...');

    // Subscribirse a todos los cambios en posts
    const channelName = realtimeService.subscribe('posts', (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          console.log('📡 Nuevo post:', newRecord);
          dispatch(addPost(newRecord));
          break;
        case 'UPDATE':
          console.log('📡 Post actualizado:', newRecord);
          dispatch(updatePostAction(newRecord));
          break;
        case 'DELETE':
          console.log('📡 Post eliminado:', oldRecord);
          dispatch(removePost(oldRecord.id));
          break;
        default:
          break;
      }
    });

    // Cleanup: cancelar subscripción al desmontar
    return () => {
      console.log('📡 Cancelando subscripción a posts...');
      realtimeService.unsubscribe(channelName);
    };
  }, [enabled, dispatch]);
};
