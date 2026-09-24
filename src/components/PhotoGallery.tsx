import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, ChevronLeft, ChevronRight, X, Sparkles, Upload } from 'lucide-react';

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  isCustom?: boolean;
}

// Curated collection reflecting Sofía's style (corset, sparkle skirt, Clahe Eventos ambient blue lighting, outdoor golden hour)
const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
    caption: 'Book de 15 • Noche de Gala',
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    caption: 'Sonrisas que iluminan • Mis 15',
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
    caption: 'Clahe Eventos • Luces y Elegancia',
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
    caption: 'Atardecer mágico al aire libre',
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80',
    caption: 'Momentos únicos antes de la fiesta',
  },
  {
    id: 'p6',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80',
    caption: 'Celebrando los 15 con el corazón',
  },
];

const LOCAL_PHOTOS_KEY = 'sofia_custom_photos_v1';

export const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_PHOTOS_KEY);
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        if (Array.isArray(custom) && custom.length > 0) {
          setPhotos([...custom, ...DEFAULT_PHOTOS]);
        }
      } catch (e) {
        console.warn('Failed to parse custom photos', e);
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: PhotoItem = {
            id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            url: event.target.result as string,
            caption: 'Foto de Sofía • Clahe Eventos',
            isCustom: true,
          };
          setPhotos((prev) => {
            const updated = [newPhoto, ...prev];
            // save up to 10 custom photos
            const customOnly = updated.filter((p) => p.isCustom).slice(0, 10);
            localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(customOnly));
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-3">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Book de Fotos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
            Galería de Recuerdos
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Un recorrido por los momentos más hermosos previos a esta noche tan soñada.
          </p>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8">
          {photos.slice(0, 6).map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(index)}
              className="group relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden cursor-pointer border border-amber-400/25 bg-[#121632] shadow-xl transform transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-blue-900/30"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b17] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

              {/* Caption */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-left translate-y-1 group-hover:translate-y-0 transition-transform">
                <p className="text-xs sm:text-sm font-medium text-white line-clamp-1 drop-shadow-md">
                  {photo.caption}
                </p>
                <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Ver en pantalla completa</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Button for Sofía & Family */}
        <div className="text-center">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151b3a] hover:bg-[#1d2550] text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-400/30 hover:border-amber-400 shadow-md cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Subir fotos del book de Sofía</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <p className="text-[11px] text-slate-400 mt-2">
            Podés agregar más fotos del book tomadas en Clahe Eventos para verlas en la galería
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
        >
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
          >
            <img
              src={photos[selectedPhotoIndex].url}
              alt={photos[selectedPhotoIndex].caption}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain border border-amber-400/30 shadow-2xl"
            />
            <p className="mt-3 text-sm font-medium text-amber-200">
              {photos[selectedPhotoIndex].caption} ({selectedPhotoIndex + 1} / {photos.length})
            </p>
          </div>

          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};
