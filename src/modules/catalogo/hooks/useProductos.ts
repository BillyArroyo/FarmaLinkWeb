import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export interface ProductoSupabase {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  precio_credito: number | null;
  oferta: string | null;
  imagenes_urls: string[] | null;
  imagen_cargada: boolean;
  activo: boolean;
}

const STORAGE_BASE = 'https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos';
const EMPRESA = 'CanaanFarma';

export function imgUrl(id: string, imagenes_urls?: string[] | null): string {
  if (imagenes_urls?.[0]) return imagenes_urls[0];
  // Fallback por convención de nombre: intenta .webp primero (formato actual del storage)
  return `${STORAGE_BASE}/${EMPRESA}/${id}.webp`;
}

// Devuelve la URL alternativa cuando la principal falla (png → webp o viceversa)
export function imgUrlFallback(failedSrc: string, id: string): string | null {
  if (failedSrc.endsWith('.webp')) return `${STORAGE_BASE}/${EMPRESA}/${id}.png`;
  if (failedSrc.endsWith('.png'))  return `${STORAGE_BASE}/${EMPRESA}/${id}.webp`;
  return null;
}

export function useProductos() {
  const [productos, setProductos] = useState<ProductoSupabase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, precio_credito, oferta, imagenes_urls, imagen_cargada, activo')
      .eq('activo', true)
      .order('laboratorio')
      .then(({ data, error }) => {
        if (error) console.error('useProductos:', error.message);
        if (data) setProductos(data as ProductoSupabase[]);
        setLoading(false);
      });
  }, []);

  return { productos, loading };
}
