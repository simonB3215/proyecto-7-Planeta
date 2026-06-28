import { geoContains } from 'd3-geo';

// =============================================================================
// Filtrado geográfico ESTRICTO por país seleccionado.
// Fuente única usada por el globo 3D (Markers) y el panel de país (CountryPanel)
// para que ambos muestren EXACTAMENTE el mismo conjunto de eventos.
// =============================================================================

// Territorios no contiguos que no resuelve bien un único polígono (EE.UU.).
const isUS = (q) => q === 'united states' || q === 'usa';
const checkUSBounds = (lng, lat) => {
  const contiguous = lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65;
  const alaska = lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130;
  const hawaii = lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;
  return contiguous || alaska || hawaii;
};

/** Busca el feature GeoJSON cuyo nombre coincide EXACTAMENTE (en minúsculas). */
export function getCountryFeature(selectedCountry, geoJsonData) {
  if (!selectedCountry) return null;
  const query = selectedCountry.trim().toLowerCase();
  return (
    geoJsonData?.features?.find((f) => f.properties?.name?.toLowerCase() === query) || null
  );
}

/**
 * Devuelve un predicado `(lng, lat) => boolean` para el país seleccionado, o `null`
 * cuando NO se puede aplicar un filtro geográfico fiable (sin país, o el texto
 * seleccionado no corresponde a un país real — p. ej. un estado/región o el nombre
 * de un volcán al hacer clic en la lista). En ese caso el llamador no debe filtrar.
 *
 * Cuando SÍ hay país real, el filtro es estricto: `geoContains` (o bounding box US).
 * Si el país existe pero no contiene el punto, el predicado devuelve `false` → el
 * globo queda vacío para países sin eventos (corrige el bug de marcadores fantasma).
 */
export function makeCountryPredicate(selectedCountry, geoJsonData) {
  if (!selectedCountry) return null;
  const query = selectedCountry.trim().toLowerCase();

  const feature = getCountryFeature(selectedCountry, geoJsonData);
  if (feature) return (lng, lat) => geoContains(feature, [lng, lat]);

  if (isUS(query)) return (lng, lat) => checkUSBounds(lng, lat);

  return null; // texto no resoluble a país: no aplicar filtro geográfico
}
