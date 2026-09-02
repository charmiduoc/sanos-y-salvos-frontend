// src/components/UiPetForm.tsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Upload, MapPin, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddressSearch } from './AddressSearch';
import petService from '../service/pet.service';
import imageService from '../service/image.service';
import geoService from '../service/geo.service';
import type { Mascota, CrearMascota } from '../types';

interface UiPetFormProps {
  ownerId?: string;
  ownerPhone?: string;
  onSuccess?: (mascota: Mascota) => void;
}

export const UiPetForm: React.FC<UiPetFormProps> = ({ 
  ownerId, 
  ownerPhone,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    color: '',
    size: 'Mediano',
    status: 'LOST' as 'LOST' | 'FOUND' | 'REUNITED',
    description: '',
    lastLocation: {
      latitude: -33.4489,
      longitude: -70.6693,
      address: '',
      street: '',
      houseNumber: '',
      city: '',
      postalCode: ''
    }
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  console.log('UiPetForm - ownerId:', ownerId);
  console.log('UiPetForm - ownerPhone:', ownerPhone);

  const handleLocationSelect = (lat: number, lng: number, address: string, fullAddress: any) => {
    setFormData(prev => ({
      ...prev,
      lastLocation: {
        latitude: lat,
        longitude: lng,
        address: address,
        street: fullAddress?.road || fullAddress?.street || '',
        houseNumber: fullAddress?.house_number || '',
        city: fullAddress?.city || fullAddress?.town || fullAddress?.village || '',
        postalCode: fullAddress?.postcode || ''
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerId) {
      setError('Debes iniciar sesion para reportar una mascota');
      toast.error('Debes iniciar sesion para reportar una mascota');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre de la mascota es obligatorio');
      toast.error('El nombre de la mascota es obligatorio');
      return;
    }

    if (!formData.lastLocation.address && (!formData.lastLocation.latitude || !formData.lastLocation.longitude)) {
      setError('Debes seleccionar una ubicacion');
      toast.error('Debes seleccionar una ubicacion');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageId = null;

      if (selectedImage) {
        try {
          const imageId_temp = `img_${Date.now()}`;
          console.log('Subiendo imagen con ID:', imageId_temp);
          console.log('Archivo:', selectedImage.name, 'Tamaño:', selectedImage.size, 'Tipo:', selectedImage.type);
          
          const imageResponse = await imageService.upload(imageId_temp, selectedImage);
          console.log('Respuesta del servidor:', JSON.stringify(imageResponse, null, 2));
          
          imageId = imageResponse?.imageId || imageResponse?.id || imageId_temp;
          console.log('ImageId final:', imageId);
          
          toast.success('Imagen subida correctamente');
        } catch (imgError: any) {
          console.error('Error al subir imagen:', imgError);
          toast.error('No se pudo subir la imagen. El reporte se creara sin foto.');
        }
      } else {
        console.log('No se selecciono imagen');
      }

      const newPetData: CrearMascota = {
        name: formData.name.trim(),
        species: formData.species || 'Perro',
        breed: formData.breed || '',
        color: formData.color || '',
        size: formData.size || 'Mediano',
        status: formData.status,
        imageId: imageId || undefined,
        ownerId: ownerId,
        description: formData.description || '',
        reportedAt: new Date().toISOString(),
        lastLocation: {
          latitude: formData.lastLocation.latitude || -33.4489,
          longitude: formData.lastLocation.longitude || -70.6693,
          address: formData.lastLocation.address || '',
        }
      };

      console.log('Creando mascota con datos:', JSON.stringify(newPetData, null, 2));

      const createdPet = await petService.create(newPetData);
      console.log('Mascota creada:', createdPet);

      if (createdPet?.id) {
        const ubicacionData = {
          reportId: createdPet.id,
          descripcion: `Mascota ${formData.name} reportada en ${formData.lastLocation.address || 'ubicacion desconocida'}`,
          fechaRegistro: new Date().toISOString(),
          posicion: {
            type: 'Point' as const,
            coordinates: [formData.lastLocation.longitude || -70.6693, formData.lastLocation.latitude || -33.4489]
          }
        };
        
        try {
          await geoService.create(ubicacionData);
          console.log('Ubicacion creada exitosamente');
        } catch (geoError) {
          console.warn('No se pudo crear la ubicacion:', geoError);
        }
      }

      setSuccess(true);
      toast.success('Reporte creado exitosamente');
      
      setFormData({
        name: '',
        species: 'Perro',
        breed: '',
        color: '',
        size: 'Mediano',
        status: 'LOST',
        description: '',
        lastLocation: {
          latitude: -33.4489,
          longitude: -70.6693,
          address: '',
          street: '',
          houseNumber: '',
          city: '',
          postalCode: ''
        }
      });
      setSelectedImage(null);
      setImagePreview(null);

      if (onSuccess) onSuccess(createdPet);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error creating report:', err);
      const errorMessage = err.message || 'Error al crear el reporte. Por favor, intenta nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Reportar Mascota
      </h3>

      {ownerPhone && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 flex items-center gap-3">
          <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Telefono de contacto
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              {ownerPhone}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400">
              Este telefono se mostrara en el reporte para que la comunidad pueda contactarte
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Reporte creado exitosamente
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Foto de la mascota
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <Upload className="h-4 w-4" />
              Subir foto
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                hidden 
              />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Formatos: JPG, PNG, GIF. Tamaño maximo: 5MB
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input
              placeholder="Nombre de la mascota"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especie *</label>
            <select
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            >
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raza</label>
            <input
              placeholder="Raza"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <input
              placeholder="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamaño</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            >
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'LOST' | 'FOUND' | 'REUNITED' })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            >
              <option value="LOST">Perdido</option>
              <option value="FOUND">Encontrado</option>
              <option value="REUNITED">Reunido</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Selecciona si la mascota esta perdida o fue encontrada
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Buscar ubicacion *
          </label>
          <AddressSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Ej: Av. Providencia 1200, Santiago"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Busca por direccion, calle con numero o sector</p>
        </div>

        {formData.lastLocation.address && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Ubicacion seleccionada:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{formData.lastLocation.address}</p>
          </div>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Ingresar coordenadas manualmente (avanzado)
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Latitud</label>
              <input
                type="number"
                step="any"
                placeholder="Latitud"
                value={formData.lastLocation.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastLocation: { ...formData.lastLocation, latitude: parseFloat(e.target.value) }
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Longitud</label>
              <input
                type="number"
                step="any"
                placeholder="Longitud"
                value={formData.lastLocation.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastLocation: { ...formData.lastLocation, longitude: parseFloat(e.target.value) }
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </details>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion *</label>
          <textarea
            placeholder="Describe a tu mascota: senas particulares, color de collar, comportamiento, etc."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !ownerId}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            ownerId ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              {ownerId ? 'Publicar Alerta' : 'Inicia sesion para publicar'}
            </>
          )}
        </button>

        {!ownerId && (
          <p className="text-sm text-red-500 text-center">Debes iniciar sesion para reportar una mascota</p>
        )}
      </form>
    </div>
  );
};