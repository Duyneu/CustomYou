"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  Compass,
} from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: "sun" | "cloud-sun" | "cloud" | "rain";
}

const CITIES = [
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
];

export function WeatherCard() {
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherData>({
    city: "Hà Nội",
    temp: 27,
    condition: "Nắng ráo dịu mát",
    humidity: 68,
    windSpeed: 12,
    feelsLike: 29,
    icon: "cloud-sun",
  });
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityIdx: number) => {
    const city = CITIES[cityIdx];
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`
      );
      if (res.ok) {
        const data = await res.json();
        const curr = data.current;
        const code = curr.weather_code;

        let condition = "Nắng ráo";
        let icon: "sun" | "cloud-sun" | "cloud" | "rain" = "sun";

        if (code === 0) {
          condition = "Trời quang đãng";
          icon = "sun";
        } else if (code <= 3) {
          condition = "Có mây rải rác";
          icon = "cloud-sun";
        } else if (code <= 48) {
          condition = "Trời nhiều mây";
          icon = "cloud";
        } else {
          condition = "Có mưa";
          icon = "rain";
        }

        setWeather({
          city: city.name,
          temp: Math.round(curr.temperature_2m),
          condition,
          humidity: Math.round(curr.relative_humidity_2m),
          windSpeed: Math.round(curr.wind_speed_10m),
          feelsLike: Math.round(curr.apparent_temperature),
          icon,
        });
      }
    } catch (e) {
      // Dùng dữ liệu dự phòng êm đềm
      setWeather((prev) => ({
        ...prev,
        city: city.name,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCityIndex);
  }, [selectedCityIndex]);

  const toggleCity = () => {
    const nextIdx = (selectedCityIndex + 1) % CITIES.length;
    setSelectedCityIndex(nextIdx);
  };

  return (
    <div className="glass-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
      {/* Ambient background glow inside card */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500"
        aria-hidden="true"
      />

      {/* Header with City Switcher */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={toggleCity}
          className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer group/btn"
          title="Nhấn để đổi thành phố"
        >
          <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span>{weather.city}</span>
          <RefreshCw
            className={`w-3 h-3 text-muted-foreground transition-transform ${
              loading ? "animate-spin" : "group-hover/btn:rotate-180"
            }`}
          />
        </button>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
          Chỉ số thời tiết
        </span>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between my-3 z-10">
        <div>
          <div className="flex items-baseline font-mono tracking-tight font-bold text-foreground">
            <span className="text-4xl sm:text-5xl tabular-nums">{weather.temp}</span>
            <span className="text-2xl sm:text-3xl font-light text-muted-foreground">°C</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{weather.condition}</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm">
          {weather.icon === "sun" && <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />}
          {weather.icon === "cloud-sun" && <CloudSun className="w-8 h-8 text-amber-500" />}
          {weather.icon === "cloud" && <Cloud className="w-8 h-8 text-indigo-400" />}
          {weather.icon === "rain" && <CloudRain className="w-8 h-8 text-cyan-400" />}
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="pt-3 border-t border-border/70 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground z-10">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Thực tế: {weather.feelsLike}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Ẩm: {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Gió: {weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}
