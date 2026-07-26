import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

interface PriceData {
  date: string;
  price: number;
  isPrediction: boolean;
}

interface PriceChartProps {
  commodity: string;
  region: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ commodity, region }) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/prices?commodity=${commodity}&region=${region}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch price data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrices();
  }, [commodity, region]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm h-[350px] flex items-center justify-center">
        <div className="text-nat-sage animate-pulse">Memuat data prediksi harga...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm h-[350px] flex items-center justify-center">
        <div className="text-nat-sage flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Belum ada data historis untuk {commodity} di {region}.
        </div>
      </div>
    );
  }

  // Format date untuk sumbu X
  const formattedData = data.map((d) => {
    const dt = new Date(d.date);
    return {
      ...d,
      displayDate: `${dt.getDate()}/${dt.getMonth() + 1}`,
      // Split the data series so we can color them differently
      historicalPrice: d.isPrediction ? null : d.price,
      predictedPrice: d.isPrediction ? d.price : null,
    };
  });
  
  // To connect the lines, we need the last historical point to also be the first predicted point
  const firstPredictionIdx = formattedData.findIndex(d => d.isPrediction);
  if (firstPredictionIdx > 0) {
     formattedData[firstPredictionIdx - 1].predictedPrice = formattedData[firstPredictionIdx - 1].historicalPrice;
  }

  const todayStr = formattedData.find(d => d.isPrediction)?.displayDate || "";

  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-nat-light-cream">
        <div>
          <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-nat-green" />
            Prediksi Harga (AI & Statistik)
          </h3>
          <p className="text-[10px] text-nat-sage mt-1">
            Tren pergerakan harga {commodity} di wilayah {region} (Historis & Prediksi 14 hari ke depan).
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="displayDate" tick={{ fill: "#64748b", fontSize: 10 }} tickMargin={10} minTickGap={20} />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748b", fontSize: 10 }}
              width={50}
            />
            <Tooltip
              formatter={(value: any) => [`Rp${Number(value).toLocaleString("id-ID")}`, "Harga"]}
              labelFormatter={(label) => `Tanggal: ${label}`}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            <ReferenceLine x={formattedData[firstPredictionIdx - 1]?.displayDate} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'top', value: 'HARI INI', fill: '#94a3b8', fontSize: 9 }} />
            
            <Line
              type="monotone"
              dataKey="historicalPrice"
              name="Harga Historis"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="predictedPrice"
              name="Prediksi (AI)"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
