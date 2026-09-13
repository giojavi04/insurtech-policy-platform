'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type ComponentType } from 'react';
import { useForm } from 'react-hook-form';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { FieldError } from '@/components/ui/FieldError';
import { LoadingState } from '@/components/ui/LoadingState';
import { fieldControlWithIconClass, fieldGroupClass, fieldLabelClass } from '@/components/ui/control-styles';
import { CarGlyph, HeartGlyph, HomeGlyph, PinGlyph, ShieldGlyph, UserGlyph } from '@/components/ui/icons';
import { catalogsApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import type { CatalogItem } from '@/lib/api/types';
import { quoteFormSchema, type QuoteFormValues } from '@/lib/schemas/quote.schema';

/**
 * Forma cruda (previa a la validación) de lo que contiene el formulario,
 * enviada directamente al parseo zod de la barra lateral. `age` sigue siendo
 * `string | number` porque el input nativo de número se serializa como texto
 * hasta que `quoteFormSchema` con `z.coerce.number()` lo parsea — igual que
 * en el formulario previo a D1.
 */
export interface QuoteFormRawValues {
  insuranceType?: string;
  coverage?: string;
  age?: string | number;
  location?: string;
}

interface QuoteFormProps {
  /** Se emite en cada cambio de campo — la barra lateral de precio en vivo se encarga del debounce y la validación. */
  onValuesChange?: (values: QuoteFormRawValues) => void;
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? toUserMessage(error) : fallback;
}

/** Icono decorativo por código de tipo de seguro; usa un escudo genérico si el código es desconocido. */
const INSURANCE_TYPE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  AUTO: CarGlyph,
  SALUD: HeartGlyph,
  HOGAR: HomeGlyph,
};

/** Subtítulo decorativo por código de cobertura — texto de estilo solamente, nunca proveniente del backend. */
const COVERAGE_SUBLABEL: Record<string, string> = {
  BASICA: 'Resp. Civil',
  ESTANDAR: 'Recomendado',
  PREMIUM: 'Todo Riesgo',
};

const TILE_BASE =
  'flex flex-col items-center justify-center gap-2 rounded-control border-2 px-3 py-4 text-center transition-colors cursor-pointer';
const TILE_ACTIVE = 'border-brand bg-lav text-brand-deep';
const TILE_INACTIVE = 'border-transparent bg-lav text-ink hover:border-line';

/** Contenedor: obtiene catálogos, controla el desplegable dependiente de cobertura y transmite valores válidos o parciales hacia la barra lateral de precio en vivo de D1. */
export function QuoteForm({ onValuesChange }: QuoteFormProps) {
  const [insuranceTypes, setInsuranceTypes] = useState<CatalogItem[]>([]);
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [coverages, setCoverages] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    mode: 'onTouched',
    defaultValues: { coverage: '', location: '' },
  });

  const selectedType = watch('insuranceType');
  const selectedCoverage = watch('coverage');
  const values = watch();

  async function loadCatalogs() {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [typesResult, locationsResult] = await Promise.all([
        catalogsApi.listInsuranceTypes(),
        catalogsApi.listLocations(),
      ]);
      setInsuranceTypes(typesResult.items);
      setLocations(locationsResult.items);
    } catch (error) {
      setCatalogError(messageFor(error, 'No se pudieron cargar los catálogos.'));
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (!selectedType) {
      setCoverages([]);
      return undefined;
    }
    let cancelled = false;
    setCoverageLoading(true);
    setValue('coverage', '');
    catalogsApi
      .listCoverages(selectedType)
      .then((result) => {
        if (!cancelled) setCoverages(result.items);
      })
      .catch((error) => {
        if (!cancelled) setCatalogError(messageFor(error, 'No se pudieron cargar las coberturas.'));
      })
      .finally(() => {
        if (!cancelled) setCoverageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedType, setValue]);

  // Streams every field change up to the sidebar. Depending on primitives
  // (not the `values` object itself) avoids an effect that re-fires on every
  // render just because watch() returns a fresh object identity.
  useEffect(() => {
    onValuesChange?.(values as unknown as QuoteFormRawValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.insuranceType, values.coverage, values.age, values.location]);

  if (catalogLoading) {
    return <LoadingState>Cargando catálogos…</LoadingState>;
  }

  if (catalogError && insuranceTypes.length === 0) {
    return <ErrorBanner message={catalogError} onRetry={loadCatalogs} />;
  }

  return (
    <form noValidate className="flex flex-col gap-7">
      {catalogError && <ErrorBanner message={catalogError} />}

      <div className={fieldGroupClass}>
        <span className={fieldLabelClass}>1. ¿Qué deseas proteger hoy?</span>
        <div
          role="radiogroup"
          aria-label="Tipo de seguro"
          aria-invalid={Boolean(errors.insuranceType)}
          aria-describedby={errors.insuranceType ? 'insuranceType-error' : undefined}
          className="grid grid-cols-3 gap-3"
        >
          {insuranceTypes.map((item) => {
            const Icon = INSURANCE_TYPE_ICON[item.code] ?? ShieldGlyph;
            const active = selectedType === item.code;
            return (
              <label key={item.code} className={`${TILE_BASE} ${active ? TILE_ACTIVE : TILE_INACTIVE}`}>
                <input type="radio" value={item.code} className="sr-only" {...register('insuranceType')} />
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{item.name}</span>
              </label>
            );
          })}
        </div>
        {errors.insuranceType && <FieldError id="insuranceType-error">{errors.insuranceType.message}</FieldError>}
      </div>

      <div className={fieldGroupClass}>
        <span className={fieldLabelClass}>2. Nivel de Cobertura</span>
        <div
          role="radiogroup"
          aria-label="Cobertura"
          aria-invalid={Boolean(errors.coverage)}
          aria-describedby={errors.coverage ? 'coverage-error' : undefined}
          className="grid grid-cols-3 gap-3"
        >
          {coverages.map((item) => {
            const active = selectedCoverage === item.code;
            return (
              <label
                key={item.code}
                className={`${TILE_BASE} ${!selectedType || coverageLoading ? 'cursor-not-allowed opacity-60' : ''} ${active ? TILE_ACTIVE : TILE_INACTIVE}`}
              >
                <input
                  type="radio"
                  value={item.code}
                  className="sr-only"
                  disabled={!selectedType || coverageLoading}
                  {...register('coverage')}
                />
                <span className="text-sm font-medium">{item.name}</span>
                {COVERAGE_SUBLABEL[item.code] && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                    {COVERAGE_SUBLABEL[item.code]}
                  </span>
                )}
              </label>
            );
          })}
          {selectedType && coverages.length === 0 && (
            <p className="col-span-3 text-sm text-ink-soft">
              {coverageLoading ? 'Cargando coberturas…' : 'Sin coberturas disponibles.'}
            </p>
          )}
          {!selectedType && (
            <p className="col-span-3 text-sm text-ink-soft">Selecciona primero un tipo de seguro.</p>
          )}
        </div>
        {errors.coverage && <FieldError id="coverage-error">{errors.coverage.message}</FieldError>}
      </div>

      <div className={fieldGroupClass}>
        <span className={fieldLabelClass}>3. Datos del titular</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldGroupClass}>
            <label htmlFor="age" className="text-xs font-medium text-ink-soft">
              Edad del asegurado
            </label>
            <div className="relative">
              <UserGlyph className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                id="age"
                type="number"
                min={18}
                max={99}
                {...register('age')}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'age-error' : undefined}
                className={`${fieldControlWithIconClass} nums-tabular`}
              />
            </div>
            {errors.age && <FieldError id="age-error">{errors.age.message}</FieldError>}
          </div>

          <div className={fieldGroupClass}>
            <label htmlFor="location" className="text-xs font-medium text-ink-soft">
              Provincia / Región
            </label>
            <div className="relative">
              <PinGlyph className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <select
                id="location"
                {...register('location')}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'location-error' : undefined}
                className={fieldControlWithIconClass}
              >
                <option value="">Selecciona una ubicación</option>
                {locations.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.location && <FieldError id="location-error">{errors.location.message}</FieldError>}
          </div>
        </div>
      </div>
    </form>
  );
}
