import { supabase } from '../config/supabase';
import firebaseNotificationsService from './firebaseNotificationsService';
import hybridSyncService from './hybridSyncService';

export const emergencyService = {
  // Enviar alerta de emergencia
  async sendEmergencyAlert(emergencyData) {
    try {
      console.log('🚨 Enviando alerta de emergencia:', emergencyData);
      
      // 1. Preparar datos para la base de datos
      const emergencyRecord = {
        user_id: emergencyData.isAnonymous ? null : emergencyData.userId,
        user_name: emergencyData.userName,
        neighborhood_id: emergencyData.neighborhoodId,
        message: emergencyData.message,
        location: emergencyData.location,
        timestamp: emergencyData.timestamp,
        status: 'active',
        type: 'emergency',
        is_anonymous: emergencyData.isAnonymous || false,
        created_at: new Date().toISOString()
      };

      // 2. Guardar en base de datos
      const { data: emergency, error: dbError } = await supabase
        .from('emergency_alerts')
        .insert(emergencyRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Error guardando emergencia en BD:', dbError);
        throw new Error('Error guardando la emergencia en la base de datos');
      }

      console.log('✅ Emergencia guardada en BD:', emergency.id);

      // 3. Sincronizar a Firebase para realtime
      try {
        await hybridSyncService.syncEmergencyToFirebase({
          ...emergency,
          userName: emergencyData.userName,
          location: emergencyData.location
        });
        console.log('🔄 Emergencia sincronizada a Firebase');
      } catch (syncError) {
        console.error('Error sincronizando emergencia a Firebase:', syncError);
        // Continuar sin sincronización
      }

      // 4. Subir archivo multimedia si existe
      let mediaUrl = null;
      if (emergencyData.mediaFile) {
        try {
          mediaUrl = await this.uploadEmergencyMedia(emergency.id, emergencyData.mediaFile);
          
          // Actualizar registro con URL del archivo
          await supabase
            .from('emergency_alerts')
            .update({ media_url: mediaUrl })
            .eq('id', emergency.id);
            
          console.log('✅ Archivo multimedia subido:', mediaUrl);
        } catch (mediaError) {
          console.error('Error subiendo archivo multimedia:', mediaError);
          // Continuar sin archivo multimedia
        }
      }

      // 5. Obtener todos los residentes de la unidad vecinal
      const { data: residents, error: residentsError } = await supabase
        .from('users')
        .select('id, email, name, fcm_token')
        .eq('neighborhood_id', emergencyData.neighborhoodId)
        .neq('id', emergencyData.userId || 'anonymous'); // Excluir al que envía

      if (residentsError) {
        console.error('Error obteniendo residentes:', residentsError);
        // Continuar sin notificaciones si falla
      }

      // 6. Enviar notificaciones push masivas
      let notificationsSent = 0;
      if (residents && residents.length > 0) {
        console.log(`📱 Enviando notificaciones a ${residents.length} residentes`);
        
        const notificationPromises = residents.map(async (resident) => {
          try {
            // Crear notificación en Firebase
            await firebaseNotificationsService.createNotification({
              userId: resident.id,
              title: '🚨 ALERTA DE EMERGENCIA',
              body: `${emergencyData.userName}: ${emergencyData.message}`,
              type: 'emergency',
              data: {
                emergencyId: emergency.id,
                location: JSON.stringify(emergencyData.location),
                mediaUrl: mediaUrl,
                isAnonymous: emergencyData.isAnonymous
              },
              priority: 'high',
              timestamp: new Date()
            });
            
            notificationsSent++;
            return true;
          } catch (error) {
            console.error(`Error enviando notificación a ${resident.email}:`, error);
            return false;
          }
        });

        await Promise.allSettled(notificationPromises);
        console.log(`✅ ${notificationsSent} notificaciones enviadas`);
      }

      // 7. Notificar a administradores
      try {
        await this.notifyAdministrators(emergency, emergencyData);
      } catch (adminError) {
        console.error('Error notificando administradores:', adminError);
        // Continuar sin notificación a admins
      }

      return {
        success: true,
        emergencyId: emergency.id,
        notificationsSent: notificationsSent,
        mediaUrl: mediaUrl
      };

    } catch (error) {
      console.error('❌ Error enviando alerta de emergencia:', error);
      throw error;
    }
  },

  // Subir archivo multimedia de emergencia
  async uploadEmergencyMedia(emergencyId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `emergency_${emergencyId}_${Date.now()}.${fileExt}`;
      const filePath = `emergencies/${fileName}`;

      // Verificar si el bucket existe, si no, usar un bucket alternativo
      let bucketName = 'emergency-media';
      
      // Intentar subir al bucket de emergencias
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo a emergency-media, intentando con bucket principal:', error);
        // Si falla, intentar con bucket principal
        bucketName = 'uploads';
        const { data: altData, error: altError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (altError) throw altError;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error subiendo archivo multimedia de emergencia:', error);
      throw error;
    }
  },

  // Notificar a administradores
  async notifyAdministrators(emergency, emergencyData) {
    try {
      // Obtener administradores de la unidad vecinal
      const { data: admins, error } = await supabase
        .from('admin_roles')
        .select(`
          user_id,
          users!inner(id, email, name, fcm_token)
        `)
        .eq('neighborhood_id', emergencyData.neighborhoodId)
        .eq('is_active', true);

      if (error) {
        console.error('Error obteniendo administradores:', error);
        return;
      }

      if (!admins || admins.length === 0) {
        console.log('No hay administradores para notificar');
        return;
      }

      // Enviar notificaciones a administradores
      const adminNotifications = admins.map(async (admin) => {
        try {
          await firebaseNotificationsService.createNotification({
            userId: admin.users.id,
            title: '🚨 EMERGENCIA REPORTADA - ADMIN',
            body: `Emergencia en tu unidad vecinal${emergencyData.isAnonymous ? ' (Reporte Anónimo)' : ` por ${emergencyData.userName}`}`,
            type: 'admin_emergency',
            data: {
              emergencyId: emergency.id,
              adminAction: 'review_emergency',
              isAnonymous: emergencyData.isAnonymous
            },
            priority: 'high',
            timestamp: new Date()
          });
          
          return true;
        } catch (error) {
          console.error(`Error notificando admin ${admin.users.email}:`, error);
          return false;
        }
      });

      await Promise.allSettled(adminNotifications);
      console.log(`✅ Administradores notificados: ${admins.length}`);

    } catch (error) {
      console.error('Error notificando administradores:', error);
    }
  },

  // Obtener historial de emergencias
  async getEmergencyHistory(neighborhoodId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select(`
          *,
          users(name, email)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Procesar datos para ocultar información de reportes anónimos
      const processedData = data.map(emergency => ({
        ...emergency,
        user_name: emergency.is_anonymous ? 'Reporte Anónimo' : emergency.user_name,
        users: emergency.is_anonymous ? null : emergency.users
      }));
      
      return processedData;

    } catch (error) {
      console.error('Error obteniendo historial de emergencias:', error);
      throw error;
    }
  },

  // Resolver emergencia (solo administradores)
  async resolveEmergency(emergencyId, resolutionNotes, resolvedBy) {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .update({
          status: 'resolved',
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', emergencyId)
        .select()
        .single();

      if (error) throw error;

      return {
        emergencyId: emergencyId,
        status: 'resolved',
        resolvedBy: resolvedBy,
        resolvedAt: data.resolved_at,
        resolutionNotes: resolutionNotes
      };

    } catch (error) {
      console.error('Error resolviendo emergencia:', error);
      throw error;
    }
  },

  // Obtener estadísticas de emergencias
  async getEmergencyStats(neighborhoodId) {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('status, timestamp, resolved_at')
        .eq('neighborhood_id', neighborhoodId);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(e => e.status === 'active').length,
        resolved: data.filter(e => e.status === 'resolved').length,
        falseAlarm: data.filter(e => e.status === 'false_alarm').length
      };

      // Calcular tiempo promedio de respuesta
      const resolvedEmergencies = data.filter(e => e.status === 'resolved' && e.resolved_at);
      if (resolvedEmergencies.length > 0) {
        const totalResponseTime = resolvedEmergencies.reduce((sum, emergency) => {
          const created = new Date(emergency.timestamp);
          const resolved = new Date(emergency.resolved_at);
          return sum + (resolved - created);
        }, 0);
        
        stats.averageResponseTime = Math.round(totalResponseTime / resolvedEmergencies.length / 1000 / 60); // en minutos
      } else {
        stats.averageResponseTime = 0;
      }

      return stats;

    } catch (error) {
      console.error('Error obteniendo estadísticas de emergencias:', error);
      throw error;
    }
  }
};