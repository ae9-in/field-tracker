import React, { useState } from 'react';
import { useFormState } from '../../context/FormContext';

export default function Step1() {
  const { formData, updateFormData } = useFormState();
  const [capturing, setCapturing] = useState(false);

  const handleCaptureLocation = () => {
    setCapturing(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setCapturing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData({
          location: {
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }
        });
        setCapturing(false);
      },
      (error) => {
        console.error('Error fetching location:', error);
        // Fallback mockup values if denied or failed, as in mockup
        updateFormData({
          location: {
            latitude: '28.6139',
            longitude: '77.2090'
          }
        });
        alert('Could not fetch location automatically. Using fallback GPS coordinates.');
        setCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <section className="space-y-lg">
      <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Employee Name *</label>
            <input
              className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-2 outline-none transition-all"
              type="text"
              required
              placeholder="Enter your name"
              value={formData.employeeName || ''}
              onChange={(e) => updateFormData({ employeeName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Employee ID (Optional)</label>
            <input
              className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-2 outline-none transition-all"
              type="text"
              placeholder="e.g. FT-99021"
              value={formData.employeeId || ''}
              onChange={(e) => updateFormData({ employeeId: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Place of Work *</label>
          <input
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all"
            placeholder="Enter market or area name"
            type="text"
            required
            value={formData.placeOfWork || ''}
            onChange={(e) => updateFormData({ placeOfWork: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Date of Visit *</label>
          <input
            className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md px-4 py-3 outline-none transition-all"
            type="date"
            required
            value={formData.dateOfVisit || ''}
            onChange={(e) => updateFormData({ dateOfVisit: e.target.value })}
          />
        </div>
      </div>

      {/* Geotag Section */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-surface-container flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 grayscale"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHyvftObQu5Jno_GW8ffRMF6MaRW87XnS44x03NiDYn49Z2c2ZThVP-58nPYobonFYGxtIxLw-N1EU_BbB0FsTL6zCD-AVqgwdSyDXXZDy_LyiOnu3se4S3at7JZiKFr1_P9rVL_1xucsVukLjrXenSqE_Hma9NmkVUFgCBq_ZPUjy-Xj3CY-xMpL3hsBb2QzdwV8XeNcioC1PD8psleDagkRXCrYZzS4zZhefZaEDBSbUKnfg_3MSfRzMtHX9y3eXoCZ-sGRSXbk')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <span className="material-symbols-outlined text-primary text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_on
          </span>
        </div>
        <div className="p-md space-y-md">
          <button
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-label-md text-label-md transition-all active:scale-95 ${
              formData.location?.latitude
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-secondary-container text-on-secondary-container hover:bg-opacity-90'
            }`}
            onClick={handleCaptureLocation}
            type="button"
            disabled={capturing}
          >
            <span className="material-symbols-outlined">
              {capturing ? 'sync' : formData.location?.latitude ? 'check_circle' : 'my_location'}
            </span>
            {capturing
              ? 'Capturing...'
              : formData.location?.latitude
              ? 'Location Captured'
              : 'Capture My Location'}
          </button>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-outline">Latitude</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg font-mono text-sm px-3 py-2 text-on-surface-variant outline-none"
                id="lat"
                placeholder="0.0000"
                readOnly
                type="text"
                value={formData.location?.latitude || ''}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-outline">Longitude</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg font-mono text-sm px-3 py-2 text-on-surface-variant outline-none"
                id="lng"
                placeholder="0.0000"
                readOnly
                type="text"
                value={formData.location?.longitude || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
