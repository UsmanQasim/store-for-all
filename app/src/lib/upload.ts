import { decode } from 'base64-arraybuffer';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

type PickOptions = { aspect?: [number, number]; maxWidth?: number };

/**
 * Uses the system photo picker (no READ_MEDIA_* permission required on
 * Android 13+, which keeps us clear of Play's photo/video permission policy).
 */
export async function pickImage({ aspect = [1, 1], maxWidth = 1080 }: PickOptions = {}): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 1,
  });
  if (res.canceled || !res.assets[0]) return null;
  const asset = res.assets[0];
  const ctx = ImageManipulator.manipulate(asset.uri);
  if ((asset.width ?? 0) > maxWidth) ctx.resize({ width: maxWidth });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ compress: 0.72, format: SaveFormat.JPEG, base64: true });
  return out.base64 ?? null;
}

/** Uploads to media/<uid>/<folder>/<timestamp>.jpg and returns the public URL. */
export async function uploadImage(base64: string, folder: string): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('auth_required');
  const path = `${uid}/${folder}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('media').upload(path, decode(base64), {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

export async function pickAndUpload(folder: string, opts?: PickOptions): Promise<string | null> {
  const b64 = await pickImage(opts);
  return b64 ? uploadImage(b64, folder) : null;
}

/** Removes every file the user uploaded — called before account deletion. */
export async function deleteAllMyMedia(uid: string) {
  const bucket = supabase.storage.from('media');
  const walk = async (prefix: string): Promise<string[]> => {
    const { data } = await bucket.list(prefix, { limit: 1000 });
    const out: string[] = [];
    for (const entry of data ?? []) {
      const full = `${prefix}/${entry.name}`;
      if (entry.id) out.push(full);
      else out.push(...(await walk(full)));
    }
    return out;
  };
  const files = await walk(uid);
  for (let i = 0; i < files.length; i += 100) await bucket.remove(files.slice(i, i + 100));
}
