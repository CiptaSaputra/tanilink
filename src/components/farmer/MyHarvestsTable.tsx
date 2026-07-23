import React from "react";
import { Sprout, RefreshCw, AlertCircle } from "lucide-react";
import { COMMODITY_LIST } from "../../constants/commodities";
import type { Harvest } from "../../types";

interface MyHarvestsTableProps {
  harvests: Harvest[];
  onOpenHarvestModal: (harvestId: string) => void;
}

export const MyHarvestsTable: React.FC<MyHarvestsTableProps> = ({
  harvests,
  onOpenHarvestModal,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-nat-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-nat-light-cream">
        <div>
          <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-nat-green" />
            Lahan & Rencana Panen Saya
          </h3>
          <p className="text-[10px] text-nat-sage mt-1">
            Data rencana tanam yang aktif dan masuk kalender distribusi.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-nat-border/50 text-[10px] uppercase text-nat-sage">
              <th className="py-3 px-2 font-bold whitespace-nowrap">
                Komoditas / ID
              </th>
              <th className="py-3 px-2 font-bold whitespace-nowrap">
                Tgl Tanam & Panen
              </th>
              <th className="py-3 px-2 font-bold whitespace-nowrap">
                Estimasi & Harga
              </th>
              <th className="py-3 px-2 font-bold whitespace-nowrap">
                Status Lahan
              </th>
              <th className="py-3 px-2 font-bold whitespace-nowrap text-right">
                Aksi Distribusi
              </th>
            </tr>
          </thead>
          <tbody className="align-top text-xs text-nat-dark">
            {harvests.length > 0 ? (
              harvests.map((h) => {
                const today = new Date();
                const harvestDate = new Date(h.expectedHarvestDate);
                const isNearingHarvest =
                  harvestDate.getTime() - today.getTime() <
                    14 * 24 * 60 * 60 * 1000 && h.status === "ACTIVE";

                return (
                  <tr
                    key={h.id}
                    className="border-b border-nat-border/30 hover:bg-nat-light-cream/50 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div className="font-bold text-nat-dark text-sm">
                        {h.commodity}
                      </div>
                      <div className="text-[10px] text-nat-sage uppercase">
                        #{h.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-nat-dark">
                        <span className="text-[10px] text-nat-sage mr-1">
                          Tanam:
                        </span>
                        {h.plantingDate}
                      </div>
                      <div
                        className={`mt-0.5 font-bold ${isNearingHarvest ? "text-amber-600" : "text-nat-green"}`}
                      >
                        <span className="text-[10px] text-nat-sage mr-1 font-normal">
                          Est. Panen:
                        </span>
                        {h.expectedHarvestDate}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-bold">
                        {h.expectedVolume.toLocaleString("id-ID")} Kg
                      </div>
                      <div className="text-[10px] text-nat-sage">
                        @ Rp{h.askingPrice.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`inline-block px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase border ${
                            h.status === "ACTIVE"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : h.status === "HARVESTED"
                                ? "bg-nat-light-cream text-nat-green border-nat-green/30"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {h.status === "ACTIVE" ? "MASA TANAM" : h.status}
                        </span>
                        {isNearingHarvest && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            <AlertCircle className="w-3 h-3" />
                            Mendekati Panen
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      {h.status === "ACTIVE" ? (
                        <button
                          onClick={() => onOpenHarvestModal(h.id)}
                          className="px-3 py-1.5 rounded-lg bg-nat-green text-white text-[10px] font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Siap Panen (Distribusi)
                        </button>
                      ) : (
                        <span className="text-[10px] text-nat-sage italic font-medium">
                          Batch Created
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-nat-sage italic"
                >
                  Belum ada laporan rencana tanam.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
