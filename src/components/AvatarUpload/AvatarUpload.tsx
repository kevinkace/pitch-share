"use client";

import { useState, useCallback, useRef } from "react";
import { Button, Flex, Text, Dialog, Box } from "@radix-ui/themes";
import { CameraIcon } from "@radix-ui/react-icons";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop/types";

import UserAvatar from "@/components/UserAvatar/UserAvatar";

import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useAuth } from "@/lib/contexts/AuthContext";

import styles from "./AvatarUpload.module.css";

interface CropData {
  pixels: Area;
  croppedAreaPixels: Area;
}

export function AvatarUpload() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCropData({ pixels: croppedArea, croppedAreaPixels });
  }, []);

  const createCroppedImage = useCallback(async (): Promise<Blob> => {
    if (!imageSrc || !cropData) {
      throw new Error('No image or crop data available');
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        const { croppedAreaPixels } = cropData;

        // Set canvas size to desired output size (300x300 for avatars)
        const outputSize = 300;
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Draw cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          outputSize,
          outputSize
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to blob conversion failed'));
            }
          },
          'image/jpeg',
          0.9
        );
      };
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = imageSrc;
    });
  }, [imageSrc, cropData]);

  const handleUpload = async () => {
    if (!user || !selectedFile || !cropData) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create cropped image
      const croppedBlob = await createCroppedImage();

      const supabase = createClient();
      const fileExt = 'jpg'; // Always save as JPEG after cropping
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (profile?.avatar_url) {
        const existingPath = profile.avatar_url.split('/').pop();
        if (existingPath && existingPath.includes(user.id)) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`]); // Remove both possible formats
        }
      }

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update or create profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Refresh profile data
      await refreshProfile();

      // Close dialog and reset state
      setIsOpen(false);
      setSelectedFile(null);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropData(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropData(null);
    setError(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <>
      <Flex direction="column" gap="3" align="center">
        <UserAvatar profile={profile} size="9"/>

        <Button
          variant="outline"
          size="3"
          onClick={() => fileInputRef.current?.click()}
        >
          <CameraIcon />
          {currentAvatar ? 'Change Avatar' : 'Upload Avatar'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />
      </Flex>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content size="4" className={styles.cropDialog}>
          <Dialog.Title>Crop Your Avatar</Dialog.Title>

          {error && (
            <Text color="red" size="2" className={styles.error}>
              {error}
            </Text>
          )}

          {imageSrc && (
            <Box className={styles.cropContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
                cropShape="round"
              />
            </Box>
          )}

          <Flex className={styles.zoomControls} gap="2" align="center">
            <Text size="2">Zoom:</Text>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.zoomSlider}
            />
          </Flex>

          <Flex gap="3" justify="end" className={styles.actions}>
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={handleCancel}>
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !cropData}
              loading={isUploading}
            >
              Upload Avatar
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}