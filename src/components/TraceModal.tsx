/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Database, 
  Cpu, 
  Clock, 
  User, 
  Layers, 
  ArrowRight, 
  FileCheck,
  CheckCircle,
  HelpCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { Harvest, COMMODITY_LIST } from '../types';

interface TraceModalProps {
  harvest: Harvest;
  isOpen: boolean;
  onClose: () => void;
}

export default function TraceModal({ harvest, isOpen, onClose }: TraceModalProps) {
  const { matches, demands } = useApp();

  if (!isOpen) return null;

  const crop = COMMODITY_LIST[harvest.commodity] || {
    color: '#10b981',
    typicalYieldKgPerHectare: 10000,
    averagePricePerKg: 10000,
    shelfLifeDays: 14,
    typicalDurationDays: 90
  };

  

  // Also see if there's any active matches/contracts
  const associatedMatch = matches.find(m => m.harvestId === harvest.id);
  const associatedDemand = associatedMatch ? demands.find(d => d.id === associatedMatch.demandId) : null;

  // Form mock URL for QR Code redirection
  const qrValue = `https://sinergitani.id/trace/${harvest.id}?v=${harvest.expectedVolume}&lat=${harvest.latitude}&lng=${harvest.longitude}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:2rem] opacity-20" />
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide font-mono">TERVERIFIKASI</span>
                <span className="text-slate-400 text-[10px] font-mono">#ID-{harvest.id}</span>
              </div>
              <h3 className="text-base font-black tracking-tight mt-0.5">Sertifikat Ketertelusuran Pangan</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Passport Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* QR Code Canvas Frame */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 relative">
                <QRCodeSVG 
                  value={qrValue} 
                  size={128}
                  level="H"
                  includeMargin={false}
                />
                {/* Overlay tiny sprout logo in the center of QR */}
                <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-200">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: crop.color }} />
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scan QR Code</span>
                <p className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded inline-block">
                  {harvest.commodity.toUpperCase()}-{harvest.id.substring(harvest.id.length - 6).toUpperCase()}
                </p>
                <p className="text-[9px] text-slate-400 leading-normal max-w-[150px] mx-auto mt-1">
                  Scan untuk memverifikasi asal-usul digital via Sistem Pengurangan Food Loss
                </p>
              </div>
            </div>

            {/* Product Identity Passport */}
            <div className="md:col-span-8 space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Komoditas & Batch</h4>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mt-0.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: crop.color }} />
                    {harvest.commodity} 
                    <span className="text-sm font-bold text-slate-400">({harvest.landArea} Ha Lahan)</span>
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Volume Terjamin</span>
                  <span className="text-lg font-black text-slate-800">{harvest.expectedVolume.toLocaleString('id-ID')} Kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    Produsen Utama (Petani)
                  </span>
                  <p className="text-xs font-extrabold text-slate-800">{harvest.farmerName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Kabupaten {harvest.region}, Jateng</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    Koordinat Geospasial
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    {harvest.latitude}, {harvest.longitude}
                  </p>
                  <a 
                    href={`https://www.google.com/maps?q=${harvest.latitude},${harvest.longitude}`}
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    Buka Peta Satelit <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Tanggal Mulai Tanam
                  </span>
                  <p className="text-xs font-bold text-slate-800">{harvest.plantingDate}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    Estimasi Panen Sedia
                  </span>
                  <p className="text-xs font-bold text-slate-800">{harvest.expectedHarvestDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" />
                    Otoritas Pelapor (Source)
                  </span>
                  <p className="text-xs font-bold text-slate-800 uppercase">
                    {harvest.inputSource || 'SELF'}
                  </p>
                  <p className="text-[9px] text-slate-500 italic">
                    {harvest.inputSource === 'ppl' && 'Divalidasi oleh PPL Lapangan'}
                    {harvest.inputSource === 'gapoktan' && 'Diinput via Operator Gapoktan'}
                    {harvest.inputSource === 'family' && 'Dibantu Anggota Keluarga'}
                    {(!harvest.inputSource || harvest.inputSource === 'self') && 'Laporan Mandiri Pemilik Lahan'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Sistem Penjamin Mutu
                  </span>
                  <p className="text-xs font-bold text-emerald-600">Sistem Pengurangan Food Loss v1.0</p>
                  <p className="text-[9px] text-slate-500">Verified digital state</p>
                </div>
              </div>
            </div>
          </div>


          {/* Escrow & Smart Contract section */}
          {associatedMatch && (
            <div className={`border rounded-2xl p-4 flex gap-3 text-xs ${
              associatedMatch.status === 'CONFIRMED'
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/50 border-amber-200 text-amber-950'
            }`}>
              <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                associatedMatch.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-[10px]">
                  {associatedMatch.status === 'CONFIRMED' 
                    ? 'KESEPAKATAN SELESAI' 
                    : 'PRE-ORDER: MENUNGGU PERSETUJUAN'
                  }
                </p>
                <p className="text-[11px] leading-relaxed">
                  {associatedMatch.status === 'CONFIRMED' ? (
                    <>
                      Koperasi <span className="font-bold">{associatedDemand?.buyerName}</span> menyerap batch panen ini dengan harga kesepakatan <span className="font-bold">Rp{(associatedDemand?.offerPrice || 0).toLocaleString('id-ID')}/Kg</span>. Dana jaminan aman terkunci di dalam sistem, melindunginya dari fluktuasi pasar dan broker nakal.
                    </>
                  ) : (
                    <>
                      Batch panen ini telah dikaitkan dengan proposal pre-order dari <span className="font-bold">{associatedDemand?.buyerName}</span>. Menunggu penyelesaian tanda tangan kedua belah pihak di sistem Pengurangan Food Loss.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            Tutup Sertifikat
          </button>
        </div>

      </div>
    </div>
  );
}
