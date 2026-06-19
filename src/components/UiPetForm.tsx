import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Upload, MapPin, Loader2 } from 'lucide-react';
import { AddressSearch } from './AddressSearch';
import petService from '../service/pet.service';
import imageService from '../service/image.service';
import geoService from '../service/geo.service';
import type { Mascota, Ubicacion } from '../types';

interface UiPetFormProps {
  ownerId?: string; // Este viene del usuario logueado
  onSuccess?: (mascota: Mascota) => void;
}

export const UiPetForm: React.FC<UiPetFormProps> = ({ ownerId, onSuccess }) => {
  // ELIMINAMOS el valor por defecto 'user123'
  // Ahora si no viene ownerId, el formulario no se puede enviar
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    color: '',
    size: 'Mediano',
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

  // Log para depuración
  console.log('🔍 UiPetForm - ownerId recibido:', ownerId);

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
    
    // VALIDACIÓN: Verificar que el ownerId esté presente
    if (!ownerId) {
      setError('Debes iniciar sesión para reportar una mascota');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageId = null;
      
      if (selectedImage) {
        const tempId = `img_${Date.now()}`;
        const imageResponse = await imageService.upload(tempId, selectedImage);
        imageId = imageResponse.imageId;
      }

      // Usar el ownerId que viene del prop (el ID real del usuario)
      const newPet: Mascota = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        color: formData.color,
        size: formData.size,
        status: 'LOST',
        imageId: imageId || undefined,
        ownerId: ownerId, // Este es el ID real del usuario
        description: formData.description,
        reportedAt: new Date().toISOString(),
        lastLocation: {
          latitude: formData.lastLocation.latitude,
          longitude: formData.lastLocation.longitude,
          address: formData.lastLocation.address
        }
      };

      console.log('Creando mascota con ownerId:', ownerId);
      console.log('Datos completos:', newPet);

      const createdPet = await petService.create(newPet);
      console.log('Mascota creada:', createdPet);

      if (createdPet.id && formData.lastLocation.latitude && formData.lastLocation.longitude) {
        const ubicacion: Ubicacion = {
          reportId: createdPet.id,
          descripcion: `Mascota ${formData.name} reportada en ${formData.lastLocation.address || 'ubicación desconocida'}`,
          fechaRegistro: new Date().toISOString(),
          posicion: {
            type: 'Point',
            coordinates: [formData.lastLocation.longitude, formData.lastLocation.latitude]
          }
        };
        await geoService.create(ubicacion);
      }

      setSuccess(true);
      setFormData({
        name: '',
        species: 'Perro',
        breed: '',
        color: '',
        size: 'Mediano',
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
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Error al crear el reporte. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Reportar Mascota Perdida
      </h3>

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          ¡Reporte creado exitosamente!
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Foto de la mascota
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <Upload className="h-4 w-4" />
              Subir foto
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
            )}
          </div>
        </div>

        {/* Nombre y Especie */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input
              placeholder="Nombre de la mascota"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especie *</label>
            <select
              value={formData.species}
              onChange={(e) => setFormData({...formData, species: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            >
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
          </div>
        </div>

        {/* Raza y Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raza</label>
            <input
              placeholder="Raza"
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <input
              placeholder="Color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Búsqueda de dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Buscar ubicación *
          </label>
          <AddressSearch 
            onLocationSelect={handleLocationSelect}
            placeholder="Ej: Av. Providencia 1200, Santiago"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Busca por dirección, calle con número o sector
          </p>
        </div>

        {/* Dirección seleccionada */}
        {formData.lastLocation.address && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Ubicación seleccionada:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{formData.lastLocation.address}</p>
            {(formData.lastLocation.street || formData.lastLocation.city) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.lastLocation.street && `Calle: ${formData.lastLocation.street}`}
                {formData.lastLocation.houseNumber && ` ${formData.lastLocation.houseNumber}`}
                {formData.lastLocation.city && ` • ${formData.lastLocation.city}`}
              </p>
            )}
          </div>
        )}

        {/* Coordenadas manuales (avanzado) */}
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
                onChange={(e) => setFormData({
                  ...formData,
                  lastLocation: {...formData.lastLocation, latitude: parseFloat(e.target.value)}
                })}
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
                onChange={(e) => setFormData({
                  ...formData,
                  lastLocation: {...formData.lastLocation, longitude: parseFloat(e.target.value)}
                })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </details>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
          <textarea
            placeholder="Describe a tu mascota: señas particulares, color de collar, comportamiento, etc."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !ownerId}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            ownerId 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
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
              {ownerId ? 'Publicar Alerta' : 'Inicia sesión para publicar'}
            </>
          )}
        </button>
        
        {!ownerId && (
          <p className="text-sm text-red-500 text-center">
            Debes iniciar sesión para reportar una mascota
          </p>
        )}
      </form>
    </div>
  );
};