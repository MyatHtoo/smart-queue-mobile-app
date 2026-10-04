import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getShopQueues, getShops } from '../services/api';
import type { Restaurant } from '../constants/types';

export const MAX_QUEUE_DISTANCE_METERS = 1000;

const getQueueCount = (response: any) => {
  const data = response?.data ?? response;
  const queues = Array.isArray(data) ? data : data?.queues ?? data?.data ?? [];
  if (!Array.isArray(queues)) return Number(data?.activeQueueCount ?? data?.count ?? 0) || 0;
  const finished = new Set(['completed', 'complete', 'cancelled', 'canceled', 'served', 'done', 'expired']);
  return queues.filter((queue: any) => !finished.has(String(queue?.status ?? '').toLowerCase())).length;
};

export const distanceInMeters = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const radius = 6371e3;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const formatDistance = (meters?: number) => {
  if (meters == null) return 'Location unavailable';
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
};

const labelFromValue = (value: any): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (!value || typeof value !== 'object') return '';
  return String(value.name ?? value.shopTypeName ?? value.title ?? value.label ?? value.type ?? '');
};

export function useNearbyShops() {
  const [shops, setShops] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const granted = permission.status === 'granted';
      setLocationStatus(granted ? 'granted' : 'denied');
      const position = granted ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }) : null;
      const response = await getShops();
      const items = (Array.isArray(response) ? response : response?.data ?? response?.shops ?? []) as any[];

      const mapped = await Promise.all(items.map(async (shop): Promise<Restaurant> => {
        const id = String(shop?._id ?? shop?.id ?? shop?.shopId ?? '');
        const coordinates = shop?.address?.location?.coordinates;
        const longitude = Number(coordinates?.[0] ?? shop?.longitude);
        const latitude = Number(coordinates?.[1] ?? shop?.latitude);
        const hasShopLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
        const distanceMeters = position && hasShopLocation
          ? distanceInMeters(position.coords.latitude, position.coords.longitude, latitude, longitude)
          : undefined;
        let queueCount = 0;
        if (id) {
          try { queueCount = getQueueCount(await getShopQueues(id)); } catch { /* keep shop visible */ }
        }
        const type = Array.isArray(shop?.shopTypes)
          ? shop.shopTypes.map(labelFromValue).filter(Boolean).join(' • ')
          : labelFromValue(shop?.shopType ?? shop?.shopTypes);
        const address = typeof shop?.address === 'string'
          ? shop.address
          : labelFromValue(shop?.address?.fullAddress ?? shop?.address?.addressLine ?? shop?.address?.name);
        return {
          id,
          name: shop?.name ?? shop?.title ?? 'Unnamed shop',
          cuisine: shop?.description ? String(shop.description) : String(shop?.cuisine ?? shop?.type ?? 'Restaurant'),
          shopType: type,
          distance: formatDistance(distanceMeters),
          distanceMeters,
          isWithinServiceArea: granted && distanceMeters != null && distanceMeters <= MAX_QUEUE_DISTANCE_METERS,
          locationAvailable: granted && hasShopLocation,
          waitInfo: String(queueCount),
          image: shop?.shopImg ? { uri: shop.shopImg } : require('../../assets/images/Thai.jpg'),
          tableTypes: Array.isArray(shop?.tableTypes)
            ? shop.tableTypes
            : Array.isArray(shop?.table_types)
              ? shop.table_types
              : Array.isArray(shop?.tables)
                ? shop.tables
                : [],
          address,
          phoneNumber: shop?.phoneNumber ?? '',
        };
      }));
      mapped.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
      setShops(mapped);
    } catch (reason: any) {
      setLocationStatus('error');
      setError(reason?.message ?? 'Unable to load nearby shops.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { shops, loading, refreshing, locationStatus, error, reload: () => load(true) };
}
