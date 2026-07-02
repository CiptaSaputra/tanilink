/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/constants/commodities.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Runtime constants untuk komoditas pertanian.
 * Dipisah dari src/types.ts agar type definitions tidak tercampur data.
 */

import type { Komoditas, CommodityMetadata, MatchWeights } from '../types';

/** Metadata per komoditas — typical duration, yield, shelf life, price, color */
export const COMMODITY_LIST: Record<Komoditas, CommodityMetadata> = {
  'Cabai Merah': {
    name: 'Cabai Merah',
    typicalDurationDays: 90,
    typicalYieldKgPerHectare: 8000,
    shelfLifeDays: 7,
    averagePricePerKg: 35000,
    color: '#ef4444', // Red
  },
  'Bawang Merah': {
    name: 'Bawang Merah',
    typicalDurationDays: 70,
    typicalYieldKgPerHectare: 10000,
    shelfLifeDays: 30,
    averagePricePerKg: 28000,
    color: '#ec4899', // Pinkish Red
  },
  'Tomat': {
    name: 'Tomat',
    typicalDurationDays: 80,
    typicalYieldKgPerHectare: 15000,
    shelfLifeDays: 8,
    averagePricePerKg: 12000,
    color: '#f97316', // Orange
  },
  'Kentang': {
    name: 'Kentang',
    typicalDurationDays: 110,
    typicalYieldKgPerHectare: 18000,
    shelfLifeDays: 45,
    averagePricePerKg: 15000,
    color: '#b45309', // Amber
  },
  'Kubis': {
    name: 'Kubis',
    typicalDurationDays: 85,
    typicalYieldKgPerHectare: 20000,
    shelfLifeDays: 12,
    averagePricePerKg: 8000,
    color: '#10b981', // Emerald
  },
  'Padi': {
    name: 'Padi',
    typicalDurationDays: 120,
    typicalYieldKgPerHectare: 6000,
    shelfLifeDays: 180, // Rice grains last a long time if dried
    averagePricePerKg: 7500,
    color: '#f59e0b', // Yellow-amber
  },
  'Jagung': {
    name: 'Jagung',
    typicalDurationDays: 100,
    typicalYieldKgPerHectare: 7000,
    shelfLifeDays: 90,
    averagePricePerKg: 6000,
    color: '#eab308', // Yellow
  },
};

/** Bobot default per kategori komoditas (bukan diatur bebas oleh admin) */
export const COMMODITY_WEIGHTS: Record<Komoditas, MatchWeights> = {
  'Cabai Merah':  { wLocation: 0.5, wVolume: 0.25, wPrice: 0.25 }, // cepat rusak → lokasi penting
  'Bawang Merah': { wLocation: 0.45, wVolume: 0.25, wPrice: 0.30 },
  'Tomat':        { wLocation: 0.5, wVolume: 0.25, wPrice: 0.25 }, // cepat rusak
  'Kentang':      { wLocation: 0.3, wVolume: 0.35, wPrice: 0.35 }, // tahan lama → harga lebih penting
  'Kubis':        { wLocation: 0.35, wVolume: 0.30, wPrice: 0.35 },
  'Padi':         { wLocation: 0.2, wVolume: 0.40, wPrice: 0.40 }, // tahan lama → volume & harga
  'Jagung':       { wLocation: 0.25, wVolume: 0.35, wPrice: 0.40 },
};
