import React, { useState, useRef } from 'react';
import { Search, Loader2, MapPin, Home, Building, Map } from 'lucide-react';

interface AddressSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string, fullAddress: any) => void;
  placeholder?: string;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  type: string;
  class: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ 
  onLocationSelect, 
  placeholder = "Ej: Av. Providencia 1200, Santiago" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<number | null>(null);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Mejorar la consulta para obtener resultados más precisos en Chile
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + ", Chile"
        )}&format=json&limit=10&addressdetails=1&countrycodes=cl&dedupe=1`
      );
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = window.setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  const getAddressLabel = (result: SearchResult) => {
    const addr = result.address;
    const parts = [];
    
    // Número y calle
    if (addr.house_number && addr.road) {
      parts.push(`${addr.road} ${addr.house_number}`);
    } else if (addr.road) {
      parts.push(addr.road);
    }
    
    // Ciudad/Comuna
    const city = addr.city || addr.town || addr.village;
    if (city) parts.push(city);
    
    // Código postal
    if (addr.postcode) parts.push(addr.postcode);
    
    return parts.join(', ') || result.display_name.split(',')[0];
  };

  const getAddressTypeIcon = (result: SearchResult) => {
    if (result.type === 'house' || result.class === 'place') {
      return <Home className="h-4 w-4 text-green-500" />;
    } else if (result.type === 'road' || result.class === 'highway') {
      return <Map className="h-4 w-4 text-blue-500" />;
    } else {
      return <Building className="h-4 w-4 text-purple-500" />;
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const fullAddress = result.address;
    const displayAddress = getAddressLabel(result);
    
    onLocationSelect(lat, lng, displayAddress, fullAddress);
    setSearchTerm(displayAddress);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getAddressTypeIcon(result)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getAddressLabel(result)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {result.display_name.split(',').slice(0, 3).join(', ')}
                </p>
                {result.address.house_number && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    Número: {result.address.house_number}
                  </p>
                )}
              </div>
              <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};